"use client";

import { useSpring, animated, useSpringValue } from "@react-spring/web";
import { useEffect } from "react";

interface RetroLoadingProps {
  variant?: "spinner" | "dots" | "bars" | "glitch" | "neon";
  size?: "sm" | "md" | "lg";
  color?: string;
  speed?: number;
}

export function RetroLoadingEnhanced({
  variant = "spinner",
  size = "md",
  color = "#FFC700",
  speed = 1000
}: RetroLoadingProps) {
  const sizeMap = {
    sm: { width: "24px", height: "24px" },
    md: { width: "48px", height: "48px" },
    lg: { width: "72px", height: "72px" }
  };

  switch (variant) {
    case "spinner":
      return <RetroSpinner size={sizeMap[size]} color={color} speed={speed} />;
    case "dots":
      return <RetroDots size={sizeMap[size]} color={color} speed={speed} />;
    case "bars":
      return <RetroBars size={sizeMap[size]} color={color} speed={speed} />;
    case "glitch":
      return <RetroGlitch size={sizeMap[size]} color={color} speed={speed} />;
    case "neon":
      return <RetroNeon size={sizeMap[size]} color={color} speed={speed} />;
    default:
      return <RetroSpinner size={sizeMap[size]} color={color} speed={speed} />;
  }
}

// Retro Spinner Component
function RetroSpinner({ size, color, speed }: any) {
  const spinnerSpring = useSpring({
    from: { transform: "rotate(0deg)" },
    to: { transform: "rotate(360deg)" },
    config: { duration: speed },
    loop: true,
  });

  return (
    <animated.div
      style={{
        ...size,
        border: `3px solid transparent`,
        borderTop: `3px solid ${color}`,
        borderRight: `3px solid ${color}`,
        borderRadius: "0%",
        boxShadow: `0 0 20px ${color}30`,
        ...spinnerSpring,
      }}
    />
  );
}

// Retro Dots Component
function RetroDots({ size, color, speed }: any) {
  const dots = [0, 1, 2];
  
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      {dots.map((dot) => {
        const dotSpring = useSpring({
          from: { transform: "scale(0.8)", opacity: 0.3 },
          to: { transform: "scale(1.2)", opacity: 1 },
          config: { duration: speed / 3 },
          loop: { reverse: true },
          delay: dot * (speed / 6),
        });

        return (
          <animated.div
            key={dot}
            style={{
              width: `${parseInt(size.width) / 3}px`,
              height: `${parseInt(size.height) / 3}px`,
              backgroundColor: color,
              border: "2px solid #111111",
              boxShadow: `2px 2px 0px #111111, 0 0 10px ${color}30`,
              ...dotSpring,
            }}
          />
        );
      })}
    </div>
  );
}

// Retro Bars Component
function RetroBars({ size, color, speed }: any) {
  const bars = [0, 1, 2, 3, 4];
  
  return (
    <div style={{ display: "flex", alignItems: "end", gap: "4px", height: size.height }}>
      {bars.map((bar) => {
        const barSpring = useSpring({
          from: { height: "20%" },
          to: { height: "100%" },
          config: { duration: speed / 2 },
          loop: { reverse: true },
          delay: bar * (speed / 10),
        });

        return (
          <animated.div
            key={bar}
            style={{
              width: `${parseInt(size.width) / 6}px`,
              backgroundColor: color,
              border: "1px solid #111111",
              boxShadow: `1px 1px 0px #111111`,
              ...barSpring,
            }}
          />
        );
      })}
    </div>
  );
}

// Retro Glitch Component
function RetroGlitch({ size, color, speed }: any) {
  const glitchSpring = useSpring({
    from: {
      transform: "translate(0px, 0px) skew(0deg)",
      filter: "hue-rotate(0deg)",
    },
    to: {
      transform: "translate(2px, -2px) skew(2deg)",
      filter: "hue-rotate(90deg)",
    },
    config: { duration: speed / 4 },
    loop: { reverse: true },
  });

  return (
    <animated.div
      style={{
        ...size,
        backgroundColor: color,
        border: "2px solid #111111",
        boxShadow: `4px 4px 0px #111111, 0 0 20px ${color}50`,
        position: "relative",
        overflow: "hidden",
        ...glitchSpring,
      }}
    >
      {/* Glitch overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(45deg, ${color}80, #FF3EA580, #00FFFF80)`,
          mixBlendMode: "multiply",
        }}
      />
    </animated.div>
  );
}

// Retro Neon Component
function RetroNeon({ size, color, speed }: any) {
  const neonSpring = useSpring({
    from: {
      boxShadow: `0 0 5px ${color}, 0 0 10px ${color}, 0 0 15px ${color}`,
      opacity: 0.8,
    },
    to: {
      boxShadow: `0 0 10px ${color}, 0 0 20px ${color}, 0 0 30px ${color}, 0 0 40px ${color}`,
      opacity: 1,
    },
    config: { duration: speed / 2 },
    loop: { reverse: true },
  });

  const rotateSpring = useSpring({
    from: { transform: "rotate(0deg)" },
    to: { transform: "rotate(360deg)" },
    config: { duration: speed * 2 },
    loop: true,
  });

  return (
    <animated.div
      style={{
        ...size,
        border: `2px solid ${color}`,
        backgroundColor: "transparent",
        position: "relative",
        ...neonSpring,
        ...rotateSpring,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "60%",
          height: "60%",
          backgroundColor: color,
          transform: "translate(-50%, -50%)",
          border: "1px solid #111111",
        }}
      />
    </animated.div>
  );
}

// Page Transition Component
interface PageTransitionProps {
  isLoading: boolean;
  children: React.ReactNode;
}

export function RetroPageTransition({ isLoading, children }: PageTransitionProps) {
  const transitionSpring = useSpring({
    opacity: isLoading ? 0 : 1,
    transform: isLoading ? "translateY(50px) scale(0.95)" : "translateY(0px) scale(1)",
    filter: isLoading ? "blur(10px)" : "blur(0px)",
    config: { tension: 280, friction: 20 },
  });

  const overlaySpring = useSpring({
    opacity: isLoading ? 1 : 0,
    background: isLoading
      ? "linear-gradient(45deg, #3D52F1, #FF3EA5, #FFC700)"
      : "linear-gradient(45deg, #3D52F1, #3D52F1, #3D52F1)",
    config: { tension: 200, friction: 25 },
  });

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {isLoading && (
        <animated.div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            ...overlaySpring,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <RetroLoadingEnhanced variant="neon" size="lg" />
            <div
              style={{
                marginTop: "24px",
                fontFamily: "Poppins, sans-serif",
                fontSize: "18px",
                fontWeight: 700,
                color: "#FFFFFF",
                textTransform: "uppercase",
                letterSpacing: "2px",
                textShadow: "2px 2px 0px #111111",
              }}
            >
              Loading...
            </div>
          </div>
        </animated.div>
      )}
      <animated.div style={transitionSpring}>{children}</animated.div>
    </div>
  );
}
