"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, ArrowRight, RefreshCw, CheckCircle, XCircle, Loader2, Home } from "lucide-react";
import Link from "next/link";
import { RetroCard } from "@/components/ui/retro-card";
import { RetroButton } from "@/components/ui/retro-button";
import { PowerUpMascot } from "@/components/ui/power-up-mascot";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  const [mascotMood, setMascotMood] = useState<"happy" | "sad" | "excited" | "thinking" | "error" | "success">("happy");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Get userId from URL params (passed from signup)
  const userId = searchParams.get("userId");
  const email = searchParams.get("email");

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Clear error when user starts typing
    if (error) {
      setError("");
      setMascotMood("happy");
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Handle paste
    if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, "").slice(0, 6);
        if (digits) {
          const newCode = [...code];
          for (let i = 0; i < digits.length && i < 6; i++) {
            newCode[i] = digits[i];
          }
          setCode(newCode);
          // Focus the next empty input or the last one
          const nextEmptyIndex = newCode.findIndex(c => !c);
          const focusIndex = nextEmptyIndex === -1 ? 5 : Math.min(nextEmptyIndex, 5);
          inputRefs.current[focusIndex]?.focus();
        }
      });
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const digits = pastedText.replace(/\D/g, "").slice(0, 6);
    
    if (digits) {
      const newCode = [...code];
      for (let i = 0; i < digits.length && i < 6; i++) {
        newCode[i] = digits[i];
      }
      setCode(newCode);
      
      // Focus the next empty input or the last one
      const nextEmptyIndex = newCode.findIndex(c => !c);
      const focusIndex = nextEmptyIndex === -1 ? 5 : Math.min(nextEmptyIndex, 5);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleVerify = async () => {
    const verificationCode = code.join("");
    
    if (verificationCode.length !== 6) {
      setError("Please enter the complete 6-digit code");
      setMascotMood("error");
      return;
    }

    if (!userId) {
      setError("Missing user information. Please sign up again.");
      setMascotMood("error");
      return;
    }

    setIsLoading(true);
    setError("");
    setMascotMood("thinking");

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          code: verificationCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setMascotMood("success");
        setTimeout(() => {
          router.push("/auth/signin");
        }, 2000);
      } else {
        setError(data.error || "Verification failed");
        if (data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.attemptsRemaining);
        }
        setMascotMood("error");
        
        // Clear code on error
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      setMascotMood("error");
    } finally {
      setIsLoading(false);
      if (!success) {
        setTimeout(() => setMascotMood("happy"), 3000);
      }
    }
  };

  const handleResendCode = async () => {
    if (!userId && !email) {
      setError("Missing user information. Please sign up again.");
      setMascotMood("error");
      return;
    }

    setIsResending(true);
    setError("");
    setMascotMood("thinking");

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setError("");
        setCode(["", "", "", "", "", ""]);
        setAttemptsRemaining(5);
        setMascotMood("excited");
        alert("New verification code sent to your email!");
        inputRefs.current[0]?.focus();
      } else {
        setError(data.error || "Failed to resend code");
        setMascotMood("error");
      }
    } catch (error) {
      setError("Failed to resend code. Please try again.");
      setMascotMood("error");
    } finally {
      setIsResending(false);
      setTimeout(() => setMascotMood("happy"), 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12"
      style={{
        backgroundColor: '#3D52F1',
        backgroundImage: `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.1) 2px,
            rgba(0, 0, 0, 0.1) 4px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.1) 2px,
            rgba(0, 0, 0, 0.1) 4px
          )
        `,
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div style={{ marginBottom: '16px' }}>
            <PowerUpMascot mood={mascotMood} size={100} />
          </div>
          <h1 style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '36px',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: '#FFC700',
            marginBottom: '8px',
            textShadow: '4px 4px 0px rgba(0,0,0,0.3)'
          }}>
            Verify Email
          </h1>
          <p style={{
            color: '#FFFFFF',
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif'
          }}>
            Enter the 6-digit code sent to {email || 'your email'}
          </p>
        </div>

        <RetroCard padding="lg">
          {success ? (
            <div className="text-center">
              <CheckCircle 
                size={64} 
                style={{ 
                  color: '#00C851',
                  margin: '0 auto 20px'
                }}
              />
              <h2 style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '24px',
                fontWeight: 700,
                color: '#111111',
                marginBottom: '12px'
              }}>
                Email Verified!
              </h2>
              <p style={{
                color: '#666666',
                fontSize: '16px',
                marginBottom: '20px'
              }}>
                Redirecting to sign in...
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div style={{
                  padding: '12px',
                  marginBottom: '20px',
                  backgroundColor: '#FFE4E4',
                  border: '2px solid #FF0000',
                  borderRadius: '8px',
                  color: '#CC0000',
                  fontSize: '14px',
                  fontWeight: 500,
                  textAlign: 'center'
                }}>
                  {error}
                  {attemptsRemaining < 5 && attemptsRemaining > 0 && (
                    <div style={{ marginTop: '4px', fontSize: '12px' }}>
                      {attemptsRemaining} attempts remaining
                    </div>
                  )}
                </div>
              )}

              {/* Code Input Fields */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '30px'
              }}>
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    disabled={isLoading || success}
                    style={{
                      width: '50px',
                      height: '60px',
                      fontSize: '24px',
                      fontWeight: '700',
                      textAlign: 'center',
                      border: '3px solid #111111',
                      borderRadius: '8px',
                      backgroundColor: digit ? '#FFC700' : '#FFFFFF',
                      color: '#111111',
                      outline: 'none',
                      transition: 'all 0.2s',
                      boxShadow: digit ? '3px 3px 0px #FF3EA5' : 'none',
                      fontFamily: 'Monaco, Consolas, monospace'
                    }}
                    onFocus={(e) => {
                      e.target.style.transform = 'scale(1.1)';
                      e.target.style.borderColor = '#3D52F1';
                    }}
                    onBlur={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.borderColor = '#111111';
                    }}
                  />
                ))}
              </div>

              {/* Verify Button */}
              <RetroButton
                onClick={handleVerify}
                disabled={isLoading || code.join("").length !== 6}
                className="w-full mb-4"
                variant="primary"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Email
                    <ArrowRight size={20} className="ml-2" />
                  </>
                )}
              </RetroButton>

              {/* Resend Code Button */}
              <RetroButton
                onClick={handleResendCode}
                disabled={isResending}
                className="w-full"
                variant="secondary"
              >
                {isResending ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw size={20} className="mr-2" />
                    Resend Code
                  </>
                )}
              </RetroButton>

              <div style={{
                marginTop: '20px',
                paddingTop: '20px',
                borderTop: '2px solid #E0E0E0',
                textAlign: 'center'
              }}>
                <p style={{
                  color: '#666666',
                  fontSize: '14px',
                  marginBottom: '8px'
                }}>
                  Didn't receive the code? Check your spam folder
                </p>
                <Link
                  href="/auth/signin"
                  style={{
                    color: '#3D52F1',
                    fontSize: '14px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#FF3EA5'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#3D52F1'}
                >
                  <Home size={16} />
                  Back to Sign In
                </Link>
              </div>
            </>
          )}
        </RetroCard>
      </div>
    </div>
  );
}

// Loading fallback component
function VerifyEmailLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12"
      style={{
        backgroundColor: '#3D52F1',
        backgroundImage: `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.1) 2px,
            rgba(0, 0, 0, 0.1) 4px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.1) 2px,
            rgba(0, 0, 0, 0.1) 4px
          )
        `,
      }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div style={{ marginBottom: '16px' }}>
            <PowerUpMascot mood="thinking" size={100} />
          </div>
          <h1 style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '36px',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: '#FFC700',
            marginBottom: '8px',
            textShadow: '4px 4px 0px rgba(0,0,0,0.3)'
          }}>
            Verify Email
          </h1>
          <p style={{
            color: '#FFFFFF',
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif'
          }}>
            Loading...
          </p>
        </div>
        <RetroCard padding="lg">
          <div className="text-center">
            <Loader2 className="animate-spin mx-auto mb-4" size={48} style={{ color: '#3D52F1' }} />
            <p>Preparing verification...</p>
          </div>
        </RetroCard>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
