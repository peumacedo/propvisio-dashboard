import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet,
  CreditCard,
  PiggyBank,
  Receipt,
  FileText,
  Users
} from 'lucide-react';
import { ExcelData } from '@/types/dashboard';
import { formatCurrency, formatPercentage, formatNumber } from '@/utils/calculations';

interface PatrimonialPositionProps {
  data: ExcelData;
  selectedMonth: string;
}

export function PatrimonialPosition({ data, selectedMonth }: PatrimonialPositionProps) {
  const currentMonthData = data.dados_mensais.find(d => d.mes_ano === selectedMonth);
  
  if (!currentMonthData) return null;

  const positionCards = [
    {
      title: 'DISPONIBILIDADE',
      value: formatCurrency(3631000), // Mock data from reference
      subtitle: '',
      icon: <Wallet className="w-6 h-6" />,
      color: 'bg-blue-500/10 text-blue-600 border-blue-200',
      isPositive: true
    },
    {
      title: 'FINANCIAMENTO',
      value: '-',
      subtitle: 'Saldo: -',
      icon: <CreditCard className="w-6 h-6" />,
      color: 'bg-purple-500/10 text-purple-600 border-purple-200',
      isNeutral: true
    },
    {
      title: 'DÍVIDA LÍQUIDA',
      value: '-',
      subtitle: '',
      icon: <PiggyBank className="w-6 h-6" />,
      color: 'bg-gray-500/10 text-gray-600 border-gray-200',
      isNeutral: true
    },
    {
      title: 'CONTAS A RECEBER',
      value: formatCurrency(currentMonthData.contas_receber || 0),
      subtitle: '',
      icon: <Receipt className="w-6 h-6" />,
      color: 'bg-green-500/10 text-green-600 border-green-200',
      isPositive: true
    },
    {
      title: 'CONTAS A PAGAR',
      value: formatCurrency(currentMonthData.contas_pagar || 0),
      subtitle: '',
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-red-500/10 text-red-600 border-red-200',
      isNegative: true
    },
    {
      title: 'APORTES S/A',
      value: formatCurrency(1060000), // Mock data
      subtitle: 'Saldo: ' + formatCurrency(1060000),
      icon: <Users className="w-6 h-6" />,
      color: 'bg-teal-500/10 text-teal-600 border-teal-200',
      isPositive: true
    }
  ];

  const projectMetrics = [
    {
      title: 'VGV PROJETO',
      value: formatCurrency(currentMonthData.vgv || 0),
      subtitle: '123 und',
      detail: formatCurrency((currentMonthData.vgv || 0) / 123) + ' / und',
      icon: <Building className="w-6 h-6" />
    },
    {
      title: 'VENDAS',
      value: formatCurrency(currentMonthData.vendas_valor || 0),
      subtitle: `${currentMonthData.vendas_unid || 0} und`,
      detail: formatCurrency((currentMonthData.vendas_valor || 0) / (currentMonthData.vendas_unid || 1)) + ' / und',
      icon: <ShoppingCart className="w-6 h-6" />
    },
    {
      title: 'ESTOQUE',
      value: formatCurrency(currentMonthData.estoque_valor || 0),
      subtitle: `${currentMonthData.estoque_unid || 0} und`,
      detail: formatCurrency((currentMonthData.estoque_valor || 0) / (currentMonthData.estoque_unid || 1)) + ' / und',
      icon: <Package className="w-6 h-6" />
    },
    {
      title: 'RECEBIDO',
      value: formatCurrency((currentMonthData.vendas_valor || 0) * 0.325), // Mock calculation
      subtitle: '',
      detail: '',
      icon: <TrendingUp className="w-6 h-6" />
    },
    {
      title: 'A RECEBER',
      value: 'Parcelas: ' + formatCurrency(currentMonthData.contas_receber || 0),
      subtitle: 'Chaves: -',
      detail: '',
      icon: <Clock className="w-6 h-6" />
    },
    {
      title: 'INADIMPLÊNCIA',
      value: formatPercentage(currentMonthData.inadimplencia_perc || 0),
      subtitle: formatCurrency(currentMonthData.inadimplencia_valor || 0),
      detail: '',
      icon: <AlertTriangle className="w-6 h-6" />,
      isAlert: (currentMonthData.inadimplencia_perc || 0) > 2
    }
  ];

  return (
    <div className="space-y-6">
      {/* Patrimonial Position */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Posição Patrimonial Atual
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {positionCards.map((card) => (
            <Card key={card.title} className="border-0">
              <CardContent className={`p-6 ${card.color}`}>
                <div className="flex items-center justify-between mb-4">
                  {card.icon}
                  {card.isPositive && <Badge variant="default" className="text-xs bg-green-500">Ativo</Badge>}
                  {card.isNegative && <Badge variant="destructive" className="text-xs">Passivo</Badge>}
                </div>
                
                <div className="space-y-2">
                  <div className="text-xs font-medium uppercase tracking-wide opacity-80">
                    {card.title}
                  </div>
                  <div className="text-xl font-bold">
                    {card.value}
                  </div>
                  {card.subtitle && (
                    <div className="text-sm opacity-70">
                      {card.subtitle}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Project Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projectMetrics.map((metric) => (
          <Card key={metric.title} className="border-0 bg-executive-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                {metric.icon}
                {metric.isAlert && <Badge variant="destructive" className="text-xs">Atenção</Badge>}
              </div>
              
              <div className="space-y-2">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {metric.title}
                </div>
                <div className="text-lg font-bold text-executive-text-primary">
                  {metric.value}
                </div>
                {metric.subtitle && (
                  <div className="text-sm text-muted-foreground">
                    {metric.subtitle}
                  </div>
                )}
                {metric.detail && (
                  <div className="text-xs text-muted-foreground">
                    {metric.detail}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Import missing icons
import { Building, ShoppingCart, Package, TrendingUp, Clock, AlertTriangle } from 'lucide-react';