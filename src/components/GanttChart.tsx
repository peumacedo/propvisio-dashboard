import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MarcoProjeto } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface GanttChartProps {
  data: MarcoProjeto[];
  className?: string;
}

const STATUS_CONFIG = {
  planejado: {
    color: 'bg-chart-neutral',
    textColor: 'text-chart-neutral',
    label: 'Planejado'
  },
  em_andamento: {
    color: 'bg-brand-accent',
    textColor: 'text-brand-accent',
    label: 'Em Andamento'
  },
  concluido: {
    color: 'bg-chart-positive',
    textColor: 'text-chart-positive',
    label: 'Concluído'
  }
};

export function GanttChart({ data, className }: GanttChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className={cn("p-6 bg-executive-card border-border/50", className)}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-executive-text-primary">
            Cronograma de Marcos
          </h3>
          <div className="text-center py-8 text-executive-text-secondary">
            <p>Nenhum marco definido</p>
          </div>
        </div>
      </Card>
    );
  }

  // Calculate date range for the gantt
  const allDates = data.flatMap(item => [new Date(item.inicio), new Date(item.fim)]);
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
  
  // Add padding
  minDate.setMonth(minDate.getMonth() - 1);
  maxDate.setMonth(maxDate.getMonth() + 1);
  
  const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  const calculatePosition = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = Math.ceil((date.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    return (days / totalDays) * 100;
  };

  const calculateWidth = (inicio: string, fim: string) => {
    const startDate = new Date(inicio);
    const endDate = new Date(fim);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max((days / totalDays) * 100, 2); // Minimum 2% width
  };

  return (
    <Card className={cn("p-6 bg-executive-card border-border/50", className)}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-executive-text-primary">
            Cronograma de Marcos
          </h3>
          <p className="text-sm text-executive-text-secondary">
            Marcos do projeto e status atual
          </p>
        </div>

        {/* Legend */}
        <div className="flex gap-4 flex-wrap">
          {Object.entries(STATUS_CONFIG).map(([status, config]) => (
            <div key={status} className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded", config.color)} />
              <span className="text-sm text-executive-text-secondary">
                {config.label}
              </span>
            </div>
          ))}
        </div>

        {/* Gantt Chart */}
        <div className="space-y-4">
          {data.map((marco, index) => {
            const config = STATUS_CONFIG[marco.status];
            const leftPosition = calculatePosition(marco.inicio);
            const width = calculateWidth(marco.inicio, marco.fim);
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-executive-text-primary truncate">
                        {marco.marco}
                      </h4>
                      <Badge variant="outline" className={cn("text-xs", config.textColor)}>
                        {config.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-executive-text-secondary">
                      {formatDate(marco.inicio)} - {formatDate(marco.fim)}
                    </p>
                  </div>
                </div>
                
                {/* Timeline bar */}
                <div className="relative h-6 bg-muted rounded-md overflow-hidden">
                  <div
                    className={cn(
                      "absolute top-0 h-full rounded-md transition-all",
                      config.color,
                      "opacity-80 hover:opacity-100"
                    )}
                    style={{
                      left: `${leftPosition}%`,
                      width: `${width}%`
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Time scale */}
        <div className="relative h-8 border-t border-border/50 pt-2">
          <div className="flex justify-between text-xs text-executive-text-secondary">
            <span>{formatDate(minDate.toISOString())}</span>
            <span>{formatDate(maxDate.toISOString())}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}