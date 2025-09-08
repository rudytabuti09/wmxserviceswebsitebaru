"use client";

import { useState, useEffect } from "react";
import { WifiOff, RefreshCw, AlertTriangle, Wifi, Router, Signal } from "lucide-react";
import { RetroButton } from "./retro-button";

interface NetworkErrorProps {
  error?: Error | string;
  onRetry?: () => void;
  retryCount?: number;
  maxRetries?: number;
  showDetails?: boolean;
  variant?: "inline" | "modal" | "toast";
  autoRetry?: boolean;
  retryDelay?: number;
}

export function NetworkError({
  error,
  onRetry,
  retryCount = 0,
  maxRetries = 3,
  showDetails = false,
  variant = "inline",
  autoRetry = false,
  retryDelay = 2000
}: NetworkErrorProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  // Monitor network status
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Auto retry with countdown
  useEffect(() => {
    if (autoRetry && retryCount < maxRetries && onRetry) {
      setCountdown(retryDelay / 1000);
      
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            handleRetry();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [autoRetry, retryCount, maxRetries, retryDelay, onRetry]);

  const handleRetry = async () => {
    if (!onRetry || isRetrying) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  const getErrorMessage = () => {
    if (!isOnline) {
      return "You're currently offline. Please check your internet connection.";
    }
    
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    
    // Default messages for common network errors
    if (error?.name === 'NetworkError' || error?.message?.includes('fetch')) {
      return "Unable to connect to our servers. Please check your connection and try again.";
    }
    
    return "Something went wrong. Please try again.";
  };

  const getErrorIcon = () => {
    if (!isOnline) return WifiOff;
    if (retryCount >= maxRetries) return AlertTriangle;
    return Router;
  };

  const getStatusColor = () => {
    if (!isOnline) return "#FF3EA5";
    if (retryCount >= maxRetries) return "#FF6B6B";
    return "#FFC700";
  };

  // Inline variant (default)
  if (variant === "inline") {
    const Icon = getErrorIcon();
    const statusColor = getStatusColor();

    return (
      <div style={{
        backgroundColor: "#FFFFFF",
        border: "3px solid #111111",
        boxShadow: "6px 6px 0px #111111",
        padding: "24px",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Decorative element */}
        <div style={{
          position: "absolute",
          top: "-10px",
          right: "-10px",
          width: "40px",
          height: "40px",
          backgroundColor: statusColor,
          border: "2px solid #111111",
          transform: "rotate(45deg)"
        }} />

        <div style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "16px",
          position: "relative",
          zIndex: 1
        }}>
          {/* Status Icon */}
          <div style={{
            backgroundColor: statusColor,
            padding: "12px",
            border: "2px solid #111111",
            boxShadow: "3px 3px 0px #111111",
            flexShrink: 0
          }}>
            <Icon size={24} color="#111111" strokeWidth={2} />
          </div>

          <div style={{ flex: 1 }}>
            {/* Error Title */}
            <h3 style={{
              fontFamily: "Poppins, sans-serif",
              fontSize: "18px",
              fontWeight: 700,
              textTransform: "uppercase",
              color: "#111111",
              marginBottom: "8px"
            }}>
              {!isOnline ? "Connection Lost" : "Network Error"}
            </h3>

            {/* Error Message */}
            <p style={{
              fontSize: "14px",
              color: "#111111",
              marginBottom: "16px",
              lineHeight: 1.6
            }}>
              {getErrorMessage()}
            </p>

            {/* Retry Info */}
            {retryCount > 0 && (
              <div style={{
                backgroundColor: "#FFF8DC",
                border: "2px dashed #111111",
                padding: "8px 12px",
                marginBottom: "16px",
                fontSize: "12px",
                color: "#111111"
              }}>
                Retry attempt: {retryCount} / {maxRetries}
              </div>
            )}

            {/* Auto retry countdown */}
            {countdown > 0 && (
              <div style={{
                backgroundColor: "#E0E0E0",
                border: "2px solid #111111",
                padding: "8px 12px",
                marginBottom: "16px",
                fontSize: "12px",
                color: "#111111",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <div style={{
                  width: "12px",
                  height: "12px",
                  backgroundColor: "#FFC700",
                  borderRadius: "50%",
                  animation: "pulse 1s ease-in-out infinite"
                }} />
                Retrying in {countdown} seconds...
              </div>
            )}

            {/* Action Buttons */}
            <div style={{
              display: "flex",
              gap: "12px",
              alignItems: "center"
            }}>
              {onRetry && retryCount < maxRetries && (
                <RetroButton
                  onClick={handleRetry}
                  disabled={isRetrying || countdown > 0}
                  variant="primary"
                  size="sm"
                  style={{
                    backgroundColor: isRetrying ? "#E0E0E0" : "#FFC700",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <RefreshCw 
                    size={16} 
                    style={{ 
                      animation: isRetrying ? "spin 1s linear infinite" : "none"
                    }} 
                  />
                  {isRetrying ? "Retrying..." : "Try Again"}
                </RetroButton>
              )}

              {/* Connection status indicator */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                color: "#666",
                fontFamily: "Poppins, sans-serif",
                fontWeight: 600,
                textTransform: "uppercase"
              }}>
                {isOnline ? (
                  <>
                    <Wifi size={14} color="#00FF00" />
                    Online
                  </>
                ) : (
                  <>
                    <WifiOff size={14} color="#FF3EA5" />
                    Offline
                  </>
                )}
              </div>
            </div>

            {/* Error details */}
            {showDetails && error && (
              <details style={{ marginTop: "16px" }}>
                <summary style={{
                  fontSize: "12px",
                  color: "#666",
                  cursor: "pointer",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 600,
                  textTransform: "uppercase"
                }}>
                  Error Details
                </summary>
                <div style={{
                  marginTop: "8px",
                  padding: "8px",
                  backgroundColor: "#111111",
                  color: "#00FF00",
                  fontFamily: "monospace",
                  fontSize: "11px",
                  border: "2px solid #00FF00",
                  maxHeight: "100px",
                  overflow: "auto"
                }}>
                  {typeof error === 'string' ? error : JSON.stringify(error, null, 2)}
                </div>
              </details>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Toast variant
  if (variant === "toast") {
    const Icon = getErrorIcon();
    const statusColor = getStatusColor();

    return (
      <div style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        backgroundColor: "#FFFFFF",
        border: "3px solid #111111",
        boxShadow: "6px 6px 0px #111111",
        padding: "16px",
        maxWidth: "400px",
        zIndex: 1000,
        animation: "slideInRight 0.3s ease-out"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          <div style={{
            backgroundColor: statusColor,
            padding: "8px",
            border: "2px solid #111111",
            boxShadow: "2px 2px 0px #111111"
          }}>
            <Icon size={20} color="#111111" />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "Poppins, sans-serif",
              fontSize: "14px",
              fontWeight: 700,
              color: "#111111",
              marginBottom: "4px"
            }}>
              Network Error
            </div>
            <div style={{
              fontSize: "12px",
              color: "#111111"
            }}>
              {getErrorMessage()}
            </div>
          </div>

          {onRetry && (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              style={{
                backgroundColor: "#FFC700",
                color: "#111111",
                border: "2px solid #111111",
                boxShadow: "2px 2px 0px #111111",
                padding: "6px",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              <RefreshCw 
                size={14} 
                style={{ 
                  animation: isRetrying ? "spin 1s linear infinite" : "none"
                }} 
              />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Modal variant
  if (variant === "modal") {
    const Icon = getErrorIcon();
    const statusColor = getStatusColor();

    return (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: "#FFFFFF",
          border: "4px solid #111111",
          boxShadow: "8px 8px 0px #111111",
          padding: "40px",
          maxWidth: "500px",
          width: "100%",
          position: "relative"
        }}>
          {/* Decorative elements */}
          <div style={{
            position: "absolute",
            top: "-15px",
            left: "-15px",
            width: "30px",
            height: "30px",
            backgroundColor: statusColor,
            border: "2px solid #111111",
            borderRadius: "50%"
          }} />

          <div style={{ textAlign: "center" }}>
            {/* Error Icon */}
            <div style={{
              backgroundColor: statusColor,
              padding: "20px",
              border: "3px solid #111111",
              boxShadow: "4px 4px 0px #111111",
              display: "inline-block",
              marginBottom: "24px"
            }}>
              <Icon size={48} color="#111111" strokeWidth={2} />
            </div>

            {/* Error Title */}
            <h2 style={{
              fontFamily: "Poppins, sans-serif",
              fontSize: "24px",
              fontWeight: 800,
              textTransform: "uppercase",
              color: "#111111",
              marginBottom: "16px",
              textShadow: "2px 2px 0px " + statusColor
            }}>
              {!isOnline ? "You're Offline" : "Connection Error"}
            </h2>

            {/* Error Message */}
            <p style={{
              fontSize: "16px",
              color: "#111111",
              marginBottom: "32px",
              lineHeight: 1.6
            }}>
              {getErrorMessage()}
            </p>

            {/* Action Buttons */}
            <div style={{
              display: "flex",
              gap: "16px",
              justifyContent: "center"
            }}>
              {onRetry && retryCount < maxRetries && (
                <RetroButton
                  onClick={handleRetry}
                  disabled={isRetrying || countdown > 0}
                  variant="primary"
                  size="lg"
                  style={{
                    backgroundColor: isRetrying ? "#E0E0E0" : "#FFC700"
                  }}
                >
                  <RefreshCw 
                    size={20} 
                    style={{ 
                      marginRight: "8px",
                      animation: isRetrying ? "spin 1s linear infinite" : "none"
                    }} 
                  />
                  {isRetrying ? "Retrying..." : "Try Again"}
                </RetroButton>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Hook for network error handling
export function useNetworkError() {
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleError = (err: Error) => {
    setError(err);
    setRetryCount(0);
  };

  const retry = async (fn: () => Promise<void>, maxRetries = 3) => {
    if (retryCount >= maxRetries) return;
    
    setIsRetrying(true);
    try {
      await fn();
      setError(null);
      setRetryCount(0);
    } catch (err) {
      setRetryCount(prev => prev + 1);
      setError(err as Error);
    } finally {
      setIsRetrying(false);
    }
  };

  const reset = () => {
    setError(null);
    setRetryCount(0);
    setIsRetrying(false);
  };

  return {
    error,
    retryCount,
    isRetrying,
    handleError,
    retry,
    reset
  };
}

// Network status indicator component
export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      
      if (!online) {
        setShowStatus(true);
      } else {
        // Show "back online" for a moment
        setShowStatus(true);
        setTimeout(() => setShowStatus(false), 3000);
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Initial check
    updateOnlineStatus();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  if (!showStatus) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: "20px",
      right: "20px",
      backgroundColor: isOnline ? "#00FF00" : "#FF3EA5",
      color: isOnline ? "#111111" : "#FFFFFF",
      padding: "8px 16px",
      border: "2px solid #111111",
      boxShadow: "4px 4px 0px #111111",
      fontFamily: "Poppins, sans-serif",
      fontSize: "12px",
      fontWeight: 700,
      textTransform: "uppercase",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      zIndex: 1000,
      animation: "slideInUp 0.3s ease-out"
    }}>
      {isOnline ? (
        <>
          <Wifi size={16} />
          Back Online
        </>
      ) : (
        <>
          <WifiOff size={16} />
          No Connection
        </>
      )}
    </div>
  );
}

// CSS animations
const styles = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideInUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
