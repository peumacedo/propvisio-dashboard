import * as XLSX from 'xlsx';
import { DadosMensais, MarcoProjeto, ExcelData, SchemaValidation, ValidationError } from '@/types/dashboard';

// Required columns for dados_mensais
const REQUIRED_COLUMNS = [
  'mes_ano',
  'vgv',
  'vendas_valor',
  'fluxo_proj',
  'fluxo_real'
];

// All possible columns
const ALL_COLUMNS = [
  'mes_ano',
  'rentabilidade_perc',
  'pa_meses',
  'vgv',
  'vendas_unid',
  'vendas_valor',
  'estoque_unid',
  'estoque_valor',
  'inadimplencia_perc',
  'inadimplencia_valor',
  'contas_pagar',
  'contas_receber',
  'fluxo_proj',
  'fluxo_real',
  'avanco_fisico_perc',
  'avanco_fisico_proj',
  'avanco_financeiro_perc',
  'vendas_meta'
];

export function normalizeDateString(dateStr: string): string {
  if (!dateStr) return '';
  
  const str = dateStr.toString().trim();
  
  // Already in YYYY-MM format
  if (/^\d{4}-\d{2}$/.test(str)) {
    return str;
  }
  
  // MMM/YY format (e.g., "Jan/25")
  if (/^[A-Za-z]{3}\/\d{2}$/.test(str)) {
    const [month, year] = str.split('/');
    const months: { [key: string]: string } = {
      'jan': '01', 'fev': '02', 'mar': '03', 'abr': '04',
      'mai': '05', 'jun': '06', 'jul': '07', 'ago': '08',
      'set': '09', 'out': '10', 'nov': '11', 'dez': '12'
    };
    const fullYear = `20${year}`;
    return `${fullYear}-${months[month.toLowerCase()] || '01'}`;
  }
  
  // Try to parse as Date
  const date = new Date(str);
  if (!isNaN(date.getTime())) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }
  
  return str;
}

export function normalizeNumber(value: any): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  
  const str = value.toString().replace(/,/g, '.');
  const num = parseFloat(str);
  
  return isNaN(num) ? undefined : num;
}

export function validateSchema(data: any[]): SchemaValidation {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  
  if (!data || data.length === 0) {
    return {
      isValid: false,
      errors: [{ column: 'general', message: 'Planilha vazia ou não encontrada', severity: 'error' }],
      warnings: [],
      missingColumns: REQUIRED_COLUMNS
    };
  }
  
  const firstRow = data[0];
  const availableColumns = Object.keys(firstRow);
  const missingColumns = REQUIRED_COLUMNS.filter(col => !availableColumns.includes(col));
  
  // Check required columns
  missingColumns.forEach(col => {
    errors.push({
      column: col,
      message: `Coluna obrigatória '${col}' não encontrada`,
      severity: 'error'
    });
  });
  
  // Check data quality
  data.forEach((row, index) => {
    // Validate date format
    if (row.mes_ano && !normalizeDateString(row.mes_ano)) {
      warnings.push({
        column: 'mes_ano',
        message: `Linha ${index + 1}: Formato de data inválido`,
        severity: 'warning'
      });
    }
    
    // Validate numeric fields
    ['vgv', 'vendas_valor', 'fluxo_proj', 'fluxo_real'].forEach(field => {
      if (row[field] !== undefined && row[field] !== null && row[field] !== '') {
        const normalized = normalizeNumber(row[field]);
        if (normalized === undefined) {
          warnings.push({
            column: field,
            message: `Linha ${index + 1}: Valor numérico inválido em ${field}`,
            severity: 'warning'
          });
        }
      }
    });
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    missingColumns
  };
}

export function parseExcelData(file: File): Promise<ExcelData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Parse dados_mensais sheet
        const dadosMensaisSheet = workbook.Sheets['dados_mensais'];
        if (!dadosMensaisSheet) {
          throw new Error('Aba "dados_mensais" não encontrada');
        }
        
        const dadosMensaisRaw = XLSX.utils.sheet_to_json(dadosMensaisSheet);
        
        // Validate schema
        const validation = validateSchema(dadosMensaisRaw);
        if (!validation.isValid) {
          throw new Error(`Erro de validação: ${validation.errors.map(e => e.message).join(', ')}`);
        }
        
        // Normalize data
        const dados_mensais: DadosMensais[] = dadosMensaisRaw.map((row: any) => ({
          mes_ano: normalizeDateString(row.mes_ano),
          rentabilidade_perc: normalizeNumber(row.rentabilidade_perc),
          pa_meses: normalizeNumber(row.pa_meses),
          vgv: normalizeNumber(row.vgv),
          vendas_unid: normalizeNumber(row.vendas_unid),
          vendas_valor: normalizeNumber(row.vendas_valor),
          estoque_unid: normalizeNumber(row.estoque_unid),
          estoque_valor: normalizeNumber(row.estoque_valor),
          inadimplencia_perc: normalizeNumber(row.inadimplencia_perc),
          inadimplencia_valor: normalizeNumber(row.inadimplencia_valor),
          contas_pagar: normalizeNumber(row.contas_pagar),
          contas_receber: normalizeNumber(row.contas_receber),
          fluxo_proj: normalizeNumber(row.fluxo_proj),
          fluxo_real: normalizeNumber(row.fluxo_real),
          avanco_fisico_perc: normalizeNumber(row.avanco_fisico_perc),
          avanco_fisico_proj: normalizeNumber(row.avanco_fisico_proj),
          avanco_financeiro_perc: normalizeNumber(row.avanco_financeiro_perc),
          vendas_meta: normalizeNumber(row.vendas_meta),
        }));
        
        // Parse marcos_projeto sheet (optional)
        let marcos_projeto: MarcoProjeto[] = [];
        const marcosSheet = workbook.Sheets['marcos_projeto'];
        if (marcosSheet) {
          const marcosRaw = XLSX.utils.sheet_to_json(marcosSheet);
          marcos_projeto = marcosRaw.map((row: any) => ({
            marco: row.marco || '',
            inicio: row.inicio || '',
            fim: row.fim || '',
            status: row.status || 'planejado'
          }));
        }
        
        resolve({
          dados_mensais,
          marcos_projeto
        });
        
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsArrayBuffer(file);
  });
}

