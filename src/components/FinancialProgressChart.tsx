import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { ChartDataPoint } from '@/types/dashboard';
import { formatPercentage } from '@/utils/calculations';

interface FinancialProgressChartProps {
  data: ChartDataPoint[];
  title?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-executive-card border border-border/50 p-3 rounded-lg shadow-[--shadow-card]">
        <p className="font-medium text-executive-text-primary">{`Mês: ${label}`}</p>
        {payload.map((entry: any, index: number) => {
          let name = '';
          if (entry.dataKey === 'financeiro_planejado') name = 'Avanço Financeiro Planejado';
          else if (entry.dataKey === 'financeiro_realizado') name = 'Avanço Financeiro Realizado';
          
          return (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {name}: {formatPercentage(entry.value)}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

export function FinancialProgressChart({ data, title = "Avanço Financeiro: Planejado vs Realizado" }: FinancialProgressChartProps) {
  return (
    <Card className="p-6 bg-executive-card border-border/50">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-executive-text-primary">{title}</h3>
          <p className="text-sm text-executive-text-secondary">
            Comparativo de avanço financeiro do projeto
          </p>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const [year, month] = value.split('-');
                  return `${month}/${year.slice(-2)}`;
                }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* PA Reference Line */}
              <Line 
                type="monotone" 
                dataKey="pa_reference" 
                stroke="hsl(var(--chart-reference))"
                strokeDasharray="8 4"
                strokeWidth={2}
                name="PA (Referência)"
                dot={false}
              />
              
              <Line 
                type="monotone" 
                dataKey="financeiro_planejado" 
                stroke="hsl(var(--chart-projected))"
                strokeDasharray="5 5"
                strokeWidth={2}
                name="Avanço Financeiro Planejado"
                dot={{ r: 4 }}
              />
              
              <Line 
                type="monotone" 
                dataKey="financeiro_realizado" 
                stroke="hsl(var(--brand-accent))"
                strokeWidth={3}
                name="Avanço Financeiro Realizado"
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}