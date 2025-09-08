"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Mail, ArrowLeft, Home, AlertCircle } from "lucide-react";
import Link from "next/link";
import { RetroCard } from "@/components/ui/retro-card";
import { RetroButton } from "@/components/ui/retro-button";
import { PowerUpMascot } from "@/components/ui/power-up-mascot";

export default function VerifyRequestPage() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // Get email from URL params if available
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F5F2' }}>
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          {/* Success Card */}
          <RetroCard padding="lg">
            <div className="text-center">
              {/* Mascot */}
              <div className="flex justify-center mb-6">
                <PowerUpMascot mood="excited" size={100} />
              </div>

              {/* Success Icon */}
              <div className="inline-flex items-center justify-center mb-6">
                <div style={{
                  backgroundColor: '#00FF00',
                  border: '3px solid #111111',
                  boxShadow: '3px 3px 0px #111111',
                  padding: '20px',
                  borderRadius: '50%'
                }}>
                  <Mail size={40} color="#111111" strokeWidth={2} />
                </div>
              </div>

              {/* Title */}
              <h1 style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '32px',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: '#111111',
                marginBottom: '16px',
                textShadow: '2px 2px 0px #FFC700'
              }}>
                Check Your Email!
              </h1>

              {/* Description */}
              <p style={{
                fontSize: '16px',
                lineHeight: '24px',
                color: '#333333',
                marginBottom: '24px'
              }}>
                We've sent a magic link to
                {email && (
                  <>
                    <br />
                    <strong style={{ color: '#3D52F1' }}>{email}</strong>
                  </>
                )}
              </p>

              {/* Instructions */}
              <div style={{
                backgroundColor: '#FFC700',
                border: '2px solid #111111',
                boxShadow: '3px 3px 0px #111111',
                padding: '20px',
                marginBottom: '24px',
                textAlign: 'left'
              }}>
                <h3 style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#111111',
                  marginBottom: '12px'
                }}>
                  <AlertCircle size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
                  Next Steps:
                </h3>
                <ol style={{
                  fontSize: '14px',
                  lineHeight: '22px',
                  color: '#111111',
                  paddingLeft: '20px',
                  margin: '0'
                }}>
                  <li>Open your email inbox</li>
                  <li>Look for an email from <strong>WMX Services</strong></li>
                  <li>Click the "Sign In to WMX Services" button</li>
                  <li>If you don't see it, check your spam folder</li>
                </ol>
              </div>

              {/* Email Icon Animation */}
              <div className="mb-6">
                <div style={{
                  display: 'inline-block',
                  animation: 'bounce 2s infinite'
                }}>
                  <CheckCircle size={24} color="#00C853" />
                </div>
              </div>

              {/* Note */}
              <p style={{
                fontSize: '14px',
                color: '#666666',
                marginBottom: '24px'
              }}>
                The link will expire in 24 hours for security reasons.
                <br />
                Didn't receive the email? Check your spam folder or try signing in again.
              </p>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link href="/auth/signin">
                  <RetroButton 
                    variant="secondary" 
                    size="lg" 
                    className="w-full"
                  >
                    <ArrowLeft size={20} style={{ marginRight: '8px' }} />
                    Back to Sign In
                  </RetroButton>
                </Link>

                <Link href="/">
                  <RetroButton 
                    variant="outline" 
                    size="lg" 
                    className="w-full"
                  >
                    <Home size={20} style={{ marginRight: '8px' }} />
                    Go to Homepage
                  </RetroButton>
                </Link>
              </div>
            </div>
          </RetroCard>

          {/* Tips Card */}
          <RetroCard padding="md" className="mt-6">
            <h3 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '14px',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#111111',
              marginBottom: '12px'
            }}>
              💡 Pro Tips:
            </h3>
            <ul style={{
              fontSize: '13px',
              lineHeight: '20px',
              color: '#666666',
              paddingLeft: '20px',
              margin: '0'
            }}>
              <li>Add <strong>noreply@wmx-services.dev</strong> to your contacts</li>
              <li>Check your promotions or updates tab in Gmail</li>
              <li>The email subject will be "Sign in to localhost"</li>
            </ul>
          </RetroCard>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
}
