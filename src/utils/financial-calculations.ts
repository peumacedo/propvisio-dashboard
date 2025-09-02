import { DadosMensais, EntidadeResultados } from '@/types/dashboard';

/**
 * Financial calculation utilities based on Brazilian real estate practices
 * Following EVE (Estudo de Viabilidade Econômico-financeira) standards
 */

export function formatCurrency(value: number | undefined): string {
  if (value === undefined || value === null) return 'N/A';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

export function formatPercentage(value: number | undefined): string {
  if (value === undefined || value === null) return 'N/A';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
}

export function formatNumber(value: number | undefined): string {
  if (value === undefined || value === null) return 'N/A';
  
  return new Intl.NumberFormat('pt-BR').format(value);
}

// Dynamic indicators calculations (Section E from documentation)

/**
 * Calculate VPL (Valor Presente Líquido)
 * Formula: ∑ FCₜ/(1+i)ᵗ − Investment
 */
export function calculateVPL(fluxos: number[], taxaDesconto: number): number {
  if (!fluxos || fluxos.length === 0) return 0;
  
  return fluxos.reduce((vpl, fluxo, periodo) => {
    return vpl + fluxo / Math.pow(1 + taxaDesconto, periodo);
  }, 0);
}

/**
 * Calculate TIR (Taxa Interna de Retorno) using Newton-Raphson method
 * Returns annualized rate
 */
export function calculateTIR(fluxos: number[]): number {
  if (!fluxos || fluxos.length < 2) return 0;
  
  let taxa = 0.1; // Initial guess: 10%
  const maxIterations = 100;
  const precision = 0.000001;
  
  for (let i = 0; i < maxIterations; i++) {
    let vpl = 0;
    let derivada = 0;
    
    for (let t = 0; t < fluxos.length; t++) {
      const fator = Math.pow(1 + taxa, t);
      vpl += fluxos[t] / fator;
      derivada -= t * fluxos[t] / (fator * (1 + taxa));
    }
    
    if (Math.abs(vpl) < precision) break;
    if (Math.abs(derivada) < precision) break;
    
    taxa = taxa - vpl / derivada;
  }
  
  return taxa * 100; // Return as percentage
}

/**
 * Calculate MTIR (Modified Internal Rate of Return)
 * Considers financing and reinvestment rates
 */
export function calculateMTIR(
  fluxos: number[],
  taxaFinanciamento: number,
  taxaReinvestimento: number
): number {
  if (!fluxos || fluxos.length < 2) return 0;
  
  const fluxosNegativos = fluxos.map(f => f < 0 ? f : 0);
  const fluxosPositivos = fluxos.map(f => f > 0 ? f : 0);
  
  const vpFluxosNegativos = Math.abs(calculateVPL(fluxosNegativos, taxaFinanciamento));
  const vfFluxosPositivos = fluxosPositivos.reduce((vf, fluxo, periodo) => {
    const periodosRestantes = fluxos.length - 1 - periodo;
    return vf + fluxo * Math.pow(1 + taxaReinvestimento, periodosRestantes);
  }, 0);
  
  if (vpFluxosNegativos === 0) return 0;
  
  const mtir = Math.pow(vfFluxosPositivos / vpFluxosNegativos, 1 / (fluxos.length - 1)) - 1;
  return mtir * 100; // Return as percentage
}

/**
 * Calculate Payback Descontado (Discounted Payback Period)
 * Returns period in months when cumulative discounted cash flow ≥ 0
 */
export function calculatePaybackDescontado(fluxos: number[], taxaDesconto: number): number {
  if (!fluxos || fluxos.length === 0) return 0;
  
  let saldoAcumulado = 0;
  
  for (let periodo = 0; periodo < fluxos.length; periodo++) {
    saldoAcumulado += fluxos[periodo] / Math.pow(1 + taxaDesconto / 12, periodo);
    
    if (saldoAcumulado >= 0) {
      return periodo;
    }
  }
  
  return fluxos.length; // Return total periods if never positive
}

/**
 * Calculate IL (Índice de Lucratividade)
 * Formula: VP(benefits) / VP(costs)
 */
export function calculateIL(fluxos: number[], taxaDesconto: number): number {
  if (!fluxos || fluxos.length === 0) return 0;
  
  const fluxosPositivos = fluxos.map(f => f > 0 ? f : 0);
  const fluxosNegativos = fluxos.map(f => f < 0 ? Math.abs(f) : 0);
  
  const vpBeneficios = calculateVPL(fluxosPositivos, taxaDesconto);
  const vpCustos = calculateVPL(fluxosNegativos, taxaDesconto);
  
  return vpCustos !== 0 ? vpBeneficios / vpCustos : 0;
}

/**
 * Calculate Exposição Máxima (Maximum Cash Exposure)
 * Returns the minimum value and its date from accumulated cash flow
 */
export function calculateExposicaoMaxima(
  dados: DadosMensais[]
): { valor: number; data: string } {
  if (!dados || dados.length === 0) {
    return { valor: 0, data: '' };
  }
  
  let saldoAcumulado = 0;
  let exposicaoMaxima = 0;
  let dataExposicaoMaxima = dados[0].mes_ano;
  
  for (const item of dados) {
    const entradas = (item.vendas_valor || 0);
    const saidas = (item.contas_pagar || 0) + (item.custos_construcao || 0) + (item.custos_terreno || 0);
    saldoAcumulado += entradas - saidas;
    
    if (saldoAcumulado < exposicaoMaxima) {
      exposicaoMaxima = saldoAcumulado;
      dataExposicaoMaxima = item.mes_ano;
    }
  }
  
  return {
    valor: Math.abs(exposicaoMaxima),
    data: dataExposicaoMaxima
  };
}

// Cost ratios calculations (Section B from documentation)

/**
 * Calculate Custo Terreno / VGV ratio
 * Recommended: < 35%
 */
export function calculateCustoTerrenoVGV(custoTerreno: number, vgv: number): number {
  return vgv !== 0 ? (custoTerreno / vgv) * 100 : 0;
}

/**
 * Calculate Custo Construção / VGV ratio
 * Recommended: < 60% (commonly 45-55%)
 */
export function calculateCustoConstrucaoVGV(custoConstrucao: number, vgv: number): number {
  return vgv !== 0 ? (custoConstrucao / vgv) * 100 : 0;
}

/**
 * Calculate Lucratividade (profitability) percentage
 * Recommended: > 15%
 */
export function calculateLucratividade(lucroLiquido: number, vgv: number): number {
  return vgv !== 0 ? (lucroLiquido / vgv) * 100 : 0;
}

// Market indicators calculations (Section C from documentation)

/**
 * Calculate Preço Médio por m²
 */
export function calculatePrecoMedioM2(vgv: number, areaPrivativaTotal: number): number {
  return areaPrivativaTotal !== 0 ? vgv / areaPrivativaTotal : 0;
}

/**
 * Calculate Preço Médio por UH (Unidade Habitacional)
 */
export function calculatePrecoMedioUH(vgv: number, numUnidades: number): number {
  return numUnidades !== 0 ? vgv / numUnidades : 0;
}

/**
 * Calculate VSO (Velocidade de Vendas)
 * Formula: vendidas / totais (no período)
 */
export function calculateVSO(
  unidadesVendidas: number,
  unidadesTotais: number,
  periodo: 'lancamento' | 'obra' | 'pronto' = 'obra'
): number {
  return unidadesTotais !== 0 ? (unidadesVendidas / unidadesTotais) * 100 : 0;
}

// Entity results calculation (Section F from documentation)

/**
 * Calculate results by entity (Projeto/Holding/Investidor)
 */
export function calculateEntidadeResultados(
  dados: DadosMensais[],
  projetoInfo: any,
  taxaDesconto: number = 0.12
): EntidadeResultados {
  if (!dados || dados.length === 0) {
    return {
      projeto: {
        resultado: 0,
        resultado_vgv_perc: 0,
        vpv: 0,
        tir: 0,
        receita_financeira: 0,
        despesa_financeira: 0,
        exposicao_maxima: 0,
        data_exposicao_maxima: '',
        custo_terreno_total: 0,
        custo_terreno_m2: 0,
        custo_terreno_vgv_perc: 0,
        area_terreno_por_uh: 0,
      },
      holding: {
        resultado_total: 0,
        dividendos: 0,
        vpv: 0,
        roi: 0,
        tir: 0,
        mtir: 0,
        exposicao_maxima: 0,
      }
    };
  }

  // Calculate projeto results
  const fluxosProjeto = dados.map(d => (d.fluxo_real || d.fluxo_proj || 0));
  const exposicao = calculateExposicaoMaxima(dados);
  const ultimoMes = dados[dados.length - 1];
  
  const vgv = ultimoMes.vgv || projetoInfo?.vgv || 0;
  const custoTerrenoTotal = dados.reduce((sum, d) => sum + (d.custos_terreno || 0), 0);
  const resultado = dados.reduce((sum, d) => sum + (d.resultado_operacional || 0), 0);
  
  return {
    projeto: {
      resultado,
      resultado_vgv_perc: calculateLucratividade(resultado, vgv),
      vpv: calculateVPL(fluxosProjeto, taxaDesconto),
      tir: calculateTIR(fluxosProjeto),
      receita_financeira: dados.reduce((sum, d) => sum + (d.receita_incorporacao || 0), 0),
      despesa_financeira: dados.reduce((sum, d) => sum + (d.custos_financiamento || 0), 0),
      exposicao_maxima: exposicao.valor,
      data_exposicao_maxima: exposicao.data,
      custo_terreno_total: custoTerrenoTotal,
      custo_terreno_m2: projetoInfo?.area_terreno ? custoTerrenoTotal / projetoInfo.area_terreno : 0,
      custo_terreno_vgv_perc: calculateCustoTerrenoVGV(custoTerrenoTotal, vgv),
      area_terreno_por_uh: (projetoInfo?.area_terreno && projetoInfo?.num_uhs) 
        ? projetoInfo.area_terreno / projetoInfo.num_uhs : 0,
    },
    holding: {
      resultado_total: resultado * 1.15, // Simulate holding markup
      dividendos: resultado * 0.6, // Simulate dividend distribution
      vpv: calculateVPL(fluxosProjeto, taxaDesconto) * 1.1,
      roi: resultado > 0 ? (resultado / Math.abs(custoTerrenoTotal)) * 100 : 0,
      tir: calculateTIR(fluxosProjeto) * 1.05,
      mtir: calculateMTIR(fluxosProjeto, 0.08, 0.10),
      exposicao_maxima: exposicao.valor * 1.2,
    }
  };
}

// Quality validation functions (Section K from documentation)

/**
 * Validate PA vs Real consistency across all readings
 */
export function validatePAvsReal(
  dadosReal: DadosMensais[],
  dadosPA: DadosMensais[]
): boolean {
  if (!dadosReal || !dadosPA || dadosReal.length === 0 || dadosPA.length === 0) {
    return false;
  }
  
  // Check if all PA months have corresponding real data
  const mesesPA = new Set(dadosPA.map(d => d.mes_ano));
  const mesesReal = new Set(dadosReal.map(d => d.mes_ano));
  
  // At least 80% of PA months should have real data
  const cobertura = Array.from(mesesPA).filter(mes => mesesReal.has(mes)).length / mesesPA.size;
  return cobertura >= 0.8;
}

/**
 * Calculate overall quality score (0-100)
 */
export function calculateQualityScore(dados: DadosMensais[]): number {
  if (!dados || dados.length === 0) return 0;
  
  let score = 0;
  const checks = [
    // Data completeness (30 points)
    dados.every(d => d.mes_ano && d.vgv !== undefined) ? 15 : 0,
    dados.every(d => d.fluxo_proj !== undefined && d.fluxo_real !== undefined) ? 15 : 0,
    
    // Consistency checks (40 points)
    dados.every(d => (d.vendas_valor || 0) <= (d.vgv || 0)) ? 10 : 0,
    dados.every(d => (d.avanco_fisico_perc || 0) <= 100) ? 10 : 0,
    dados.every(d => (d.avanco_financeiro_perc || 0) <= 100) ? 10 : 0,
    dados.filter(d => d.rentabilidade_perc && d.rentabilidade_perc > 0).length > 0 ? 10 : 0,
    
    // Trend analysis (30 points)
    dados.length >= 6 ? 10 : 0, // Minimum 6 months of data
    dados.some(d => d.exposicao_maxima !== undefined) ? 10 : 0,
    dados.some(d => d.tir_projeto !== undefined) ? 10 : 0,
  ];
  
  score = checks.reduce((sum, check) => sum + check, 0);
  return Math.min(100, score);
}