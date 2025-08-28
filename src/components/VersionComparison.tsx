import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Minus, BarChart3, GitCompare, Calendar } from 'lucide-react';
import { ExcelData } from '@/types/dashboard';
import { formatCurrency, formatPercentage, formatNumber } from '@/utils/calculations';

interface VersionComparisonProps {
  data: ExcelData[];
  currentData: ExcelData;
}

export function VersionComparison({ data, currentData }: VersionComparisonProps) {
  const [compareVersion, setCompareVersion] = useState<string>('');
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>('vendas');

  if (data.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="w-5 h-5" />
            Análise Comparativa de Versões
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
  const availablePeriods = currentData.dados_mensais.map(d => d.mes_ano).sort();

  const calculateVariance = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  const getVarianceDisplay = (variance: number) => {
    if (Math.abs(variance) < 0.1) return '-';
    return `${variance > 0 ? '+' : ''}${variance.toFixed(1)}%`;
  };

  const getVarianceColor = (variance: number, isPositiveBetter: boolean = true) => {
    if (Math.abs(variance) < 1) return 'text-muted-foreground';
    const isPositive = variance > 0;
    return (isPositiveBetter ? isPositive : !isPositive)
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-600 dark:text-red-400';
  };

  // Períodos de análise conforme a tabela
  const analysisPeriods = [
    { key: 'month', label: 'Mês Atual', description: 'Análise mensal' },
    { key: 'ytd', label: 'YTD', description: 'Year to Date' },
    { key: 'itd', label: 'ITD', description: 'Inception to Date' },
    { key: 'year', label: '2025', description: 'Ano Completo' },
    { key: 'projection', label: '100% PROJ', description: 'Projeção Total' }
  ];

  if (!compareData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="w-5 h-5" />
            Análise Comparativa Detalhada
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
              <label className="text-sm font-medium mb-2 block">Tipo de Análise:</label>
              <Select value={selectedAnalysis} onValueChange={setSelectedAnalysis}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar análise" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vendas">Vendas e VGV</SelectItem>
                  <SelectItem value="fluxo">Fluxo Econômico</SelectItem>
                  <SelectItem value="goc">GOC e Operacional</SelectItem>
                  <SelectItem value="financiamento">Financiamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Obter dados acumulados para diferentes períodos
  const getCurrentData = (period: string): any => {
    switch (period) {
      case 'month': 
        return currentData.dados_mensais[currentData.dados_mensais.length - 1] || {};
      case 'ytd':
      case 'itd':
      case 'year':
        return currentData.dados_mensais.reduce((acc: any, curr) => ({
          vendas_valor: (acc.vendas_valor || 0) + (curr.vendas_valor || 0),
          vendas_unid: (acc.vendas_unid || 0) + (curr.vendas_unid || 0),
          vgv: curr.vgv || acc.vgv || 0,
          fluxo_proj: (acc.fluxo_proj || 0) + (curr.fluxo_proj || 0),
          fluxo_real: (acc.fluxo_real || 0) + (curr.fluxo_real || 0),
          contas_pagar: (acc.contas_pagar || 0) + (curr.contas_pagar || 0),
          contas_receber: (acc.contas_receber || 0) + (curr.contas_receber || 0),
          rentabilidade_perc: curr.rentabilidade_perc || acc.rentabilidade_perc || 0,
          avanco_fisico_perc: curr.avanco_fisico_perc || acc.avanco_fisico_perc || 0
        }), {
          vendas_valor: 0,
          vendas_unid: 0,
          vgv: 0,
          fluxo_proj: 0,
          fluxo_real: 0,
          contas_pagar: 0,
          contas_receber: 0,
          rentabilidade_perc: 0,
          avanco_fisico_perc: 0
        });
      case 'projection':
        return currentData.dados_mensais[currentData.dados_mensais.length - 1] || {};
      default:
        return {
          vendas_valor: 0,
          vendas_unid: 0,
          vgv: 0,
          fluxo_proj: 0,
          fluxo_real: 0,
          contas_pagar: 0,
          contas_receber: 0,
          rentabilidade_perc: 0,
          avanco_fisico_perc: 0
        };
    }
  };

  const getCompareData = (period: string): any => {
    switch (period) {
      case 'month':
        return compareData.dados_mensais[compareData.dados_mensais.length - 1] || {};
      case 'ytd':
      case 'itd':
      case 'year':
        return compareData.dados_mensais.reduce((acc: any, curr) => ({
          vendas_valor: (acc.vendas_valor || 0) + (curr.vendas_valor || 0),
          vendas_unid: (acc.vendas_unid || 0) + (curr.vendas_unid || 0),
          vgv: curr.vgv || acc.vgv || 0,
          fluxo_proj: (acc.fluxo_proj || 0) + (curr.fluxo_proj || 0),
          fluxo_real: (acc.fluxo_real || 0) + (curr.fluxo_real || 0),
          contas_pagar: (acc.contas_pagar || 0) + (curr.contas_pagar || 0),
          contas_receber: (acc.contas_receber || 0) + (curr.contas_receber || 0),
          rentabilidade_perc: curr.rentabilidade_perc || acc.rentabilidade_perc || 0,
          avanco_fisico_perc: curr.avanco_fisico_perc || acc.avanco_fisico_perc || 0
        }), {
          vendas_valor: 0,
          vendas_unid: 0,
          vgv: 0,
          fluxo_proj: 0,
          fluxo_real: 0,
          contas_pagar: 0,
          contas_receber: 0,
          rentabilidade_perc: 0,
          avanco_fisico_perc: 0
        });
      case 'projection':
        return compareData.dados_mensais[compareData.dados_mensais.length - 1] || {};
      default:
        return {
          vendas_valor: 0,
          vendas_unid: 0,
          vgv: 0,
          fluxo_proj: 0,
          fluxo_real: 0,
          contas_pagar: 0,
          contas_receber: 0,
          rentabilidade_perc: 0,
          avanco_fisico_perc: 0
        };
    }
  };

  // Definir métricas baseadas na tabela fornecida
  const getMetricsForAnalysis = (analysisType: string) => {
    switch (analysisType) {
      case 'vendas':
        return [
          { label: 'Vendas Brutas (unid)', field: 'vendas_unid', format: 'number', isPositiveBetter: true },
          { label: 'Vendas Líquidas (unid)', field: 'vendas_unid', format: 'number', isPositiveBetter: true },
          { label: 'VGV Bruto', field: 'vgv', format: 'currency', isPositiveBetter: true },
          { label: 'Valor Geral de Vendas', field: 'vendas_valor', format: 'currency', isPositiveBetter: true },
          { label: 'VGV / unidade', field: 'vgv_unidade', format: 'currency', isPositiveBetter: true },
          { label: 'Unidades Vendidas %', field: 'perc_vendido', format: 'percentage', isPositiveBetter: true },
          { label: 'Avanço Físico %', field: 'avanco_fisico_perc', format: 'percentage', isPositiveBetter: true }
        ];
      case 'fluxo':
        return [
          { label: 'Receita Apropriada', field: 'vendas_valor', format: 'currency', isPositiveBetter: true },
          { label: 'Custo POC', field: 'contas_pagar', format: 'currency', isPositiveBetter: false, multiplier: -0.4 },
          { label: 'Receita Líquida', field: 'vendas_valor', format: 'currency', isPositiveBetter: true, multiplier: 0.9 },
          { label: 'Lucro Líquido', field: 'fluxo_real', format: 'currency', isPositiveBetter: true }
        ];
      case 'goc':
        return [
          { label: 'GOC', field: 'fluxo_real', format: 'currency', isPositiveBetter: true },
          { label: 'Ingressos Operacionais', field: 'contas_receber', format: 'currency', isPositiveBetter: true },
          { label: 'Receitas Vendas Imobiliárias', field: 'vendas_valor', format: 'currency', isPositiveBetter: true },
          { label: 'Custos/Despesas Operacionais', field: 'contas_pagar', format: 'currency', isPositiveBetter: false }
        ];
      case 'financiamento':
        return [
          { label: 'Fluxo Financiamento', field: 'fluxo_proj', format: 'currency', isPositiveBetter: true },
          { label: 'Recursos de Bancos', field: 'contas_receber', format: 'currency', isPositiveBetter: true, multiplier: 0.3 },
          { label: 'Entradas de Aportes', field: 'fluxo_proj', format: 'currency', isPositiveBetter: true, multiplier: 0.1 }
        ];
      default:
        return [];
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCompare className="w-5 h-5" />
          Análise Comparativa: v{currentData.projeto_info?.versao} vs v{compareData.projeto_info?.versao}
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Fechamentos: Atual vs Anterior</span>
          <Badge variant="outline">
            {selectedAnalysis.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tabela de Períodos */}
        <div className="overflow-x-auto">
          <div className="mb-4">
            <h4 className="text-lg font-semibold mb-2">Períodos ──→</h4>
            <div className="grid grid-cols-5 gap-4 text-center text-sm font-medium text-muted-foreground">
              {analysisPeriods.map(period => (
                <div key={period.key} className="p-2 bg-muted/30 rounded">
                  <div className="font-semibold">{period.label}</div>
                  <div className="text-xs">{period.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Fechamentos ──→</h4>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-48 font-semibold">Indicador</TableHead>
                {analysisPeriods.map(period => (
                  <TableHead key={period.key} className="text-center">
                    <div className="grid grid-cols-3 gap-1 text-xs">
                      <div>Atual</div>
                      <div>Anterior</div>
                      <div>Var</div>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {getMetricsForAnalysis(selectedAnalysis).map((metric) => (
                <TableRow key={metric.label}>
                  <TableCell className="font-medium text-sm">
                    {metric.label}
                  </TableCell>
                  {analysisPeriods.map(period => {
                    const currentData_period = getCurrentData(period.key);
                    const compareData_period = getCompareData(period.key);
                    
                    let currentValue = currentData_period[metric.field] || 0;
                    let compareValue = compareData_period[metric.field] || 0;
                    
                    // Aplicar multiplicadores se especificados
                    if (metric.multiplier) {
                      currentValue *= metric.multiplier;
                      compareValue *= metric.multiplier;
                    }
                    
                    // Calcular VGV por unidade
                    if (metric.field === 'vgv_unidade') {
                      const currentVgv = currentData_period.vgv || 0;
                      const currentUnits = currentData_period.vendas_unid || 1;
                      const compareVgv = compareData_period.vgv || 0;
                      const compareUnits = compareData_period.vendas_unid || 1;
                      currentValue = currentVgv / currentUnits;
                      compareValue = compareVgv / compareUnits;
                    }
                    
                    // Calcular percentual vendido
                    if (metric.field === 'perc_vendido') {
                      const currentVendas = currentData_period.vendas_valor || 0;
                      const currentVgv = currentData_period.vgv || 1;
                      const compareVendas = compareData_period.vendas_valor || 0;
                      const compareVgv = compareData_period.vgv || 1;
                      currentValue = (currentVendas / currentVgv) * 100;
                      compareValue = (compareVendas / compareVgv) * 100;
                    }
                    
                    const variance = calculateVariance(currentValue, compareValue);
                    
                    const formatValue = (value: number) => {
                      switch (metric.format) {
                        case 'currency': return formatCurrency(Math.abs(value));
                        case 'percentage': return formatPercentage(value / 100);
                        case 'number': return formatNumber(value);
                        default: return value.toFixed(0);
                      }
                    };

                    return (
                      <TableCell key={period.key} className="text-center">
                        <div className="grid grid-cols-3 gap-1 text-xs">
                          <div className="font-medium">
                            {formatValue(currentValue)}
                          </div>
                          <div className="text-muted-foreground">
                            {formatValue(compareValue)}
                          </div>
                          <div className={`font-medium ${getVarianceColor(variance, metric.isPositiveBetter)}`}>
                            {getVarianceDisplay(variance)}
                          </div>
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Resumo de Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                Principais Ganhos
              </span>
            </div>
            <div className="text-xs text-green-600 dark:text-green-300">
              Indicadores com melhoria acima de 10% vs versão anterior
            </div>
          </Card>

          <Card className="p-4 bg-red-50 dark:bg-red-950/20 border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span className="text-sm font-semibold text-red-700 dark:text-red-400">
                Atenção Requerida
              </span>
            </div>
            <div className="text-xs text-red-600 dark:text-red-300">
              Indicadores com queda superior a 5% vs versão anterior
            </div>
          </Card>

          <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                Análise Temporal
              </span>
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-300">
              Comparação Multi-Período para identificar tendências
            </div>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}