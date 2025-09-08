"use client";

import { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

interface RetroAdminLayoutProps {
  children: ReactNode;
  showDecorations?: boolean;
}

export function RetroAdminLayout({ 
  children, 
  showDecorations = true 
}: RetroAdminLayoutProps) {
  return (
    <div className="min-h-screen" style={{
      backgroundColor: '#3D52F1',
      backgroundImage: `
        repeating-linear-gradient(
          0deg,
          rgba(255, 199, 0, 0.1),
          rgba(255, 199, 0, 0.1) 2px,
          transparent 2px,
          transparent 40px
        ),
        repeating-linear-gradient(
          90deg,
          rgba(255, 199, 0, 0.1),
          rgba(255, 199, 0, 0.1) 2px,
          transparent 2px,
          transparent 40px
        )
      `
    }}>
      <Header />
      
      {/* Floating Retro Decorations */}
      {showDecorations && (
        <>
          <div style={{
            position: 'fixed',
            top: '10%',
            left: '3%',
            width: '50px',
            height: '50px',
            backgroundColor: '#FFC700',
            border: '3px solid #111111',
            transform: 'rotate(45deg)',
            zIndex: 1,
            opacity: 0.5
          }} />
          <div style={{
            position: 'fixed',
            bottom: '15%',
            right: '5%',
            width: '35px',
            height: '35px',
            backgroundColor: '#FF3EA5',
            borderRadius: '50%',
            border: '3px solid #111111',
            zIndex: 1,
            opacity: 0.5
          }} />
        </>
      )}
      
      <main className="py-20 relative z-10">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}

// Utility component untuk Back Navigation
interface RetroBackButtonProps {
  href?: string;
  onClick?: () => void;
  label: string;
}

export function RetroBackButton({ 
  href, 
  onClick, 
  label 
}: RetroBackButtonProps) {
  const buttonStyle = {
    display: 'inline-flex' as const,
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#FFFFFF',
    color: '#111111',
    padding: '12px 20px',
    border: '2px solid #111111',
    boxShadow: '3px 3px 0px #111111',
    fontFamily: 'Poppins, sans-serif',
    fontSize: '14px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    textDecoration: 'none',
    transition: 'all 0.2s',
    cursor: 'pointer'
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.transform = 'translate(-2px, -2px)';
    e.currentTarget.style.backgroundColor = '#FFC700';
    e.currentTarget.style.boxShadow = '5px 5px 0px #111111';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.transform = 'translate(0, 0)';
    e.currentTarget.style.backgroundColor = '#FFFFFF';
    e.currentTarget.style.boxShadow = '3px 3px 0px #111111';
  };

  if (href) {
    return (
      <a
        href={href}
        style={buttonStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        ← {label}
      </a>
    );
  }

  return (
    <button
      onClick={onClick || (() => window.history.back())}
      style={buttonStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      ← {label}
    </button>
  );
}

// Utility component untuk Page Header
interface RetroPageHeaderProps {
  icon: string;
  title: string;
  description: string;
  actionButton?: ReactNode;
}

export function RetroPageHeader({ 
  icon, 
  title, 
  description, 
  actionButton 
}: RetroPageHeaderProps) {
  return (
    <div className="text-center mb-16">
      <div style={{
        display: 'inline-block',
        animation: 'bounce 2s infinite'
      }}>
        <div style={{
          backgroundColor: '#FF3EA5',
          width: '80px',
          height: '80px',
          margin: '0 auto 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '3px solid #111111',
          boxShadow: '4px 4px 0px #111111',
          transform: 'rotate(-5deg)',
        }}>
          <div style={{
            fontSize: '40px'
          }}>{icon}</div>
        </div>
      </div>
      <h1 style={{
        fontFamily: 'Poppins, sans-serif',
        fontSize: '48px',
        fontWeight: 800,
        textTransform: 'uppercase',
        color: '#FFC700',
        marginBottom: '16px',
        textShadow: '3px 3px 0px #111111'
      }}>
        {title}
      </h1>
      <p style={{
        fontSize: '18px',
        color: '#FFFFFF',
        maxWidth: '600px',
        margin: '0 auto 32px'
      }}>
        {description}
      </p>
      {actionButton}
    </div>
  );
}

// CSS Animation Keyframes
export const RetroAnimations = () => (
  <style jsx global>{`
    @keyframes bounce {
      0%, 20%, 53%, 80%, 100% {
        transform: translate3d(0,0,0) rotate(-5deg);
      }
      40%, 43% {
        transform: translate3d(0,-20px,0) rotate(-5deg);
      }
      70% {
        transform: translate3d(0,-10px,0) rotate(-5deg);
      }
      90% {
        transform: translate3d(0,-4px,0) rotate(-5deg);
      }
    }
  `}</style>
);
