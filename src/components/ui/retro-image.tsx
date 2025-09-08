"use client";

import { useState, useEffect, useRef } from "react";
import { RetroSkeleton } from "./retro-skeleton";

interface RetroImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  placeholder?: string;
  blurDataURL?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
  retryCount?: number;
}

export function RetroImage({
  src,
  alt,
  width = "100%",
  height = "auto",
  className = "",
  placeholder,
  blurDataURL,
  priority = false,
  onLoad,
  onError,
  fallbackSrc,
  retryCount = 3
}: RetroImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [retries, setRetries] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) {
      setIsVisible(true);
      return;
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observerRef.current?.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    if (retries < retryCount) {
      // Retry loading
      setRetries(prev => prev + 1);
      setCurrentSrc(`${src}?retry=${retries + 1}`);
    } else if (fallbackSrc) {
      // Use fallback image
      setCurrentSrc(fallbackSrc);
      setRetries(0);
    } else {
      // Show error state
      setIsLoading(false);
      setHasError(true);
      onError?.();
    }
  };

  const containerStyle: React.CSSProperties = {
    width,
    height,
    position: "relative",
    overflow: "hidden",
    border: "2px solid #111111",
    boxShadow: "4px 4px 0px #111111",
    backgroundColor: "#E0E0E0"
  };

  const imageStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "opacity 0.3s ease, filter 0.3s ease",
    opacity: isLoading ? 0 : 1,
    filter: isLoading ? "blur(10px)" : "blur(0px)"
  };

  // Error state
  if (hasError && !fallbackSrc) {
    return (
      <div 
        ref={imgRef}
        className={className} 
        style={containerStyle}
      >
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          backgroundColor: "#FF3EA5",
          color: "#FFFFFF",
          padding: "20px",
          textAlign: "center"
        }}>
          <div style={{
            fontSize: "48px",
            marginBottom: "16px"
          }}>⚠️</div>
          <div style={{
            fontFamily: "Poppins, sans-serif",
            fontSize: "14px",
            fontWeight: 700,
            textTransform: "uppercase",
            marginBottom: "8px"
          }}>
            Image Failed
          </div>
          <div style={{
            fontSize: "12px",
            opacity: 0.9
          }}>
            Could not load image
          </div>
          {retries > 0 && (
            <button
              onClick={() => {
                setHasError(false);
                setIsLoading(true);
                setRetries(0);
                setCurrentSrc(src);
              }}
              style={{
                marginTop: "12px",
                padding: "8px 16px",
                backgroundColor: "#FFFFFF",
                color: "#111111",
                border: "2px solid #111111",
                boxShadow: "2px 2px 0px #111111",
                fontFamily: "Poppins, sans-serif",
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                cursor: "pointer"
              }}
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={imgRef}
      className={className} 
      style={containerStyle}
    >
      {/* Loading skeleton */}
      {isLoading && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#E0E0E0"
        }}>
          <div className="retro-skeleton-shimmer" />
          <div style={{
            fontSize: "48px",
            color: "#CCCCCC",
            zIndex: 1
          }}>📷</div>
        </div>
      )}

      {/* Blur placeholder if provided */}
      {blurDataURL && isLoading && (
        <img
          src={blurDataURL}
          alt=""
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "blur(10px)",
            opacity: 0.7
          }}
        />
      )}

      {/* Main image */}
      {isVisible && (
        <img
          src={currentSrc}
          alt={alt}
          style={imageStyle}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}

      {/* Loading indicator overlay */}
      {isLoading && (
        <div style={{
          position: "absolute",
          bottom: "8px",
          right: "8px",
          backgroundColor: "#FFC700",
          color: "#111111",
          padding: "4px 8px",
          border: "2px solid #111111",
          boxShadow: "2px 2px 0px #111111",
          fontFamily: "Poppins, sans-serif",
          fontSize: "10px",
          fontWeight: 700,
          textTransform: "uppercase",
          display: "flex",
          alignItems: "center",
          gap: "4px"
        }}>
          <div style={{
            width: "8px",
            height: "8px",
            backgroundColor: "#111111",
            borderRadius: "50%",
            animation: "pulse 1s ease-in-out infinite"
          }} />
          Loading
        </div>
      )}

      {/* Retry indicator */}
      {retries > 0 && !hasError && (
        <div style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          backgroundColor: "#FF3EA5",
          color: "#FFFFFF",
          padding: "4px 8px",
          border: "2px solid #111111",
          boxShadow: "2px 2px 0px #111111",
          fontFamily: "Poppins, sans-serif",
          fontSize: "10px",
          fontWeight: 700,
          textTransform: "uppercase"
        }}>
          Retry {retries}/{retryCount}
        </div>
      )}
    </div>
  );
}

// Gallery component with progressive loading
export function RetroImageGallery({ 
  images, 
  columns = 3,
  gap = "16px"
}: { 
  images: Array<{
    src: string;
    alt: string;
    placeholder?: string;
    blurDataURL?: string;
  }>;
  columns?: number;
  gap?: string;
}) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap,
      width: "100%"
    }}>
      {images.map((image, index) => (
        <RetroImage
          key={index}
          {...image}
          priority={index < 2} // Load first 2 images with priority
          className="aspect-square"
        />
      ))}
    </div>
  );
}

// Avatar component with progressive loading
export function RetroAvatar({
  src,
  alt,
  size = "64px",
  fallback,
  className = ""
}: {
  src: string;
  alt: string;
  size?: string;
  fallback?: string;
  className?: string;
}) {
  const [hasError, setHasError] = useState(false);

  const avatarStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    border: "3px solid #111111",
    boxShadow: "3px 3px 0px #111111",
    backgroundColor: "#E0E0E0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  };

  if (hasError && fallback) {
    return (
      <div className={className} style={avatarStyle}>
        <div style={{
          fontFamily: "Poppins, sans-serif",
          fontSize: "24px",
          fontWeight: 800,
          color: "#111111",
          textTransform: "uppercase"
        }}>
          {fallback}
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={avatarStyle}>
      <RetroImage
        src={src}
        alt={alt}
        width="100%"
        height="100%"
        priority={true}
        onError={() => setHasError(true)}
        className="rounded-full"
      />
    </div>
  );
}
