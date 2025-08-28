import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, BarChart3, GitCompare } from 'lucide-react';
import { ExcelData } from '@/types/dashboard';
import { formatCurrency, formatPercentage, formatNumber } from '@/utils/calculations';

interface VersionComparisonProps {
  data: ExcelData[];
  currentData: ExcelData;
}

export function VersionComparison({ data, currentData }: VersionComparisonProps) {
  const [compareVersion, setCompareVersion] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');

  if (data.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="w-5 h-5" />
            Comparação de Versões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Carregue múltiplas versões para ativar a análise comparativa.
          </p>
        </CardContent>
      </Card>
    );
  }

  const compareData = data.find(d => d.projeto_info?.versao === compareVersion);
  const availablePeriods = currentData.dados_mensais.map(d => d.mes_ano).sort().reverse();

  const calculateVariance = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  const getVarianceIcon = (variance: number) => {
    if (Math.abs(variance) < 1) return <Minus className="w-4 h-4" />;
    return variance > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  const getVarianceColor = (variance: number, isPositiveBetter: boolean = true) => {
    if (Math.abs(variance) < 1) return 'text-muted-foreground';
    const isPositive = variance > 0;
    return (isPositiveBetter ? isPositive : !isPositive) 
      ? 'text-green-600 dark:text-green-400' 
      : 'text-red-600 dark:text-red-400';
  };

  if (!compareData || !selectedPeriod) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="w-5 h-5" />
            Comparação de Versões
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
              <label className="text-sm font-medium mb-2 block">Período de Análise:</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar período" />
                </SelectTrigger>
                <SelectContent>
                  {availablePeriods.map(period => {
                    const [year, month] = period.split('-');
                    return (
                      <SelectItem key={period} value={period}>
                        {month}/{year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentPeriodData = currentData.dados_mensais.find(d => d.mes_ano === selectedPeriod);
  const comparePeriodData = compareData.dados_mensais.find(d => d.mes_ano === selectedPeriod);

  if (!currentPeriodData || !comparePeriodData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="w-5 h-5" />
            Comparação de Versões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Período não disponível em uma das versões selecionadas.
          </p>
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    {
      label: 'VGV',
      current: currentPeriodData.vgv || 0,
      compare: comparePeriodData.vgv || 0,
      format: 'currency',
      isPositiveBetter: true
    },
    {
      label: 'Vendas Valor',
      current: currentPeriodData.vendas_valor || 0,
      compare: comparePeriodData.vendas_valor || 0,
      format: 'currency',
      isPositiveBetter: true
    },
    {
      label: 'Vendas Unidades',
      current: currentPeriodData.vendas_unid || 0,
      compare: comparePeriodData.vendas_unid || 0,
      format: 'number',
      isPositiveBetter: true
    },
    {
      label: 'Fluxo Projetado',
      current: currentPeriodData.fluxo_proj || 0,
      compare: comparePeriodData.fluxo_proj || 0,
      format: 'currency',
      isPositiveBetter: true
    },
    {
      label: 'Fluxo Realizado',
      current: currentPeriodData.fluxo_real || 0,
      compare: comparePeriodData.fluxo_real || 0,
      format: 'currency',
      isPositiveBetter: true
    },
    {
      label: 'Rentabilidade',
      current: currentPeriodData.rentabilidade_perc || 0,
      compare: comparePeriodData.rentabilidade_perc || 0,
      format: 'percentage',
      isPositiveBetter: true
    },
    {
      label: 'Inadimplência',
      current: currentPeriodData.inadimplencia_perc || 0,
      compare: comparePeriodData.inadimplencia_perc || 0,
      format: 'percentage',
      isPositiveBetter: false
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCompare className="w-5 h-5" />
          Análise de Variações: v{currentData.projeto_info?.versao} vs v{compareData.projeto_info?.versao}
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Período: {selectedPeriod?.split('-').reverse().join('/')}</span>
          <Badge variant="outline">
            {metrics.filter(m => Math.abs(calculateVariance(m.current, m.compare)) >= 5).length} variações significativas
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric) => {
            const variance = calculateVariance(metric.current, metric.compare);
            const formatValue = (value: number) => {
              switch (metric.format) {
                case 'currency': return formatCurrency(value);
                case 'percentage': return formatPercentage(value);
                case 'number': return formatNumber(value);
                default: return value.toString();
              }
            };

            return (
              <Card key={metric.label} className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      {metric.label}
                    </span>
                    <div className={`flex items-center gap-1 ${getVarianceColor(variance, metric.isPositiveBetter)}`}>
                      {getVarianceIcon(variance)}
                      <span className="text-xs font-medium">
                        {Math.abs(variance) < 0.1 ? '0%' : `${variance > 0 ? '+' : ''}${variance.toFixed(1)}%`}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Atual</span>
                      <span className="text-sm font-semibold">
                        {formatValue(metric.current)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Anterior</span>
                      <span className="text-sm">
                        {formatValue(metric.compare)}
                      </span>
                    </div>
                  </div>
                  
                  {Math.abs(variance) >= 10 && (
                    <Badge 
                      variant={variance > 0 ? "default" : "destructive"} 
                      className="text-xs"
                    >
                      Variação Alta
                    </Badge>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm font-medium">Resumo Executivo</span>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              • {metrics.filter(m => calculateVariance(m.current, m.compare) > 5).length} indicadores com crescimento acima de 5%
            </p>
            <p>
              • {metrics.filter(m => calculateVariance(m.current, m.compare) < -5).length} indicadores com redução acima de 5%
            </p>
            <p>
              • Maior variação: {metrics.reduce((max, m) => {
                const variance = Math.abs(calculateVariance(m.current, m.compare));
                return variance > Math.abs(calculateVariance(max.current, max.compare)) ? m : max;
              }).label} ({Math.abs(calculateVariance(
                metrics.reduce((max, m) => {
                  const variance = Math.abs(calculateVariance(m.current, m.compare));
                  return variance > Math.abs(calculateVariance(max.current, max.compare)) ? m : max;
                }).current,
                metrics.reduce((max, m) => {
                  const variance = Math.abs(calculateVariance(m.current, m.compare));
                  return variance > Math.abs(calculateVariance(max.current, max.compare)) ? m : max;
                }).compare
              )).toFixed(1)}%)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}