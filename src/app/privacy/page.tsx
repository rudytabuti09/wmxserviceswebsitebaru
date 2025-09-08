"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Shield, Lock, Eye, Database, Mail, Phone, Calendar } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="py-12 lg:py-20 relative overflow-hidden">
        {/* Background decorative elements */}
        <div 
          style={{
            position: 'absolute',
            top: '15%',
            left: '8%',
            width: '60px',
            height: '60px',
            backgroundColor: '#FFC700',
            border: '3px solid #111111',
            transform: 'rotate(45deg)',
            animation: 'float 6s ease-in-out infinite',
            opacity: 0.3,
            boxShadow: '0 0 20px rgba(255, 199, 0, 0.3)'
          }} 
        />
        <div 
          style={{
            position: 'absolute',
            bottom: '20%',
            right: '12%',
            width: '40px',
            height: '40px',
            backgroundColor: '#FF3EA5',
            border: '3px solid #111111',
            borderRadius: '50%',
            animation: 'float 8s ease-in-out infinite reverse',
            opacity: 0.3,
            boxShadow: '0 0 20px rgba(255, 62, 165, 0.3)'
          }} 
        />
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Badge */}
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
                gap: '8px'
              }}>
                <Shield size={16} />
                Your Privacy Matters
                <Shield size={16} />
              </div>
            </div>
            
            {/* Main Heading */}
            <h1 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: 'clamp(48px, 6vw, 64px)',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#FFC700',
              lineHeight: '1.1',
              textShadow: '4px 4px 0px #111111',
              marginBottom: '24px'
            }}>
              Privacy Policy
            </h1>
            
            <p style={{
              fontSize: '18px',
              color: '#FFFFFF',
              lineHeight: 1.6,
              maxWidth: '600px',
              margin: '0 auto',
              opacity: 0.9
            }}>
              We are committed to protecting your privacy and ensuring the security of your personal information.
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
                color: '#FF3EA5',
                padding: '12px 24px',
                border: '2px solid #FF3EA5',
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
                  icon: Database,
                  title: "Information We Collect",
                  content: [
                    "Personal Information: Name, email address, phone number, and company details when you contact us or use our services.",
                    "Technical Information: IP address, browser type, device information, and usage data to improve our services.",
                    "Communication Data: Records of your interactions with us, including emails, chat messages, and support tickets.",
                    "Project Data: Information related to your projects, including files, specifications, and progress updates."
                  ]
                },
                {
                  icon: Lock,
                  title: "How We Use Your Information",
                  content: [
                    "Service Delivery: To provide, maintain, and improve our digital services and support.",
                    "Communication: To respond to inquiries, send project updates, and provide customer support.",
                    "Business Operations: To process payments, manage accounts, and maintain business relationships.",
                    "Legal Compliance: To comply with applicable laws, regulations, and legitimate business purposes."
                  ]
                },
                {
                  icon: Shield,
                  title: "Data Protection & Security",
                  content: [
                    "Encryption: All sensitive data is encrypted both in transit and at rest using industry-standard protocols.",
                    "Access Control: Strict access controls ensure only authorized personnel can access your information.",
                    "Regular Audits: We conduct regular security audits and vulnerability assessments.",
                    "Secure Infrastructure: Our systems are hosted on secure, monitored cloud infrastructure."
                  ]
                },
                {
                  icon: Eye,
                  title: "Information Sharing",
                  content: [
                    "We do not sell, rent, or trade your personal information to third parties.",
                    "Service Providers: We may share data with trusted service providers who assist in delivering our services.",
                    "Legal Requirements: We may disclose information when required by law or to protect our rights and safety.",
                    "Business Transfers: In case of merger or acquisition, your information may be transferred to the new entity."
                  ]
                },
                {
                  icon: Mail,
                  title: "Your Rights",
                  content: [
                    "Access: You have the right to access and obtain copies of your personal information.",
                    "Correction: You can request corrections to inaccurate or incomplete information.",
                    "Deletion: You may request deletion of your personal information, subject to legal requirements.",
                    "Portability: You can request your data in a structured, commonly used format.",
                    "Objection: You can object to certain processing of your personal information."
                  ]
                },
                {
                  icon: Phone,
                  title: "Contact Us",
                  content: [
                    "If you have questions about this Privacy Policy or our data practices, please contact us:",
                    "Email: privacy@wmxservices.com",
                    "Phone: +62 812 3456 7890",
                    "Address: Jakarta, Indonesia",
                    "We will respond to your inquiry within 30 days."
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
                      background: index % 2 === 0 ? '#FFC700' : '#FF3EA5'
                    }} />
                    
                    <div className="flex items-start gap-4">
                      <div style={{
                        backgroundColor: index % 2 === 0 ? '#FFC700' : '#FF3EA5',
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
                                color: index % 2 === 0 ? '#FFC700' : '#FF3EA5',
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

            {/* Bottom CTA */}
            <div className="mt-16 text-center">
              <div style={{
                backgroundColor: '#111111',
                padding: '32px',
                border: '4px solid #FFC700',
                boxShadow: '8px 8px 0px #FFC700'
              }}>
                <h3 style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#FFC700',
                  marginBottom: '16px',
                  textTransform: 'uppercase'
                }}>
                  Questions About Privacy?
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#FFFFFF',
                  marginBottom: '24px',
                  opacity: 0.9
                }}>
                  We're here to help. Contact our privacy team for any questions or concerns.
                </p>
                <a
                  href="mailto:privacy@wmxservices.com"
                  style={{
                    backgroundColor: '#FFC700',
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
                    e.currentTarget.style.backgroundColor = '#FF3EA5';
                    e.currentTarget.style.transform = 'translate(-2px, -2px)';
                    e.currentTarget.style.boxShadow = '6px 6px 0px #111111';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFC700';
                    e.currentTarget.style.transform = 'translate(0, 0)';
                    e.currentTarget.style.boxShadow = '4px 4px 0px #111111';
                  }}
                >
                  Contact Privacy Team
                </a>
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
      `}</style>
    </div>
  );
}
