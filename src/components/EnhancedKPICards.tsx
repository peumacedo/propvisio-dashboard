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
  Minus
} from 'lucide-react';
import { ExcelData } from '@/types/dashboard';
import { formatCurrency, formatPercentage } from '@/utils/calculations';

interface EnhancedKPICardsProps {
  data: ExcelData;
  selectedMonth: string;
}

export function EnhancedKPICards({ data, selectedMonth }: EnhancedKPICardsProps) {
  const currentMonthData = data.dados_mensais.find(d => d.mes_ano === selectedMonth);
  
  if (!currentMonthData) return null;

  const progressCards = [
    {
      title: 'Avanço Vendas',
      value: ((currentMonthData.vendas_valor || 0) / (currentMonthData.vgv || 1)) * 100,
      max: 100,
      color: 'success' as const,
      icon: <Target className="w-5 h-5" />,
      subtitle: `${formatCurrency(currentMonthData.vendas_valor || 0)} vendido`,
      target: formatCurrency(currentMonthData.vgv || 0)
    },
    {
      title: 'Avanço Financeiro',
      value: currentMonthData.avanco_financeiro_perc || 0,
      max: 100,
      color: 'primary' as const,
      icon: <DollarSign className="w-5 h-5" />,
      subtitle: 'Planejado vs Realizado',
      target: `${formatPercentage(currentMonthData.avanco_financeiro_proj || 0)} meta`
    },
    {
      title: 'Avanço Físico',
      value: currentMonthData.avanco_fisico_perc || 0,
      max: 100,
      color: 'warning' as const,
      icon: <Hammer className="w-5 h-5" />,
      subtitle: 'Obra Executada',
      target: `${formatPercentage(currentMonthData.avanco_fisico_proj || 0)} projetado`
    }
  ];

  const performanceCards = [
    {
      title: 'Dividendos',
      value: formatCurrency(19820), // Mock data from reference
      subtitle: 'Distribuído',
      detail: formatCurrency(19820),
      trend: 'up' as const,
      icon: <TrendingUp className="w-5 h-5 text-green-500" />
    },
    {
      title: 'TAC',
      value: formatCurrency(3981), // Mock data from reference
      subtitle: 'Total',
      detail: `Pago: ${formatCurrency(292)}`,
      trend: 'stable' as const,
      icon: <Minus className="w-5 h-5 text-muted-foreground" />
    },
    {
      title: 'Rentabilidade',
      value: formatPercentage(currentMonthData.rentabilidade_perc || 0),
      subtitle: `PA: ${currentMonthData.pa_meses || 0} meses`,
      detail: `Viab: ${formatPercentage((currentMonthData.rentabilidade_perc || 0) * 0.54)}`, // Mock calculation
      trend: (currentMonthData.rentabilidade_perc || 0) > 20 ? 'up' : 'down' as const,
      icon: (currentMonthData.rentabilidade_perc || 0) > 20 
        ? <TrendingUp className="w-5 h-5 text-green-500" />
        : <TrendingDown className="w-5 h-5 text-red-500" />
    }
  ];

  const projectInfo = [
    {
      label: 'TIPO',
      value: 'Residencial',
      className: 'bg-brand-primary/10 text-brand-primary'
    },
    {
      label: 'TERRENO',
      value: '1.170 m²',
      className: 'bg-blue-500/10 text-blue-600'
    },
    {
      label: 'UNIDADES',
      value: '126',
      className: 'bg-green-500/10 text-green-600'
    },
    {
      label: 'PERMUTA',
      value: '4 und',
      className: 'bg-purple-500/10 text-purple-600'
    },
    {
      label: 'ÁREA CONSTRUÍDA',
      value: '8.986 m²',
      className: 'bg-orange-500/10 text-orange-600'
    },
    {
      label: 'ÁREA PRIVATIVA',
      value: '4.982 m²',
      className: 'bg-teal-500/10 text-teal-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Project Info Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Building className="w-5 h-5" />
          Informações do Projeto
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

      {/* Progress Indicators */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Indicadores de Performance - KPIs
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {progressCards.map((card) => (
            <Card key={card.title} className="p-6">
              <CardContent className="p-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {card.icon}
                    <span className="font-semibold text-sm uppercase tracking-wide">
                      {card.title}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <CircularProgress
                    value={card.value}
                    max={card.max}
                    color={card.color}
                    size="lg"
                  />
                  
                  <div className="text-right space-y-1">
                    <div className="text-sm text-muted-foreground">
                      {card.subtitle}
                    </div>
                    <div className="text-xs font-medium text-muted-foreground">
                      Meta: {card.target}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {performanceCards.map((card) => (
          <Card key={card.title} className="p-6">
            <CardContent className="p-0">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm uppercase tracking-wide">
                  {card.title}
                </span>
                {card.icon}
              </div>
              
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {card.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {card.subtitle}
                </div>
                <div className="text-xs font-medium">
                  {card.detail}
                </div>
                
                <Badge 
                  variant={card.trend === 'up' ? 'default' : card.trend === 'down' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {card.trend === 'up' ? 'Positivo' : card.trend === 'down' ? 'Atenção' : 'Estável'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}