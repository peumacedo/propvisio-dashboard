import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  TrendingUp, 
  TrendingDown, 
  GitCompare, 
  Calendar,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Eye,
  Filter
} from 'lucide-react';
import { ExcelData } from '@/types/dashboard';
import { formatCurrency, formatPercentage, formatNumber } from '@/utils/calculations';

interface EnhancedVersionComparisonProps {
  data: ExcelData[];
  currentData: ExcelData;
}

interface PeriodData {
  month: number;
  ytd: number;
  itd: number;
  year: number;
  projection: number;
}

interface MetricComparison {
  current: PeriodData;
  previous: PeriodData;
  variance: PeriodData;
}

export function EnhancedVersionComparison({ data, currentData }: EnhancedVersionComparisonProps) {
  const [compareVersion, setCompareVersion] = useState<string>('');
  const [selectedView, setSelectedView] = useState<string>('table');
  const [filterSignificant, setFilterSignificant] = useState<boolean>(false);

  if (data.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="w-5 h-5" />
            Análise Comparativa Avançada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Carregue múltiplas versões para ativar a análise comparativa detalhada.
          </p>
        </CardContent>
      </Card>
    );
  }

  const compareData = data.find(d => d.projeto_info?.versao === compareVersion);

  const getMetricValue = (data: ExcelData, period: 'month' | 'ytd' | 'itd' | 'year' | 'projection', metric: string): number => {
    if (!data.dados_mensais.length) return 0;
    
    switch (period) {
      case 'month':
        const latestMonth = data.dados_mensais[data.dados_mensais.length - 1];
        return (latestMonth as any)[metric] || 0;
      
      case 'ytd':
      case 'itd':
      case 'year':
        return data.dados_mensais.reduce((acc, curr) => acc + ((curr as any)[metric] || 0), 0);
      
      case 'projection':
        // Use VGV for projection or latest month value
        if (metric === 'vgv') return data.projeto_info?.vgv || 0;
        return data.dados_mensais[data.dados_mensais.length - 1]?.[metric as keyof typeof data.dados_mensais[0]] as number || 0;
      
      default:
        return 0;
    }
  };

  const calculateComparison = (metric: string): MetricComparison | null => {
    if (!compareData) return null;

    const periods: (keyof PeriodData)[] = ['month', 'ytd', 'itd', 'year', 'projection'];
    
    const current: PeriodData = {} as PeriodData;
    const previous: PeriodData = {} as PeriodData;
    const variance: PeriodData = {} as PeriodData;

    periods.forEach(period => {
      current[period] = getMetricValue(currentData, period, metric);
      previous[period] = getMetricValue(compareData, period, metric);
      
      if (previous[period] === 0) {
        variance[period] = current[period] > 0 ? 100 : 0;
      } else {
        variance[period] = ((current[period] - previous[period]) / Math.abs(previous[period])) * 100;
      }
    });

    return { current, previous, variance };
  };

  const metrics = [
    { key: 'vendas_valor', label: 'Vendas Realizadas', format: 'currency', positive: true },
    { key: 'vendas_unid', label: 'Unidades Vendidas', format: 'number', positive: true },
    { key: 'vgv', label: 'VGV Total', format: 'currency', positive: true },
    { key: 'fluxo_real', label: 'Fluxo Realizado', format: 'currency', positive: true },
    { key: 'fluxo_proj', label: 'Fluxo Projetado', format: 'currency', positive: true },
    { key: 'rentabilidade_perc', label: 'Rentabilidade %', format: 'percentage', positive: true },
    { key: 'avanco_fisico_perc', label: 'Avanço Físico %', format: 'percentage', positive: true },
    { key: 'contas_receber', label: 'Contas a Receber', format: 'currency', positive: true },
    { key: 'contas_pagar', label: 'Contas a Pagar', format: 'currency', positive: false },
    { key: 'inadimplencia_valor', label: 'Inadimplência', format: 'currency', positive: false }
  ];

  const getVarianceIcon = (variance: number) => {
    if (Math.abs(variance) < 1) return <Minus className="w-4 h-4 text-muted-foreground" />;
    if (variance > 0) return <ArrowUpRight className="w-4 h-4 text-green-600" />;
    return <ArrowDownRight className="w-4 h-4 text-red-600" />;
  };

  const getVarianceColor = (variance: number, isPositiveBetter: boolean) => {
    if (Math.abs(variance) < 1) return 'text-muted-foreground';
    const isPositive = variance > 0;
    return (isPositiveBetter ? isPositive : !isPositive)
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-600 dark:text-red-400';
  };

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency': return formatCurrency(value);
      case 'percentage': return formatPercentage(value / 100);
      case 'number': return formatNumber(value);
      default: return value.toFixed(0);
    }
  };

  const significantMetrics = metrics.filter(metric => {
    const comparison = calculateComparison(metric.key);
    if (!comparison) return false;
    return Object.values(comparison.variance).some(v => Math.abs(v) > 5);
  });

  const displayMetrics = filterSignificant ? significantMetrics : metrics;

  if (!compareData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="w-5 h-5" />
            Análise Comparativa Avançada
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Comparar com Versão:</label>
              <Select value={compareVersion} onValueChange={setCompareVersion}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar versão" />
                </SelectTrigger>
                <SelectContent>
                  {data
                    .filter(d => d.projeto_info?.versao !== currentData.projeto_info?.versao)
                    .map(d => (
                      <SelectItem 
                        key={d.projeto_info?.versao} 
                        value={d.projeto_info?.versao || ''}
                      >
                        v{d.projeto_info?.versao} - {d.projeto_info?.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Modo de Visualização:</label>
              <Select value={selectedView} onValueChange={setSelectedView}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar visualização" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="table">Tabela Detalhada</SelectItem>
                  <SelectItem value="summary">Resumo Executivo</SelectItem>
                  <SelectItem value="trends">Análise de Tendências</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="w-5 h-5" />
            Análise Comparativa: v{currentData.projeto_info?.versao} vs v{compareData.projeto_info?.versao}
          </CardTitle>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Fechamentos: Atual vs Anterior</span>
              <Badge variant="outline">
                {data.length} versões disponíveis
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <label className="text-sm">Apenas variações &gt; 5%</label>
              <input 
                type="checkbox" 
                checked={filterSignificant}
                onChange={(e) => setFilterSignificant(e.target.checked)}
                className="rounded"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={selectedView} onValueChange={setSelectedView} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="table" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Tabela Detalhada
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Resumo Executivo
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Análise de Tendências
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Análise Multi-Período Detalhada</CardTitle>
                <Badge variant="outline">
                  {displayMetrics.length} métricas {filterSignificant && 'significativas'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-48">Métrica</TableHead>
                      <TableHead className="text-center">Mar/25</TableHead>
                      <TableHead className="text-center">YTD</TableHead>
                      <TableHead className="text-center">ITD</TableHead>
                      <TableHead className="text-center">2025</TableHead>
                      <TableHead className="text-center">100% PROJ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayMetrics.map((metric) => {
                      const comparison = calculateComparison(metric.key);
                      if (!comparison) return null;

                      return (
                        <TableRow key={metric.key}>
                          <TableCell className="font-medium">{metric.label}</TableCell>
                          {(['month', 'ytd', 'itd', 'year', 'projection'] as const).map(period => (
                            <TableCell key={period} className="text-center">
                              <div className="grid grid-cols-3 gap-1 text-xs">
                                <div className="font-medium">
                                  {formatValue(comparison.current[period], metric.format)}
                                </div>
                                <div className="text-muted-foreground">
                                  {formatValue(comparison.previous[period], metric.format)}
                                </div>
                                <div className={`font-medium flex items-center justify-center gap-1 ${getVarianceColor(comparison.variance[period], metric.positive)}`}>
                                  {getVarianceIcon(comparison.variance[period])}
                                  {Math.abs(comparison.variance[period]) < 0.1 ? '-' : `${comparison.variance[period] > 0 ? '+' : ''}${comparison.variance[period].toFixed(1)}%`}
                                </div>
                              </div>
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Top Improvements */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <TrendingUp className="w-5 h-5" />
                  Maiores Ganhos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics
                    .map(m => ({ ...m, comparison: calculateComparison(m.key) }))
                    .filter(m => m.comparison && Object.values(m.comparison.variance).some(v => v > 10))
                    .slice(0, 3)
                    .map(metric => (
                      <div key={metric.key} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{metric.label}</span>
                        <Badge variant="secondary" className="text-green-700">
                          +{Math.max(...Object.values(metric.comparison!.variance)).toFixed(1)}%
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Areas of Concern */}
            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <TrendingDown className="w-5 h-5" />
                  Atenção Requerida
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics
                    .map(m => ({ ...m, comparison: calculateComparison(m.key) }))
                    .filter(m => m.comparison && Object.values(m.comparison.variance).some(v => v < -5))
                    .slice(0, 3)
                    .map(metric => (
                      <div key={metric.key} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{metric.label}</span>
                        <Badge variant="destructive">
                          {Math.min(...Object.values(metric.comparison!.variance)).toFixed(1)}%
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Stability Metrics */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <BarChart3 className="w-5 h-5" />
                  Métricas Estáveis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics
                    .map(m => ({ ...m, comparison: calculateComparison(m.key) }))
                    .filter(m => m.comparison && Object.values(m.comparison.variance).every(v => Math.abs(v) < 5))
                    .slice(0, 3)
                    .map(metric => (
                      <div key={metric.key} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{metric.label}</span>
                        <Badge variant="outline" className="text-blue-700">
                          Estável
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Tendências Entre Versões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {metrics.slice(0, 4).map(metric => {
                  const comparison = calculateComparison(metric.key);
                  if (!comparison) return null;

                  return (
                    <div key={metric.key} className="space-y-3">
                      <h4 className="font-semibold">{metric.label}</h4>
                      <div className="space-y-2">
                        {(['month', 'ytd', 'itd', 'year', 'projection'] as const).map(period => (
                          <div key={period} className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground capitalize">
                              {period === 'month' ? 'Março' : period === 'ytd' ? 'YTD' : period === 'itd' ? 'ITD' : period === 'year' ? '2025' : 'Projeção'}
                            </span>
                            <div className="flex items-center gap-2">
                            <div className={`w-16 text-xs text-right ${getVarianceColor(comparison.variance[period], metric.positive)}`}>
                              {comparison.variance[period] > 0 ? '+' : ''}{comparison.variance[period].toFixed(1)}%
                            </div>
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${comparison.variance[period] >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min(Math.abs(comparison.variance[period]), 100)}%` }}
                              />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}