import { DadosMensais } from '@/types/dashboard';

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

export function calculateKPIs(data: DadosMensais[], selectedMonth: string, showAccumulated: boolean) {
  if (!data || data.length === 0) {
    return {
      rentabilidade: { value: 0, pa_meses: 0, isEstimated: false, variation: 0 },
      vgv: { value: 0, percentVendido: 0, variation: 0 },
      vendasAcumuladas: { unidades: 0, valor: 0, variation: 0 },
      estoque: { unidades: 0, valor: 0, variation: 0 },
      inadimplencia: { percentual: 0, valor: 0, variation: 0 }
    };
  }

  // Sort data by date
  const sortedData = [...data].sort((a, b) => a.mes_ano.localeCompare(b.mes_ano));
  
  // Find current and previous month data
  const currentIndex = sortedData.findIndex(item => item.mes_ano === selectedMonth);
  const previousData = currentIndex > 0 ? sortedData[currentIndex - 1] : null;
  
  // Filter data based on selected month and accumulation setting
  const filteredData = showAccumulated 
    ? sortedData.filter(item => item.mes_ano <= selectedMonth)
    : sortedData.filter(item => item.mes_ano === selectedMonth);
    
  // Previous filtered data for comparison
  const previousFilteredData = showAccumulated && previousData
    ? sortedData.filter(item => item.mes_ano <= previousData.mes_ano)
    : previousData ? [previousData] : [];
  
  if (filteredData.length === 0) {
    return {
      rentabilidade: { value: 0, pa_meses: 0, isEstimated: false, variation: 0 },
      vgv: { value: 0, percentVendido: 0, variation: 0 },
      vendasAcumuladas: { unidades: 0, valor: 0, variation: 0 },
      estoque: { unidades: 0, valor: 0, variation: 0 },
      inadimplencia: { percentual: 0, valor: 0, variation: 0 }
    };
  }

  const latestData = filteredData[filteredData.length - 1];
  const previousLatestData = previousFilteredData.length > 0 ? previousFilteredData[previousFilteredData.length - 1] : null;
  
  // Helper function to calculate percentage variation
  const calculateVariation = (current: number, previous: number | undefined) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };
  
  // Calculate rentability and payback
  let rentabilidade = latestData.rentabilidade_perc || 0;
  let pa_meses = latestData.pa_meses || 0;
  let isRentabilidadeEstimated = false;
  
  // Estimate rentability if not provided
  if (!latestData.rentabilidade_perc && latestData.vendas_valor && latestData.contas_pagar) {
    rentabilidade = (latestData.vendas_valor / latestData.contas_pagar - 1) * 100;
    isRentabilidadeEstimated = true;
  }
  
  // Estimate payback if not provided
  if (!latestData.pa_meses) {
    let cumulativeFlow = 0;
    for (let i = 0; i < sortedData.length; i++) {
      cumulativeFlow += sortedData[i].fluxo_real || 0;
      if (cumulativeFlow >= 0) {
        pa_meses = i + 1;
        break;
      }
    }
  }

  // VGV and percentage sold
  const vgv = latestData.vgv || 0;
  const totalVendasValor = showAccumulated 
    ? filteredData.reduce((sum, item) => sum + (item.vendas_valor || 0), 0)
    : latestData.vendas_valor || 0;
  const percentVendido = vgv > 0 ? (totalVendasValor / vgv) * 100 : 0;
  
  const previousTotalVendasValor = showAccumulated && previousFilteredData.length > 0
    ? previousFilteredData.reduce((sum, item) => sum + (item.vendas_valor || 0), 0)
    : previousLatestData?.vendas_valor || 0;

  // Accumulated sales
  const vendasAcumuladasUnidades = showAccumulated
    ? filteredData.reduce((sum, item) => sum + (item.vendas_unid || 0), 0)
    : latestData.vendas_unid || 0;
  
  const vendasAcumuladasValor = showAccumulated
    ? filteredData.reduce((sum, item) => sum + (item.vendas_valor || 0), 0)
    : latestData.vendas_valor || 0;
    
  const previousVendasAcumuladasValor = showAccumulated && previousFilteredData.length > 0
    ? previousFilteredData.reduce((sum, item) => sum + (item.vendas_valor || 0), 0)
    : previousLatestData?.vendas_valor || 0;

  // Current stock (always latest values)
  const estoqueUnidades = latestData.estoque_unid || 0;
  const estoqueValor = latestData.estoque_valor || 0;

  // Default accounts (latest values)
  const inadimplenciaPercentual = latestData.inadimplencia_perc || 0;
  const inadimplenciaValor = latestData.inadimplencia_valor || 
    (inadimplenciaPercentual > 0 && latestData.contas_receber ? 
     (inadimplenciaPercentual / 100) * latestData.contas_receber : 0);

  return {
    rentabilidade: { 
      value: rentabilidade, 
      pa_meses, 
      isEstimated: isRentabilidadeEstimated,
      variation: calculateVariation(rentabilidade, previousLatestData?.rentabilidade_perc)
    },
    vgv: { 
      value: vgv, 
      percentVendido,
      variation: calculateVariation(vgv, previousLatestData?.vgv)
    },
    vendasAcumuladas: { 
      unidades: vendasAcumuladasUnidades, 
      valor: vendasAcumuladasValor,
      variation: calculateVariation(vendasAcumuladasValor, previousVendasAcumuladasValor)
    },
    estoque: { 
      unidades: estoqueUnidades, 
      valor: estoqueValor,
      variation: calculateVariation(estoqueValor, previousLatestData?.estoque_valor)
    },
    inadimplencia: { 
      percentual: inadimplenciaPercentual, 
      valor: inadimplenciaValor,
      variation: calculateVariation(inadimplenciaPercentual, previousLatestData?.inadimplencia_perc)
    }
  };
}

