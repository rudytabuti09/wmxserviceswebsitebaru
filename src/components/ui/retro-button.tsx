"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { useSpring, animated } from '@react-spring/web';
import { useState, useEffect } from 'react';

interface RetroButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  className?: string;
  glitch?: boolean;
  fullWidth?: boolean;
}

export function RetroButton({ 
  variant = "primary", 
  size = "md", 
  children, 
  className = "",
  glitch = false,
  fullWidth = false,
  ...props 
}: RetroButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Responsive size configuration with clamp for fluid sizing
  const sizeStyles = {
    sm: { 
      padding: 'clamp(8px, 2.5vw, 10px) clamp(16px, 4vw, 20px)', 
      fontSize: 'clamp(12px, 3vw, 14px)',
      minHeight: isMobile ? '44px' : '36px',
      gap: 'clamp(4px, 1vw, 6px)'
    },
    md: { 
      padding: 'clamp(12px, 3vw, 14px) clamp(24px, 5vw, 28px)', 
      fontSize: 'clamp(14px, 3.5vw, 16px)',
      minHeight: isMobile ? '48px' : '40px',
      gap: 'clamp(6px, 1.5vw, 8px)'
    },
    lg: { 
      padding: 'clamp(16px, 3.5vw, 18px) clamp(32px, 6vw, 36px)', 
      fontSize: 'clamp(16px, 4vw, 18px)',
      minHeight: isMobile ? '52px' : '44px',
      gap: 'clamp(8px, 2vw, 10px)'
    }
  };

  const variantStyles = {
    primary: {
      backgroundColor: '#FFC700',
      hoverColor: '#FFD700',
      color: '#111111',
    },
    secondary: {
      backgroundColor: '#FF3EA5',
      hoverColor: '#FF69B4',
      color: '#111111',
    },
    outline: {
      backgroundColor: '#FFFFFF',
      hoverColor: '#FFC700',
      color: '#111111',
    },
  };

  // Responsive animation configurations
  const animationConfig = {
    tension: isMobile ? 300 : 400,
    friction: isMobile ? 15 : 10
  };

  // React Spring animations with mobile optimizations
  const buttonSpring = useSpring({
    transform: isPressed 
      ? 'translate(1px, 1px) scale(0.98)' 
      : isHovered && !isMobile
        ? 'translate(-3px, -3px) scale(1.02)' 
        : isHovered && isMobile
          ? 'translate(-2px, -2px) scale(1.01)'
          : 'translate(0px, 0px) scale(1)',
    backgroundColor: isHovered 
      ? variantStyles[variant].hoverColor 
      : variantStyles[variant].backgroundColor,
    boxShadow: isPressed
      ? isMobile ? '1px 1px 0px #111111' : '2px 2px 0px #111111'
      : isHovered
        ? isMobile 
          ? '6px 6px 0px #111111, 0 0 15px rgba(255, 199, 0, 0.2)'
          : '8px 8px 0px #111111, 0 0 20px rgba(255, 199, 0, 0.3)'
        : isMobile ? '3px 3px 0px #111111' : '4px 4px 0px #111111',
    config: animationConfig,
  });

  // Reduced glitch effect for mobile
  const glitchSpring = useSpring({
    transform: glitch && isHovered && !isMobile
      ? `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)` 
      : glitch && isHovered && isMobile
        ? `translate(${Math.random() * 2 - 1}px, ${Math.random() * 2 - 1}px)`
        : 'translate(0px, 0px)',
    config: { tension: isMobile ? 500 : 1000, friction: 5 },
    loop: glitch && isHovered,
  });

  // Text animation - reduced on mobile for performance
  const textSpring = useSpring({
    letterSpacing: isHovered && !isMobile ? '3px' : isMobile ? '1px' : '1px',
    config: { tension: 300, friction: 20 }
  });

  const baseStyles: React.CSSProperties = {
    ...sizeStyles[size],
    border: '2px solid #111111',
    borderRadius: '0px',
    fontFamily: 'Poppins, sans-serif',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'nowrap', // Prevent wrapping
    position: 'relative' as const,
    color: variantStyles[variant].color,
    userSelect: 'none' as const,
    outline: 'none',
    width: fullWidth ? '100%' : 'auto',
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
    lineHeight: '1.2', // Better text alignment
    whiteSpace: 'nowrap' as const, // Prevent text wrapping
  };

  // Handle touch events for mobile
  const handleTouchStart = () => {
    if (isMobile) {
      setIsPressed(true);
    }
  };

  const handleTouchEnd = () => {
    if (isMobile) {
      setIsPressed(false);
    }
  };

  return (
    <animated.button
      style={{
        ...baseStyles,
        ...buttonSpring,
        ...glitchSpring,
      }}
      className={className}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => {
        if (!isMobile) {
          setIsHovered(false);
          setIsPressed(false);
        }
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onFocus={() => isMobile && setIsHovered(true)}
      onBlur={() => isMobile && setIsHovered(false)}
      {...props}
    >
      <animated.span 
        style={{
          ...textSpring,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'inherit', // Use button's gap
          flexWrap: 'nowrap',
          width: '100%'
        }}
      >
        {children}
      </animated.span>
    </animated.button>
  );
}
