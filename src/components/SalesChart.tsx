import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { ChartDataPoint } from '@/types/dashboard';
import { formatCurrency } from '@/utils/calculations';

interface SalesChartProps {
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
            {entry.dataKey === 'vendas' ? 'Vendas' : 'Meta'}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function SalesChart({ data, title = "Vendas vs Meta" }: SalesChartProps) {
  return (
    <Card className="p-6 bg-executive-card border-border/50">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-executive-text-primary">{title}</h3>
          <p className="text-sm text-executive-text-secondary">Realizado vs Projetado</p>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
              <Bar 
                dataKey="vendas" 
                fill="hsl(var(--chart-realized))"
                name="Vendas Realizadas"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="meta" 
                fill="hsl(var(--chart-projected))"
                name="Meta de Vendas"
                radius={[2, 2, 0, 0]}
                opacity={0.7}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}