export function calculateChartData(data: DadosMensais[]) {
  if (!data || data.length === 0) return [];
  
  return data
    .sort((a, b) => a.mes_ano.localeCompare(b.mes_ano))
    .map(item => ({
      month: item.mes_ano,
      projected: item.fluxo_proj || 0,
      realized: item.fluxo_real || 0,
      pa_reference: (item.fluxo_proj || 0) * 0.9 // PA reference at 90% of projected
    }));
}

export function calculateSalesChartData(data: DadosMensais[]) {
  if (!data || data.length === 0) return [];
  
  return data
    .sort((a, b) => a.mes_ano.localeCompare(b.mes_ano))
    .map(item => ({
      month: item.mes_ano,
      vendas: item.vendas_valor || 0,
      meta: item.vendas_meta || (item.vendas_valor || 0) * 1.1
    }));
}

export function calculateProgressChartData(data: DadosMensais[]) {
  if (!data || data.length === 0) return [];
  
  return data
    .sort((a, b) => a.mes_ano.localeCompare(b.mes_ano))
    .map(item => ({
      month: item.mes_ano,
      fisico: item.avanco_fisico_perc || 0,
      financeiro: item.avanco_financeiro_perc || 0,
      fisico_proj: item.avanco_fisico_proj || 0,
      pa_reference: (item.avanco_fisico_proj || 0) * 0.92 // PA reference
    }));
}

export function calculateFinancialProgressChartData(data: DadosMensais[]) {
  if (!data || data.length === 0) return [];
  
  return data
    .sort((a, b) => a.mes_ano.localeCompare(b.mes_ano))
    .map(item => ({
      month: item.mes_ano,
      financeiro_planejado: item.avanco_financeiro_proj || 0,
      financeiro_realizado: item.avanco_financeiro_perc || 0,
      pa_reference: (item.avanco_financeiro_proj || 0) * 0.95 // PA reference
    }));
}

// Calculate operational cash flow data
export function calculateOperationalCashFlowData(data: DadosMensais[]) {
  if (!data || data.length === 0) return [];
  
  return data
    .sort((a, b) => a.mes_ano.localeCompare(b.mes_ano))
    .map((item, index) => {
      // Simulate operational cash flow (revenue - operational costs)
      const revenue = item.vendas_valor || 0;
      const operationalCosts = revenue * 0.7; // Simulate 70% operational costs
      const baseOperational = revenue - operationalCosts;
      
      // Simulate negative periods (months 2, 3, 4 in the cycle)
      const cyclePosition = index % 8;
      const negativeMultiplier = [2, 3, 4].includes(cyclePosition) ? -0.8 : 1;
      
      return {
        month: item.mes_ano,
        operational: baseOperational * negativeMultiplier,
        pa_reference: revenue * 0.3 * 0.85 // PA reference at 85% of expected
      };
    });
}

export function calculateDREData(data: DadosMensais[], showAccumulated: boolean) {
  if (!data || data.length === 0) return [];
  
  const sortedData = [...data].sort((a, b) => a.mes_ano.localeCompare(b.mes_ano));
  
  if (showAccumulated) {
    // Calculate cumulative values
    let cumulativeReceita = 0;
    let cumulativeCustos = 0;
    
    return sortedData.map(item => {
      cumulativeReceita += item.vendas_valor || 0;
      cumulativeCustos += item.contas_pagar || 0;
      
      const resultado = cumulativeReceita - cumulativeCustos;
      
      return {
        mes_ano: item.mes_ano,
        receita: cumulativeReceita,
        custos: cumulativeCustos,
        resultado: resultado
      };
    });
  } else {
    // Monthly values
    return sortedData.map(item => {
      const receita = item.vendas_valor || 0;
      const custos = item.contas_pagar || 0;
      const resultado = receita - custos;
      
      return {
        mes_ano: item.mes_ano,
        receita,
        custos,
        resultado
      };
    });
  }
}