"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Github, Mail, Chrome, KeyRound, ArrowRight, Loader2, Zap, Shield, TrendingUp, Star, Home } from "lucide-react";
import { RetroCard } from "@/components/ui/retro-card";
import { RetroButton } from "@/components/ui/retro-button";
import { RetroInput } from "@/components/ui/retro-input";
import { RetroLoader } from "@/components/ui/retro-loader";
import { PowerUpMascot } from "@/components/ui/power-up-mascot";
import { VerificationModal } from "@/components/ui/verification-modal";

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");
  const [mascotMood, setMascotMood] = useState<"happy" | "sad" | "excited" | "thinking" | "error" | "success">("happy");
  
  // Verification modal states
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationUserId, setVerificationUserId] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationPassword, setVerificationPassword] = useState("");

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(provider);
    setError("");
    setMascotMood("thinking");
    try {
      await signIn(provider, { callbackUrl: "/admin/dashboard" });
      setMascotMood("success");
    } catch (error) {
      setError("Failed to sign in. Please try again.");
      setMascotMood("error");
      setIsLoading(null);
      setTimeout(() => setMascotMood("happy"), 3000);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading("email");
    setError("");
    setMascotMood("thinking");

    try {
      const result = await signIn("email", {
        email,
        redirect: false,
        callbackUrl: "/admin/dashboard",
      });

      if (result?.ok) {
        setEmailSent(true);
        setMascotMood("excited");
      } else {
        setError("Failed to send magic link. Please try again.");
        setMascotMood("error");
        setTimeout(() => setMascotMood("happy"), 3000);
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      setMascotMood("error");
      setTimeout(() => setMascotMood("happy"), 3000);
    } finally {
      setIsLoading(null);
    }
  };

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading("credentials");
    setError("");
    setMascotMood("thinking");

    if (isSignUp) {
      // Handle sign up
      try {
        console.log('Starting signup process for:', email);
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        console.log('Signup response:', data);

        if (response.ok) {
          // Check if email verification is required
          if (data.requiresVerification) {
            console.log('Verification required, showing modal');
            console.log('UserId:', data.userId);
            setMascotMood("excited");
            
            // Show verification modal instead of redirect
            setVerificationUserId(data.userId);
            setVerificationEmail(email);
            setVerificationPassword(password);
            setShowVerificationModal(true);
            return; // Make sure to return here to prevent further execution
          } else {
            // Old flow for backward compatibility
            const result = await signIn("credentials", {
              email,
              password,
              redirect: false,
              callbackUrl: "/admin/dashboard",
            });

            if (result?.ok) {
              setMascotMood("success");
              router.push(result.url || "/admin/dashboard");
            } else {
              setError("Account created but failed to sign in. Please try signing in manually.");
              setMascotMood("error");
              setTimeout(() => setMascotMood("happy"), 3000);
            }
          }
        } else {
          setError(data.error || "Failed to create account.");
          setMascotMood("error");
          setTimeout(() => setMascotMood("happy"), 3000);
        }
      } catch (error) {
        console.error('Signup error:', error);
        setError("An error occurred during sign up.");
        setMascotMood("error");
        setTimeout(() => setMascotMood("happy"), 3000);
      } finally {
        setIsLoading(null);
      }
    } else {
      // Handle sign in
      try {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
          callbackUrl: "/admin/dashboard",
        });

        if (result?.ok) {
          setMascotMood("success");
          router.push(result.url || "/admin/dashboard");
        } else {
          setError("Invalid email or password.");
          setMascotMood("error");
          setTimeout(() => setMascotMood("happy"), 3000);
        }
      } catch (error) {
        setError("An error occurred during sign in.");
        setMascotMood("error");
        setTimeout(() => setMascotMood("happy"), 3000);
      } finally {
        setIsLoading(null);
      }
    }
  };

  const handleVerificationSuccess = () => {
    // Reset form and show success message
    setEmail("");
    setPassword("");
    setIsSignUp(false);
    setMascotMood("success");
    
    // Redirect to signin page or show success message
    setTimeout(() => {
      setMascotMood("happy");
      setError("");
    }, 2000);
  };

  const handleCloseVerificationModal = () => {
    setShowVerificationModal(false);
    setVerificationUserId("");
    setVerificationEmail("");
    setVerificationPassword("");
  };

  return (
    <div className="h-screen overflow-hidden">
      {/* Split Sign In Section - Full Height */}
      <section className="h-full flex">
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-4" 
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <div className="w-full max-w-md">
            {/* Mobile Title with Mascot (shown only on mobile) */}
            <div className="lg:hidden text-center mb-4">
              <div style={{ marginBottom: '8px' }}>
                <PowerUpMascot mood={mascotMood} size={60} />
              </div>
              <h1 style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '28px',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: '#111111',
                marginBottom: '4px',
                textShadow: '2px 2px 0px #FFC700'
              }}>
                {isSignUp ? 'Sign Up' : 'Welcome Back'}
              </h1>
            </div>
            
            
            {/* Desktop Title with Mascot */}
            <div className="hidden lg:block mb-4 mt-4">
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '12px' }}>
                <PowerUpMascot mood={mascotMood} size={80} />
                <div style={{ flex: 1 }}>
                  <h2 style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#111111',
                    marginBottom: '4px'
                  }}>
                    {isSignUp ? 'Sign Up' : 'Welcome Back!'}
                  </h2>
                  <p style={{
                    fontSize: '14px',
                    color: '#666666',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    {isSignUp ? 'Create your new account' : 'Sign in to access your dashboard'}
                  </p>
                </div>
              </div>
            </div>

          <RetroCard padding="lg">
            {error && (
              <div style={{
                padding: '12px',
                marginBottom: '20px',
                backgroundColor: '#FFE4E4',
                border: '2px solid #FF0000',
                boxShadow: '3px 3px 0px #111111'
              }}>
                <p style={{
                  color: '#FF0000',
                  fontSize: '14px',
                  fontWeight: 600
                }}>{error}</p>
              </div>
            )}

            {emailSent ? (
              <div className="text-center py-8">
                <div style={{
                  display: 'inline-block',
                  padding: '20px',
                  backgroundColor: '#FFC700',
                  border: '2px solid #111111',
                  boxShadow: '4px 4px 0px #111111',
                  marginBottom: '24px'
                }}>
                  <Mail size={48} color="#111111" />
                </div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#111111',
                  marginBottom: '12px',
                  textTransform: 'uppercase'
                }}>Check Your Email!</h3>
                <p style={{
                  fontSize: '16px',
                  color: '#666666',
                  marginBottom: '8px'
                }}>
                  Magic link sent to:
                </p>
                <p style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#FF3EA5',
                  marginBottom: '24px'
                }}>{email}</p>
                <RetroButton
                  variant="outline"
                  onClick={() => setEmailSent(false)}
                >
                  Use Different Method
                </RetroButton>
              </div>
            ) : (
              <>
                {/* OAuth Providers */}
                <div className="space-y-4">
                  <button
                    onClick={() => handleOAuthSignIn("google")}
                    disabled={isLoading !== null}
                    style={{
                      width: '100%',
                      padding: '14px 24px',
                      backgroundColor: '#FFFFFF',
                      color: '#111111',
                      border: '2px solid #111111',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      boxShadow: '4px 4px 0px #111111',
                      opacity: isLoading ? 0.5 : 1,
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px'
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.transform = 'translate(-2px, -2px)';
                        e.currentTarget.style.boxShadow = '6px 6px 0px #111111';
                        e.currentTarget.style.backgroundColor = '#FFF3E0';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translate(0, 0)';
                      e.currentTarget.style.boxShadow = '4px 4px 0px #111111';
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }}
                  >
                    {isLoading === "google" ? (
                      <RetroLoader size="sm" />
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleOAuthSignIn("github")}
                    disabled={isLoading !== null}
                    style={{
                      width: '100%',
                      padding: '14px 24px',
                      backgroundColor: '#111111',
                      color: '#FFFFFF',
                      border: '2px solid #111111',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      boxShadow: '4px 4px 0px #666666',
                      opacity: isLoading ? 0.5 : 1,
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px'
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.transform = 'translate(-2px, -2px)';
                        e.currentTarget.style.boxShadow = '6px 6px 0px #666666';
                        e.currentTarget.style.backgroundColor = '#333333';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translate(0, 0)';
                      e.currentTarget.style.boxShadow = '4px 4px 0px #666666';
                      e.currentTarget.style.backgroundColor = '#111111';
                    }}
                  >
                    {isLoading === "github" ? (
                      <RetroLoader size="sm" />
                    ) : (
                      <>
                        <Github size={20} />
                        Continue with GitHub
                      </>
                    )}
                  </button>
                </div>

                {/* Divider */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  margin: '16px 0',
                  gap: '12px'
                }}>
                  <div style={{
                    flex: 1,
                    height: '2px',
                    backgroundColor: '#111111'
                  }} />
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#666666',
                    textTransform: 'uppercase'
                  }}>Or</span>
                  <div style={{
                    flex: 1,
                    height: '2px',
                    backgroundColor: '#111111'
                  }} />
                </div>

                {/* Tab Selection */}
                <div style={{
                  display: 'flex',
                  marginBottom: '16px',
                  border: '2px solid #111111',
                  boxShadow: '3px 3px 0px #111111'
                }}>
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: !isSignUp ? '#FFC700' : '#FFFFFF',
                      color: '#111111',
                      border: 'none',
                      borderRight: '2px solid #111111',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '13px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: isSignUp ? '#FFC700' : '#FFFFFF',
                      color: '#111111',
                      border: 'none',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '13px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    Sign Up
                  </button>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleCredentialsSignIn}>
                  <div className="space-y-4">
                    <RetroInput
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                    <RetroInput
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    <RetroButton
                      type="submit"
                      variant="secondary"
                      className="w-full"
                      disabled={isLoading !== null}
                    >
                      {isLoading === "credentials" ? (
                        <RetroLoader size="sm" />
                      ) : (
                        <>
                          <KeyRound size={20} />
                          {isSignUp ? "Create Account" : "Sign In"}
                        </>
                      )}
                    </RetroButton>
                  </div>
                </form>

                {/* Magic Link Section */}
                <div style={{
                  marginTop: '20px',
                  padding: '16px',
                  backgroundColor: '#F0F9FF',
                  border: '2px solid #111111',
                  boxShadow: '3px 3px 0px #111111'
                }}>
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#111111',
                    marginBottom: '8px',
                    textTransform: 'uppercase'
                  }}>
                    <Mail size={18} style={{ display: 'inline', marginRight: '6px' }} />
                    Magic Link
                  </h3>
                  <p style={{
                    fontSize: '13px',
                    color: '#666666',
                    marginBottom: '12px'
                  }}>
                    Get a sign-in link sent to your email
                  </p>
                  <form onSubmit={handleEmailSignIn}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        style={{
                          flex: 1,
                          padding: '10px 14px',
                          border: '2px solid #111111',
                          backgroundColor: '#FFFFFF',
                          fontSize: '14px',
                          fontFamily: 'Inter, sans-serif',
                          outline: 'none',
                          boxShadow: '3px 3px 0px #111111'
                        }}
                      />
                      <RetroButton
                        type="submit"
                        variant="primary"
                        disabled={isLoading !== null}
                      >
                        {isLoading === "email" ? (
                          <RetroLoader size="sm" />
                        ) : (
                          <ArrowRight size={20} />
                        )}
                      </RetroButton>
                    </div>
                  </form>
                </div>

                {/* Back to Home Link */}
                <div style={{
                  marginTop: '24px',
                  textAlign: 'center'
                }}>
                  <Link href="/" className="inline-flex items-center gap-2" 
                    style={{
                      color: '#666666',
                      fontSize: '14px',
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                      fontWeight: 500
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#FF3EA5'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#666666'}
                  >
                    <Home size={16} />
                    Back to Home
                  </Link>
                </div>
              </>
            )}
          </RetroCard>

          </div>
        </div>
        
        {/* Right Side - Hero Section */}
        <div className="hidden lg:flex w-1/2 items-center justify-center px-12 relative overflow-hidden"
          style={{
            backgroundColor: '#3D52F1',
            backgroundImage: `
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 35px,
                rgba(255, 199, 0, 0.1) 35px,
                rgba(255, 199, 0, 0.1) 70px
              ),
              repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 35px,
                rgba(255, 62, 165, 0.1) 35px,
                rgba(255, 62, 165, 0.1) 70px
              )
            `
          }}
        >
          {/* Decorative Elements */}
          <div style={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: '80px',
            height: '80px',
            backgroundColor: '#FFC700',
            border: '3px solid #111111',
            transform: 'rotate(45deg)',
            boxShadow: '4px 4px 0px #111111'
          }} />
          
          <div style={{
            position: 'absolute',
            bottom: '15%',
            right: '15%',
            width: '60px',
            height: '60px',
            backgroundColor: '#FF3EA5',
            borderRadius: '50%',
            border: '3px solid #111111',
            boxShadow: '4px 4px 0px #111111'
          }} />
          
          <div style={{
            position: 'absolute',
            top: '40%',
            right: '10%',
            width: '40px',
            height: '40px',
            backgroundColor: '#FFFFFF',
            border: '3px solid #111111',
            boxShadow: '3px 3px 0px #111111'
          }} />
          
          {/* Content */}
          <div className="relative z-10 max-w-lg">
            <h1 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '48px',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#FFC700',
              marginBottom: '24px',
              lineHeight: '1.1',
              textShadow: '3px 3px 0px #111111'
            }}>
              Build Amazing
              <span style={{ 
                display: 'block', 
                color: '#FFFFFF',
                marginTop: '8px'
              }}>
                Digital Products
              </span>
            </h1>
            
            <p style={{
              fontSize: '18px',
              color: '#FFFFFF',
              marginBottom: '40px',
              lineHeight: '1.6',
              opacity: 0.95
            }}>
              Join thousands of businesses who trust WMX Services for their digital transformation journey.
            </p>
            
            {/* Features List */}
            <div className="space-y-4 mb-8">
              {[
                { icon: Zap, text: "Fast Development Process" },
                { icon: Shield, text: "Secure & Reliable Solutions" },
                { icon: TrendingUp, text: "Scalable Architecture" },
                { icon: Star, text: "24/7 Premium Support" }
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div style={{
                    backgroundColor: '#FFC700',
                    padding: '8px',
                    border: '2px solid #111111',
                    boxShadow: '2px 2px 0px #111111'
                  }}>
                    <feature.icon size={20} color="#111111" />
                  </div>
                  <span style={{
                    color: '#FFFFFF',
                    fontSize: '16px',
                    fontWeight: 500
                  }}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-12">
              {[
                { number: "500+", label: "Projects" },
                { number: "98%", label: "Satisfaction" },
                { number: "24/7", label: "Support" }
              ].map((stat, index) => (
                <div key={index} style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  padding: '12px',
                  textAlign: 'center',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 800,
                    color: '#FFC700',
                    textShadow: '2px 2px 0px rgba(0,0,0,0.3)'
                  }}>
                    {stat.number}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#FFFFFF',
                    textTransform: 'uppercase',
                    marginTop: '4px',
                    fontWeight: 600
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Testimonial */}
            <div style={{
              marginTop: '48px',
              padding: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(10px)'
            }}>
              <div className="flex gap-2 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#FFC700" color="#FFC700" />
                ))}
              </div>
              <p style={{
                color: '#FFFFFF',
                fontSize: '14px',
                lineHeight: '1.6',
                fontStyle: 'italic',
                marginBottom: '12px'
              }}>
                "WMX Services transformed our business with their exceptional digital solutions. Highly recommended!"
              </p>
              <div style={{
                color: '#FFC700',
                fontSize: '14px',
                fontWeight: 600
              }}>
                - Sarah Johnson, CEO TechCorp
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Verification Modal */}
      <VerificationModal
        isOpen={showVerificationModal}
        onClose={handleCloseVerificationModal}
        onSuccess={handleVerificationSuccess}
        userId={verificationUserId}
        email={verificationEmail}
        password={verificationPassword}
      />
    </div>
  );
}
