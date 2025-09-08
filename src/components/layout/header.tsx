"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { RetroButton } from "@/components/ui/retro-button";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { Menu, X, Volume2 } from "lucide-react";

export function Header() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const [knob1Rotation, setKnob1Rotation] = useState(0);
  const [knob2Rotation, setKnob2Rotation] = useState(0);

  // Add stripe pattern styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }
      .led-pulse {
        animation: pulse 2s infinite;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .stripe-pattern {
        background: repeating-linear-gradient(
          45deg,
          #FFC700,
          #FFC700 5px,
          #111111 5px,
          #111111 10px
        );
      }
      .logo-responsive {
        height: 72px;
        max-width: 200px;
        min-width: 180px;
      }
      @media (max-width: 768px) {
        .logo-responsive {
          height: 56px;
          max-width: 150px;
          min-width: 120px;
        }
      }
      @media (max-width: 480px) {
        .logo-responsive {
          height: 48px;
          max-width: 120px;
          min-width: 100px;
        }
      }
      
      /* Perfect Logo Text Responsive Positioning */
      .wmx-logo-text {
        font-size: 32px;
        letter-spacing: 4px;
      }
      
      .wmx-services-text {
        font-size: 9px;
        letter-spacing: 2.5px;
      }
      
      @media (max-width: 768px) {
        .wmx-logo-text {
          font-size: 28px;
          letter-spacing: 3px;
        }
        .wmx-services-text {
          font-size: 8px;
          letter-spacing: 2px;
        }
      }
      
      @media (max-width: 480px) {
        .wmx-logo-text {
          font-size: 24px;
          letter-spacing: 2px;
        }
        .wmx-services-text {
          font-size: 7px;
          letter-spacing: 1.5px;
        }
      }
      
      @media (max-width: 360px) {
        .wmx-logo-text {
          font-size: 20px;
          letter-spacing: 1.5px;
        }
        .wmx-services-text {
          font-size: 6px;
          letter-spacing: 1px;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <header style={{
      backgroundColor: '#3D52F1',
      borderBottom: '6px solid #111111',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      height: '80px',
      padding: '16px',
      width: '100%'
    }}>
      {/* Top Stripe Pattern */}
      <div className="stripe-pattern" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        width: '100%'
      }} />
      
      <div className="flex items-center h-full" style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
          {/* Section 1: Logo Section */}
          <div className="flex items-center gap-2 md:gap-4" style={{ 
            position: 'absolute', 
            left: 0, 
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10 
          }}>
            {/* Speaker Icon */}
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#111111',
              border: '3px solid #FFC700',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                backgroundColor: '#FF3EA5',
                borderRadius: '50%'
              }} />
            </div>
            
            {/* Logo Text */}
            <Link 
              href="/" 
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
                justifyContent: 'center',
                minWidth: '80px',
                height: '48px'
              }}
            >
              <div
                className="wmx-logo-text"
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '32px',
                  fontWeight: '900',
                  color: '#FFFFFF',
                  textShadow: '3px 3px 0 #111111',
                  letterSpacing: '4px',
                  lineHeight: '0.9',
                  background: 'linear-gradient(135deg, #00FFFF 0%, #FFC700 50%, #FF3EA5 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  userSelect: 'none',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.08) translateY(-1px)';
                  e.currentTarget.style.textShadow = '4px 4px 0 #111111, 0 0 20px rgba(255, 199, 0, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1) translateY(0)';
                  e.currentTarget.style.textShadow = '3px 3px 0 #111111';
                }}
              >
                WMX
              </div>
              <div
                className="wmx-services-text"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '9px',
                  fontWeight: '700',
                  color: '#FFC700',
                  letterSpacing: '2.5px',
                  textTransform: 'uppercase',
                  marginTop: '-4px',
                  textShadow: '1px 1px 0 #111111',
                  opacity: '0.9'
                }}
              >
                SERVICES
              </div>
            </Link>
          </div>

          {/* Section 2: Global Search for Admin or Navigation for Public */}
          {session?.user.role === "ADMIN" && pathname.startsWith('/admin') ? (
            /* Global Search for Admin */
            <div className="hidden md:flex items-center justify-center" style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 5,
              width: '400px',
              maxWidth: '40vw'
            }}>
              <GlobalSearch
                className="w-full"
                placeholder="Search projects, files, clients..."
                size="md"
              />
            </div>
          ) : (
            /* Navigation for Public Pages */
            <nav className="hidden md:flex items-center justify-center" style={{ 
              position: 'absolute', 
              left: '50%', 
              top: '50%', 
              transform: 'translate(-50%, -50%)', 
              zIndex: 5 
            }}>
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '3px solid #111111',
              borderRadius: '20px',
              padding: '8px',
              display: 'flex',
              gap: '8px',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <Link
                href="/"
                style={{
                  backgroundColor: pathname === '/' ? '#FF3EA5' : '#FFC700',
                  border: '2px solid #111111',
                  borderRadius: '15px',
                  padding: '8px 16px',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: pathname === '/' ? '#FFFFFF' : '#111111',
                  textDecoration: 'none',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s ease',
                  transform: pathname === '/' ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: pathname === '/' ? 'inset 2px 2px 4px rgba(0,0,0,0.3)' : 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (pathname !== '/') {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.filter = 'brightness(110%)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (pathname !== '/') {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.filter = 'brightness(100%)';
                  }
                }}
              >
                Home
              </Link>
              <Link
                href="/portfolio"
                style={{
                  backgroundColor: pathname === '/portfolio' ? '#FF3EA5' : '#FFC700',
                  border: '2px solid #111111',
                  borderRadius: '15px',
                  padding: '8px 16px',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: pathname === '/portfolio' ? '#FFFFFF' : '#111111',
                  textDecoration: 'none',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s ease',
                  transform: pathname === '/portfolio' ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: pathname === '/portfolio' ? 'inset 2px 2px 4px rgba(0,0,0,0.3)' : 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (pathname !== '/portfolio') {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.filter = 'brightness(110%)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (pathname !== '/portfolio') {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.filter = 'brightness(100%)';
                  }
                }}
              >
                Portfolio
              </Link>
              <Link
                href="/services"
                style={{
                  backgroundColor: pathname === '/services' ? '#FF3EA5' : '#FFC700',
                  border: '2px solid #111111',
                  borderRadius: '15px',
                  padding: '8px 16px',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: pathname === '/services' ? '#FFFFFF' : '#111111',
                  textDecoration: 'none',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s ease',
                  transform: pathname === '/services' ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: pathname === '/services' ? 'inset 2px 2px 4px rgba(0,0,0,0.3)' : 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (pathname !== '/services') {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.filter = 'brightness(110%)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (pathname !== '/services') {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.filter = 'brightness(100%)';
                  }
                }}
              >
                Services
              </Link>
              <Link
                href="/contact"
                style={{
                  backgroundColor: pathname === '/contact' ? '#FF3EA5' : '#FFC700',
                  border: '2px solid #111111',
                  borderRadius: '15px',
                  padding: '8px 16px',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: pathname === '/contact' ? '#FFFFFF' : '#111111',
                  textDecoration: 'none',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s ease',
                  transform: pathname === '/contact' ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: pathname === '/contact' ? 'inset 2px 2px 4px rgba(0,0,0,0.3)' : 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (pathname !== '/contact') {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.filter = 'brightness(110%)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (pathname !== '/contact') {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.filter = 'brightness(100%)';
                  }
                }}
              >
                Contact
              </Link>
            </div>
          </nav>
          )}

          {/* Section 3: Controls (Kanan) */}
          <div className="hidden md:flex items-center justify-end gap-3" style={{ 
            position: 'absolute', 
            right: 0, 
            top: '50%', 
            transform: 'translateY(-50%)', 
            zIndex: 10 
          }}>
            {/* Knob 1 */}
            <div
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#FFFFFF',
                border: '3px solid #111111',
                borderRadius: '50%',
                position: 'relative',
                cursor: 'pointer',
                transition: 'transform 0.3s ease',
                transform: `rotate(${knob1Rotation}deg)`
              }}
              onMouseEnter={(e) => {
                setKnob1Rotation(30);
              }}
              onMouseLeave={() => {
                setKnob1Rotation(0);
              }}
              onMouseDown={() => {
                setKnob1Rotation(45);
              }}
              onMouseUp={() => {
                setKnob1Rotation(30);
              }}
              aria-label="Volume control"
            >
              {/* Knob Indicator */}
              <div style={{
                position: 'absolute',
                top: '4px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '2px',
                height: '8px',
                backgroundColor: '#111111'
              }} />
            </div>

            {/* Knob 2 */}
            <div
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#FFFFFF',
                border: '3px solid #111111',
                borderRadius: '50%',
                position: 'relative',
                cursor: 'pointer',
                transition: 'transform 0.3s ease',
                transform: `rotate(${knob2Rotation}deg)`
              }}
              onMouseEnter={() => {
                setKnob2Rotation(30);
              }}
              onMouseLeave={() => {
                setKnob2Rotation(0);
              }}
              onMouseDown={() => {
                setKnob2Rotation(45);
              }}
              onMouseUp={() => {
                setKnob2Rotation(30);
              }}
              aria-label="Bass control"
            >
              {/* Knob Indicator */}
              <div style={{
                position: 'absolute',
                top: '4px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '2px',
                height: '8px',
                backgroundColor: '#111111'
              }} />
            </div>

            {/* LED Indicator */}
            <div
              className="led-pulse"
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#FF3EA5',
                border: '2px solid #111111',
                borderRadius: '50%',
                marginLeft: '8px'
              }}
              aria-label="System active indicator"
            />

            {/* Notification Bell */}
            {session && <NotificationBell />}
            
            {/* User Actions */}
            {session ? (
              <div className="flex items-center gap-2 ml-4">
                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin/dashboard"
                    style={{
                      backgroundColor: pathname === '/admin/dashboard' ? '#FF3EA5' : '#FFC700',
                      border: '2px solid #111111',
                      borderRadius: '4px',
                      padding: '6px 12px',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: pathname === '/admin/dashboard' ? '#FFFFFF' : '#111111',
                      textDecoration: 'none',
                      textTransform: 'uppercase'
                    }}
                  >
                    Admin
                  </Link>
                )}
                {session.user.role === "CLIENT" && (
                  <Link
                    href="/client/dashboard"
                    style={{
                      backgroundColor: pathname === '/client/dashboard' ? '#FF3EA5' : '#FFC700',
                      border: '2px solid #111111',
                      borderRadius: '4px',
                      padding: '6px 12px',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: pathname === '/client/dashboard' ? '#FFFFFF' : '#111111',
                      textDecoration: 'none',
                      textTransform: 'uppercase'
                    }}
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '2px solid #111111',
                    borderRadius: '4px',
                    padding: '6px 12px',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#111111',
                    textTransform: 'uppercase',
                    cursor: 'pointer'
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn()}
                style={{
                  backgroundColor: '#FFC700',
                  border: '2px solid #111111',
                  borderRadius: '4px',
                  padding: '6px 16px',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#111111',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  marginLeft: '12px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FF3EA5';
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFC700';
                  e.currentTarget.style.color = '#111111';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              padding: '8px',
              backgroundColor: '#FFC700',
              border: '2px solid #111111',
              boxShadow: '2px 2px 0px #111111',
              cursor: 'pointer',
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)'
            }}
            className="block md:hidden"
          >
            {isMenuOpen ? (
              <X size={24} strokeWidth={2} color="#111111" />
            ) : (
              <Menu size={24} strokeWidth={2} color="#111111" />
            )}
          </button>
        </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div 
          className="md:hidden py-4"
          style={{
            borderTop: '2px solid #111111',
            backgroundColor: '#FFFFFF',
            marginTop: '16px'
          }}
        >
          <nav className="flex flex-col space-y-4 px-4">
              <Link
                href="/"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '16px',
                  fontWeight: 500,
                  color: pathname === '/' ? '#FF3EA5' : '#111111',
                  textDecoration: pathname === '/' ? 'underline' : 'none',
                  textDecorationColor: '#FFC700',
                  textDecorationThickness: '3px'
                }}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/portfolio"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '16px',
                  fontWeight: 500,
                  color: pathname === '/portfolio' ? '#FF3EA5' : '#111111',
                  textDecoration: pathname === '/portfolio' ? 'underline' : 'none',
                  textDecorationColor: '#FFC700',
                  textDecorationThickness: '3px'
                }}
                onClick={() => setIsMenuOpen(false)}
              >
                Portfolio
              </Link>
              <Link
                href="/services"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '16px',
                  fontWeight: 500,
                  color: pathname === '/services' ? '#FF3EA5' : '#111111',
                  textDecoration: pathname === '/services' ? 'underline' : 'none',
                  textDecorationColor: '#FFC700',
                  textDecorationThickness: '3px'
                }}
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
              <Link
                href="/contact"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '16px',
                  fontWeight: 500,
                  color: pathname === '/contact' ? '#FF3EA5' : '#111111',
                  textDecoration: pathname === '/contact' ? 'underline' : 'none',
                  textDecorationColor: '#FFC700',
                  textDecorationThickness: '3px'
                }}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              {session ? (
                <div className="flex flex-col space-y-2">
                  {/* Mobile Global Search for Admin */}
                  {session.user.role === "ADMIN" && pathname.startsWith('/admin') && (
                    <div style={{ marginBottom: '16px' }}>
                      <GlobalSearch
                        className="w-full"
                        placeholder="Search everything..."
                        size="sm"
                      />
                    </div>
                  )}
                  {/* Mobile Notification Bell */}
                  <div className="flex items-center">
                    <NotificationBell />
                    <span className="ml-2 text-sm font-medium text-gray-700">Notifications</span>
                  </div>
                  {session.user.role === "ADMIN" && (
                    <Link
                      href="/admin/dashboard"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '16px',
                        fontWeight: 500,
                        color: pathname === '/admin/dashboard' ? '#FF3EA5' : '#111111',
                        textDecoration: pathname === '/admin/dashboard' ? 'underline' : 'none',
                        textDecorationColor: '#FFC700',
                        textDecorationThickness: '3px'
                      }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  {session.user.role === "CLIENT" && (
                    <Link
                      href="/client/dashboard"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '16px',
                        fontWeight: 500,
                        color: pathname === '/client/dashboard' ? '#FF3EA5' : '#111111',
                        textDecoration: pathname === '/client/dashboard' ? 'underline' : 'none',
                        textDecorationColor: '#FFC700',
                        textDecorationThickness: '3px'
                      }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  <RetroButton
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    variant="secondary"
                    size="sm"
                  >
                    Sign Out
                  </RetroButton>
                </div>
              ) : (
                <RetroButton
                  onClick={() => {
                    signIn();
                    setIsMenuOpen(false);
                  }}
                  variant="primary"
                  size="md"
                  style={{
                    backgroundColor: '#FFC700',
                    color: '#111111',
                    border: '2px solid #111111',
                    boxShadow: '4px 4px 0px #111111',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    width: '100%'
                  }}
                >
                  Login
                </RetroButton>
              )}
          </nav>
        </div>
      )}
    </header>
  );
}
