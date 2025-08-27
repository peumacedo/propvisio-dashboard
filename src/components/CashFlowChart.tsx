import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { ChartDataPoint } from '@/types/dashboard';
import { formatCurrency } from '@/utils/calculations';

interface CashFlowChartProps {
  data: ChartDataPoint[];
  title?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-executive-card border border-border/50 p-3 rounded-lg shadow-[--shadow-card]">
        <p className="font-medium text-executive-text-primary">{`Mês: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name === 'projected' ? 'Projetado' : 'Realizado'}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function CashFlowChart({ data, title = "Fluxo de Caixa" }: CashFlowChartProps) {
  return (
    <Card className="p-6 bg-executive-card border-border/50">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-executive-text-primary">{title}</h3>
          <p className="text-sm text-executive-text-secondary">Projetado vs Realizado</p>
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
                tickFormatter={(value) => formatCurrency(value).replace('R$', '').trim()}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="projected" 
                stroke="hsl(var(--chart-projected))"
                strokeDasharray="5 5"
                strokeWidth={2}
                name="Projetado"
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="realized" 
                stroke="hsl(var(--chart-realized))"
                strokeWidth={3}
                name="Realizado"
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}