"use client";

import { useEffect, useState, useRef } from "react";

interface PowerUpMascotProps {
  mood?: "happy" | "sad" | "excited" | "thinking" | "error" | "success";
  size?: number;
}

export function PowerUpMascot({ mood = "happy", size = 120 }: PowerUpMascotProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [lightningAnimation, setLightningAnimation] = useState(0);
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Random blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, Math.random() * 4000 + 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Mouse tracking for eyes
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!svgRef.current) return;
      
      const rect = svgRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate relative position
      const relX = e.clientX - centerX;
      const relY = e.clientY - centerY;
      
      // Limit eye movement
      const maxMove = 3;
      const distance = Math.sqrt(relX * relX + relY * relY);
      const limitedDistance = Math.min(distance, 100);
      
      const angle = Math.atan2(relY, relX);
      const moveX = (Math.cos(angle) * limitedDistance * maxMove) / 100;
      const moveY = (Math.sin(angle) * limitedDistance * maxMove) / 100;
      
      setEyePosition({ x: moveX, y: moveY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Pulsing effect for excited/success states
  useEffect(() => {
    if (mood === "excited" || mood === "success") {
      setIsPulsing(true);
      const interval = setInterval(() => {
        setLightningAnimation((prev) => (prev + 1) % 3);
      }, 500);
      return () => clearInterval(interval);
    } else {
      setIsPulsing(false);
    }
  }, [mood]);

  const getEyeExpression = () => {
    if (isBlinking) return { width: 8, height: 2 }; // Closed eyes
    
    switch (mood) {
      case "sad":
      case "error":
        return { width: 10, height: 8, sad: true };
      case "excited":
      case "success":
        return { width: 12, height: 12, sparkle: true };
      case "thinking":
        return { width: 8, height: 6 };
      default:
        return { width: 10, height: 10 };
    }
  };

  const getMouthExpression = () => {
    switch (mood) {
      case "sad":
        return "M 40 68 Q 50 63, 60 68"; // Sad mouth
      case "error":
        return "M 35 68 Q 50 62, 65 68 M 40 70 Q 50 65, 60 70"; // Very sad mouth
      case "excited":
        return "M 30 60 Q 50 72, 70 60 Q 50 75, 30 60"; // Big open smile
      case "success":
        return "M 32 62 Q 50 70, 68 62 Q 50 72, 32 62"; // Wide smile
      case "thinking":
        return "M 42 65 L 48 67 L 54 65 L 58 67"; // Wavy thinking mouth
      default:
        return "M 38 62 Q 50 66, 62 62"; // Normal smile
    }
  };

  const getBodyColor = () => {
    switch (mood) {
      case "error":
        return "#FF3EA5";
      case "success":
        return "#00FFFF";
      case "excited":
        return "#FFC700";
      default:
        return "#FF3EA5"; // Pink by default
    }
  };

  const eyeProps = getEyeExpression();

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
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-10px) rotate(-5deg); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1) rotate(-5deg); }
          50% { transform: scale(1.1) rotate(-5deg); }
        }
        
        @keyframes electricPulse {
          0% { opacity: 0.8; }
          50% { opacity: 1; }
          100% { opacity: 0.8; }
        }
        
        @keyframes zigzag {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          10% { transform: translateX(-2px) rotate(-1deg); }
          20% { transform: translateX(2px) rotate(1deg); }
          30% { transform: translateX(-2px) rotate(-1deg); }
          40% { transform: translateX(2px) rotate(1deg); }
          50% { transform: translateX(0) rotate(0deg); }
        }
        
        @keyframes tilt {
          0%, 100% { transform: rotate(-5deg); }
          25% { transform: rotate(-7deg); }
          50% { transform: rotate(-3deg); }
          75% { transform: rotate(-7deg); }
        }
        
        .lightning-bolt {
          animation: electricPulse 0.5s ease-in-out infinite;
        }
        
        .energy-dots {
          animation: float 2s ease-in-out infinite;
        }
      `}</style>

      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox="0 0 120 120"
        style={{
          animation: 
            mood === "error" ? "shake 0.5s ease-in-out infinite" :
            mood === "thinking" ? "tilt 4s ease-in-out infinite" :
            isPulsing ? "pulse 0.8s ease-in-out infinite" : 
            "float 3s ease-in-out infinite",
          transform: mood === "error" ? "rotate(0deg)" : "rotate(-5deg)",
        }}
      >
        {/* Background Energy Effects */}
        <g className="energy-dots">
          {/* Cyan dots */}
          <circle cx="20" cy="30" r="3" fill="#00FFFF" opacity="0.6" />
          <circle cx="100" cy="25" r="2" fill="#00FFFF" opacity="0.8" />
          <circle cx="15" cy="70" r="2.5" fill="#00FFFF" opacity="0.7" />
          
          {/* Pink dots */}
          <circle cx="105" cy="60" r="3" fill="#FF3EA5" opacity="0.6" />
          <circle cx="25" cy="90" r="2" fill="#FF3EA5" opacity="0.8" />
          
          {/* Blue dots */}
          <circle cx="95" cy="85" r="2.5" fill="#3D52F1" opacity="0.7" />
          <circle cx="30" cy="50" r="2" fill="#3D52F1" opacity="0.6" />
        </g>

        {/* Lightning Zigzag Lines Behind Character */}
        <g className="lightning-bolt">
          <path
            d="M 10 60 L 20 50 L 15 65 L 25 55"
            stroke="#00FFFF"
            strokeWidth="2"
            fill="none"
            opacity="0.8"
          />
          <path
            d="M 95 50 L 105 40 L 100 55 L 110 45"
            stroke="#FFC700"
            strokeWidth="2"
            fill="none"
            opacity="0.8"
          />
        </g>

        {/* Shadow */}
        <ellipse
          cx="60"
          cy="105"
          rx="25"
          ry="4"
          fill="#111111"
          opacity="0.3"
        />

        {/* Feet/Base */}
        <rect
          x="45"
          y="95"
          width="12"
          height="8"
          fill="#00FFFF"
          stroke="#111111"
          strokeWidth="2.5"
        />
        <rect
          x="63"
          y="95"
          width="12"
          height="8"
          fill="#00FFFF"
          stroke="#111111"
          strokeWidth="2.5"
        />

        {/* Body - Main Pink Suit */}
        <rect
          x="40"
          y="55"
          width="40"
          height="45"
          rx="8"
          fill={getBodyColor()}
          stroke="#111111"
          strokeWidth="3"
        />

        {/* Lightning Bolt on Chest */}
        <path
          d="M 55 65 L 62 75 L 57 75 L 65 85 L 58 75 L 63 75 L 55 65"
          fill="#FFC700"
          stroke="#111111"
          strokeWidth="1.5"
        />

        {/* Tech Pattern Details on Suit */}
        <line x1="42" y1="70" x2="48" y2="70" stroke="#111111" strokeWidth="1" opacity="0.3" />
        <line x1="72" y1="70" x2="78" y2="70" stroke="#111111" strokeWidth="1" opacity="0.3" />
        <line x1="42" y1="85" x2="48" y2="85" stroke="#111111" strokeWidth="1" opacity="0.3" />
        <line x1="72" y1="85" x2="78" y2="85" stroke="#111111" strokeWidth="1" opacity="0.3" />

        {/* Arms */}
        <rect
          x="28"
          y="65"
          width="12"
          height="20"
          rx="6"
          fill={getBodyColor()}
          stroke="#111111"
          strokeWidth="2.5"
        />
        <rect
          x="80"
          y="65"
          width="12"
          height="20"
          rx="6"
          fill={getBodyColor()}
          stroke="#111111"
          strokeWidth="2.5"
        />

        {/* Gloves */}
        <circle cx="34" cy="88" r="7" fill="#FFC700" stroke="#111111" strokeWidth="2" />
        <circle cx="86" cy="88" r="7" fill="#FFC700" stroke="#111111" strokeWidth="2" />

        {/* Head */}
        <circle
          cx="60"
          cy="40"
          r="22"
          fill="#FFB8B8"
          stroke="#111111"
          strokeWidth="3"
        />

        {/* Hair - Cyan Spiky Style */}
        <path
          d="M 38 30 L 35 20 L 40 25 L 42 15 L 45 23 L 50 12 L 52 22 L 58 10 L 60 20 L 65 13 L 68 22 L 75 15 L 77 25 L 82 20 L 80 30"
          fill="#00FFFF"
          stroke="#111111"
          strokeWidth="2.5"
        />

        {/* Headband */}
        <rect
          x="38"
          y="32"
          width="44"
          height="8"
          rx="2"
          fill="#9333EA"
          stroke="#111111"
          strokeWidth="2"
        />

        {/* Pink accent stripe on headband */}
        <rect
          x="38"
          y="34"
          width="44"
          height="2"
          fill="#FF3EA5"
        />
        <rect
          x="38"
          y="37"
          width="44"
          height="1.5"
          fill="#FFC700"
        />

        {/* Star on headband */}
        <g transform="translate(60, 36)">
          <path
            d="M 0,-4 L 1,-1 L 4,-1 L 1,1 L 2,4 L 0,2 L -2,4 L -1,1 L -4,-1 L -1,-1 Z"
            fill="#FFC700"
            stroke="#111111"
            strokeWidth="1"
          />
        </g>

        {/* Eyes */}
        <g>
          {/* Left eye */}
          <ellipse
            cx="50"
            cy="42"
            rx={eyeProps.width / 2}
            ry={isBlinking ? 1 : eyeProps.height / 2}
            fill="#FFFFFF"
            stroke="#111111"
            strokeWidth="2"
          />
          {!isBlinking && (
            <>
              <circle 
                cx={50 + eyePosition.x} 
                cy={42 + eyePosition.y} 
                r="4" 
                fill={mood === "error" ? "#FF0000" : mood === "success" ? "#00FF00" : "#9333EA"} 
              />
              <circle 
                cx={52 + eyePosition.x} 
                cy={40 + eyePosition.y} 
                r="2" 
                fill="#FFFFFF" 
              />
              {eyeProps.sparkle && (
                <circle cx="48" cy="44" r="1" fill="#FFFFFF" opacity="0.8" />
              )}
            </>
          )}
          
          {/* Right eye */}
          <ellipse
            cx="70"
            cy="42"
            rx={eyeProps.width / 2}
            ry={isBlinking ? 1 : eyeProps.height / 2}
            fill="#FFFFFF"
            stroke="#111111"
            strokeWidth="2"
          />
          {!isBlinking && (
            <>
              <circle 
                cx={70 + eyePosition.x} 
                cy={42 + eyePosition.y} 
                r="4" 
                fill={mood === "error" ? "#FF0000" : mood === "success" ? "#00FF00" : "#9333EA"} 
              />
              <circle 
                cx={72 + eyePosition.x} 
                cy={40 + eyePosition.y} 
                r="2" 
                fill="#FFFFFF" 
              />
              {eyeProps.sparkle && (
                <circle cx="68" cy="44" r="1" fill="#FFFFFF" opacity="0.8" />
              )}
            </>
          )}
        </g>

        {/* Cheeks */}
        {(mood === "excited" || mood === "happy") && (
          <>
            <circle cx="40" cy="48" r="4" fill="#FF3EA5" opacity="0.4" />
            <circle cx="80" cy="48" r="4" fill="#FF3EA5" opacity="0.4" />
          </>
        )}
        
        {mood === "error" && (
          <>
            <circle cx="40" cy="50" r="5" fill="#FF6B6B" opacity="0.6" />
            <circle cx="80" cy="50" r="5" fill="#FF6B6B" opacity="0.6" />
          </>
        )}
        
        {mood === "sad" && (
          <>
            <path d="M 38 52 L 42 54" stroke="#4A90E2" strokeWidth="2" opacity="0.7" />
            <path d="M 78 52 L 82 54" stroke="#4A90E2" strokeWidth="2" opacity="0.7" />
          </>
        )}

        {/* Mouth */}
        <path
          d={getMouthExpression()}
          stroke="#111111"
          strokeWidth="2.5"
          fill={mood === "excited" || mood === "success" ? "#FF3EA5" : "none"}
          strokeLinecap="round"
        />

        {/* Extra effects based on mood */}
        {mood === "thinking" && (
          <g className="energy-dots">
            <circle cx="85" cy="20" r="2" fill="#666" opacity="0.6" />
            <circle cx="90" cy="15" r="2.5" fill="#666" opacity="0.7" />
            <circle cx="95" cy="10" r="3" fill="#666" opacity="0.8" />
            <text x="80" y="12" fontSize="16" fill="#666">?</text>
          </g>
        )}

        {mood === "success" && (
          <g>
            <text x="20" y="20" fontSize="10" fill="#FFC700">⭐</text>
            <text x="85" y="25" fontSize="12" fill="#FFC700">✨</text>
            <text x="90" y="50" fontSize="10" fill="#00FFFF">⚡</text>
            <text x="25" y="45" fontSize="14" fill="#00FF00">✓</text>
            <text x="95" y="75" fontSize="14" fill="#00FF00">✓</text>
          </g>
        )}
        
        {mood === "error" && (
          <g>
            <text x="20" y="25" fontSize="16" fill="#FF0000">✗</text>
            <text x="90" y="30" fontSize="16" fill="#FF0000">!</text>
            <path 
              d="M 75 35 Q 73 30, 75 25 Q 77 30, 75 35" 
              fill="#4A90E2" 
              opacity="0.7"
            />
          </g>
        )}
        
        {mood === "excited" && (
          <g>
            <circle cx="15" cy="35" r="2" fill="#FFC700" className="energy-dots" />
            <circle cx="105" cy="40" r="2" fill="#FF3EA5" className="energy-dots" />
            <circle cx="20" cy="75" r="2" fill="#00FFFF" className="energy-dots" />
            <circle cx="100" cy="70" r="2" fill="#FFC700" className="energy-dots" />
          </g>
        )}

        {/* Dynamic Text based on mood */}
        <text
          x="60"
          y="115"
          fontSize="14"
          fontFamily="Poppins, sans-serif"
          fontWeight="800"
          fill={mood === "error" ? "#FF0000" : mood === "success" ? "#00FF00" : "#00FFFF"}
          textAnchor="middle"
          stroke="#111111"
          strokeWidth="0.5"
          style={{
            textTransform: "uppercase",
            letterSpacing: "1px"
          }}
        >
          {mood === "error" ? "ERROR!" : 
           mood === "success" ? "SUCCESS!" : 
           mood === "thinking" ? "LOADING..." :
           mood === "excited" ? "AWESOME!" :
           mood === "sad" ? "TRY AGAIN" :
           "POWER UP!"}
        </text>
      </svg>
    </div>
  );
}
