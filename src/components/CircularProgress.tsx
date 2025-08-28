import { cn } from '@/lib/utils';

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  showValue?: boolean;
  label?: string;
  className?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 'md',
  color = 'primary',
  showValue = true,
  label,
  className
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };
  
  const colorClasses = {
    primary: 'text-brand-primary',
    secondary: 'text-brand-accent',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    danger: 'text-red-500'
  };
  
  const strokeWidth = size === 'sm' ? 4 : size === 'md' ? 6 : 8;
  const radius = size === 'sm' ? 28 : size === 'md' ? 42 : 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const center = size === 'sm' ? 32 : size === 'md' ? 48 : 64;
  const viewBox = size === 'sm' ? '0 0 64 64' : size === 'md' ? '0 0 96 96' : '0 0 128 128';

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className={cn('relative', sizeClasses[size])}>
        <svg
          className="transform -rotate-90 w-full h-full"
          viewBox={viewBox}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/20"
          />
          
          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={cn(colorClasses[color], 'transition-all duration-1000 ease-out')}
            style={{
              filter: 'drop-shadow(0 0 6px currentColor)'
            }}
          />
        </svg>
        
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn(
              'font-bold',
              size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-lg',
              colorClasses[color]
            )}>
              {percentage.toFixed(0)}%
            </span>
          </div>
        )}
      </div>
      
      {label && (
        <span className={cn(
          'text-center font-medium text-muted-foreground',
          size === 'sm' ? 'text-xs' : 'text-sm'
        )}>
          {label}
        </span>
      )}
    </div>
  );
}