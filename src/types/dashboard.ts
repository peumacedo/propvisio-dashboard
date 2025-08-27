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
  
  // Additional fields for physical progress tracking
  avanco_fisico_perc?: number;
  avanco_fisico_proj?: number;
  avanco_financeiro_perc?: number;
  avanco_financeiro_proj?: number;
  vendas_meta?: number;
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
  };
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