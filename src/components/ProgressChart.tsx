import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { ChartDataPoint } from '@/types/dashboard';
import { formatPercentage } from '@/utils/calculations';

interface ProgressChartProps {
  data: ChartDataPoint[];
  title?: string;
  type: 'physical-financial' | 'physical-projected';
}

const CustomTooltip = ({ active, payload, label, type }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-executive-card border border-border/50 p-3 rounded-lg shadow-[--shadow-card]">
        <p className="font-medium text-executive-text-primary">{`Mês: ${label}`}</p>
        {payload.map((entry: any, index: number) => {
          let name = '';
          if (entry.dataKey === 'fisico') name = 'Avanço Físico';
          else if (entry.dataKey === 'financeiro') name = 'Avanço Financeiro';
          else if (entry.dataKey === 'fisico_proj') name = 'Físico Projetado';
          
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

export function ProgressChart({ data, title, type }: ProgressChartProps) {
  const chartTitle = title || (type === 'physical-financial' ? 'Avanço Físico vs Financeiro' : 'Avanço Físico: Projetado vs Realizado');
  
  return (
    <Card className="p-6 bg-executive-card border-border/50">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-executive-text-primary">{chartTitle}</h3>
          <p className="text-sm text-executive-text-secondary">
            {type === 'physical-financial' ? 'Comparativo de evolução' : 'Projetado vs Realizado'}
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
              <Tooltip content={(props) => <CustomTooltip {...props} type={type} />} />
              <Legend />
              
              <Line 
                type="monotone" 
                dataKey="fisico" 
                stroke="hsl(var(--chart-realized))"
                strokeWidth={3}
                name="Avanço Físico"
                dot={{ r: 5 }}
              />
              
              {type === 'physical-financial' ? (
                <Line 
                  type="monotone" 
                  dataKey="financeiro" 
                  stroke="hsl(var(--brand-accent))"
                  strokeWidth={2}
                  name="Avanço Financeiro"
                  dot={{ r: 4 }}
                />
              ) : (
                <Line 
                  type="monotone" 
                  dataKey="fisico_proj" 
                  stroke="hsl(var(--chart-projected))"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  name="Físico Projetado"
                  dot={{ r: 4 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}