"use client";

import { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { Mail, ArrowRight, RefreshCw, CheckCircle, XCircle, Loader2, X } from "lucide-react";
import { RetroCard } from "./retro-card";
import { RetroButton } from "./retro-button";
import { PowerUpMascot } from "./power-up-mascot";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  email: string;
  password: string; // Add password for auto-login
}

export function VerificationModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  userId, 
  email,
  password 
}: VerificationModalProps) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  const [mascotMood, setMascotMood] = useState<"happy" | "sad" | "excited" | "thinking" | "error" | "success">("happy");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Reset states when modal opens
      setCode(["", "", "", "", "", ""]);
      setError("");
      setSuccess(false);
      setAttemptsRemaining(5);
      setMascotMood("happy");
      
      // Focus first input after a brief delay
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

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
      setError("Missing user information. Please try again.");
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
        
        // Auto-login user after verification success
        setTimeout(async () => {
          try {
            const loginResult = await signIn("credentials", {
              email,
              password,
              redirect: false,
            });
            
            if (loginResult?.ok) {
              // Redirect to dashboard after successful login
              window.location.href = "/admin/dashboard";
            } else {
              // If auto-login fails, just close modal and let user sign in manually
              onSuccess();
              onClose();
            }
          } catch (loginError) {
            console.error("Auto-login error:", loginError);
            // Fallback to manual signin
            onSuccess();
            onClose();
          }
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
      setError("Missing user information. Please try again.");
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
        // Show success message briefly instead of alert
        const successMsg = "New verification code sent to your email!";
        setError(""); // Clear any existing error
        inputRefs.current[0]?.focus();
        
        // Show temporary success message
        const tempDiv = document.createElement('div');
        tempDiv.style.cssText = `
          position: fixed; top: 20px; right: 20px; z-index: 9999;
          background: #4CAF50; color: white; padding: 12px 20px;
          border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500;
        `;
        tempDiv.textContent = successMsg;
        document.body.appendChild(tempDiv);
        
        setTimeout(() => {
          document.body.removeChild(tempDiv);
        }, 3000);
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

  const handleClose = () => {
    setCode(["", "", "", "", "", ""]);
    setError("");
    setSuccess(false);
    setMascotMood("happy");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      zIndex: 9999
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            width: '32px',
            height: '32px',
            backgroundColor: '#FF3EA5',
            border: '2px solid #111111',
            borderRadius: '50%',
            boxShadow: '3px 3px 0px #111111',
            color: '#FFFFFF',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.backgroundColor = '#FF1A8C';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.backgroundColor = '#FF3EA5';
          }}
        >
          <X size={16} />
        </button>

        <RetroCard padding="lg">
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <PowerUpMascot mood={mascotMood} size={80} />
            </div>
            <h2 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '24px',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#111111',
              marginBottom: '8px',
              textShadow: '2px 2px 0px #FFC700'
            }}>
              Verify Your Email
            </h2>
            <p style={{
              color: '#666666',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif'
            }}>
              Enter the 6-digit code sent to {email}
            </p>
          </div>

          {success ? (
            <div style={{ textAlign: 'center' }}>
              <CheckCircle 
                size={64} 
                style={{ 
                  color: '#00C851',
                  margin: '0 auto 20px'
                }}
              />
              <h3 style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '24px',
                fontWeight: 700,
                color: '#111111',
                marginBottom: '12px'
              }}>
                Email Verified!
              </h3>
              <p style={{
                color: '#666666',
                fontSize: '16px',
                marginBottom: '20px'
              }}>
                Logging you in and redirecting to dashboard...
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
                gap: '8px',
                marginBottom: '24px'
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
                      width: '45px',
                      height: '55px',
                      fontSize: '20px',
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
                      e.target.style.transform = 'scale(1.05)';
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
                marginTop: '16px',
                textAlign: 'center'
              }}>
                <p style={{
                  color: '#666666',
                  fontSize: '12px'
                }}>
                  Didn't receive the code? Check your spam folder
                </p>
              </div>
            </>
          )}
        </RetroCard>
      </div>
    </div>
  );
}
