import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/calculations';
import { cn } from '@/lib/utils';

interface DREData {
  mes_ano: string;
  receita: number;
  custos: number;
  resultado: number;
}

interface DRETableProps {
  data: DREData[];
  showAccumulated: boolean;
  className?: string;
}

export function DRETable({ data, showAccumulated, className }: DRETableProps) {
  return (
    <Card className={cn("p-6 bg-executive-card border-border/50", className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-executive-text-primary">
              Demonstrativo Financeiro
            </h3>
            <p className="text-sm text-executive-text-secondary">
              Visão {showAccumulated ? 'Acumulada' : 'Mensal'}
            </p>
          </div>
          <Badge variant={showAccumulated ? "default" : "secondary"}>
            {showAccumulated ? 'Acumulado' : 'Mensal'}
          </Badge>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left p-3 text-sm font-medium text-executive-text-secondary">
                  Período
                </th>
                <th className="text-right p-3 text-sm font-medium text-executive-text-secondary">
                  Receita
                </th>
                <th className="text-right p-3 text-sm font-medium text-executive-text-secondary">
                  Custos
                </th>
                <th className="text-right p-3 text-sm font-medium text-executive-text-secondary">
                  Resultado
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => {
                const isPositive = row.resultado > 0;
                const isNeutral = row.resultado === 0;
                
                return (
                  <tr 
                    key={row.mes_ano} 
                    className="border-b border-border/30 hover:bg-executive-card-hover transition-colors"
                  >
                    <td className="p-3 text-sm font-medium text-executive-text-primary">
                      {(() => {
                        const [year, month] = row.mes_ano.split('-');
                        return `${month}/${year}`;
                      })()}
                    </td>
                    <td className="p-3 text-sm text-right text-chart-positive font-medium">
                      {formatCurrency(row.receita)}
                    </td>
                    <td className="p-3 text-sm text-right text-chart-negative font-medium">
                      {formatCurrency(row.custos)}
                    </td>
                    <td className={cn(
                      "p-3 text-sm text-right font-semibold",
                      isPositive ? "text-chart-positive" : 
                      isNeutral ? "text-chart-neutral" : "text-chart-negative"
                    )}>
                      {formatCurrency(row.resultado)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {data.length === 0 && (
          <div className="text-center py-8 text-executive-text-secondary">
            <p>Nenhum dado disponível para o período selecionado</p>
          </div>
        )}
      </div>
    </Card>
  );
}