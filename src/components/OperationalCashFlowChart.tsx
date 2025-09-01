import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import { formatCurrency } from '@/utils/calculations';

interface ChartDataPoint {
  month: string;
  operational: number;
  pa_reference?: number;
}

interface OperationalCashFlowChartProps {
  data: ChartDataPoint[];
  title?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-executive-card border border-border/50 rounded-lg shadow-lg p-3">
        <p className="text-executive-text-primary font-medium">{`${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {`${entry.name}: ${formatCurrency(entry.value)}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function OperationalCashFlowChart({ 
  data, 
  title = "Fluxo de Caixa Operacional" 
}: OperationalCashFlowChartProps) {
  return (
    <Card className="bg-executive-card border-border/50">
      <CardHeader>
        <CardTitle className="text-executive-text-primary">
          {title}
        </CardTitle>
        <p className="text-sm text-executive-text-secondary">
          Fluxo operacional sem investimentos e financiamentos
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--executive-text-secondary))"
              fontSize={12}
              tickFormatter={(value) => {
                const [year, month] = value.split('-');
                return `${month}/${year}`;
              }}
            />
            <YAxis 
              stroke="hsl(var(--executive-text-secondary))"
              fontSize={12}
              tickFormatter={formatCurrency}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <ReferenceLine y={0} stroke="hsl(var(--chart-neutral))" strokeDasharray="2 2" />
            
            {/* PA Reference Line */}
            <Line
              type="monotone"
              dataKey="pa_reference"
              stroke="hsl(var(--chart-reference))"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="PA (Referência)"
            />
            
            {/* Operational Cash Flow */}
            <Line
              type="monotone"
              dataKey="operational"
              stroke="hsl(var(--brand-primary))"
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--brand-primary))', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'hsl(var(--brand-primary))', strokeWidth: 2 }}
              name="Fluxo Operacional"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}