// Generate enhanced mock data with all financial indicators
export function generateMockData(): ExcelData {
  const currentYear = new Date().getFullYear();
  const months = [
    '2024-09', '2024-10', '2024-11', '2024-12',
    '2025-01', '2025-02', '2025-03', '2025-04', '2025-05'
  ];
  
  const baseData = {
    vgv: 76_914_000,
    num_uhs: 126,
    area_terreno: 1170,
    preco_terreno: 8_500_000,
    area_privativa_total: 4982
  };

  const dados_mensais: DadosMensais[] = months.map((month, index) => {
    const progress = (index + 1) / months.length;
    const cyclePos = index % 8;
    
    // Enhanced data based on documentation
    const custos_terreno = baseData.preco_terreno * Math.min(progress * 1.2, 1);
    const custos_construcao = baseData.vgv * 0.45 * progress; // 45% of VGV for construction
    const vendas_valor = baseData.vgv * progress * 0.8; // Sales progress
    const receita_incorporacao = vendas_valor * 1.05; // 5% markup
    const impostos_receita = receita_incorporacao * 0.08; // 8% taxes
    
    return {
      mes_ano: month,
      vgv: baseData.vgv,
      rentabilidade_perc: 18 + Math.sin(index * 0.3) * 3,
      pa_meses: Math.max(36 - index * 2, 12),
      
      // Sales and market data
      vendas_unid: Math.floor(baseData.num_uhs * progress * 0.85),
      vendas_valor,
      vendas_meta: vendas_valor * 1.1,
      
      // Stock data
      estoque_unid: baseData.num_uhs - Math.floor(baseData.num_uhs * progress * 0.85),
      estoque_valor: baseData.vgv - vendas_valor,
      
      // Delinquency
      inadimplencia_perc: Math.max(0, 2.5 + Math.sin(index * 0.5) * 1.5),
      inadimplencia_valor: vendas_valor * 0.025,
      
      // Financial accounts
      contas_pagar: custos_construcao + custos_terreno,
      contas_receber: vendas_valor * 0.7, // 70% to receive
      
      // Cash flow
      fluxo_proj: (vendas_valor - custos_construcao - custos_terreno) * (cyclePos % 3 === 0 ? -0.5 : 1),
      fluxo_real: (vendas_valor - custos_construcao - custos_terreno) * (cyclePos % 3 === 0 ? -0.3 : 0.9),
      
      // Progress tracking
      avanco_fisico_perc: Math.min(progress * 95, 85),
      avanco_fisico_proj: Math.min((progress + 0.1) * 100, 100),
      avanco_financeiro_perc: Math.min(progress * 90, 80),
      avanco_financeiro_proj: Math.min((progress + 0.05) * 100, 95),
      
      // Enhanced financial metrics (EVE vs Real)
      eve_total: vendas_valor * 1.1, // Planned values 10% higher
      real_total: vendas_valor,
      
      // DRE components
      receita_incorporacao,
      impostos_receita,
      receita_liquida: receita_incorporacao - impostos_receita,
      custos_terreno,
      custos_construcao,
      outros_custos: baseData.vgv * 0.05 * progress, // 5% other costs
      margem_operacional: receita_incorporacao - custos_terreno - custos_construcao - (baseData.vgv * 0.05 * progress),
      despesas_incorporacao: baseData.vgv * 0.03 * progress, // 3% incorporation expenses
      despesas_comerciais: baseData.vgv * 0.04 * progress, // 4% commercial expenses
      despesas_adm_spe: baseData.vgv * 0.02 * progress, // 2% admin expenses
      outras_despesas: baseData.vgv * 0.01 * progress, // 1% other expenses
      resultado_operacional: (receita_incorporacao - custos_terreno - custos_construcao) * 0.85 - (baseData.vgv * 0.1 * progress),
      custos_financiamento: baseData.vgv * 0.08 * progress, // 8% financing costs
      
      // Dynamic indicators (calculated based on patterns)
      vpv_projeto: (receita_incorporacao - custos_terreno - custos_construcao) * 0.7, // Simplified NPV
      tir_projeto: 15 + Math.sin(index * 0.4) * 3, // TIR between 12-18%
      mtir_projeto: 14 + Math.sin(index * 0.3) * 2, // MTIR slightly lower
      il_projeto: 1.2 + Math.sin(index * 0.2) * 0.3, // IL around 1.2
      payback_descontado: Math.max(24 - index, 8), // Payback decreases over time
      exposicao_maxima: Math.max(custos_terreno + custos_construcao - vendas_valor, 0),
      data_exposicao_maxima: month,
      
      // Cost ratios
      custo_terreno_vgv: (custos_terreno / baseData.vgv) * 100,
      custo_construcao_vgv: (custos_construcao / baseData.vgv) * 100,
      lucratividade_vgv: ((receita_incorporacao - custos_terreno - custos_construcao) / baseData.vgv) * 100,
      
      // Market indicators
      preco_medio_m2: baseData.vgv / baseData.area_privativa_total,
      preco_medio_uh: baseData.vgv / baseData.num_uhs,
      vso_percentual: (Math.floor(baseData.num_uhs * progress * 0.85) / baseData.num_uhs) * 100,
      
      // Technical fields
      cub_m2: 2800 + index * 50, // CUB increases over time (inflation)
      bdi_percentual: 25 + Math.sin(index * 0.1) * 2, // BDI around 25%
      custo_obra_m2_apv: custos_construcao / baseData.area_privativa_total
    };
  });
  
  return { 
    dados_mensais, 
    marcos_projeto: [
      { marco: 'Aprovação Projeto', inicio: '2024-01-15', fim: '2024-03-30', status: 'concluido' },
      { marco: 'Lançamento Vendas', inicio: '2024-03-15', fim: '2024-03-15', status: 'concluido' },
      { marco: 'Início da Obra', inicio: '2024-06-01', fim: '2024-06-01', status: 'concluido' },
      { marco: 'Fundação', inicio: '2024-06-01', fim: '2024-09-30', status: 'concluido' },
      { marco: 'Estrutura', inicio: '2024-09-01', fim: '2025-06-30', status: 'em_andamento' },
      { marco: 'Acabamento', inicio: '2025-06-01', fim: '2026-08-31', status: 'planejado' },
      { marco: 'Entrega das Chaves', inicio: '2026-09-01', fim: '2026-12-01', status: 'planejado' }
    ],
    projeto_info: {
      nome: 'Residencial Amazônia',
      versao: '3.2',
      vgv: baseData.vgv,
      responsavel: 'João Silva',
      data_criacao: '2024-01-15',
      // Enhanced project info from documentation
      num_uhs: baseData.num_uhs,
      area_privativa_total: baseData.area_privativa_total,
      area_privativa_media: baseData.area_privativa_total / baseData.num_uhs,
      data_inicio_obra: '2024-06-01',
      data_termino_obra: '2026-12-01',
      duracao_meses: 30,
      area_terreno: baseData.area_terreno,
      preco_terreno: baseData.preco_terreno,
      permuta_fisica: 4, // 4 units in exchange
      permuta_financeira: baseData.preco_terreno * 0.15, // 15% of land price
      data_lancamento: '2024-03-15',
      prazo_vendas_meses: 36,
      taxa_desconto_vpl: 12, // 12% annual discount rate
      indices_correcao: {
        incc: 4.2, // Annual INCC
        ipca: 3.8, // Annual IPCA
        igp_m: 4.5 // Annual IGP-M
      }
    },
    // Add EVE baseline for comparison
    eve_baseline: dados_mensais.map(item => ({
      ...item,
      vendas_valor: (item.vendas_valor || 0) * 1.1, // PA values 10% higher
      custos_construcao: (item.custos_construcao || 0) * 0.95, // PA costs 5% lower
      fluxo_proj: (item.fluxo_proj || 0) * 1.15 // PA projections 15% more optimistic
    }))
  };
}

