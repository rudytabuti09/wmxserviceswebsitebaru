"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Github } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer style={{
      backgroundColor: '#111111',
      borderTop: '6px solid #FFC700',
      marginTop: '80px',
      position: 'relative'
    }}>
      {/* Decorative stripe pattern at top */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '6px',
        background: 'repeating-linear-gradient(90deg, #FFC700 0px, #FFC700 10px, #FF3EA5 10px, #FF3EA5 20px)'
      }} />
      
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '28px',
              fontWeight: 800,
              color: '#FFC700',
              textTransform: 'uppercase',
              marginBottom: '16px',
              textShadow: '2px 2px 0px #FF3EA5'
            }}>
              WMX Services
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#FFFFFF',
              lineHeight: 1.8,
              marginBottom: '24px',
              opacity: 0.9
            }}>
              Professional digital agency offering cutting-edge solutions for web
              development, mobile applications, and desktop software.
            </p>
            
            {/* Social Icons */}
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Github].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#FFC700',
                    border: '2px solid #111111',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#FF3EA5';
                    e.currentTarget.style.transform = 'scale(1.1) rotate(-5deg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFC700';
                    e.currentTarget.style.transform = 'scale(1) rotate(0)';
                  }}
                >
                  <Icon size={20} strokeWidth={2} color="#111111" />
                </a>
              ))}
            </div>
          </div>

          {/* Services Links */}
          <div>
            <h4 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '18px',
              fontWeight: 700,
              color: '#FF3EA5',
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}>
              Services
            </h4>
            <ul className="space-y-3">
              {['Web Development', 'Mobile Apps', 'Desktop Apps', 'UI/UX Design'].map((service, index) => (
                <li key={index}>
                  <Link 
                    href="/services"
                    style={{
                      fontSize: '14px',
                      color: '#FFFFFF',
                      textDecoration: 'none',
                      display: 'inline-block',
                      transition: 'all 0.2s',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#FFC700';
                      e.currentTarget.style.transform = 'translateX(5px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#FFFFFF';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    → {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '18px',
              fontWeight: 700,
              color: '#FF3EA5',
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}>
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <div style={{
                  backgroundColor: '#FFC700',
                  padding: '6px',
                  border: '2px solid #111111'
                }}>
                  <Phone size={16} strokeWidth={2} color="#111111" />
                </div>
                <span style={{ fontSize: '14px', color: '#FFFFFF' }}>+62 812 3456 7890</span>
              </li>
              <li className="flex items-center gap-3">
                <div style={{
                  backgroundColor: '#FFC700',
                  padding: '6px',
                  border: '2px solid #111111'
                }}>
                  <Mail size={16} strokeWidth={2} color="#111111" />
                </div>
                <span style={{ fontSize: '14px', color: '#FFFFFF' }}>hello@wmxservices.com</span>
              </li>
              <li className="flex items-start gap-3">
                <div style={{
                  backgroundColor: '#FFC700',
                  padding: '6px',
                  border: '2px solid #111111'
                }}>
                  <MapPin size={16} strokeWidth={2} color="#111111" />
                </div>
                <span style={{ fontSize: '14px', color: '#FFFFFF', lineHeight: 1.6 }}>
                  Jakarta, Indonesia<br />12345
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div style={{
          borderTop: '3px solid #FFC700',
          marginTop: '48px',
          paddingTop: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div className="flex flex-col md:flex-row items-center justify-between w-full">
            <p style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              color: '#FFC700',
              textTransform: 'uppercase'
            }}>
              © {currentYear} WMX Services. All Rights Reserved.
            </p>
            
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link 
                href="/privacy"
                style={{
                  fontSize: '12px',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#FF3EA5'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#FFFFFF'}
              >
                Privacy
              </Link>
              <Link 
                href="/terms"
                style={{
                  fontSize: '12px',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#FF3EA5'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#FFFFFF'}
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
