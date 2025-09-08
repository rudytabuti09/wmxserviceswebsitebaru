"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Home, ArrowLeft, Search, Gamepad2, Zap, Star } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function NotFound() {
  const [glitchActive, setGlitchActive] = useState(false);
  const [floatingShapes, setFloatingShapes] = useState<Array<{id: number, x: number, y: number, color: string, shape: string}>>([]);
  const [gameScore, setGameScore] = useState(0);
  const [showGame, setShowGame] = useState(false);

  // Generate floating shapes
  useEffect(() => {
    const shapes = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: ['#FFC700', '#FF3EA5', '#00FFFF', '#00FF00'][Math.floor(Math.random() * 4)],
      shape: ['square', 'circle', 'triangle', 'diamond'][Math.floor(Math.random() * 4)]
    }));
    setFloatingShapes(shapes);
  }, []);

  // Glitch effect
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleShapeClick = (id: number) => {
    setGameScore(prev => prev + 10);
    setFloatingShapes(prev => prev.filter(shape => shape.id !== id));
    
    // Add new shape
    setTimeout(() => {
      const newShape = {
        id: Date.now(),
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: ['#FFC700', '#FF3EA5', '#00FFFF', '#00FF00'][Math.floor(Math.random() * 4)],
        shape: ['square', 'circle', 'triangle', 'diamond'][Math.floor(Math.random() * 4)]
      };
      setFloatingShapes(prev => [...prev, newShape]);
    }, 500);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Header />
      
      {/* Animated Background Grid */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          linear-gradient(rgba(255, 199, 0, 0.1) 2px, transparent 2px),
          linear-gradient(90deg, rgba(255, 199, 0, 0.1) 2px, transparent 2px)
        `,
        backgroundSize: '50px 50px',
        animation: 'grid-move 20s linear infinite',
        zIndex: -2
      }} />

      {/* Floating Shapes */}
      {floatingShapes.map((shape) => (
        <div
          key={shape.id}
          onClick={() => handleShapeClick(shape.id)}
          style={{
            position: "absolute",
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            width: "30px",
            height: "30px",
            backgroundColor: shape.color,
            border: "2px solid #111111",
            cursor: "pointer",
            animation: `float-shape 6s ease-in-out infinite`,
            animationDelay: `${shape.id * 0.5}s`,
            zIndex: 1,
            ...(shape.shape === 'circle' && { borderRadius: '50%' }),
            ...(shape.shape === 'triangle' && { clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }),
            ...(shape.shape === 'diamond' && { transform: 'rotate(45deg)' }),
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = shape.shape === 'diamond' ? 'rotate(45deg) scale(1.2)' : 'scale(1.2)';
            e.currentTarget.style.boxShadow = '4px 4px 0px #111111';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = shape.shape === 'diamond' ? 'rotate(45deg)' : 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      ))}

      <main className="py-20 relative z-10">
        <div className="container mx-auto px-6 text-center">
          {/* Game Score */}
          {gameScore > 0 && (
            <div style={{
              position: "fixed",
              top: "100px",
              right: "20px",
              backgroundColor: "#FFC700",
              color: "#111111",
              padding: "8px 16px",
              border: "2px solid #111111",
              boxShadow: "4px 4px 0px #111111",
              fontFamily: "Poppins, sans-serif",
              fontSize: "14px",
              fontWeight: 700,
              textTransform: "uppercase",
              zIndex: 100
            }}>
              <Gamepad2 size={16} style={{ marginRight: "8px" }} />
              Score: {gameScore}
            </div>
          )}

          {/* Main 404 Content */}
          <div className="max-w-4xl mx-auto">
            {/* Glitch 404 Number */}
            <div style={{ position: "relative", marginBottom: "32px" }}>
              <h1 style={{
                fontFamily: "Poppins, sans-serif",
                fontSize: "clamp(120px, 20vw, 200px)",
                fontWeight: 900,
                textTransform: "uppercase",
                color: "#FFC700",
                textShadow: "6px 6px 0px #111111",
                lineHeight: 1,
                ...(glitchActive && {
                  animation: "glitch 0.2s ease-in-out",
                  color: "#FF3EA5"
                })
              }}>
                404
              </h1>

              {/* Glitch layers */}
              {glitchActive && (
                <>
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: "2px",
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "clamp(120px, 20vw, 200px)",
                    fontWeight: 900,
                    color: "#00FFFF",
                    textShadow: "6px 6px 0px #111111",
                    zIndex: -1,
                    animation: "glitch-1 0.2s ease-in-out"
                  }}>
                    404
                  </div>
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: "-2px",
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "clamp(120px, 20vw, 200px)",
                    fontWeight: 900,
                    color: "#FF3EA5",
                    textShadow: "6px 6px 0px #111111",
                    zIndex: -1,
                    animation: "glitch-2 0.2s ease-in-out"
                  }}>
                    404
                  </div>
                </>
              )}
            </div>

            {/* Error Message */}
            <div style={{
              backgroundColor: "#FFFFFF",
              border: "4px solid #111111",
              boxShadow: "8px 8px 0px #111111",
              padding: "40px",
              marginBottom: "40px",
              position: "relative",
              overflow: "hidden"
            }}>
              {/* Decorative corner */}
              <div style={{
                position: "absolute",
                top: "-2px",
                right: "-2px",
                width: "60px",
                height: "60px",
                backgroundColor: "#FF3EA5",
                clipPath: "polygon(0 0, 100% 0, 100% 100%)"
              }} />

              <h2 style={{
                fontFamily: "Poppins, sans-serif",
                fontSize: "32px",
                fontWeight: 800,
                textTransform: "uppercase",
                color: "#111111",
                marginBottom: "16px",
                textShadow: "2px 2px 0px #FFC700"
              }}>
                Page Not Found
              </h2>

              <p style={{
                fontSize: "18px",
                color: "#111111",
                marginBottom: "24px",
                lineHeight: 1.6
              }}>
                Looks like this page went on a retro adventure and got lost in the digital void! 
                Don't worry, our pixel-perfect navigation will get you back on track.
              </p>

              {/* Fun Message */}
              <div style={{
                backgroundColor: "#FFF8DC",
                border: "2px dashed #FF3EA5",
                padding: "16px",
                marginBottom: "32px"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  marginBottom: "8px"
                }}>
                  <Star size={20} color="#FFC700" />
                  <span style={{
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#111111",
                    textTransform: "uppercase"
                  }}>
                    Pro Tip
                  </span>
                  <Star size={20} color="#FFC700" />
                </div>
                <p style={{
                  fontSize: "14px",
                  color: "#111111",
                  textAlign: "center"
                }}>
                  Click the floating shapes around the screen to earn retro points! 
                  Current Score: <strong>{gameScore}</strong>
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: "flex",
                gap: "16px",
                justifyContent: "center",
                flexWrap: "wrap"
              }}>
                <Link href="/">
                  <button style={{
                    backgroundColor: "#FFC700",
                    color: "#111111",
                    border: "3px solid #111111",
                    padding: "16px 24px",
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "16px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    boxShadow: "4px 4px 0px #111111",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translate(-3px, -3px) rotate(-2deg)";
                    e.currentTarget.style.boxShadow = "7px 7px 0px #111111";
                    e.currentTarget.style.backgroundColor = "#FFD700";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translate(0, 0) rotate(0deg)";
                    e.currentTarget.style.boxShadow = "4px 4px 0px #111111";
                    e.currentTarget.style.backgroundColor = "#FFC700";
                  }}>
                    <Home size={20} />
                    Take Me Home
                  </button>
                </Link>

                <button
                  onClick={() => window.history.back()}
                  style={{
                    backgroundColor: "#FF3EA5",
                    color: "#FFFFFF",
                    border: "3px solid #111111",
                    padding: "16px 24px",
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "16px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    boxShadow: "4px 4px 0px #111111",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translate(-3px, -3px) rotate(2deg)";
                    e.currentTarget.style.boxShadow = "7px 7px 0px #111111";
                    e.currentTarget.style.backgroundColor = "#FF69B4";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translate(0, 0) rotate(0deg)";
                    e.currentTarget.style.boxShadow = "4px 4px 0px #111111";
                    e.currentTarget.style.backgroundColor = "#FF3EA5";
                  }}
                >
                  <ArrowLeft size={20} />
                  Go Back
                </button>

                <Link href="/portfolio">
                  <button style={{
                    backgroundColor: "#00FFFF",
                    color: "#111111",
                    border: "3px solid #111111",
                    padding: "16px 24px",
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "16px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    boxShadow: "4px 4px 0px #111111",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translate(-3px, -3px) rotate(-2deg)";
                    e.currentTarget.style.boxShadow = "7px 7px 0px #111111";
                    e.currentTarget.style.backgroundColor = "#40E0D0";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translate(0, 0) rotate(0deg)";
                    e.currentTarget.style.boxShadow = "4px 4px 0px #111111";
                    e.currentTarget.style.backgroundColor = "#00FFFF";
                  }}>
                    <Search size={20} />
                    Browse Portfolio
                  </button>
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
              maxWidth: "800px",
              margin: "0 auto"
            }}>
              {[
                { href: "/services", label: "Our Services", color: "#FFC700" },
                { href: "/portfolio", label: "Portfolio", color: "#FF3EA5" },
                { href: "/contact", label: "Contact Us", color: "#00FFFF" },
                { href: "/about", label: "About", color: "#00FF00" }
              ].map((link, index) => (
                <Link key={index} href={link.href}>
                  <div style={{
                    backgroundColor: "#FFFFFF",
                    border: "2px solid #111111",
                    boxShadow: "3px 3px 0px #111111",
                    padding: "16px",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    position: "relative",
                    overflow: "hidden"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = link.color;
                    e.currentTarget.style.transform = "translate(-2px, -2px)";
                    e.currentTarget.style.boxShadow = "5px 5px 0px #111111";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#FFFFFF";
                    e.currentTarget.style.transform = "translate(0, 0)";
                    e.currentTarget.style.boxShadow = "3px 3px 0px #111111";
                  }}>
                    <div style={{
                      fontFamily: "Poppins, sans-serif",
                      fontSize: "14px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      color: "#111111"
                    }}>
                      {link.label}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        
        @keyframes float-shape {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes glitch {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
        }
        
        @keyframes glitch-1 {
          0%, 100% { transform: translate(0); }
          25% { transform: translate(2px, 0); }
          50% { transform: translate(-2px, 0); }
          75% { transform: translate(0, 2px); }
        }
        
        @keyframes glitch-2 {
          0%, 100% { transform: translate(0); }
          25% { transform: translate(-2px, 0); }
          50% { transform: translate(2px, 0); }
          75% { transform: translate(0, -2px); }
        }
      `}</style>
    </div>
  );
}
