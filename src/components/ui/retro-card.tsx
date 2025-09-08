"use client";

import { ReactNode, useState } from "react";

interface RetroCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
}

export function RetroCard({ 
  children, 
  className = "",
  hover = true,
  padding = "md"
}: RetroCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const paddingSizes = {
    sm: '16px',
    md: '24px',
    lg: '32px'
  };

  const cardStyles: React.CSSProperties = {
    padding: paddingSizes[padding],
    border: '2px solid #111111',
    borderRadius: '0px',
    backgroundColor: '#FFFFFF',
    boxShadow: '6px 6px 0px #111111',
    transform: isHovered && hover ? 'translate(-3px, -3px)' : 'translate(0, 0)',
    transition: 'transform 0.1s ease, border-color 0.1s ease',
    position: 'relative' as const,
    borderColor: isHovered && hover ? '#FF3EA5' : '#111111',
  };

  return (
    <div 
      style={cardStyles}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
}