// Generate multiple versions for comparison
export function generateMultipleVersions(): ExcelData[] {
  const versions = [
    { version: '1.0', multiplier: 0.85, name: 'Versão Inicial', vgv: 100000000 },
    { version: '2.0', multiplier: 0.95, name: 'Revisão Market', vgv: 115000000 },
    { version: '2.1', multiplier: 1.0, name: 'Residencial Via Nova', vgv: 120000000 }
  ];

  return versions.map((v, versionIndex) => {
    const months = [
      '2025-01', '2025-02', '2025-03', '2025-04', 
      '2025-05', '2025-06', '2025-07', '2025-08'
    ];
    
    const dados_mensais: DadosMensais[] = months.map((month, index) => {
      const baseVendas = (3500000 + (index * 500000)) * v.multiplier;
      const baseFluxo = (-800000 + (index * 300000)) * v.multiplier;
      
      return {
        mes_ano: month,
        rentabilidade_perc: (2.5 + (index * 0.2)) * v.multiplier,
        pa_meses: Math.round((18 - index) * (v.multiplier + 0.1)),
        vgv: v.vgv,
        vendas_unid: Math.round((10 + (index * 2)) * v.multiplier),
        vendas_valor: baseVendas,
        estoque_unid: Math.round((90 - (index * 2)) * (2 - v.multiplier)),
        estoque_valor: (45000000 - (index * 600000)) * v.multiplier,
        inadimplencia_perc: (1.2 - (index * 0.1)) * (2 - v.multiplier),
        inadimplencia_valor: (300000 - (index * 10000)) * (2 - v.multiplier),
        contas_pagar: (4200000 - (index * 200000)) * v.multiplier,
        contas_receber: (5200000 + (index * 100000)) * v.multiplier,
        fluxo_proj: baseFluxo,
        fluxo_real: baseFluxo + (Math.random() * 200000 - 100000),
        avanco_fisico_perc: (index * 12.5) * v.multiplier,
        avanco_fisico_proj: (index * 12.5 + 5) * v.multiplier,
        avanco_financeiro_perc: (index * 10) * v.multiplier,
        vendas_meta: baseVendas * 1.1,
      };
    });

    const marcos_projeto: MarcoProjeto[] = [
      {
        marco: 'Lançamento do Projeto',
        inicio: '2025-01-01',
        fim: '2025-01-15',
        status: versionIndex === 2 ? 'concluido' : 'planejado'
      },
      {
        marco: 'Início das Obras',
        inicio: '2025-02-01',
        fim: '2025-02-28',
        status: versionIndex >= 1 ? 'concluido' : 'planejado'
      },
      {
        marco: '50% Vendido',
        inicio: '2025-04-01',
        fim: '2025-06-30',
        status: versionIndex === 2 ? 'em_andamento' : 'planejado'
      },
      {
        marco: 'Obra 80% Concluída',
        inicio: '2025-08-01',
        fim: '2025-10-31',
        status: 'planejado'
      },
      {
        marco: 'Habite-se',
        inicio: '2025-11-01',
        fim: '2025-12-31',
        status: 'planejado'
      }
    ];

    return {
      dados_mensais,
      marcos_projeto,
      projeto_info: {
        nome: v.name,
        versao: v.version,
        vgv: v.vgv,
        responsavel: 'Equipe Via.One',
        data_criacao: new Date(Date.now() - versionIndex * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')
      }
    };
  });
}