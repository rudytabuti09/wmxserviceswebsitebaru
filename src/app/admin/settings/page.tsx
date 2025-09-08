"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RetroCard } from "@/components/ui/retro-card";
import { RetroButton } from "@/components/ui/retro-button";
import { RetroInput } from "@/components/ui/retro-input";
import { 
  Settings as SettingsIcon, ArrowLeft, Shield, Database, Mail, 
  Bell, Palette, Globe, Lock, Key, Server, User, AlertTriangle,
  Save, RefreshCw, Download, Upload, Eye, EyeOff
} from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("general");
  const [showSecrets, setShowSecrets] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Mock settings data (in real app, this would come from database/env)
  const [settings, setSettings] = useState({
    general: {
      siteName: "WMX Services",
      siteDescription: "Professional Web Development Services",
      adminEmail: "admin@wmx-services.com",
      timezone: "Asia/Jakarta",
      language: "id-ID",
    },
    email: {
      provider: "resend",
      fromEmail: "noreply@wmx-services.com",
      fromName: "WMX Services",
      apiKey: "re_***********",
    },
    security: {
      enableTwoFactor: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      requireStrongPasswords: true,
    },
    notifications: {
      emailNotifications: true,
      projectUpdates: true,
      paymentAlerts: true,
      newUserRegistration: true,
    },
    appearance: {
      theme: "retro",
      primaryColor: "#FFC700",
      logoUrl: "/logo.png",
    },
  });
  
  const handleSaveSettings = async (tab: string) => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert(`${tab.charAt(0).toUpperCase() + tab.slice(1)} settings saved successfully!`);
    setIsSaving(false);
  };

  const handleInputChange = (category: string, field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  if (!session || session.user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RetroCard padding="lg" className="text-center max-w-md">
          <div style={{ fontSize: '72px', marginBottom: '24px' }}>🛡️</div>
          <h1 style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '32px',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#111111',
            marginBottom: '16px'
          }}>Access Denied</h1>
          <p style={{
            fontSize: '16px',
            color: '#111111',
            marginBottom: '24px'
          }}>You need admin privileges to access this page.</p>
          <Link href="/">
            <RetroButton variant="primary" size="lg">
              Back to Home
            </RetroButton>
          </Link>
        </RetroCard>
      </div>
    );
  }

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "email", label: "Email", icon: Mail },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          {/* Back Navigation */}
          <div className="mb-6">
            <Link href="/admin/dashboard">
              <button style={{
                backgroundColor: '#FFFFFF',
                color: '#111111',
                border: '2px solid #111111',
                padding: '8px 16px',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'uppercase',
                boxShadow: '2px 2px 0px #111111',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(-1px, -1px)';
                e.currentTarget.style.boxShadow = '3px 3px 0px #111111';
                e.currentTarget.style.backgroundColor = '#FFC700';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translate(0, 0)';
                e.currentTarget.style.boxShadow = '2px 2px 0px #111111';
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}>
                <ArrowLeft size={16} />
                Back to Dashboard
              </button>
            </Link>
          </div>
          
          {/* Page Header */}
          <div className="mb-8 text-center">
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
                <SettingsIcon size={40} strokeWidth={3} color="#FFFFFF" />
              </div>
            </div>
            <h1 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '42px',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#FF3EA5',
              marginBottom: '16px',
              textShadow: '2px 2px 0px #111111'
            }}>
              System Settings
            </h1>
            <p style={{
              fontSize: '18px',
              color: '#FFFFFF',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Configure your admin panel and system preferences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Settings Navigation */}
            <div className="lg:col-span-1">
              <RetroCard padding="lg">
                <h3 style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '18px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#111111',
                  marginBottom: '16px'
                }}>Settings</h3>
                
                <div className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          backgroundColor: activeTab === tab.id ? '#FFC700' : '#FFFFFF',
                          border: '2px solid #111111',
                          boxShadow: activeTab === tab.id ? '3px 3px 0px #111111' : '2px 2px 0px #111111',
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#111111',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        <Icon size={16} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </RetroCard>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-3">
              <RetroCard padding="xl">
                {/* General Settings */}
                {activeTab === "general" && (
                  <div>
                    <h2 style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '24px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: '#111111',
                      marginBottom: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <Globe size={20} />
                      General Settings
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label style={{
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '14px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: '#111111',
                          marginBottom: '8px',
                          display: 'block'
                        }}>Site Name</label>
                        <RetroInput
                          type="text"
                          value={settings.general.siteName}
                          onChange={(e) => handleInputChange("general", "siteName", e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label style={{
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '14px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: '#111111',
                          marginBottom: '8px',
                          display: 'block'
                        }}>Site Description</label>
                        <textarea
                          value={settings.general.siteDescription}
                          onChange={(e) => handleInputChange("general", "siteDescription", e.target.value)}
                          rows={3}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            backgroundColor: '#FFFFFF',
                            border: '3px solid #111111',
                            boxShadow: '4px 4px 0px #111111',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '16px',
                            color: '#111111',
                            outline: 'none',
                            resize: 'vertical',
                          }}
                        />
                      </div>
                      
                      <div>
                        <label style={{
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '14px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: '#111111',
                          marginBottom: '8px',
                          display: 'block'
                        }}>Admin Email</label>
                        <RetroInput
                          type="email"
                          value={settings.general.adminEmail}
                          onChange={(e) => handleInputChange("general", "adminEmail", e.target.value)}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '14px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            color: '#111111',
                            marginBottom: '8px',
                            display: 'block'
                          }}>Timezone</label>
                          <select
                            value={settings.general.timezone}
                            onChange={(e) => handleInputChange("general", "timezone", e.target.value)}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              backgroundColor: '#FFFFFF',
                              border: '3px solid #111111',
                              boxShadow: '4px 4px 0px #111111',
                              fontFamily: 'Poppins, sans-serif',
                              fontSize: '16px',
                              fontWeight: 600,
                              color: '#111111',
                              outline: 'none',
                            }}
                          >
                            <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                            <option value="UTC">UTC</option>
                            <option value="America/New_York">America/New_York (EST)</option>
                          </select>
                        </div>
                        
                        <div>
                          <label style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '14px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            color: '#111111',
                            marginBottom: '8px',
                            display: 'block'
                          }}>Language</label>
                          <select
                            value={settings.general.language}
                            onChange={(e) => handleInputChange("general", "language", e.target.value)}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              backgroundColor: '#FFFFFF',
                              border: '3px solid #111111',
                              boxShadow: '4px 4px 0px #111111',
                              fontFamily: 'Poppins, sans-serif',
                              fontSize: '16px',
                              fontWeight: 600,
                              color: '#111111',
                              outline: 'none',
                            }}
                          >
                            <option value="id-ID">Indonesia</option>
                            <option value="en-US">English (US)</option>
                            <option value="en-GB">English (UK)</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <RetroButton
                          onClick={() => handleSaveSettings("general")}
                          disabled={isSaving}
                          variant="primary"
                          size="lg"
                        >
                          {isSaving ? <RefreshCw size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                          Save General Settings
                        </RetroButton>
                      </div>
                    </div>
                  </div>
                )}

                {/* Email Settings */}
                {activeTab === "email" && (
                  <div>
                    <h2 style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '24px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: '#111111',
                      marginBottom: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <Mail size={20} />
                      Email Configuration
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label style={{
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '14px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: '#111111',
                          marginBottom: '8px',
                          display: 'block'
                        }}>Email Provider</label>
                        <select
                          value={settings.email.provider}
                          onChange={(e) => handleInputChange("email", "provider", e.target.value)}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            backgroundColor: '#FFFFFF',
                            border: '3px solid #111111',
                            boxShadow: '4px 4px 0px #111111',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '16px',
                            fontWeight: 600,
                            color: '#111111',
                            outline: 'none',
                          }}
                        >
                          <option value="resend">Resend</option>
                          <option value="sendgrid">SendGrid</option>
                          <option value="mailgun">Mailgun</option>
                          <option value="smtp">Custom SMTP</option>
                        </select>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '14px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            color: '#111111',
                            marginBottom: '8px',
                            display: 'block'
                          }}>From Email</label>
                          <RetroInput
                            type="email"
                            value={settings.email.fromEmail}
                            onChange={(e) => handleInputChange("email", "fromEmail", e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <label style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '14px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            color: '#111111',
                            marginBottom: '8px',
                            display: 'block'
                          }}>From Name</label>
                          <RetroInput
                            type="text"
                            value={settings.email.fromName}
                            onChange={(e) => handleInputChange("email", "fromName", e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label style={{
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '14px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: '#111111',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <Key size={16} />
                          API Key
                          <button
                            type="button"
                            onClick={() => setShowSecrets(!showSecrets)}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: '#666',
                              cursor: 'pointer'
                            }}
                          >
                            {showSecrets ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </label>
                        <RetroInput
                          type={showSecrets ? "text" : "password"}
                          value={settings.email.apiKey}
                          onChange={(e) => handleInputChange("email", "apiKey", e.target.value)}
                        />
                      </div>
                      
                      <div className="pt-4">
                        <RetroButton
                          onClick={() => handleSaveSettings("email")}
                          disabled={isSaving}
                          variant="primary"
                          size="lg"
                        >
                          {isSaving ? <RefreshCw size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                          Save Email Settings
                        </RetroButton>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Settings */}
                {activeTab === "security" && (
                  <div>
                    <h2 style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '24px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: '#111111',
                      marginBottom: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <Shield size={20} />
                      Security Settings
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '16px',
                          backgroundColor: '#F8F8F8',
                          border: '2px solid #111111',
                          boxShadow: '3px 3px 0px #111111',
                        }}>
                          <input
                            type="checkbox"
                            id="enableTwoFactor"
                            checked={settings.security.enableTwoFactor}
                            onChange={(e) => handleInputChange("security", "enableTwoFactor", e.target.checked)}
                            style={{
                              width: '20px',
                              height: '20px',
                              accentColor: '#FF3EA5'
                            }}
                          />
                          <label 
                            htmlFor="enableTwoFactor"
                            style={{
                              fontFamily: 'Poppins, sans-serif',
                              fontSize: '16px',
                              fontWeight: 600,
                              color: '#111111',
                              cursor: 'pointer'
                            }}
                          >
                            🔐 Enable Two-Factor Authentication
                          </label>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '14px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            color: '#111111',
                            marginBottom: '8px',
                            display: 'block'
                          }}>Session Timeout (minutes)</label>
                          <RetroInput
                            type="number"
                            value={settings.security.sessionTimeout.toString()}
                            onChange={(e) => handleInputChange("security", "sessionTimeout", parseInt(e.target.value))}
                            min="5"
                            max="1440"
                          />
                        </div>
                        
                        <div>
                          <label style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '14px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            color: '#111111',
                            marginBottom: '8px',
                            display: 'block'
                          }}>Max Login Attempts</label>
                          <RetroInput
                            type="number"
                            value={settings.security.maxLoginAttempts.toString()}
                            onChange={(e) => handleInputChange("security", "maxLoginAttempts", parseInt(e.target.value))}
                            min="3"
                            max="10"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '16px',
                          backgroundColor: '#F8F8F8',
                          border: '2px solid #111111',
                          boxShadow: '3px 3px 0px #111111',
                        }}>
                          <input
                            type="checkbox"
                            id="requireStrongPasswords"
                            checked={settings.security.requireStrongPasswords}
                            onChange={(e) => handleInputChange("security", "requireStrongPasswords", e.target.checked)}
                            style={{
                              width: '20px',
                              height: '20px',
                              accentColor: '#FF3EA5'
                            }}
                          />
                          <label 
                            htmlFor="requireStrongPasswords"
                            style={{
                              fontFamily: 'Poppins, sans-serif',
                              fontSize: '16px',
                              fontWeight: 600,
                              color: '#111111',
                              cursor: 'pointer'
                            }}
                          >
                            🔒 Require Strong Passwords
                          </label>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <RetroButton
                          onClick={() => handleSaveSettings("security")}
                          disabled={isSaving}
                          variant="primary"
                          size="lg"
                        >
                          {isSaving ? <RefreshCw size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                          Save Security Settings
                        </RetroButton>
                      </div>
                    </div>
                  </div>
                )}

                {/* Add other tabs content similarly... */}
                {activeTab === "notifications" && (
                  <div>
                    <h2 style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '24px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: '#111111',
                      marginBottom: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <Bell size={20} />
                      Notification Preferences
                    </h2>
                    
                    <div className="space-y-4">
                      {Object.entries(settings.notifications).map(([key, value]) => (
                        <div key={key} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '16px',
                          backgroundColor: '#F8F8F8',
                          border: '2px solid #111111',
                          boxShadow: '3px 3px 0px #111111',
                        }}>
                          <input
                            type="checkbox"
                            id={key}
                            checked={value as boolean}
                            onChange={(e) => handleInputChange("notifications", key, e.target.checked)}
                            style={{
                              width: '20px',
                              height: '20px',
                              accentColor: '#FF3EA5'
                            }}
                          />
                          <label 
                            htmlFor={key}
                            style={{
                              fontFamily: 'Poppins, sans-serif',
                              fontSize: '16px',
                              fontWeight: 600,
                              color: '#111111',
                              cursor: 'pointer'
                            }}
                          >
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </label>
                        </div>
                      ))}
                      
                      <div className="pt-4">
                        <RetroButton
                          onClick={() => handleSaveSettings("notifications")}
                          disabled={isSaving}
                          variant="primary"
                          size="lg"
                        >
                          {isSaving ? <RefreshCw size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                          Save Notification Settings
                        </RetroButton>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "appearance" && (
                  <div>
                    <h2 style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '24px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: '#111111',
                      marginBottom: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <Palette size={20} />
                      Appearance Settings
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label style={{
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '14px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: '#111111',
                          marginBottom: '8px',
                          display: 'block'
                        }}>Theme</label>
                        <select
                          value={settings.appearance.theme}
                          onChange={(e) => handleInputChange("appearance", "theme", e.target.value)}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            backgroundColor: '#FFFFFF',
                            border: '3px solid #111111',
                            boxShadow: '4px 4px 0px #111111',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '16px',
                            fontWeight: 600,
                            color: '#111111',
                            outline: 'none',
                          }}
                        >
                          <option value="retro">Retro (Current)</option>
                          <option value="modern">Modern</option>
                          <option value="dark">Dark Mode</option>
                        </select>
                      </div>
                      
                      <div>
                        <label style={{
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '14px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: '#111111',
                          marginBottom: '8px',
                          display: 'block'
                        }}>Primary Color</label>
                        <div className="flex items-center gap-4">
                          <input
                            type="color"
                            value={settings.appearance.primaryColor}
                            onChange={(e) => handleInputChange("appearance", "primaryColor", e.target.value)}
                            style={{
                              width: '60px',
                              height: '40px',
                              border: '3px solid #111111',
                              boxShadow: '3px 3px 0px #111111',
                              cursor: 'pointer'
                            }}
                          />
                          <RetroInput
                            type="text"
                            value={settings.appearance.primaryColor}
                            onChange={(e) => handleInputChange("appearance", "primaryColor", e.target.value)}
                            style={{ flex: 1 }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label style={{
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '14px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: '#111111',
                          marginBottom: '8px',
                          display: 'block'
                        }}>Logo URL</label>
                        <RetroInput
                          type="url"
                          value={settings.appearance.logoUrl}
                          onChange={(e) => handleInputChange("appearance", "logoUrl", e.target.value)}
                          placeholder="/logo.png or https://example.com/logo.png"
                        />
                      </div>
                      
                      <div className="pt-4">
                        <RetroButton
                          onClick={() => handleSaveSettings("appearance")}
                          disabled={isSaving}
                          variant="primary"
                          size="lg"
                        >
                          {isSaving ? <RefreshCw size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                          Save Appearance Settings
                        </RetroButton>
                      </div>
                    </div>
                  </div>
                )}
              </RetroCard>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
