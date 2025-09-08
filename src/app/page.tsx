"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { trpc } from "@/lib/trpc";
import { RetroButton } from "@/components/ui/retro-button";
import { RetroCard } from "@/components/ui/retro-card";
import { RetroSkeletonCard, RetroSkeletonGrid } from "@/components/ui/retro-skeleton";
import { Globe, Smartphone, Monitor, ArrowRight, Star, Users, Zap, Rocket, TrendingUp, Award, Clock, CheckCircle, Sparkles, Code2, Palette } from "lucide-react";
import { useState, useEffect } from "react";

export default function Home() {
  const { data: featuredProjects } = trpc.portfolio.getFeatured.useQuery();
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  
  const rotatingTexts = [
    "That Drive Growth",
    "Built for Success",
    "Powered by Innovation",
    "Made with Passion"
  ];
  
  // Portfolio thumbnails for preview
  const portfolioThumbnails = [
    {
      id: 1,
      title: "E-Commerce Platform",
      tech: "Next.js",
      image: "https://images.unsplash.com/photo-1661956602116-aa6865609028?w=300&h=200&fit=crop&crop=center"
    },
    {
      id: 2,
      title: "Mobile Banking App",
      tech: "React Native",
      image: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=300&h=200&fit=crop&crop=center"
    },
    {
      id: 3,
      title: "SaaS Dashboard",
      tech: "Vue.js",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop&crop=center"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentTextIndex((prev) => (prev + 1) % rotatingTexts.length);
        setIsVisible(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Parallax and mouse movement effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const moveX = (clientX - centerX) * 0.01;
      const moveY = (clientY - centerY) * 0.01;
      setMousePosition({ x: moveX, y: moveY });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const services = [
    {
      title: "Web Development",
      description: "Custom websites and web applications built with modern technologies",
      icon: Globe,
    },
    {
      title: "Mobile Apps",
      description: "Native and cross-platform mobile applications for iOS and Android",
      icon: Smartphone,
    },
    {
      title: "Desktop Applications",
      description: "Powerful desktop software solutions for Windows, macOS, and Linux",
      icon: Monitor,
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="py-12 lg:py-20 relative overflow-hidden">
        {/* Background effects removed for consistency */}
        
        {/* Enhanced Animated Background Elements with Parallax */}
        <div 
          className="parallax-element"
          style={{
            position: 'absolute',
            top: '10%',
            left: '5%',
            width: '80px',
            height: '80px',
            backgroundColor: '#FFC700',
            border: '3px solid #111111',
            transform: 'rotate(45deg)',
            animation: 'float 6s ease-in-out infinite, glow-pulse 4s ease-in-out infinite',
            opacity: 0.4,
            boxShadow: '0 0 20px rgba(255, 199, 0, 0.3)',
            transition: 'transform 0.1s ease-out'
          }} 
        />
        <div 
          className="parallax-element"
          style={{
            position: 'absolute',
            bottom: '15%',
            right: '8%',
            width: '60px',
            height: '60px',
            backgroundColor: '#FF3EA5',
            border: '3px solid #111111',
            borderRadius: '50%',
            animation: 'float 8s ease-in-out infinite reverse, glow-pulse 6s ease-in-out infinite',
            opacity: 0.4,
            boxShadow: '0 0 20px rgba(255, 62, 165, 0.3)',
            transition: 'transform 0.1s ease-out'
          }} 
        />
        <div 
          className="parallax-element"
          style={{
            position: 'absolute',
            top: '50%',
            right: '15%',
            width: '40px',
            height: '40px',
            backgroundColor: '#00FFFF',
            border: '3px solid #111111',
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            animation: 'spin 10s linear infinite, glow-pulse 5s ease-in-out infinite',
            opacity: 0.4,
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
            transition: 'transform 0.1s ease-out'
          }} 
        />
        
        {/* Removed Grid Background for Consistency */}
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Animated Badge */}
            <div className="flex justify-center mb-8">
              <div style={{
                backgroundColor: '#111111',
                color: '#FFC700',
                padding: '8px 20px',
                border: '2px solid #FFC700',
                boxShadow: '3px 3px 0px #FFC700',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '2px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                animation: 'pulse-badge 2s ease-in-out infinite'
              }}>
                <Sparkles size={16} />
                Welcome to the Future of Web
                <Sparkles size={16} />
              </div>
            </div>
            
            {/* Main Heading with Glitch Effect */}
            <div style={{ position: 'relative', marginBottom: '24px' }}>
              <h1 style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: 'clamp(48px, 8vw, 80px)',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: '#FFC700',
                lineHeight: '1.1',
                textShadow: '4px 4px 0px #111111',
                position: 'relative'
              }}>
                <span style={{ display: 'inline-block', animation: 'text-glow 3s ease-in-out infinite' }}>
                  Digital
                </span>
                {' '}
                <span style={{ 
                  display: 'inline-block',
                  color: '#00FFFF',
                  textShadow: '4px 4px 0px #111111, 0 0 20px rgba(0, 255, 255, 0.5)',
                  animation: 'text-glow 3s ease-in-out infinite reverse'
                }}>
                  Solutions
                </span>
              </h1>
              
              {/* Rotating Text */}
              <div style={{
                fontSize: 'clamp(36px, 6vw, 56px)',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: '#FF3EA5',
                fontFamily: 'Poppins, sans-serif',
                marginTop: '16px',
                height: '70px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textShadow: '3px 3px 0px #111111',
                transition: 'opacity 0.3s ease',
                opacity: isVisible ? 1 : 0
              }}>
                {rotatingTexts[currentTextIndex]}
              </div>
            </div>
            
            {/* Description with Icon */}
            <div className="flex justify-center mb-12">
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '2px solid #FFC700',
                padding: '20px 32px',
                maxWidth: '800px'
              }}>
                <p style={{
                  fontSize: '18px',
                  color: '#FFFFFF',
                  lineHeight: '1.8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
                  justifyContent: 'center'
                }}>
                  <Code2 size={24} color="#FFC700" />
                  We craft exceptional digital experiences through innovative
                  <span style={{ color: '#FFC700', fontWeight: 700 }}>web development</span>,
                  <span style={{ color: '#FF3EA5', fontWeight: 700 }}>mobile apps</span>,
                  and <span style={{ color: '#00FFFF', fontWeight: 700 }}>desktop solutions</span>
                  <Palette size={24} color="#FF3EA5" />
                </p>
              </div>
            </div>
            
            {/* CTA Buttons with Icons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/portfolio">
                <button style={{
                  backgroundColor: '#FFC700',
                  color: '#111111',
                  border: '3px solid #111111',
                  padding: '18px 36px',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '18px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  boxShadow: '5px 5px 0px #111111',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translate(-3px, -3px) scale(1.05)';
                  e.currentTarget.style.boxShadow = '8px 8px 0px #111111';
                  e.currentTarget.style.backgroundColor = '#FFD700';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translate(0, 0) scale(1)';
                  e.currentTarget.style.boxShadow = '5px 5px 0px #111111';
                  e.currentTarget.style.backgroundColor = '#FFC700';
                }}>
                  <Rocket size={20} />
                  View Our Work
                  <ArrowRight size={20} style={{ animation: 'arrow-bounce 1s ease-in-out infinite' }} />
                </button>
              </Link>
              <Link href="/contact">
                <button style={{
                  backgroundColor: '#FFFFFF',
                  color: '#111111',
                  border: '3px solid #111111',
                  padding: '18px 36px',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '18px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  boxShadow: '5px 5px 0px #111111',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translate(-3px, -3px) scale(1.05)';
                  e.currentTarget.style.boxShadow = '8px 8px 0px #111111';
                  e.currentTarget.style.backgroundColor = '#FF3EA5';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translate(0, 0) scale(1)';
                  e.currentTarget.style.boxShadow = '5px 5px 0px #111111';
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.color = '#111111';
                }}>
                  <Zap size={20} />
                  Get Started
                </button>
              </Link>
            </div>
            
            {/* Technology Icons Showcase */}
            <div className="mt-20 mb-12">
              <div style={{
                textAlign: 'center',
                marginBottom: '32px'
              }}>
                <div style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  marginBottom: '16px',
                  opacity: 0.7
                }}>
                  Powered by Modern Technologies
                </div>
                
                {/* Technology Icons */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '32px',
                  flexWrap: 'wrap',
                  maxWidth: '600px',
                  margin: '0 auto',
                  alignItems: 'center'
                }}>
                  {[
                    { name: 'React', icon: '⚛️' },
                    { name: 'Next.js', icon: '▲' },
                    { name: 'TypeScript', icon: 'TS' },
                    { name: 'Node.js', icon: '🟢' },
                    { name: 'AWS', icon: '☁️' }
                  ].map((tech, index) => (
                    <div 
                      key={tech.name}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: 0.8,
                        transition: 'all 0.3s ease',
                        animation: `tech-float 4s ease-in-out infinite ${index * 0.2}s`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '1';
                        e.currentTarget.style.transform = 'scale(1.1) translateY(-5px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '0.8';
                        e.currentTarget.style.transform = 'scale(1) translateY(0)';
                      }}
                    >
                      <div style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        border: '2px solid rgba(255, 199, 0, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        fontWeight: 700,
                        color: '#FFC700',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '4px'
                      }}>
                        {tech.icon}
                      </div>
                      <span style={{
                        fontSize: '12px',
                        color: '#FFFFFF',
                        fontWeight: 500,
                        textAlign: 'center'
                      }}>
                        {tech.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Animated Stats Bar */}
            <div className="mt-16 flex justify-center">
              <div style={{
                display: 'flex',
                gap: '32px',
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                {[
                  { number: '100+', label: 'Projects' },
                  { number: '50+', label: 'Clients' },
                  { number: '5+', label: 'Years' }
                ].map((stat, index) => (
                  <div key={index} style={{
                    textAlign: 'center',
                    animation: `fade-in-up 0.6s ease-out ${index * 0.2}s both`
                  }}>
                    <div style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '32px',
                      fontWeight: 800,
                      color: '#FFC700',
                      textShadow: '2px 2px 0px #111111',
                      marginBottom: '4px'
                    }}>
                      {stat.number}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#FFFFFF',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontWeight: 600
                    }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* CSS Animations */}
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(45deg); }
            50% { transform: translateY(-20px) rotate(45deg); }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes grid-move {
            0% { transform: translate(0, 0); }
            100% { transform: translate(50px, 50px); }
          }
          @keyframes pulse-badge {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @keyframes text-glow {
            0%, 100% { filter: brightness(1); }
            50% { filter: brightness(1.2); }
          }
          @keyframes arrow-bounce {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(5px); }
          }
          @keyframes fade-in-up {
            from { 
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          /* New Animations for Enhanced Hero Section */
          @keyframes pulse-background {
            0%, 100% { 
              transform: scale(1);
              opacity: 0.05;
            }
            50% { 
              transform: scale(1.1);
              opacity: 0.08;
            }
          }
          
          @keyframes code-rain {
            0% { 
              transform: translateY(-100vh) rotate(0deg);
              opacity: 0;
            }
            10% {
              opacity: 0.03;
            }
            90% {
              opacity: 0.03;
            }
            100% { 
              transform: translateY(100vh) rotate(360deg);
              opacity: 0;
            }
          }
          
          @keyframes glow-pulse {
            0%, 100% { 
              box-shadow: 0 0 20px rgba(255, 199, 0, 0.3);
              filter: brightness(1);
            }
            50% { 
              box-shadow: 0 0 30px rgba(255, 199, 0, 0.6), 0 0 50px rgba(255, 199, 0, 0.3);
              filter: brightness(1.2);
            }
          }
          
          @keyframes grid-pulse {
            0%, 100% { 
              opacity: 0.08;
            }
            50% { 
              opacity: 0.12;
            }
          }
          
          @keyframes thumbnail-float {
            0%, 100% { 
              transform: translateY(0px) rotate(-2deg);
            }
            50% { 
              transform: translateY(-10px) rotate(-2deg);
            }
          }
          
          /* Parallax Effects */
          .parallax-element {
            transform-style: preserve-3d;
            will-change: transform;
          }
          
          .parallax-grid {
            transform-style: preserve-3d;
            will-change: transform;
          }
          
          /* Enhanced Hover Effects */
          .portfolio-thumbnail:hover .shine-effect {
            left: 100%;
          }
          
          /* Text Enhancement Effects */
          @keyframes text-entrance {
            0% {
              opacity: 0;
              transform: translateY(30px) rotateX(90deg);
              filter: blur(10px);
            }
            50% {
              opacity: 0.8;
              transform: translateY(10px) rotateX(45deg);
              filter: blur(2px);
            }
            100% {
              opacity: 1;
              transform: translateY(0) rotateX(0deg);
              filter: blur(0);
            }
          }
          
          @keyframes digital-glitch {
            0%, 90%, 100% {
              transform: translate3d(0, 0, 0);
              filter: hue-rotate(0deg);
            }
            10% {
              transform: translate3d(-1px, -1px, 0);
              filter: hue-rotate(90deg);
            }
            20% {
              transform: translate3d(1px, 1px, 0);
              filter: hue-rotate(180deg);
            }
            30% {
              transform: translate3d(-1px, 1px, 0);
              filter: hue-rotate(270deg);
            }
            40% {
              transform: translate3d(1px, -1px, 0);
              filter: hue-rotate(360deg);
            }
          }
          
          /* Technology Icons Animation */
          @keyframes tech-float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-8px);
            }
          }
          
          /* Responsive Animations */
          @media (max-width: 768px) {
            @keyframes thumbnail-float {
              0%, 100% { 
                transform: translateY(0px) rotate(0deg);
              }
              50% { 
                transform: translateY(-5px) rotate(0deg);
              }
            }
          }
        `}</style>
      </section>

      {/* Services Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '48px',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#FFC700',
              marginBottom: '16px',
              textShadow: '2px 2px 0px #111111'
            }}>
              Our Services
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#FFFFFF',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              We specialize in creating digital solutions that help your business thrive
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <RetroCard key={index} padding="lg" className="text-center h-full">
                  <div className="flex justify-center mb-6">
                    <div style={{
                      backgroundColor: '#FF3EA5',
                      padding: '16px',
                      border: '2px solid #111111',
                      boxShadow: '3px 3px 0px #111111'
                    }}>
                      <Icon size={48} strokeWidth={2} color="#111111" />
                    </div>
                  </div>
                  <h3 style={{ 
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '24px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    marginBottom: '16px',
                    color: '#111111'
                  }}>
                    {service.title}
                  </h3>
                  <p style={{
                    fontSize: '16px',
                    lineHeight: 1.6,
                    color: '#111111'
                  }}>
                    {service.description}
                  </p>
                </RetroCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Portfolio Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '48px',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#FFC700',
              marginBottom: '16px',
              textShadow: '2px 2px 0px #111111'
            }}>
              Featured Work
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#FFFFFF',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Showcasing some of our best projects and client success stories
            </p>
          </div>
          
          {featuredProjects && featuredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12">
              {featuredProjects.map((project) => (
                <RetroCard key={project.id} padding="none" className="overflow-hidden">
                  <div className="relative" style={{ borderBottom: '2px solid #111111' }}>
                    <img 
                      src={project.imageUrl} 
                      alt={project.title}
                      className="w-full h-48 object-cover"
                    />
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      backgroundColor: '#FFC700',
                      color: '#111111',
                      padding: '4px 12px',
                      border: '2px solid #111111',
                      boxShadow: '2px 2px 0px #111111',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}>
                      Featured
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '20px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      marginBottom: '12px',
                      color: '#111111'
                    }}>
                      {project.title}
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      lineHeight: 1.6,
                      color: '#111111',
                      marginBottom: '16px'
                    }}>
                      {project.description}
                    </p>
                    {project.liveUrl && (
                      <Link href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                        <RetroButton variant="primary" size="sm">
                          Visit Site
                        </RetroButton>
                      </Link>
                    )}
                  </div>
                </RetroCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="flex justify-center mb-6">
                <div style={{
                  backgroundColor: '#FF3EA5',
                  padding: '20px',
                  border: '2px solid #111111',
                  boxShadow: '4px 4px 0px #111111',
                  display: 'inline-block'
                }}>
                  <Rocket size={64} strokeWidth={2} color="#111111" />
                </div>
              </div>
              <p style={{
                fontSize: '18px',
                color: '#FFFFFF',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
                textTransform: 'uppercase'
              }}>
                Our portfolio is being updated. Check back soon!
              </p>
            </div>
          )}
          
          <div className="text-center mt-16">
            <Link href="/portfolio">
              <RetroButton 
                variant="secondary" 
                size="lg"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#111111',
                  border: '2px solid #111111',
                  boxShadow: '4px 4px 0px #111111',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}
              >
                View All Projects →
              </RetroButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20" style={{ backgroundColor: '#FFC700' }}>
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '100+', label: 'Projects Completed', icon: CheckCircle },
              { number: '50+', label: 'Happy Clients', icon: Users },
              { number: '5+', label: 'Years Experience', icon: Clock },
              { number: '24/7', label: 'Support Available', icon: Zap }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    padding: '12px',
                    border: '3px solid #111111',
                    boxShadow: '3px 3px 0px #111111'
                  }}>
                    <stat.icon size={32} strokeWidth={2} color="#111111" />
                  </div>
                </div>
                <h3 style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '36px',
                  fontWeight: 800,
                  color: '#111111',
                  marginBottom: '8px'
                }}>
                  {stat.number}
                </h3>
                <p style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#111111',
                  textTransform: 'uppercase'
                }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '48px',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#FFC700',
              marginBottom: '16px',
              textShadow: '2px 2px 0px #111111'
            }}>
              Why Choose Us
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#FFFFFF',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              We deliver excellence through innovation and dedication
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Expert Team',
                description: 'Our skilled developers bring years of experience to every project',
                icon: Award
              },
              {
                title: 'Fast Delivery',
                description: 'We deliver projects on time without compromising quality',
                icon: Clock
              },
              {
                title: 'Modern Tech',
                description: 'Using the latest technologies and best practices',
                icon: Zap
              },
              {
                title: 'Growth Focus',
                description: 'We build solutions that scale with your business',
                icon: TrendingUp
              },
              {
                title: '24/7 Support',
                description: 'Round-the-clock support to keep your systems running',
                icon: Users
              },
              {
                title: 'Quality First',
                description: 'Rigorous testing ensures bug-free, reliable solutions',
                icon: CheckCircle
              }
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-6">
                  <div style={{
                    backgroundColor: '#FF3EA5',
                    padding: '16px',
                    border: '2px solid #111111',
                    boxShadow: '3px 3px 0px #111111',
                    transform: 'rotate(-3deg)',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'rotate(3deg) scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'rotate(-3deg) scale(1)';
                  }}>
                    <feature.icon size={32} strokeWidth={2} color="#FFFFFF" />
                  </div>
                </div>
                <h3 style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#FFC700',
                  marginBottom: '12px',
                  textTransform: 'uppercase'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#FFFFFF',
                  lineHeight: 1.6,
                  opacity: 0.9
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="text-center mb-16">
          <h2 style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '48px',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: '#FFC700',
            marginBottom: '16px',
            textShadow: '2px 2px 0px #111111'
          }}>
            Client Reviews
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#FFFFFF',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            What our clients say about working with us
          </p>
        </div>

        {/* Marquee Container */}
        <div style={{ 
          overflow: 'hidden',
          position: 'relative',
          width: '100%',
          padding: '20px 0'
        }}>
          {/* Gradient Overlays for fade effect - Updated with proper background color */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100px',
            height: '100%',
            background: 'linear-gradient(to right, #3D52F1, rgba(61, 82, 241, 0.6), transparent)',
            zIndex: 10,
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100%',
            background: 'linear-gradient(to left, #3D52F1, rgba(61, 82, 241, 0.6), transparent)',
            zIndex: 10,
            pointerEvents: 'none'
          }} />

          {/* Marquee Track */}
          <div style={{
            display: 'flex',
            animation: 'marquee 30s linear infinite',
            gap: '32px'
          }}>
            {/* First set of testimonials */}
            {[
              {
                name: 'John Doe',
                company: 'Tech Startup',
                review: 'WMX Services delivered an exceptional web application that exceeded our expectations!',
                rating: 5
              },
              {
                name: 'Sarah Johnson',
                company: 'E-commerce Store',
                review: 'Professional team, great communication, and outstanding results. Sales increased by 200%!',
                rating: 5
              },
              {
                name: 'Mike Chen',
                company: 'Digital Agency',
                review: 'The mobile app they built for us is perfect. Fast, reliable, and exactly what we needed.',
                rating: 5
              },
              {
                name: 'Lisa Wang',
                company: 'Fashion Brand',
                review: 'Amazing design sense and technical expertise. Our website looks incredible!',
                rating: 5
              },
              {
                name: 'David Smith',
                company: 'SaaS Platform',
                review: 'They transformed our complex requirements into a user-friendly application.',
                rating: 5
              },
              {
                name: 'Emma Davis',
                company: 'Healthcare Startup',
                review: 'Exceptional work! They delivered a secure and scalable solution on time.',
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={`first-${index}`} style={{ 
                minWidth: '350px',
                flexShrink: 0
              }}>
                <div style={{
                  backgroundColor: '#FFFFFF',
                  border: '3px solid #111111',
                  boxShadow: '5px 5px 0px #111111',
                  padding: '24px',
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Retro corner accent */}
                  <div style={{
                    position: 'absolute',
                    top: '-1px',
                    right: '-1px',
                    width: '50px',
                    height: '50px',
                    backgroundColor: '#FFC700',
                    clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
                    border: '3px solid #111111',
                    borderLeft: 'none',
                    borderBottom: 'none'
                  }} />
                  
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={20} fill="#FFC700" color="#FFC700" />
                    ))}
                  </div>
                  <p style={{
                    fontSize: '14px',
                    color: '#111111',
                    lineHeight: 1.8,
                    marginBottom: '16px',
                    fontStyle: 'italic',
                    minHeight: '72px'
                  }}>
                    "{testimonial.review}"
                  </p>
                  <div style={{ borderTop: '2px dashed #FF3EA5', paddingTop: '16px' }}>
                    <p style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '16px',
                      fontWeight: 700,
                      color: '#111111',
                      textTransform: 'uppercase'
                    }}>
                      {testimonial.name}
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color: '#FF3EA5',
                      fontWeight: 600
                    }}>
                      {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Duplicate set for seamless loop */}
            {[
              {
                name: 'John Doe',
                company: 'Tech Startup',
                review: 'WMX Services delivered an exceptional web application that exceeded our expectations!',
                rating: 5
              },
              {
                name: 'Sarah Johnson',
                company: 'E-commerce Store',
                review: 'Professional team, great communication, and outstanding results. Sales increased by 200%!',
                rating: 5
              },
              {
                name: 'Mike Chen',
                company: 'Digital Agency',
                review: 'The mobile app they built for us is perfect. Fast, reliable, and exactly what we needed.',
                rating: 5
              },
              {
                name: 'Lisa Wang',
                company: 'Fashion Brand',
                review: 'Amazing design sense and technical expertise. Our website looks incredible!',
                rating: 5
              },
              {
                name: 'David Smith',
                company: 'SaaS Platform',
                review: 'They transformed our complex requirements into a user-friendly application.',
                rating: 5
              },
              {
                name: 'Emma Davis',
                company: 'Healthcare Startup',
                review: 'Exceptional work! They delivered a secure and scalable solution on time.',
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={`second-${index}`} style={{ 
                minWidth: '350px',
                flexShrink: 0
              }}>
                <div style={{
                  backgroundColor: '#FFFFFF',
                  border: '3px solid #111111',
                  boxShadow: '5px 5px 0px #111111',
                  padding: '24px',
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Retro corner accent */}
                  <div style={{
                    position: 'absolute',
                    top: '-1px',
                    right: '-1px',
                    width: '50px',
                    height: '50px',
                    backgroundColor: '#FFC700',
                    clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
                    border: '3px solid #111111',
                    borderLeft: 'none',
                    borderBottom: 'none'
                  }} />
                  
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={20} fill="#FFC700" color="#FFC700" />
                    ))}
                  </div>
                  <p style={{
                    fontSize: '14px',
                    color: '#111111',
                    lineHeight: 1.8,
                    marginBottom: '16px',
                    fontStyle: 'italic',
                    minHeight: '72px'
                  }}>
                    "{testimonial.review}"
                  </p>
                  <div style={{ borderTop: '2px dashed #FF3EA5', paddingTop: '16px' }}>
                    <p style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '16px',
                      fontWeight: 700,
                      color: '#111111',
                      textTransform: 'uppercase'
                    }}>
                      {testimonial.name}
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color: '#FF3EA5',
                      fontWeight: 600
                    }}>
                      {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CSS Animation */}
        <style jsx>{`
          @keyframes marquee {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
        `}</style>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-6 text-center">
          <div style={{
            backgroundColor: '#FF3EA5',
            padding: '60px 40px',
            border: '4px solid #111111',
            boxShadow: '8px 8px 0px #111111',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <h2 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '48px',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#FFFFFF',
              marginBottom: '16px',
              textShadow: '3px 3px 0px #111111'
            }}>
              Ready to Start?
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#FFFFFF',
              marginBottom: '32px',
              maxWidth: '500px',
              margin: '0 auto 32px'
            }}>
              Let's transform your ideas into reality with our cutting-edge solutions
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/contact">
                <button style={{
                  backgroundColor: '#FFC700',
                  color: '#111111',
                  border: '3px solid #111111',
                  padding: '16px 32px',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '18px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  boxShadow: '4px 4px 0px #111111',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translate(-2px, -2px)';
                  e.currentTarget.style.boxShadow = '6px 6px 0px #111111';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translate(0, 0)';
                  e.currentTarget.style.boxShadow = '4px 4px 0px #111111';
                }}>
                  Start Your Project
                </button>
              </Link>
              <Link href="/services">
                <button style={{
                  backgroundColor: '#FFFFFF',
                  color: '#111111',
                  border: '3px solid #111111',
                  padding: '16px 32px',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '18px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  boxShadow: '4px 4px 0px #111111',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translate(-2px, -2px)';
                  e.currentTarget.style.boxShadow = '6px 6px 0px #111111';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translate(0, 0)';
                  e.currentTarget.style.boxShadow = '4px 4px 0px #111111';
                }}>
                  View Services
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
