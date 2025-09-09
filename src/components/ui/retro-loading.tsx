"use client";

import { useTheme } from "@/contexts/theme-context";
import { Loader2, Zap, Rocket, Sparkles } from "lucide-react";

interface RetroLoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
  variant?: "default" | "glow" | "pulse" | "rotate";
}

interface RetroPageLoaderProps {
  message?: string;
  subMessage?: string;
  showProgress?: boolean;
  progress?: number;
}

interface RetroButtonLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  disabled?: boolean;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Enhanced Loading Spinner
export function RetroLoadingSpinner({ 
  size = "md", 
  className = "",
  text = "",
  variant = "default"
}: RetroLoadingSpinnerProps) {
  const { isDarkMode } = useTheme();
  
  const sizes = {
    sm: { width: '24px', height: '24px', fontSize: '12px', strokeWidth: 3 },
    md: { width: '40px', height: '40px', fontSize: '14px', strokeWidth: 4 },
    lg: { width: '60px', height: '60px', fontSize: '16px', strokeWidth: 5 },
    xl: { width: '80px', height: '80px', fontSize: '18px', strokeWidth: 6 }
  };
  
  const currentSize = sizes[size];
  
  const getSpinnerContent = () => {
    switch (variant) {
      case "glow":
        return (
          <div 
            className="retro-spinner-glow"
            style={{
              width: currentSize.width,
              height: currentSize.height,
              border: `${currentSize.strokeWidth}px solid transparent`,
              borderTop: `${currentSize.strokeWidth}px solid #FFC700`,
              borderRight: `${currentSize.strokeWidth}px solid #FF3EA5`,
              borderRadius: '0px',
              animation: 'retro-spin 1s linear infinite',
              position: 'relative',
              boxShadow: `0 0 20px ${isDarkMode ? '#FFC700' : '#FF3EA5'}`
            }}
          >
            <div 
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '30%',
                height: '30%',
                backgroundColor: '#00FFFF',
                animation: 'retro-pulse 2s ease-in-out infinite',
                borderRadius: '0px'
              }}
            />
          </div>
        );
      case "pulse":
        return (
          <div
            style={{
              width: currentSize.width,
              height: currentSize.height,
              backgroundColor: '#FFC700',
              border: '3px solid #111111',
              animation: 'retro-square-pulse 1.5s ease-in-out infinite',
              borderRadius: '0px',
              boxShadow: '4px 4px 0px #111111'
            }}
          />
        );
      case "rotate":
        return (
          <div
            style={{
              width: currentSize.width,
              height: currentSize.height,
              position: 'relative'
            }}
          >
            <Zap 
              size={parseInt(currentSize.width)} 
              color="#FFC700"
              strokeWidth={currentSize.strokeWidth / 2}
              style={{
                animation: 'retro-rotate 2s linear infinite',
                filter: 'drop-shadow(2px 2px 0px #111111)'
              }}
            />
          </div>
        );
      default:
        return (
          <div 
            style={{
              width: currentSize.width,
              height: currentSize.height,
              border: `${currentSize.strokeWidth}px solid ${isDarkMode ? '#2A2F5E' : '#E5E5E5'}`,
              borderTop: `${currentSize.strokeWidth}px solid #FFC700`,
              borderRight: `${currentSize.strokeWidth}px solid #FF3EA5`,
              borderRadius: '0px',
              animation: 'retro-spin 1s linear infinite',
              boxShadow: '3px 3px 0px #111111'
            }}
          />
        );
    }
  };
  
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {getSpinnerContent()}
      
      {text && (
        <div style={{
          fontFamily: 'Poppins, sans-serif',
          fontSize: currentSize.fontSize,
          fontWeight: 600,
          color: isDarkMode ? '#FFC700' : '#111111',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          animation: 'retro-text-pulse 2s ease-in-out infinite',
          textShadow: '2px 2px 0px #111111'
        }}>
          {text}
        </div>
      )}
      
      <style jsx>{`
        @keyframes retro-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes retro-pulse {
          0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.8); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        
        @keyframes retro-square-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        
        @keyframes retro-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes retro-text-pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// Full Page Loader
export function RetroPageLoader({ 
  message = "Loading...", 
  subMessage,
  showProgress = false,
  progress = 0
}: RetroPageLoaderProps) {
  const { isDarkMode } = useTheme();
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: isDarkMode ? 'rgba(26, 31, 78, 0.95)' : 'rgba(61, 82, 241, 0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(8px)'
    }}>
      <div style={{
        backgroundColor: isDarkMode ? '#2A2F5E' : '#FFFFFF',
        border: `4px solid ${isDarkMode ? '#FFC700' : '#111111'}`,
        boxShadow: `8px 8px 0px ${isDarkMode ? '#FFC700' : '#111111'}`,
        padding: '48px',
        textAlign: 'center' as const,
        minWidth: '320px',
        maxWidth: '500px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Elements */}
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          width: '32px',
          height: '32px',
          backgroundColor: '#FF3EA5',
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
          animation: 'retro-rotate 3s linear infinite'
        }} />
        
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          width: '24px',
          height: '24px',
          backgroundColor: '#00FFFF',
          borderRadius: '50%',
          animation: 'retro-pulse 2s ease-in-out infinite'
        }} />
        
        {/* Main Content */}
        <div style={{ marginBottom: '32px' }}>
          <Rocket 
            size={48} 
            color={isDarkMode ? '#FFC700' : '#111111'}
            strokeWidth={3}
            style={{
              marginBottom: '20px',
              animation: 'retro-bounce 2s ease-in-out infinite'
            }}
          />
        </div>
        
        <RetroLoadingSpinner size="xl" text={message} variant="glow" />
        
        {subMessage && (
          <div style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            color: isDarkMode ? '#FFFFFF' : '#111111',
            marginTop: '16px',
            opacity: 0.8
          }}>
            {subMessage}
          </div>
        )}
        
        {showProgress && (
          <div style={{ marginTop: '24px' }}>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: isDarkMode ? '#1A1F4E' : '#E5E5E5',
              border: '2px solid #111111',
              borderRadius: '0px',
              overflow: 'hidden',
              marginBottom: '8px'
            }}>
              <div style={{
                width: `${Math.min(100, Math.max(0, progress))}%`,
                height: '100%',
                backgroundColor: '#FFC700',
                transition: 'width 0.3s ease',
                borderRadius: '0px'
              }} />
            </div>
            <div style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              color: isDarkMode ? '#FFC700' : '#111111',
              textAlign: 'right' as const
            }}>
              {Math.round(progress)}%
            </div>
          </div>
        )}
        
        <style jsx>{`
          @keyframes retro-bounce {
            0%, 100% { transform: translateY(0) rotate(-5deg); }
            50% { transform: translateY(-10px) rotate(-5deg); }
          }
        `}</style>
      </div>
    </div>
  );
}

// Button with Loading State
export function RetroButtonLoading({
  isLoading,
  children,
  loadingText = "Loading...",
  disabled = false,
  onClick,
  variant = "primary",
  size = "md",
  className = ""
}: RetroButtonLoadingProps) {
  const { isDarkMode } = useTheme();
  
  const variants = {
    primary: { bg: '#FFC700', color: '#111111', hoverBg: '#FFD700' },
    secondary: { bg: '#FF3EA5', color: '#111111', hoverBg: '#FF69B4' },
    outline: { bg: '#FFFFFF', color: '#111111', hoverBg: '#FFC700' }
  };
  
  const sizes = {
    sm: { padding: '8px 16px', fontSize: '14px', height: '36px' },
    md: { padding: '12px 24px', fontSize: '16px', height: '44px' },
    lg: { padding: '16px 32px', fontSize: '18px', height: '52px' }
  };
  
  const currentVariant = variants[variant];
  const currentSize = sizes[size];
  
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={className}
      style={{
        backgroundColor: currentVariant.bg,
        color: currentVariant.color,
        border: `2px solid ${isDarkMode ? '#FFC700' : '#111111'}`,
        borderRadius: '0px',
        padding: currentSize.padding,
        fontSize: currentSize.fontSize,
        fontFamily: 'Poppins, sans-serif',
        fontWeight: 700,
        textTransform: 'uppercase',
        cursor: (disabled || isLoading) ? 'not-allowed' : 'pointer',
        boxShadow: (disabled || isLoading) ? '2px 2px 0px #111111' : '4px 4px 0px #111111',
        opacity: (disabled || isLoading) ? 0.7 : 1,
        transition: 'all 0.2s ease',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        minHeight: currentSize.height,
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        if (!disabled && !isLoading) {
          e.currentTarget.style.transform = 'translate(-2px, -2px)';
          e.currentTarget.style.boxShadow = '6px 6px 0px #111111';
          e.currentTarget.style.backgroundColor = currentVariant.hoverBg;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !isLoading) {
          e.currentTarget.style.transform = 'translate(0, 0)';
          e.currentTarget.style.boxShadow = '4px 4px 0px #111111';
          e.currentTarget.style.backgroundColor = currentVariant.bg;
        }
      }}
    >
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 199, 0, 0.1)',
          animation: 'retro-loading-sweep 2s linear infinite'
        }} />
      )}
      
      {isLoading ? (
        <>
          <RetroLoadingSpinner size="sm" />
          {loadingText}
        </>
      ) : (
        children
      )}
      
      <style jsx>{`
        @keyframes retro-loading-sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </button>
  );
}
