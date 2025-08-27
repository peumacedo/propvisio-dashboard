import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, FileSpreadsheet, Info } from 'lucide-react';
import * as XLSX from 'xlsx';

export function ExcelTemplate() {
  const downloadTemplate = () => {
    // Create workbook with multiple sheets
    const wb = XLSX.utils.book_new();
    
    // Sheet 1: Informações do Projeto
    const projectInfo = [
      ['Via.One - Template de Viabilidade Imobiliária', '', '', ''],
      ['', '', '', ''],
      ['INFORMAÇÕES DO PROJETO', '', '', ''],
      ['Nome do Empreendimento', 'Residencial Exemplo', '', ''],
      ['Versão da Análise', '1.0', '', ''],
      ['Data de Criação', new Date().toLocaleDateString('pt-BR'), '', ''],
      ['Responsável', 'Nome do Analista', '', ''],
      ['VGV Total (R$)', '120000000', '', 'Valor Geral de Vendas'],
      ['', '', '', ''],
      ['INSTRUÇÕES:', '', '', ''],
      ['1. Preencha os dados mensais na aba "dados_mensais"', '', '', ''],
      ['2. Configure os marcos na aba "marcos_projeto" (opcional)', '', '', ''],
      ['3. Mantenha os nomes das colunas exatamente como no template', '', '', ''],
      ['4. Use formato YYYY-MM para datas (ex: 2025-01)', '', '', ''],
      ['5. Valores monetários sem símbolos, apenas números', '', '', '']
    ];
    
    const wsProject = XLSX.utils.aoa_to_sheet(projectInfo);
    XLSX.utils.book_append_sheet(wb, wsProject, 'info_projeto');
    
    // Sheet 2: Dados Mensais Template
    const monthlyHeaders = [
      'mes_ano', 'rentabilidade_perc', 'pa_meses', 'vgv', 'vendas_unid', 
      'vendas_valor', 'vendas_meta', 'estoque_unid', 'estoque_valor', 
      'inadimplencia_perc', 'inadimplencia_valor', 'contas_pagar', 
      'contas_receber', 'fluxo_proj', 'fluxo_real', 'avanco_fisico_perc', 
      'avanco_fisico_proj', 'avanco_financeiro_perc'
    ];
    
    const monthlyData = [
      monthlyHeaders,
      ['2025-01', '2.5', '18', '120000000', '10', '3500000', '4000000', '90', '45000000', '1.2', '300000', '4200000', '5200000', '-800000', '-750000', '5', '8', '3'],
      ['2025-02', '2.8', '17', '120000000', '12', '4200000', '4500000', '88', '44400000', '1.1', '290000', '3800000', '5600000', '200000', '150000', '12', '15', '8'],
      ['2025-03', '3.1', '16', '120000000', '15', '5000000', '5200000', '85', '43000000', '1.0', '280000', '3600000', '5800000', '600000', '720000', '18', '22', '15'],
      ['2025-04', '3.0', '15', '120000000', '18', '6000000', '6200000', '80', '41000000', '1.3', '350000', '3400000', '6000000', '900000', '850000', '25', '28', '22']
    ];
    
    const wsMonthly = XLSX.utils.aoa_to_sheet(monthlyData);
    XLSX.utils.book_append_sheet(wb, wsMonthly, 'dados_mensais');
    
    // Sheet 3: Marcos do Projeto
    const milestonesHeaders = ['marco', 'inicio', 'fim', 'status'];
    const milestonesData = [
      milestonesHeaders,
      ['Lançamento Comercial', '2025-01-15', '2025-02-28', 'concluido'],
      ['Aprovação de Projetos', '2025-02-01', '2025-04-30', 'em_andamento'],
      ['Início da Obra', '2025-05-01', '2025-06-15', 'planejado'],
      ['50% Vendido', '2025-08-01', '2025-10-30', 'planejado'],
      ['Habite-se', '2027-12-01', '2028-01-31', 'planejado']
    ];
    
    const wsMilestones = XLSX.utils.aoa_to_sheet(milestonesData);
    XLSX.utils.book_append_sheet(wb, wsMilestones, 'marcos_projeto');
    
    // Download the file
    XLSX.writeFile(wb, 'Via.One-Template-Viabilidade.xlsx');
  };

  return (
    <Card className="p-6 bg-executive-card border-border/50">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="w-6 h-6 text-brand-primary" />
          <div>
            <h3 className="text-lg font-semibold text-executive-text-primary">
              Template de Planilha
            </h3>
            <p className="text-sm text-executive-text-secondary">
              Baixe o modelo para estruturar seus dados
            </p>
          </div>
        </div>
        
        <div className="bg-muted/30 p-4 rounded-lg border">
          <div className="flex items-start gap-2 mb-3">
            <Info className="w-4 h-4 text-brand-accent mt-0.5 flex-shrink-0" />
            <div className="text-xs text-executive-text-secondary">
              <p className="font-medium mb-1">O template inclui:</p>
              <ul className="space-y-1">
                <li>• Estrutura completa de dados mensais</li>
                <li>• Campos para avanço físico e financeiro</li>
                <li>• Marcos do projeto com cronograma</li>
                <li>• Informações de versionamento</li>
                <li>• Exemplos preenchidos</li>
              </ul>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={downloadTemplate}
          className="w-full"
          variant="outline"
        >
          <Download className="w-4 h-4 mr-2" />
          Baixar Template Excel
        </Button>
      </div>
    </Card>
  );
}