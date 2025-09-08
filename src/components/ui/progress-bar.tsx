interface RetroProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function RetroProgressBar({ 
  value, 
  max = 100, 
  className = "",
  size = "md",
  showLabel = false
}: RetroProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const sizeClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4"
  };

  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="flex justify-between text-sm text-foreground">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full bg-muted rounded-full overflow-hidden ${sizeClasses[size]} ${className}`}>
        <div 
          className="h-full bg-primary-500 transition-all duration-500 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Backward compatibility
export const ProgressBar = RetroProgressBar;
