"use client";

import { useEffect, useState } from "react";

interface AuthMascotProps {
  mood?: "happy" | "sad" | "excited" | "thinking" | "error" | "success";
  size?: number;
}

export function AuthMascot({ mood = "happy", size = 120 }: AuthMascotProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isWaving, setIsWaving] = useState(false);

  // Random blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, Math.random() * 4000 + 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Wave on mount and when mood changes to happy/excited
  useEffect(() => {
    if (mood === "happy" || mood === "excited") {
      setIsWaving(true);
      setTimeout(() => setIsWaving(false), 1000);
    }
  }, [mood]);

  const getEyeExpression = () => {
    if (isBlinking) return "M 35 45 L 45 45"; // Closed eyes
    
    switch (mood) {
      case "sad":
      case "error":
        return "M 30 42 Q 35 38, 40 42 Q 35 46, 30 42"; // Sad eyes
      case "excited":
      case "success":
        return "M 30 40 Q 35 35, 40 40 Q 35 45, 30 40"; // Star eyes
      case "thinking":
        return "M 32 40 L 38 40 L 38 46 L 32 46 Z"; // Squinting
      default:
        return "M 35 42 A 3 3 0 0 1 35 48 A 3 3 0 0 1 35 42"; // Normal round eyes
    }
  };

  const getMouthExpression = () => {
    switch (mood) {
      case "sad":
      case "error":
        return "M 40 65 Q 50 60, 60 65"; // Sad mouth
      case "excited":
      case "success":
        return "M 35 60 Q 50 70, 65 60 Q 50 75, 35 60"; // Big smile
      case "thinking":
        return "M 45 65 L 55 65"; // Straight mouth
      default:
        return "M 40 60 Q 50 65, 60 60"; // Smile
    }
  };

  const getBodyColor = () => {
    switch (mood) {
      case "error":
        return "#FF6B6B";
      case "success":
        return "#51CF66";
      case "excited":
        return "#FFD43B";
      default:
        return "#FFC700";
    }
  };

  const getCheeks = () => {
    if (mood === "error" || mood === "sad") {
      return (
        <>
          <circle cx="25" cy="55" r="5" fill="#FFB8B8" opacity="0.6" />
          <circle cx="75" cy="55" r="5" fill="#FFB8B8" opacity="0.6" />
        </>
      );
    }
    if (mood === "excited" || mood === "success") {
      return (
        <>
          <circle cx="25" cy="55" r="6" fill="#FF6B9D" opacity="0.8" />
          <circle cx="75" cy="55" r="6" fill="#FF6B9D" opacity="0.8" />
        </>
      );
    }
    return null;
  };

  const getAccessory = () => {
    if (mood === "thinking") {
      return (
        <g className="thinking-bubble">
          <circle cx="85" cy="25" r="3" fill="#666" opacity="0.6" />
          <circle cx="90" cy="18" r="4" fill="#666" opacity="0.7" />
          <circle cx="95" cy="10" r="5" fill="#666" opacity="0.8" />
        </g>
      );
    }
    if (mood === "error") {
      return (
        <g className="sweat-drop">
          <path d="M 75 35 Q 73 30, 75 25 Q 77 30, 75 35" fill="#4A90E2" opacity="0.7" />
        </g>
      );
    }
    if (mood === "success") {
      return (
        <g className="sparkles">
          <text x="15" y="25" fontSize="12" fill="#FFD700">✨</text>
          <text x="75" y="20" fontSize="10" fill="#FFD700">✨</text>
          <text x="85" y="40" fontSize="8" fill="#FFD700">✨</text>
        </g>
      );
    }
    return null;
  };

  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        display: "inline-block",
      }}
    >
      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes wave {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-10deg); }
          100% { transform: rotate(0deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .thinking-bubble {
          animation: float 2s ease-in-out infinite;
        }
        
        .sweat-drop {
          animation: float 1.5s ease-in-out infinite;
        }
        
        .sparkles {
          animation: float 1s ease-in-out infinite;
        }
      `}</style>

      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        style={{
          animation: 
            mood === "excited" || mood === "success" 
              ? "bounce 1s ease-in-out infinite" 
              : mood === "error" 
              ? "shake 0.5s ease-in-out" 
              : "float 3s ease-in-out infinite",
        }}
      >
        {/* Shadow */}
        <ellipse
          cx="50"
          cy="95"
          rx="25"
          ry="3"
          fill="#111111"
          opacity="0.2"
        />

        {/* Body */}
        <rect
          x="30"
          y="40"
          width="40"
          height="50"
          rx="20"
          fill={getBodyColor()}
          stroke="#111111"
          strokeWidth="2"
        />

        {/* Arms */}
        <rect
          x={isWaving ? "15" : "20"}
          y={isWaving ? "45" : "55"}
          width="12"
          height="25"
          rx="6"
          fill={getBodyColor()}
          stroke="#111111"
          strokeWidth="2"
          style={{
            transformOrigin: "26px 55px",
            transform: isWaving ? "rotate(-45deg)" : "rotate(0deg)",
            transition: "all 0.3s ease",
          }}
        />
        <rect
          x="73"
          y="55"
          width="12"
          height="25"
          rx="6"
          fill={getBodyColor()}
          stroke="#111111"
          strokeWidth="2"
        />

        {/* Legs */}
        <rect
          x="38"
          y="85"
          width="10"
          height="12"
          rx="5"
          fill={getBodyColor()}
          stroke="#111111"
          strokeWidth="2"
        />
        <rect
          x="52"
          y="85"
          width="10"
          height="12"
          rx="5"
          fill={getBodyColor()}
          stroke="#111111"
          strokeWidth="2"
        />

        {/* Face Background */}
        <circle
          cx="50"
          cy="50"
          r="25"
          fill="#FFFFFF"
          stroke="#111111"
          strokeWidth="2"
        />

        {/* Eyes */}
        <g>
          {/* Left eye */}
          <path
            d={getEyeExpression()}
            fill="#111111"
            transform="translate(-5, 0)"
          />
          {/* Right eye */}
          <path
            d={getEyeExpression()}
            fill="#111111"
            transform="translate(20, 0)"
          />
        </g>

        {/* Mouth */}
        <path
          d={getMouthExpression()}
          stroke="#111111"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />

        {/* Cheeks */}
        {getCheeks()}

        {/* Accessories */}
        {getAccessory()}

        {/* Hat/Hair */}
        <path
          d="M 30 35 Q 50 25, 70 35 L 70 30 Q 50 15, 30 30 Z"
          fill="#111111"
          opacity="0.8"
        />
      </svg>
    </div>
  );
}
