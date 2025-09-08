interface RetroLoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function RetroLoader({
  size = "md",
  className = "",
  text
}: RetroLoaderProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute inset-0 rounded-full border-4 border-primary-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
      </div>
      
      {text && (
        <p className={`text-muted-foreground font-medium ${textSizeClasses[size]}`}>
          {text}
        </p>
      )}
    </div>
  );
}

export function RetroSpinner({ size = "md", className = "" }: Pick<RetroLoaderProps, 'size' | 'className'>) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-3",
    lg: "w-8 h-8 border-4"
  };

  return (
    <div 
      className={`${sizeClasses[size]} border-primary-200 border-t-primary-500 rounded-full animate-spin ${className}`}
    />
  );
}
