import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CircularProgress } from '@/components/CircularProgress';
import { 
  TrendingUp, 
  Building, 
  Target,
  Hammer,
  DollarSign,
  TrendingDown,
  Minus,
  Calculator,
  PieChart,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { ExcelData } from '@/types/dashboard';
import { 
  formatCurrency, 
  formatPercentage, 
  calculateVPL,
  calculateTIR,
  calculateExposicaoMaxima,
  calculateCustoTerrenoVGV,
  calculateCustoConstrucaoVGV,
  calculateLucratividade,
  calculateEntidadeResultados,
  calculateQualityScore
} from '@/utils/financial-calculations';

interface EnhancedKPICardsProps {
  data: ExcelData;
  selectedMonth: string;
}

export function EnhancedKPICards({ data, selectedMonth }: EnhancedKPICardsProps) {
  const currentMonthData = data.dados_mensais.find(d => d.mes_ano === selectedMonth);
  const sortedData = [...data.dados_mensais].sort((a, b) => a.mes_ano.localeCompare(b.mes_ano));
  const currentIndex = sortedData.findIndex(d => d.mes_ano === selectedMonth);
  const previousMonthData = currentIndex > 0 ? sortedData[currentIndex - 1] : null;
  
  if (!currentMonthData) return null;

  // Calculate enhanced indicators based on documentation
  const fluxos = sortedData.map(d => d.fluxo_real || d.fluxo_proj || 0);
  const vgv = currentMonthData.vgv || data.projeto_info?.vgv || 0;
  const exposicao = calculateExposicaoMaxima(sortedData);
  const entidadeResultados = calculateEntidadeResultados(sortedData, data.projeto_info);
  const qualityScore = calculateQualityScore(sortedData);
  
  // Calculate variations for trend indicators
  const calculateVariation = (current: number, previous: number | undefined) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Dynamic KPIs based on documentation (Section E)
  const dynamicIndicators = [
    {
      title: 'VPL Projeto',
      value: formatCurrency(entidadeResultados.projeto.vpv),
      subtitle: 'Valor Presente Líquido',
      detail: entidadeResultados.projeto.vpv > 0 ? 'Cria Valor' : 'Destrói Valor',
      trend: entidadeResultados.projeto.vpv > 0 ? 'up' : 'down' as const,
      icon: <Calculator className="w-5 h-5" />,
      status: entidadeResultados.projeto.vpv > 0 ? 'success' : 'danger' as const
    },
    {
      title: 'TIR Anualizada',
      value: formatPercentage(entidadeResultados.projeto.tir),
      subtitle: 'Taxa Interna de Retorno',
      detail: `Meta: ${formatPercentage(12)}`, // TMA padrão 12%
      trend: entidadeResultados.projeto.tir > 12 ? 'up' : 'down' as const,
      icon: <PieChart className="w-5 h-5" />,
      status: entidadeResultados.projeto.tir > 12 ? 'success' : 'warning' as const
    },
    {
      title: 'Exposição Máxima',
      value: formatCurrency(exposicao.valor),
      subtitle: 'Capital de Giro Requerido',
      detail: `Data: ${exposicao.data}`,
      trend: 'stable' as const,
      icon: <AlertTriangle className="w-5 h-5" />,
      status: 'warning' as const
    }
  ];

  // Cost ratio indicators (Section B)
  const custoTerreno = sortedData.reduce((sum, d) => sum + (d.custos_terreno || 0), 0);
  const custoConstrucao = sortedData.reduce((sum, d) => sum + (d.custos_construcao || 0), 0);
  const resultado = sortedData.reduce((sum, d) => sum + (d.resultado_operacional || 0), 0);

  const costRatios = [
    {
      title: 'Custo Terreno / VGV',
      value: formatPercentage(calculateCustoTerrenoVGV(custoTerreno, vgv)),
      subtitle: 'Recomendado: < 35%',
      isGood: calculateCustoTerrenoVGV(custoTerreno, vgv) < 35,
      icon: <Building className="w-5 h-5" />
    },
    {
      title: 'Custo Construção / VGV',
      value: formatPercentage(calculateCustoConstrucaoVGV(custoConstrucao, vgv)),
      subtitle: 'Recomendado: < 60%',
      isGood: calculateCustoConstrucaoVGV(custoConstrucao, vgv) < 60,
      icon: <Hammer className="w-5 h-5" />
    },
    {
      title: 'Lucratividade',
      value: formatPercentage(calculateLucratividade(resultado, vgv)),
      subtitle: 'Recomendado: > 15%',
      isGood: calculateLucratividade(resultado, vgv) > 15,
      icon: <TrendingUp className="w-5 h-5" />
    }
  ];

  // Market indicators with variations (Section C)
  const marketIndicators = [
    {
      title: 'Vendas Acumuladas',
      value: formatCurrency(currentMonthData.vendas_valor || 0),
      variation: calculateVariation(
        currentMonthData.vendas_valor || 0, 
        previousMonthData?.vendas_valor
      ),
      subtitle: `${((currentMonthData.vendas_valor || 0) / vgv * 100).toFixed(1)}% do VGV`,
      icon: <Target className="w-5 h-5" />
    },
    {
      title: 'Inadimplência',
      value: formatPercentage(currentMonthData.inadimplencia_perc || 0),
      variation: calculateVariation(
        currentMonthData.inadimplencia_perc || 0,
        previousMonthData?.inadimplencia_perc
      ),
      subtitle: formatCurrency(currentMonthData.inadimplencia_valor || 0),
      icon: <AlertTriangle className="w-5 h-5" />
    },
    {
      title: 'Payback',
      value: `${currentMonthData.pa_meses || 0} meses`,
      variation: calculateVariation(
        currentMonthData.pa_meses || 0,
        previousMonthData?.pa_meses
      ),
      subtitle: 'Período de Retorno',
      icon: <Clock className="w-5 h-5" />
    }
  ];

  // Project info enhanced with documentation fields
  const projectInfo = [
    {
      label: 'QUALIDADE',
      value: `${Math.round(qualityScore)}%`,
      className: qualityScore >= 80 ? 'bg-green-500/10 text-green-600' : 
                qualityScore >= 60 ? 'bg-yellow-500/10 text-yellow-600' : 
                'bg-red-500/10 text-red-600'
    },
    {
      label: 'UNIDADES',
      value: data.projeto_info?.num_uhs || '126',
      className: 'bg-blue-500/10 text-blue-600'
    },
    {
      label: 'ÁREA PRIVATIVA',
      value: `${data.projeto_info?.area_privativa_total || 4982} m²`,
      className: 'bg-green-500/10 text-green-600'
    },
    {
      label: 'PREÇO MÉDIO/m²',
      value: formatCurrency((vgv / (data.projeto_info?.area_privativa_total || 4982)) || 0),
      className: 'bg-purple-500/10 text-purple-600'
    },
    {
      label: 'VGV',
      value: formatCurrency(vgv),
      className: 'bg-orange-500/10 text-orange-600'
    },
    {
      label: 'VERSÃO',
      value: data.projeto_info?.versao || 'v1.0',
      className: 'bg-teal-500/10 text-teal-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Project Info Cards - Enhanced */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Building className="w-5 h-5" />
          Informações do Projeto - EVE vs Real
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {projectInfo.map((info) => (
            <Card key={info.label} className={`p-4 text-center ${info.className} border-0`}>
              <div className="space-y-1">
                <div className="text-xs font-medium opacity-80">
                  {info.label}
                </div>
                <div className="text-lg font-bold">
                  {info.value}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Dynamic Indicators (VPL, TIR, Exposição) */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Indicadores Dinâmicos - Fluxo de Caixa
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dynamicIndicators.map((indicator) => (
            <Card key={indicator.title} className="p-6">
              <CardContent className="p-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm uppercase tracking-wide">
                    {indicator.title}
                  </span>
                  {indicator.icon}
                </div>
                
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {indicator.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {indicator.subtitle}
                  </div>
                  <div className="text-xs font-medium">
                    {indicator.detail}
                  </div>
                  
                  <Badge 
                    variant={
                      indicator.status === 'success' ? 'default' : 
                      indicator.status === 'danger' ? 'destructive' : 'secondary'
                    }
                    className="text-xs"
                  >
                    {indicator.status === 'success' ? 'Excelente' : 
                     indicator.status === 'danger' ? 'Crítico' : 'Atenção'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cost Ratios */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Razões de Custo - DRE Viabilidade
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {costRatios.map((ratio) => (
            <Card key={ratio.title} className="p-6">
              <CardContent className="p-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm uppercase tracking-wide">
                    {ratio.title}
                  </span>
                  <div className="flex items-center gap-1">
                    {ratio.icon}
                    {ratio.isGood ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {ratio.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {ratio.subtitle}
                  </div>
                  
                  <Badge 
                    variant={ratio.isGood ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {ratio.isGood ? 'Dentro do Recomendado' : 'Fora do Padrão'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Market Indicators with Variations */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Vendas e Mercado - PA vs Real
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {marketIndicators.map((indicator) => (
            <Card key={indicator.title} className="p-6">
              <CardContent className="p-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm uppercase tracking-wide">
                    {indicator.title}
                  </span>
                  <div className="flex items-center gap-1">
                    {indicator.icon}
                    {Math.abs(indicator.variation) > 0 && (
                      indicator.variation > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {indicator.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {indicator.subtitle}
                  </div>
                  {Math.abs(indicator.variation) > 0 && (
                    <div className="text-xs font-medium">
                      Variação vs mês anterior: {formatPercentage(Math.abs(indicator.variation))}
                      <span className={indicator.variation > 0 ? 'text-green-600' : 'text-red-600'}>
                        {indicator.variation > 0 ? ' ↑' : ' ↓'}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Entity Results Summary */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <PieChart className="w-5 h-5" />
          Resultados por Entidade
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <CardContent className="p-0">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-sm uppercase tracking-wide">
                  PROJETO (SPE)
                </span>
                <Building className="w-5 h-5" />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Resultado:</span>
                  <span className="font-medium">{formatCurrency(entidadeResultados.projeto.resultado)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Resultado/VGV:</span>
                  <span className="font-medium">{formatPercentage(entidadeResultados.projeto.resultado_vgv_perc)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">TIR:</span>
                  <span className="font-medium">{formatPercentage(entidadeResultados.projeto.tir)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Exposição Máxima:</span>
                  <span className="font-medium">{formatCurrency(entidadeResultados.projeto.exposicao_maxima)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="p-0">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-sm uppercase tracking-wide">
                  HOLDING
                </span>
                <DollarSign className="w-5 h-5" />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Resultado Total:</span>
                  <span className="font-medium">{formatCurrency(entidadeResultados.holding.resultado_total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Dividendos:</span>
                  <span className="font-medium">{formatCurrency(entidadeResultados.holding.dividendos)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">ROI:</span>
                  <span className="font-medium">{formatPercentage(entidadeResultados.holding.roi)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">MTIR:</span>
                  <span className="font-medium">{formatPercentage(entidadeResultados.holding.mtir)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}