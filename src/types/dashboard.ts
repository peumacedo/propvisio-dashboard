export interface DadosMensais {
  mes_ano: string;
  rentabilidade_perc?: number;
  pa_meses?: number;
  vgv?: number;
  vendas_unid?: number;
  vendas_valor?: number;
  estoque_unid?: number;
  estoque_valor?: number;
  inadimplencia_perc?: number;
  inadimplencia_valor?: number;
  contas_pagar?: number;
  contas_receber?: number;
  fluxo_proj?: number;
  fluxo_real?: number;
  
  // Physical and financial progress tracking
  avanco_fisico_perc?: number;
  avanco_fisico_proj?: number;
  avanco_financeiro_perc?: number;
  avanco_financeiro_proj?: number;
  vendas_meta?: number;
  
  // EVE vs Real indicators
  eve_total?: number;
  real_total?: number;
  
  // Additional financial metrics
  receita_incorporacao?: number;
  impostos_receita?: number;
  receita_liquida?: number;
  custos_terreno?: number;
  custos_construcao?: number;
  outros_custos?: number;
  margem_operacional?: number;
  despesas_incorporacao?: number;
  despesas_comerciais?: number;
  despesas_adm_spe?: number;
  outras_despesas?: number;
  resultado_operacional?: number;
  custos_financiamento?: number;
  
  // Dynamic indicators
  vpv_projeto?: number;  // Valor Presente do Projeto
  tir_projeto?: number;  // TIR anualizada
  mtir_projeto?: number; // MTIR anualizada
  il_projeto?: number;   // Índice de Lucratividade
  payback_descontado?: number; // em meses
  exposicao_maxima?: number;   // valor máximo de exposição de caixa
  data_exposicao_maxima?: string; // data da exposição máxima
  
  // Cost ratios
  custo_terreno_vgv?: number;    // %
  custo_construcao_vgv?: number; // %
  lucratividade_vgv?: number;    // %
  
  // Market indicators
  preco_medio_m2?: number;       // R$/m²
  preco_medio_uh?: number;       // R$ por UH
  vso_percentual?: number;       // Velocidade de Vendas %
  
  // Technical fields
  cub_m2?: number;
  bdi_percentual?: number;
  custo_obra_m2_apv?: number;
}

export interface MarcoProjeto {
  marco: string;
  inicio: string;
  fim: string;
  status: 'planejado' | 'em_andamento' | 'concluido';
}

export interface ExcelData {
  dados_mensais: DadosMensais[];
  marcos_projeto?: MarcoProjeto[];
  projeto_info?: {
    nome?: string;
    versao?: string;
    vgv?: number;
    responsavel?: string;
    data_criacao?: string;
    // Additional project metadata from documentation
    num_uhs?: number;
    area_privativa_total?: number;
    area_privativa_media?: number;
    data_inicio_obra?: string;
    data_termino_obra?: string;
    duracao_meses?: number;
    area_terreno?: number;
    preco_terreno?: number;
    permuta_fisica?: number;
    permuta_financeira?: number;
    data_lancamento?: string;
    prazo_vendas_meses?: number;
    taxa_desconto_vpl?: number;
    indices_correcao?: {
      incc?: number;
      ipca?: number;
      igp_m?: number;
    };
  };
  // EVE (Baseline) data for comparison
  eve_baseline?: DadosMensais[];
  // Validation results
  validacao?: ValidationResults;
}

export interface KPICard {
  title: string;
  value: string | number;
  subtitle?: string;
  subvalue?: string | number;
  trend?: 'up' | 'down' | 'stable';
  isEstimated?: boolean;
  format: 'currency' | 'percentage' | 'number';
}

export interface ChartDataPoint {
  month: string;
  projected?: number;
  realized?: number;
  value?: number;
  target?: number;
  vendas?: number;
  meta?: number;
  fisico?: number;
  financeiro?: number;
  fisico_proj?: number;
  financeiro_planejado?: number;
  financeiro_realizado?: number;
}

export interface DashboardFilters {
  selectedMonth: string;
  showAccumulated: boolean;
}

export interface ValidationError {
  column: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface SchemaValidation {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  missingColumns: string[];
}

// Enhanced validation results based on documentation
export interface ValidationResults {
  pa_vs_real: boolean;           // PA vs Real consistency
  snapshot_versioned: boolean;   // Versioning integrity
  saldos_bancarios: boolean;     // Bank balance consistency
  investimentos_vs_lancamentos: boolean; // Investment vs entries
  estoque_vs_curva: boolean;     // Stock vs curve consistency
  fisico_vs_financeiro: boolean; // Physical vs financial alignment
  tma_parametrizada: boolean;    // TMA properly configured
  cub_bdi_detalhado: boolean;    // CUB/BDI breakdown available
  quality_score: number;         // Overall quality (0-100)
}

// Entity-specific results from documentation
export interface EntidadeResultados {
  projeto: {
    resultado: number;
    resultado_vgv_perc: number;
    vpv: number;
    tir: number;
    receita_financeira: number;
    despesa_financeira: number;
    exposicao_maxima: number;
    data_exposicao_maxima: string;
    custo_terreno_total: number;
    custo_terreno_m2: number;
    custo_terreno_vgv_perc: number;
    area_terreno_por_uh: number;
  };
  holding: {
    resultado_total: number;
    dividendos: number;
    vpv: number;
    roi: number;
    tir: number;
    mtir: number;
    exposicao_maxima: number;
  };
  investidor?: {
    resultado: number;
    dividendos: number;
    remuneracao_prioritaria: number;
    vpv: number;
    roi: number;
    tir: number;
    mtir: number;
    exposicao_maxima: number;
  };
}