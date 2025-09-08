"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RetroCard } from "@/components/ui/retro-card";
import { RetroButton } from "@/components/ui/retro-button";
import { Mail, Phone, MapPin, Send, CheckCircle, Clock, Calendar } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
    
    // Hide success message after 5 seconds
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const contactInfo = [
    {
      title: "Email",
      value: "hello@wmxservices.com",
      icon: Mail,
      color: "#FFC700",
    },
    {
      title: "Phone",
      value: "+1 (555) 123-4567",
      icon: Phone,
      color: "#FF3EA5",
    },
    {
      title: "Office",
      value: "123 Business Ave, City, State 12345",
      icon: MapPin,
      color: "#00FFFF",
    },
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
              Get In Touch
            </h1>
            <p style={{
              fontSize: '18px',
              color: '#FFFFFF',
              maxWidth: '700px',
              margin: '0 auto'
            }}>
              Ready to start your next project? We'd love to hear from you. 
              Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <RetroCard padding="lg">
                <h2 style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '32px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#111111',
                  marginBottom: '24px'
                }}>Send us a message</h2>
                
                {isSubmitted && (
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#00FF00',
                    border: '2px solid #111111',
                    boxShadow: '3px 3px 0px #111111',
                    marginBottom: '24px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <CheckCircle size={24} color="#111111" />
                      <p style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#111111',
                        textTransform: 'uppercase'
                      }}>Thank you! We'll get back to you soon.</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" style={{
                        display: 'block',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '14px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        color: '#111111',
                        marginBottom: '8px'
                      }}>
                        Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #111111',
                          backgroundColor: '#FFFFFF',
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'all 0.1s ease'
                        }}
                        placeholder="Your full name"
                        onFocus={(e) => {
                          e.target.style.boxShadow = '3px 3px 0px #FFC700';
                          e.target.style.transform = 'translate(-2px, -2px)';
                        }}
                        onBlur={(e) => {
                          e.target.style.boxShadow = 'none';
                          e.target.style.transform = 'translate(0, 0)';
                        }}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" style={{
                        display: 'block',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '14px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        color: '#111111',
                        marginBottom: '8px'
                      }}>
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #111111',
                          backgroundColor: '#FFFFFF',
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'all 0.1s ease'
                        }}
                        placeholder="your@email.com"
                        onFocus={(e) => {
                          e.target.style.boxShadow = '3px 3px 0px #FFC700';
                          e.target.style.transform = 'translate(-2px, -2px)';
                        }}
                        onBlur={(e) => {
                          e.target.style.boxShadow = 'none';
                          e.target.style.transform = 'translate(0, 0)';
                        }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" style={{
                      display: 'block',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '14px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: '#111111',
                      marginBottom: '8px'
                    }}>
                      Project Type
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #111111',
                        backgroundColor: '#FFFFFF',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'all 0.1s ease',
                        cursor: 'pointer'
                      }}
                      onFocus={(e) => {
                        e.target.style.boxShadow = '3px 3px 0px #FFC700';
                        e.target.style.transform = 'translate(-2px, -2px)';
                      }}
                      onBlur={(e) => {
                        e.target.style.boxShadow = 'none';
                        e.target.style.transform = 'translate(0, 0)';
                      }}
                    >
                      <option value="">Select a service</option>
                      <option value="web-development">Web Development</option>
                      <option value="mobile-app">Mobile App Development</option>
                      <option value="desktop-app">Desktop Application</option>
                      <option value="consultation">General Consultation</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="message" style={{
                      display: 'block',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '14px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: '#111111',
                      marginBottom: '8px'
                    }}>
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #111111',
                        backgroundColor: '#FFFFFF',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'all 0.1s ease',
                        resize: 'none'
                      }}
                      placeholder="Tell us about your project..."
                      onFocus={(e) => {
                        e.target.style.boxShadow = '3px 3px 0px #FFC700';
                        e.target.style.transform = 'translate(-2px, -2px)';
                      }}
                      onBlur={(e) => {
                        e.target.style.boxShadow = 'none';
                        e.target.style.transform = 'translate(0, 0)';
                      }}
                    />
                  </div>
                  
                  <RetroButton 
                    type="submit"
                    disabled={isSubmitting}
                    variant="primary"
                    size="lg"
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid #111111',
                          borderRightColor: 'transparent',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }} />
                        Sending...
                      </span>
                    ) : (
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <Send size={20} />
                        Send Message
                      </span>
                    )}
                  </RetroButton>
                </form>
              </RetroCard>

              {/* Contact Information */}
              <div className="space-y-8">
                <RetroCard padding="lg">
                  <h2 style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '32px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#111111',
                    marginBottom: '16px'
                  }}>Contact Information</h2>
                  <p style={{
                    fontSize: '14px',
                    color: '#111111',
                    marginBottom: '32px',
                    lineHeight: 1.6
                  }}>
                    We're here to help and answer any question you might have. 
                    We look forward to hearing from you.
                  </p>

                  <div className="space-y-6">
                    {contactInfo.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <div key={index} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px'
                        }}>
                          <div style={{
                            backgroundColor: item.color,
                            padding: '12px',
                            border: '2px solid #111111',
                            boxShadow: '3px 3px 0px #111111',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <Icon size={24} color="#111111" strokeWidth={2} />
                          </div>
                          <div>
                            <h3 style={{
                              fontFamily: 'Poppins, sans-serif',
                              fontSize: '14px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              color: '#111111',
                              marginBottom: '4px'
                            }}>{item.title}</h3>
                            <p style={{
                              fontSize: '14px',
                              color: '#111111'
                            }}>{item.value}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </RetroCard>

                <RetroCard padding="lg" className="relative overflow-hidden">
                  <div style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    width: '100px',
                    height: '100px',
                    backgroundColor: '#FFC700',
                    border: '2px solid #111111',
                    transform: 'rotate(45deg)'
                  }}></div>
                  <h3 style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '24px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#111111',
                    marginBottom: '16px',
                    position: 'relative'
                  }}>
                    Free Consultation
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#111111',
                    marginBottom: '24px',
                    lineHeight: 1.6
                  }}>
                    Schedule a free 30-minute consultation to discuss your project needs.
                  </p>
                  <RetroButton variant="primary" size="lg" className="w-full">
                    <Calendar size={20} />
                    Schedule Now →
                  </RetroButton>
                </RetroCard>

                {/* Business Hours */}
                <RetroCard padding="lg">
                  <h3 style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '24px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#111111',
                    marginBottom: '24px'
                  }}>Business Hours</h3>
                  <div className="space-y-4">
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '2px solid #111111'
                    }}>
                      <span style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '14px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        color: '#111111'
                      }}>Monday - Friday</span>
                      <span style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#FFC700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <Clock size={14} />
                        9:00 AM - 6:00 PM
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '2px solid #111111'
                    }}>
                      <span style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '14px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        color: '#111111'
                      }}>Saturday</span>
                      <span style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#FFC700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <Clock size={14} />
                        10:00 AM - 4:00 PM
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0'
                    }}>
                      <span style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '14px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        color: '#111111'
                      }}>Sunday</span>
                      <span style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#FF3EA5'
                      }}>Closed</span>
                    </div>
                  </div>
                </RetroCard>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
