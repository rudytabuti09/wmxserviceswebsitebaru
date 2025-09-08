"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FileText, Scale, Users, AlertTriangle, CreditCard, Gavel, Calendar } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="py-12 lg:py-20 relative overflow-hidden">
        {/* Background decorative elements */}
        <div 
          style={{
            position: 'absolute',
            top: '20%',
            left: '10%',
            width: '50px',
            height: '50px',
            backgroundColor: '#FF3EA5',
            border: '3px solid #111111',
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            animation: 'spin 10s linear infinite',
            opacity: 0.3,
            boxShadow: '0 0 20px rgba(255, 62, 165, 0.3)'
          }} 
        />
        <div 
          style={{
            position: 'absolute',
            bottom: '15%',
            right: '15%',
            width: '70px',
            height: '70px',
            backgroundColor: '#00FFFF',
            border: '3px solid #111111',
            transform: 'rotate(45deg)',
            animation: 'float 7s ease-in-out infinite',
            opacity: 0.3,
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)'
          }} 
        />
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Badge */}
            <div className="flex justify-center mb-8">
              <div style={{
                backgroundColor: '#111111',
                color: '#FF3EA5',
                padding: '8px 20px',
                border: '2px solid #FF3EA5',
                boxShadow: '3px 3px 0px #FF3EA5',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '2px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Scale size={16} />
                Legal & Fair
                <Scale size={16} />
              </div>
            </div>
            
            {/* Main Heading */}
            <h1 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: 'clamp(48px, 6vw, 64px)',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#FF3EA5',
              lineHeight: '1.1',
              textShadow: '4px 4px 0px #111111',
              marginBottom: '24px'
            }}>
              Terms of Service
            </h1>
            
            <p style={{
              fontSize: '18px',
              color: '#FFFFFF',
              lineHeight: 1.6,
              maxWidth: '600px',
              margin: '0 auto',
              opacity: 0.9
            }}>
              Please read these terms carefully before using our services. By using WMX Services, you agree to these terms.
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Last Updated */}
            <div className="mb-12 text-center">
              <div style={{
                backgroundColor: '#111111',
                color: '#FFC700',
                padding: '12px 24px',
                border: '2px solid #FFC700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'uppercase'
              }}>
                <Calendar size={16} />
                Last Updated: December 2024
              </div>
            </div>

            {/* Content Cards */}
            <div className="space-y-8">
              {[
                {
                  icon: FileText,
                  title: "Acceptance of Terms",
                  content: [
                    "By accessing and using WMX Services, you accept and agree to be bound by the terms and provision of this agreement.",
                    "These terms apply to all visitors, users, and others who access or use our services.",
                    "If you do not agree to abide by the above, please do not use this service.",
                    "We reserve the right to modify these terms at any time, and such modifications shall be effective immediately upon posting."
                  ]
                },
                {
                  icon: Users,
                  title: "Services Description",
                  content: [
                    "Web Development: Custom website design, development, and maintenance services.",
                    "Mobile Applications: Native and cross-platform mobile app development for iOS and Android.",
                    "Desktop Software: Custom desktop application development and enterprise software solutions.",
                    "Digital Consulting: Technology consulting, system architecture, and digital transformation services.",
                    "Maintenance & Support: Ongoing technical support, updates, and maintenance services."
                  ]
                },
                {
                  icon: CreditCard,
                  title: "Payment Terms",
                  content: [
                    "Project costs will be outlined in the project proposal and agreed upon before work begins.",
                    "Payment schedules vary by project but typically include an initial deposit and milestone-based payments.",
                    "All invoices are due within 30 days of the invoice date unless otherwise agreed upon.",
                    "Late payments may incur additional fees as specified in the project agreement.",
                    "We accept various payment methods including bank transfers and digital payment platforms."
                  ]
                },
                {
                  icon: Gavel,
                  title: "Intellectual Property",
                  content: [
                    "Upon full payment, clients own the custom code and designs created specifically for their project.",
                    "WMX Services retains ownership of proprietary frameworks, tools, and methodologies used.",
                    "Third-party licenses and assets used in projects remain subject to their respective terms.",
                    "Clients grant us permission to showcase completed work in our portfolio and marketing materials.",
                    "We respect confidentiality agreements and will not disclose sensitive business information."
                  ]
                },
                {
                  icon: AlertTriangle,
                  title: "Limitations of Liability",
                  content: [
                    "Our services are provided 'as is' without warranty of any kind, either express or implied.",
                    "We are not liable for any indirect, incidental, special, or consequential damages.",
                    "Our total liability shall not exceed the amount paid for the specific service in question.",
                    "Clients are responsible for maintaining backups of their data and content.",
                    "We recommend clients have appropriate insurance coverage for their digital assets."
                  ]
                },
                {
                  icon: Scale,
                  title: "Termination & Cancellation",
                  content: [
                    "Either party may terminate services with 30 days written notice.",
                    "Clients are responsible for payment of all work completed up to the termination date.",
                    "Refunds, if applicable, will be processed according to the project-specific agreement.",
                    "Upon termination, we will provide all completed work and transfer necessary credentials.",
                    "Confidentiality obligations survive termination of the service agreement."
                  ]
                },
                {
                  icon: FileText,
                  title: "Dispute Resolution",
                  content: [
                    "Any disputes will first be addressed through good faith negotiations.",
                    "If resolution cannot be reached, disputes may be subject to mediation.",
                    "These terms are governed by the laws of Indonesia.",
                    "Any legal proceedings will be conducted in Jakarta, Indonesia.",
                    "We encourage open communication to resolve issues before they become disputes."
                  ]
                }
              ].map((section, index) => {
                const IconComponent = section.icon;
                return (
                  <div
                    key={index}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '4px solid #111111',
                      boxShadow: '8px 8px 0px #111111',
                      padding: '32px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Card accent */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '6px',
                      background: index % 3 === 0 ? '#FFC700' : index % 3 === 1 ? '#FF3EA5' : '#00FFFF'
                    }} />
                    
                    <div className="flex items-start gap-4">
                      <div style={{
                        backgroundColor: index % 3 === 0 ? '#FFC700' : index % 3 === 1 ? '#FF3EA5' : '#00FFFF',
                        padding: '12px',
                        border: '3px solid #111111',
                        flexShrink: 0
                      }}>
                        <IconComponent size={24} strokeWidth={2} color="#111111" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 style={{
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '24px',
                          fontWeight: 700,
                          color: '#111111',
                          marginBottom: '16px',
                          textTransform: 'uppercase'
                        }}>
                          {section.title}
                        </h3>
                        
                        <ul className="space-y-3">
                          {section.content.map((item, itemIndex) => (
                            <li
                              key={itemIndex}
                              style={{
                                fontSize: '16px',
                                color: '#666666',
                                lineHeight: 1.6,
                                paddingLeft: '16px',
                                position: 'relative'
                              }}
                            >
                              <span style={{
                                position: 'absolute',
                                left: 0,
                                color: index % 3 === 0 ? '#FFC700' : index % 3 === 1 ? '#FF3EA5' : '#00FFFF',
                                fontWeight: 'bold'
                              }}>
                                →
                              </span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Agreement Section */}
            <div className="mt-16">
              <div style={{
                backgroundColor: '#111111',
                padding: '32px',
                border: '4px solid #FF3EA5',
                boxShadow: '8px 8px 0px #FF3EA5',
                textAlign: 'center'
              }}>
                <h3 style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#FF3EA5',
                  marginBottom: '16px',
                  textTransform: 'uppercase'
                }}>
                  Agreement Acknowledgment
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#FFFFFF',
                  marginBottom: '24px',
                  opacity: 0.9,
                  lineHeight: 1.6
                }}>
                  By using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/contact"
                    style={{
                      backgroundColor: '#FF3EA5',
                      color: '#111111',
                      padding: '12px 24px',
                      border: '3px solid #111111',
                      textDecoration: 'none',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '14px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      display: 'inline-block',
                      transition: 'all 0.2s',
                      boxShadow: '4px 4px 0px #111111'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFC700';
                      e.currentTarget.style.transform = 'translate(-2px, -2px)';
                      e.currentTarget.style.boxShadow = '6px 6px 0px #111111';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#FF3EA5';
                      e.currentTarget.style.transform = 'translate(0, 0)';
                      e.currentTarget.style.boxShadow = '4px 4px 0px #111111';
                    }}
                  >
                    Questions? Contact Us
                  </a>
                  <a
                    href="/privacy"
                    style={{
                      backgroundColor: 'transparent',
                      color: '#FFFFFF',
                      padding: '12px 24px',
                      border: '3px solid #FFFFFF',
                      textDecoration: 'none',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '14px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      display: 'inline-block',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                      e.currentTarget.style.color = '#111111';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#FFFFFF';
                    }}
                  >
                    Read Privacy Policy
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(45deg); }
          50% { transform: translateY(-20px) rotate(45deg); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
