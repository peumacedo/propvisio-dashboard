import { useDashboard } from '@/contexts/DashboardContext';
import { FileUpload } from '@/components/FileUpload';
import { KPICard } from '@/components/KPICard';
import { CashFlowChart } from '@/components/CashFlowChart';
import { SalesChart } from '@/components/SalesChart';
import { ProgressChart } from '@/components/ProgressChart';
import { GanttChart } from '@/components/GanttChart';
import { DRETable } from '@/components/DRETable';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Building, 
  ShoppingCart, 
  Package, 
  AlertTriangle,
  Database
} from 'lucide-react';
import { 
  calculateKPIs, 
  calculateChartData, 
  calculateSalesChartData, 
  calculateProgressChartData,
  calculateDREData,
  formatCurrency,
  formatPercentage,
  formatNumber
} from '@/utils/calculations';

export function Dashboard() {
  const { data, filters, setData, setFilters, loadMockData, availableMonths } = useDashboard();

  if (!data) {
    return (
      <div className="min-h-screen bg-executive-bg">
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-executive-text-primary">
              PropVisio Dashboard
            </h1>
            <p className="text-executive-text-secondary">
              Painel de Viabilidade Financeira para Empreendimentos Imobiliários
            </p>
          </div>

          {/* Upload and Demo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <FileUpload onDataLoaded={(newData) => {
              setData(newData);
              if (newData.dados_mensais.length > 0) {
                const sortedMonths = newData.dados_mensais
                  .map(item => item.mes_ano)
                  .sort()
                  .reverse();
                setFilters({ selectedMonth: sortedMonths[0] });
              }
            }} />
            
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-executive-text-primary mb-2">
                  Ou experimente com dados demo
                </h3>
                <Button 
                  onClick={loadMockData}
                  variant="outline"
                  className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-primary-foreground"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Carregar Dados Demo
                </Button>
              </div>
              
              <div className="text-xs text-executive-text-secondary bg-muted/30 p-4 rounded border">
                <p className="font-medium mb-2">Dados Demo incluem:</p>
                <ul className="space-y-1">
                  <li>• 8 meses de dados financeiros</li>
                  <li>• VGV de R$ 120M com vendas progressivas</li>
                  <li>• Fluxo de caixa projetado vs realizado</li>
                  <li>• 5 marcos de projeto com cronograma</li>
                  <li>• Avanços físico e financeiro</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate KPIs and chart data
  const kpis = calculateKPIs(data.dados_mensais, filters.selectedMonth, filters.showAccumulated);
  const cashFlowData = calculateChartData(data.dados_mensais);
  const salesData = calculateSalesChartData(data.dados_mensais);
  const progressPhysicalFinancial = calculateProgressChartData(data.dados_mensais);
  const progressPhysicalProjected = calculateProgressChartData(data.dados_mensais);
  const dreData = calculateDREData(data.dados_mensais, filters.showAccumulated);

  return (
    <div className="min-h-screen bg-executive-bg">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-executive-card border-b border-border/50 shadow-[--shadow-card]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-executive-text-primary">
                Viabilidade – Empreendimento Demo
              </h1>
              <p className="text-sm text-executive-text-secondary">
                Painel Executivo para Investidores
              </p>
            </div>
            
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Label htmlFor="month-filter" className="text-sm font-medium">
                  Mês:
                </Label>
                <Select 
                  value={filters.selectedMonth} 
                  onValueChange={(value) => setFilters({ selectedMonth: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMonths.map(month => {
                      const [year, monthNum] = month.split('-');
                      const displayMonth = `${monthNum}/${year}`;
                      return (
                        <SelectItem key={month} value={month}>
                          {displayMonth}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  id="accumulated"
                  checked={filters.showAccumulated}
                  onCheckedChange={(checked) => setFilters({ showAccumulated: checked })}
                />
                <Label htmlFor="accumulated" className="text-sm">
                  Acumulado até Mês
                </Label>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.reload()}
              >
                Novo Upload
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
          <KPICard
            title="Rentabilidade"
            value={formatPercentage(kpis.rentabilidade.value)}
            subtitle="Payback"
            subvalue={`${kpis.rentabilidade.pa_meses} meses`}
            isEstimated={kpis.rentabilidade.isEstimated}
            trend={kpis.rentabilidade.value > 5 ? 'up' : kpis.rentabilidade.value < 2 ? 'down' : 'stable'}
            icon={<TrendingUp className="w-8 h-8" />}
          />
          
          <KPICard
            title="VGV do Projeto"
            value={formatCurrency(kpis.vgv.value)}
            subtitle="% Vendido"
            subvalue={formatPercentage(kpis.vgv.percentVendido)}
            trend={kpis.vgv.percentVendido > 50 ? 'up' : kpis.vgv.percentVendido < 25 ? 'down' : 'stable'}
            icon={<Building className="w-8 h-8" />}
          />
          
          <KPICard
            title="Vendas Acumuladas"
            value={formatCurrency(kpis.vendasAcumuladas.valor)}
            subtitle="Unidades"
            subvalue={formatNumber(kpis.vendasAcumuladas.unidades)}
            trend="up"
            icon={<ShoppingCart className="w-8 h-8" />}
          />
          
          <KPICard
            title="Estoque Atual"
            value={formatCurrency(kpis.estoque.valor)}
            subtitle="Unidades"
            subvalue={formatNumber(kpis.estoque.unidades)}
            trend={kpis.estoque.unidades < 50 ? 'up' : 'down'}
            icon={<Package className="w-8 h-8" />}
          />
          
          <KPICard
            title="Inadimplência"
            value={formatPercentage(kpis.inadimplencia.percentual)}
            subtitle="Valor"
            subvalue={formatCurrency(kpis.inadimplencia.valor)}
            trend={kpis.inadimplencia.percentual < 2 ? 'up' : 'down'}
            icon={<AlertTriangle className="w-8 h-8" />}
          />
        </div>

        {/* Charts Row 1 - Cash Flow */}
        <div className="grid grid-cols-1 gap-6">
          <CashFlowChart data={cashFlowData} />
        </div>

        {/* Charts Row 2 - Sales and Progress */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <SalesChart data={salesData} />
          <ProgressChart 
            data={progressPhysicalFinancial} 
            type="physical-financial"
          />
        </div>

        {/* Charts Row 3 - Physical Progress and Gantt */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ProgressChart 
            data={progressPhysicalProjected} 
            type="physical-projected"
          />
          <GanttChart data={data.marcos_projeto || []} />
        </div>

        {/* DRE Table */}
        <div className="grid grid-cols-1 gap-6">
          <DRETable 
            data={dreData} 
            showAccumulated={filters.showAccumulated}
          />
        </div>
      </div>
    </div>
  );
}