import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  subvalue?: string | number;
  trend?: 'up' | 'down' | 'stable';
  isEstimated?: boolean;
  className?: string;
  icon?: React.ReactNode;
  previousMonthVariation?: number; // Percentage variation from previous month
}

const TrendIcon = ({ trend }: { trend?: 'up' | 'down' | 'stable' }) => {
  if (trend === 'up') return <TrendingUp className="h-4 w-4 text-chart-positive" />;
  if (trend === 'down') return <TrendingDown className="h-4 w-4 text-chart-negative" />;
  return <Minus className="h-4 w-4 text-chart-neutral" />;
};

export function KPICard({
  title,
  value,
  subtitle,
  subvalue,
  trend,
  isEstimated = false,
  className,
  icon,
  previousMonthVariation
}: KPICardProps) {
  return (
    <Card className={cn(
      "p-6 hover:shadow-[--shadow-hover] transition-all duration-200",
      "bg-executive-card border-border/50",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-executive-text-secondary">
              {title}
            </p>
            {isEstimated && (
              <Badge variant="outline" className="text-xs px-2 py-0">
                Estimado
              </Badge>
            )}
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-executive-text-primary">
                {value}
              </p>
              <div className="flex items-center gap-1">
                <TrendIcon trend={trend} />
                {previousMonthVariation !== undefined && (
                  <span className={cn(
                    "text-xs font-medium px-2 py-1 rounded-full",
                    previousMonthVariation > 0 
                      ? "text-chart-positive bg-chart-positive/10" 
                      : previousMonthVariation < 0 
                        ? "text-chart-negative bg-chart-negative/10"
                        : "text-chart-neutral bg-chart-neutral/10"
                  )}>
                    {previousMonthVariation > 0 ? '+' : ''}{previousMonthVariation.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
            
            {subtitle && subvalue && (
              <div className="text-sm text-executive-text-secondary">
                <span className="font-medium">{subtitle}:</span>{' '}
                <span className="text-executive-text-primary font-semibold">
                  {subvalue}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {icon && (
          <div className="text-brand-primary/20 ml-4">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}