"use client";

import { ReactNode, useState, useEffect } from "react";
import { useSpring, animated } from '@react-spring/web';
import { useInView } from '@react-spring/web';

interface RetroCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
  glitchOnHover?: boolean;
  animateOnScroll?: boolean;
}

export function RetroCard({ 
  children, 
  className = "",
  hover = true,
  padding = "md",
  glitchOnHover = false,
  animateOnScroll = false
}: RetroCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [ref, inView] = useInView({ threshold: isMobile ? 0.05 : 0.1 });

  // Detect mobile device
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Responsive padding sizes
  const paddingSizes = {
    sm: isMobile ? '12px' : '16px',
    md: isMobile ? '16px' : '24px',
    lg: isMobile ? '20px' : '32px'
  };

  // Mobile-optimized animation config
  const animationConfig = {
    tension: isMobile ? 250 : 300,
    friction: isMobile ? 25 : 20
  };

  // Main card animation with mobile optimizations
  const cardSpring = useSpring({
    transform: (isHovered || isTouched) && hover
      ? isMobile
        ? 'translate(-2px, -2px) scale(1.01)'
        : 'translate(-5px, -5px) scale(1.02) rotateY(2deg)'
      : 'translate(0px, 0px) scale(1) rotateY(0deg)',
    boxShadow: (isHovered || isTouched) && hover
      ? isMobile
        ? '8px 8px 0px #111111, 0 0 15px rgba(255, 62, 165, 0.2)'
        : '10px 10px 0px #111111, 0 0 25px rgba(255, 62, 165, 0.3)'
      : isMobile 
        ? '4px 4px 0px #111111'
        : '6px 6px 0px #111111',
    borderColor: (isHovered || isTouched) && hover ? '#FF3EA5' : '#111111',
    backgroundColor: (isHovered || isTouched) && hover ? '#FEFEFE' : '#FFFFFF',
    config: animationConfig,
  });

  // Scroll animation with reduced motion for mobile
  const scrollSpring = useSpring({
    opacity: animateOnScroll ? (inView ? 1 : 0) : 1,
    transform: animateOnScroll 
      ? (inView ? 'translateY(0px)' : isMobile ? 'translateY(30px)' : 'translateY(50px)')
      : 'translateY(0px)',
    config: { 
      tension: isMobile ? 200 : 280, 
      friction: isMobile ? 40 : 60 
    },
  });

  // Reduced glitch effect for mobile performance
  const glitchSpring = useSpring({
    transform: glitchOnHover && (isHovered || isTouched) && !isMobile
      ? `skew(${Math.random() * 4 - 2}deg, ${Math.random() * 4 - 2}deg)`
      : glitchOnHover && (isHovered || isTouched) && isMobile
        ? `skew(${Math.random() * 2 - 1}deg, ${Math.random() * 2 - 1}deg)`
        : 'skew(0deg, 0deg)',
    config: { tension: isMobile ? 500 : 1000, friction: 5 },
    loop: glitchOnHover && (isHovered || isTouched),
  });

  // Reduced content animation for mobile
  const contentSpring = useSpring({
    transform: (isHovered || isTouched) && hover
      ? isMobile ? 'scale(1.005)' : 'scale(1.01)'
      : 'scale(1)',
    config: { tension: isMobile ? 300 : 400, friction: 30 }
  });

  // Touch event handlers
  const handleTouchStart = () => {
    if (isMobile) {
      setIsTouched(true);
    }
  };

  const handleTouchEnd = () => {
    if (isMobile) {
      setTimeout(() => setIsTouched(false), 150); // Brief delay for visual feedback
    }
  };

  const baseStyles: React.CSSProperties = {
    padding: paddingSizes[padding],
    border: '2px solid',
    borderRadius: '0px',
    position: 'relative' as const,
    overflow: 'hidden',
    cursor: hover ? 'pointer' : 'default',
    WebkitTapHighlightColor: 'transparent', // Remove iOS tap highlight
    touchAction: 'manipulation', // Improve touch responsiveness
  };

  return (
    <animated.div 
      ref={ref}
      style={{
        ...baseStyles,
        ...cardSpring,
        ...scrollSpring,
        ...glitchSpring,
      }}
      className={className}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Retro corner accent */}
      <animated.div
        style={{
          position: 'absolute',
          top: '-2px',
          right: '-2px',
          width: '20px',
          height: '20px',
          backgroundColor: '#FFC700',
          clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
          border: '2px solid #111111',
          borderLeft: 'none',
          borderBottom: 'none',
          opacity: isHovered && hover ? 1 : 0,
          transform: isHovered && hover ? 'scale(1)' : 'scale(0)',
          transition: 'all 0.2s ease',
        }}
      />
      
      {/* Shine effect */}
      <animated.div
        style={{
          position: 'absolute',
          top: 0,
          left: isHovered && hover ? '100%' : '-100%',
          width: '50%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 199, 0, 0.2), transparent)',
          transform: 'skewX(-25deg)',
          transition: 'left 0.6s ease',
          pointerEvents: 'none',
        }}
      />
      
      <animated.div style={contentSpring}>
        {children}
      </animated.div>
    </animated.div>
  );
}
