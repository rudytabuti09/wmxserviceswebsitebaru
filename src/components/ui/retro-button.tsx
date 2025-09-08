import { ButtonHTMLAttributes, ReactNode } from "react";

interface RetroButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  className?: string;
}

export function RetroButton({ 
  variant = "primary", 
  size = "md", 
  children, 
  className = "",
  ...props 
}: RetroButtonProps) {
  const baseStyles: React.CSSProperties = {
    padding: '12px 24px',
    borderRadius: '0px',
    fontFamily: 'Poppins, sans-serif',
    fontSize: '16px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
    transition: 'transform 0.1s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    position: 'relative' as const,
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: '#FFC700',
      color: '#111111',
      border: '2px solid #111111',
      boxShadow: '4px 4px 0px #111111',
    },
    secondary: {
      backgroundColor: '#FF3EA5',
      color: '#111111',
      border: '2px solid #111111',
      boxShadow: '4px 4px 0px #111111',
    },
    outline: {
      backgroundColor: '#FFFFFF',
      color: '#111111',
      border: '2px solid #111111',
      boxShadow: '4px 4px 0px #111111',
    },
  };

  const combinedStyles = {
    ...baseStyles,
    ...variantStyles[variant],
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translate(-2px, -2px)';
    e.currentTarget.style.boxShadow = '6px 6px 0px #111111';
    if (variant === 'primary') {
      e.currentTarget.style.backgroundColor = '#FFD700';
    } else if (variant === 'secondary') {
      e.currentTarget.style.backgroundColor = '#FF69B4';
    } else if (variant === 'outline') {
      e.currentTarget.style.backgroundColor = '#FFC700';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translate(0, 0)';
    e.currentTarget.style.boxShadow = '4px 4px 0px #111111';
    if (variant === 'primary') {
      e.currentTarget.style.backgroundColor = '#FFC700';
    } else if (variant === 'secondary') {
      e.currentTarget.style.backgroundColor = '#FF3EA5';
    } else if (variant === 'outline') {
      e.currentTarget.style.backgroundColor = '#FFFFFF';
    }
  };

  return (
    <button
      style={combinedStyles}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </button>
  );
}
