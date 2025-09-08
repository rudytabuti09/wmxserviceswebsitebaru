"use client";

import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <div 
      className={`animate-in fade-in-0 slide-in-from-bottom-4 duration-700 ease-out ${className}`}
    >
      {children}
    </div>
  );
}

// Staggered animations for lists
export function StaggeredFadeIn({ 
  children, 
  delay = 0, 
  className = "" 
}: { 
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div 
      className={`animate-in fade-in-0 slide-in-from-bottom-2 duration-500 ease-out ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
