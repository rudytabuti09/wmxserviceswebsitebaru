"use client";

import { ReactNode, useEffect, useState, useMemo } from "react";
import { useSpring, animated, config } from "@react-spring/web";

interface SplitTextProps {
  text: string;
  delay?: number;
  duration?: number;
  className?: string;
  variant?: "slide" | "bounce" | "glitch" | "neon";
  trigger?: boolean;
  stagger?: number;
  style?: React.CSSProperties;
}

export function SplitText({
  text,
  delay = 0,
  duration = 0.6,
  className = "",
  variant = "slide",
  trigger = true,
  stagger = 50,
  style = {}
}: SplitTextProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  
  const letters = useMemo(() => text.split(""), [text]);
  
  // Simplified glitch values for better stability
  const glitchValues = useMemo(() => 
    letters.map((_, index) => ({
      translateX: (index % 3 - 1) * 5, // Simplified calculation
      translateY: ((index + 1) % 3 - 1) * 3,
      skew: (index % 2 ? 1 : -1) * 2,
      color: ["#FF3EA5", "#FFC700", "#00FFFF"][index % 3]
    })), [letters]
  );

  // Optimized detection with debouncing
  useEffect(() => {
    setIsHydrated(true);
    
    let timeoutId: NodeJS.Timeout;
    
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    const checkMotionPreference = () => {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
    };
    
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkIsMobile, 100);
    };
    
    checkIsMobile();
    checkMotionPreference();
    
    window.addEventListener('resize', debouncedResize, { passive: true });
    
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (trigger) {
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, [trigger, delay]);

  // Simplified and stable animation function
  const getVariantAnimation = (index: number) => {
    // Limit animations for better performance
    if (!isHydrated || prefersReducedMotion || index > 10) {
      return {
        opacity: isVisible ? 1 : 0,
        config: config.gentle
      };
    }

    const animDelay = isMobile ? index * 30 : index * 50;
    const baseConfig = isMobile ? config.gentle : config.wobbly;

    switch (variant) {
      case "slide":
        return {
          opacity: isVisible ? 1 : 0,
          transform: isVisible 
            ? "translateY(0px)" 
            : "translateY(20px)",
          config: baseConfig,
          delay: animDelay,
        };
      
      case "bounce":
        return {
          opacity: isVisible ? 1 : 0,
          transform: isVisible 
            ? "translateY(0px) scale(1)" 
            : "translateY(-20px) scale(0.9)",
          config: config.bouncy,
          delay: animDelay,
        };
        
      case "glitch":
        const glitchData = glitchValues[index] || { translateX: 0, translateY: 0, skew: 0, color: "#FFC700" };
        return {
          opacity: isVisible ? 1 : 0,
          transform: isVisible 
            ? "translate(0px, 0px) skew(0deg)" 
            : `translate(${glitchData.translateX}px, ${glitchData.translateY}px) skew(${glitchData.skew}deg)`,
          color: isVisible ? "inherit" : glitchData.color,
          config: config.stiff,
          delay: animDelay,
        };
        
      case "neon":
        return {
          opacity: isVisible ? 1 : 0,
          textShadow: isVisible 
            ? "0 0 5px currentColor, 0 0 10px currentColor"
            : "0 0 0px currentColor",
          config: baseConfig,
          delay: animDelay,
        };
        
      default:
        return {
          opacity: isVisible ? 1 : 0,
          config: baseConfig,
          delay: animDelay,
        };
    }
  };

  // Limit rendered letters for performance
  const maxLetters = 20;
  const displayLetters = letters.slice(0, maxLetters);
  const remainingText = letters.slice(maxLetters).join('');

  return (
    <span 
      className={className} 
      style={{ 
        display: "inline-block",
        ...style
      }}
    >
      {displayLetters.map((letter, index) => {
        const animationProps = getVariantAnimation(index);
        return (
          <animated.span
            key={`${text}-${index}`} // More stable key
            style={{
              display: "inline-block",
              whiteSpace: letter === " " ? "pre" : "normal",
              fontSize: isHydrated && isMobile ? '0.9em' : '1em',
              ...useSpring(animationProps),
            }}
          >
            {letter}
          </animated.span>
        );
      })}
      {remainingText && (
        <span style={{ opacity: isVisible ? 1 : 0 }}>
          {remainingText}
        </span>
      )}
    </span>
  );
}

// TypeWriter Effect Component
interface TypeWriterProps {
  texts: string[];
  speed?: number;
  deleteSpeed?: number;
  pauseDuration?: number;
  className?: string;
  infinite?: boolean;
}

export function TypeWriter({
  texts,
  speed = 100,
  deleteSpeed = 50,
  pauseDuration = 2000,
  className = "",
  infinite = true
}: TypeWriterProps) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const cursorSpring = useSpring({
    opacity: 1,
    config: { duration: 500 },
    loop: { reverse: true },
  });

  useEffect(() => {
    if (isComplete && !infinite) return;

    const currentFullText = texts[currentTextIndex];
    
    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (currentText !== currentFullText) {
          setCurrentText(currentFullText.slice(0, currentText.length + 1));
        } else {
          if (infinite || currentTextIndex < texts.length - 1) {
            setTimeout(() => setIsDeleting(true), pauseDuration);
          } else {
            setIsComplete(true);
          }
        }
      } else {
        if (currentText !== "") {
          setCurrentText(currentText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        }
      }
    }, isDeleting ? deleteSpeed : speed);

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentTextIndex, texts, speed, deleteSpeed, pauseDuration, infinite, isComplete]);

  return (
    <span className={className}>
      {currentText}
      <animated.span
        style={{
          ...cursorSpring,
          color: '#FF3EA5',
          fontWeight: 'bold'
        }}
      >
        |
      </animated.span>
    </span>
  );
}

// Gradient Text Animation
interface GradientTextProps {
  text: string;
  className?: string;
  animate?: boolean;
}

export function GradientText({ 
  text, 
  className = "",
  animate = true 
}: GradientTextProps) {
  const gradientSpring = useSpring({
    backgroundPosition: animate ? "200% center" : "0% center",
    config: { duration: 3000 },
    loop: animate,
  });

  return (
    <animated.span
      className={className}
      style={{
        background: "linear-gradient(45deg, #FFC700, #FF3EA5, #00FFFF, #FFC700)",
        backgroundSize: "200% 200%",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        ...gradientSpring,
      }}
    >
      {text}
    </animated.span>
  );
}
