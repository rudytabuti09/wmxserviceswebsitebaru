"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RetroCard } from "@/components/ui/retro-card";
import { RetroButton } from "@/components/ui/retro-button";
import { Globe, Smartphone, Monitor, Check, ArrowRight, Package, Code, Palette } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Services() {
  const { data: dbServices, isLoading } = trpc.services.getAllVisible.useQuery();
  
  // Icon map for converting string to component
  const iconMap: Record<string, any> = {
    Globe,
    Smartphone, 
    Monitor,
    Package,
    Code,
    Palette
  };
  
  // Format IDR currency
  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Default services for fallback
  const defaultServices = [
    {
      title: "Web Development",
      description: "Custom websites and web applications tailored to your business needs",
      features: [
        "Responsive Design",
        "Modern Frameworks (Next.js, React)",
        "SEO Optimization",
        "Performance Optimization",
        "E-commerce Solutions",
        "CMS Integration"
      ],
      icon: "Globe",
      price: 25000000
    },
    {
      title: "Mobile App Development",
      description: "Native and cross-platform mobile applications for iOS and Android",
      features: [
        "Native iOS & Android Apps",
        "Cross-platform Development",
        "App Store Submission",
        "Push Notifications",
        "Offline Functionality",
        "Third-party Integrations"
      ],
      icon: "Smartphone",
      price: 50000000
    },
    {
      title: "Desktop Applications",
      description: "Powerful desktop software solutions for Windows, macOS, and Linux",
      features: [
        "Cross-platform Compatibility",
        "Rich User Interfaces",
        "Database Integration",
        "File System Access",
        "System Integrations",
        "Auto-update Mechanisms"
      ],
      icon: "Monitor",
      price: 35000000
    }
  ];

  const process = [
    {
      step: "01",
      title: "Discovery",
      description: "We understand your requirements, goals, and target audience"
    },
    {
      step: "02",
      title: "Planning",
      description: "We create a detailed project plan with timeline and milestones"
    },
    {
      step: "03",
      title: "Design",
      description: "We craft beautiful, user-centered designs and prototypes"
    },
    {
      step: "04",
      title: "Development",
      description: "We build your solution using cutting-edge technologies"
    },
    {
      step: "05",
      title: "Testing",
      description: "We thoroughly test to ensure quality and performance"
    },
    {
      step: "06",
      title: "Launch",
      description: "We deploy your solution and provide ongoing support"
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="py-20">
          <div className="container mx-auto px-6 text-center">
            <h1 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '48px',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#FFC700',
              marginBottom: '16px',
              textShadow: '2px 2px 0px #111111'
            }}>
              Our Services
            </h1>
            <p style={{
              fontSize: '18px',
              color: '#FFFFFF',
              maxWidth: '700px',
              margin: '0 auto'
            }}>
              We offer comprehensive digital solutions to help your business grow and succeed in the digital age
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            {isLoading ? (
              <div className="text-center py-20">
                <div style={{
                  display: 'inline-block',
                  width: '48px',
                  height: '48px',
                  border: '4px solid #FFC700',
                  borderRightColor: 'transparent',
                  borderRadius: '0',
                  animation: 'spin 1s linear infinite'
                }} />
                <p style={{
                  marginTop: '16px',
                  fontSize: '16px',
                  color: '#FFFFFF',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 600,
                  textTransform: 'uppercase'
                }}>Loading services...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {(dbServices && dbServices.length > 0 ? dbServices : defaultServices).map((service, index) => {
                  const IconComponent = iconMap[service.icon] || Globe;
                  return (
                  <RetroCard key={index} padding="lg" className="text-center">
                    <div className="flex justify-center mb-6">
                      <div style={{
                        backgroundColor: '#FFC700',
                        padding: '20px',
                        border: '2px solid #111111',
                        boxShadow: '3px 3px 0px #111111'
                      }}>
                        <IconComponent size={48} strokeWidth={2} color="#111111" />
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
                      fontSize: '14px',
                      color: '#111111',
                      marginBottom: '24px',
                      lineHeight: 1.6
                    }}>
                      {service.description}
                    </p>
                    
                    <ul className="space-y-3 mb-8 text-left">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center">
                          <div style={{
                            backgroundColor: '#FF3EA5',
                            padding: '4px',
                            marginRight: '12px',
                            border: '2px solid #111111'
                          }}>
                            <Check size={16} strokeWidth={3} color="#111111" />
                          </div>
                          <span style={{ fontSize: '14px', color: '#111111' }}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    
                    <div style={{
                      borderTop: '2px solid #111111',
                      paddingTop: '24px'
                    }}>
                      <p style={{
                        fontSize: '20px',
                        fontWeight: 700,
                        color: '#FF3EA5',
                        marginBottom: '16px',
                        fontFamily: 'Poppins, sans-serif'
                      }}>
                        Mulai dari {formatIDR(service.price)}
                      </p>
                      <Link href="/contact">
                        <RetroButton variant="primary" size="md" className="w-full">
                          Get Started
                        </RetroButton>
                      </Link>
                    </div>
                  </RetroCard>
                );
              })}
            </div>
            )}
          </div>
        </section>

        {/* Process Section */}
        <section className="py-20">
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
                Our Process
              </h2>
              <p style={{
                fontSize: '18px',
                color: '#FFFFFF',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                We follow a proven methodology to ensure project success
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {process.map((item, index) => (
                <div key={index} className="text-center">
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '64px',
                    height: '64px',
                    backgroundColor: '#FF3EA5',
                    color: '#FFFFFF',
                    border: '3px solid #111111',
                    fontSize: '24px',
                    fontWeight: 800,
                    fontFamily: 'Poppins, sans-serif',
                    marginBottom: '16px',
                    boxShadow: '3px 3px 0px #111111'
                  }}>
                    {item.step}
                  </div>
                  <h3 style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '20px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#FFFFFF',
                    marginBottom: '8px'
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#FFFFFF',
                    opacity: 0.9
                  }}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20" style={{ backgroundColor: '#FFC700' }}>
          <div className="container mx-auto px-6 text-center">
            <h2 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '48px',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#111111',
              marginBottom: '16px',
              textShadow: '3px 3px 0px #FF3EA5'
            }}>
              Ready to Start?
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#111111',
              marginBottom: '32px',
              maxWidth: '600px',
              margin: '0 auto 32px'
            }}>
              Let's discuss your ideas and create something amazing together
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/contact">
                <button style={{
                  backgroundColor: '#FFFFFF',
                  color: '#111111',
                  border: '3px solid #111111',
                  padding: '16px 32px',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '16px',
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
                  Get Free Consultation
                </button>
              </Link>
              <Link href="/portfolio">
                <button style={{
                  backgroundColor: '#FF3EA5',
                  color: '#FFFFFF',
                  border: '3px solid #111111',
                  padding: '16px 32px',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '16px',
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
                  View Our Work
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
