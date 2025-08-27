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

// Generate mock data for demonstration
export function generateMockData(): ExcelData {
  const months = [
    '2025-01', '2025-02', '2025-03', '2025-04', 
    '2025-05', '2025-06', '2025-07', '2025-08'
  ];
  
  const dados_mensais: DadosMensais[] = months.map((month, index) => {
    const baseVendas = 3500000 + (index * 500000);
    const baseFluxo = -800000 + (index * 300000);
    
    return {
      mes_ano: month,
      rentabilidade_perc: 2.5 + (index * 0.2),
      pa_meses: 18 - index,
      vgv: 120000000,
      vendas_unid: 10 + (index * 2),
      vendas_valor: baseVendas,
      estoque_unid: 90 - (index * 2),
      estoque_valor: 45000000 - (index * 600000),
      inadimplencia_perc: 1.2 - (index * 0.1),
      inadimplencia_valor: 300000 - (index * 10000),
      contas_pagar: 4200000 - (index * 200000),
      contas_receber: 5200000 + (index * 100000),
      fluxo_proj: baseFluxo,
      fluxo_real: baseFluxo + (Math.random() * 200000 - 100000),
      avanco_fisico_perc: index * 12.5,
      avanco_fisico_proj: index * 12.5 + 5,
      avanco_financeiro_perc: index * 10,
      vendas_meta: baseVendas * 1.1,
    };
  });
  
  const marcos_projeto: MarcoProjeto[] = [
    {
      marco: 'Lançamento do Projeto',
      inicio: '2025-01-01',
      fim: '2025-01-15',
      status: 'concluido'
    },
    {
      marco: 'Início das Obras',
      inicio: '2025-02-01',
      fim: '2025-02-28',
      status: 'concluido'
    },
    {
      marco: '50% Vendido',
      inicio: '2025-04-01',
      fim: '2025-06-30',
      status: 'em_andamento'
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
  
  return { dados_mensais, marcos_projeto };
}