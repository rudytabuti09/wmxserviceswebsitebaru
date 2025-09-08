"use client";

import React, { Component, ReactNode } from "react";
import { RefreshCw, Home, Bug, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string;
}

export class RetroErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ""
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }

    // Here you could also send error to monitoring service
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ""
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default retro error UI
      return (
        <RetroErrorDisplay
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorId={this.state.errorId}
          onRetry={this.handleRetry}
          showDetails={this.props.showDetails}
        />
      );
    }

    return this.props.children;
  }
}

// Error display component with retro styling
function RetroErrorDisplay({
  error,
  errorInfo,
  errorId,
  onRetry,
  showDetails = false
}: {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string;
  onRetry: () => void;
  showDetails?: boolean;
}) {
  const [showFullError, setShowFullError] = React.useState(false);

  return (
    <div style={{
      minHeight: "400px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      backgroundColor: "transparent"
    }}>
      <div style={{
        backgroundColor: "#FFFFFF",
        border: "4px solid #111111",
        boxShadow: "8px 8px 0px #111111",
        maxWidth: "600px",
        width: "100%",
        padding: "40px",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Decorative elements */}
        <div style={{
          position: "absolute",
          top: "-20px",
          right: "-20px",
          width: "80px",
          height: "80px",
          backgroundColor: "#FF3EA5",
          border: "3px solid #111111",
          transform: "rotate(45deg)"
        }} />
        
        <div style={{
          position: "absolute",
          bottom: "-15px",
          left: "-15px",
          width: "60px",
          height: "60px",
          backgroundColor: "#FFC700",
          border: "3px solid #111111",
          borderRadius: "50%"
        }} />

        {/* Main content */}
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Error icon */}
          <div style={{
            textAlign: "center",
            marginBottom: "24px"
          }}>
            <div style={{
              display: "inline-block",
              backgroundColor: "#FF3EA5",
              padding: "20px",
              border: "3px solid #111111",
              boxShadow: "4px 4px 0px #111111",
              animation: "bounce 2s infinite"
            }}>
              <Bug size={48} color="#FFFFFF" strokeWidth={2} />
            </div>
          </div>

          {/* Error title */}
          <h1 style={{
            fontFamily: "Poppins, sans-serif",
            fontSize: "32px",
            fontWeight: 800,
            textTransform: "uppercase",
            color: "#111111",
            textAlign: "center",
            marginBottom: "16px",
            textShadow: "2px 2px 0px #FFC700"
          }}>
            Oops! Something Went Wrong
          </h1>

          {/* Error description */}
          <p style={{
            fontSize: "16px",
            color: "#111111",
            textAlign: "center",
            marginBottom: "32px",
            lineHeight: 1.6
          }}>
            We encountered an unexpected error. Don't worry, our retro robots are working to fix it!
          </p>

          {/* Error ID */}
          <div style={{
            backgroundColor: "#FFF8DC",
            border: "2px dashed #111111",
            padding: "12px",
            marginBottom: "24px",
            textAlign: "center"
          }}>
            <div style={{
              fontFamily: "Poppins, sans-serif",
              fontSize: "12px",
              fontWeight: 600,
              color: "#666",
              textTransform: "uppercase",
              marginBottom: "4px"
            }}>
              Error ID
            </div>
            <div style={{
              fontFamily: "monospace",
              fontSize: "14px",
              color: "#111111",
              backgroundColor: "#FFFFFF",
              padding: "4px 8px",
              border: "1px solid #111111",
              display: "inline-block"
            }}>
              {errorId}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{
            display: "flex",
            gap: "16px",
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: showDetails ? "32px" : "0"
          }}>
            <button
              onClick={onRetry}
              style={{
                backgroundColor: "#FFC700",
                color: "#111111",
                border: "3px solid #111111",
                padding: "12px 24px",
                fontFamily: "Poppins, sans-serif",
                fontSize: "16px",
                fontWeight: 700,
                textTransform: "uppercase",
                boxShadow: "4px 4px 0px #111111",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translate(-2px, -2px)";
                e.currentTarget.style.boxShadow = "6px 6px 0px #111111";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translate(0, 0)";
                e.currentTarget.style.boxShadow = "4px 4px 0px #111111";
              }}
            >
              <RefreshCw size={20} />
              Try Again
            </button>

            <Link href="/">
              <button style={{
                backgroundColor: "#FFFFFF",
                color: "#111111",
                border: "3px solid #111111",
                padding: "12px 24px",
                fontFamily: "Poppins, sans-serif",
                fontSize: "16px",
                fontWeight: 700,
                textTransform: "uppercase",
                boxShadow: "4px 4px 0px #111111",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#00FFFF";
                e.currentTarget.style.transform = "translate(-2px, -2px)";
                e.currentTarget.style.boxShadow = "6px 6px 0px #111111";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#FFFFFF";
                e.currentTarget.style.transform = "translate(0, 0)";
                e.currentTarget.style.boxShadow = "4px 4px 0px #111111";
              }}>
                <Home size={20} />
                Go Home
              </button>
            </Link>
          </div>

          {/* Show details toggle */}
          {(showDetails || process.env.NODE_ENV === 'development') && error && (
            <>
              <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <button
                  onClick={() => setShowFullError(!showFullError)}
                  style={{
                    backgroundColor: "transparent",
                    color: "#666",
                    border: "none",
                    padding: "8px",
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "12px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    cursor: "pointer",
                    textDecoration: "underline"
                  }}
                >
                  {showFullError ? "Hide" : "Show"} Error Details
                </button>
              </div>

              {showFullError && (
                <div style={{
                  backgroundColor: "#111111",
                  color: "#00FF00",
                  padding: "16px",
                  border: "2px solid #00FF00",
                  fontFamily: "monospace",
                  fontSize: "12px",
                  maxHeight: "200px",
                  overflow: "auto",
                  textAlign: "left"
                }}>
                  <div style={{ marginBottom: "12px" }}>
                    <strong>Error:</strong> {error.message}
                  </div>
                  {error.stack && (
                    <div style={{ marginBottom: "12px" }}>
                      <strong>Stack Trace:</strong>
                      <pre style={{ whiteSpace: "pre-wrap", fontSize: "10px" }}>
                        {error.stack}
                      </pre>
                    </div>
                  )}
                  {errorInfo?.componentStack && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre style={{ whiteSpace: "pre-wrap", fontSize: "10px" }}>
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* CSS animations */}
        <style jsx>{`
          @keyframes bounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }
        `}</style>
      </div>
    </div>
  );
}

// Lightweight error boundary for specific components
export function RetroErrorFallback({ 
  error, 
  resetError,
  componentName = "Component"
}: {
  error: Error;
  resetError: () => void;
  componentName?: string;
}) {
  return (
    <div style={{
      backgroundColor: "#FFE4E1",
      border: "2px solid #FF3EA5",
      boxShadow: "3px 3px 0px #111111",
      padding: "16px",
      textAlign: "center"
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        marginBottom: "12px"
      }}>
        <AlertTriangle size={20} color="#FF3EA5" />
        <span style={{
          fontFamily: "Poppins, sans-serif",
          fontSize: "14px",
          fontWeight: 700,
          color: "#111111",
          textTransform: "uppercase"
        }}>
          {componentName} Error
        </span>
      </div>
      
      <p style={{
        fontSize: "12px",
        color: "#111111",
        marginBottom: "16px"
      }}>
        {error.message}
      </p>

      <button
        onClick={resetError}
        style={{
          backgroundColor: "#FF3EA5",
          color: "#FFFFFF",
          border: "2px solid #111111",
          padding: "8px 16px",
          fontFamily: "Poppins, sans-serif",
          fontSize: "12px",
          fontWeight: 700,
          textTransform: "uppercase",
          boxShadow: "2px 2px 0px #111111",
          cursor: "pointer"
        }}
      >
        <RefreshCw size={14} style={{ marginRight: "4px" }} />
        Retry
      </button>
    </div>
  );
}

// Hook for functional components error handling
export function useErrorHandler() {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    console.error('Error caught by error handler:', error, errorInfo);
    
    // Here you can add error reporting logic
    // Example: Send to monitoring service
  };
}
