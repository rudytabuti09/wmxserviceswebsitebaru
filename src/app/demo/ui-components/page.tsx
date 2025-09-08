"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RetroCard } from "@/components/ui/retro-card";
import { RetroButton } from "@/components/ui/retro-button";
import { RetroErrorBoundary } from "@/components/ui/error-boundary";
import { NetworkError, NetworkStatus } from "@/components/ui/network-error";
import { RetroImage, RetroAvatar } from "@/components/ui/retro-image";
import { RetroInput, RetroTextarea, RetroSelect, RetroForm } from "@/components/ui/retro-form";
import { 
  RetroSkeleton, 
  RetroSkeletonGrid, 
  RetroSkeletonStatsGrid,
  RetroSkeletonDashboard 
} from "@/components/ui/retro-skeleton";

// Dummy component that throws error
function ErrorTrigger() {
  const [shouldError, setShouldError] = useState(false);
  
  if (shouldError) {
    throw new Error("This is a demo error to show the Error Boundary!");
  }
  
  return (
    <div>
      <p style={{ marginBottom: "16px" }}>This component is working fine.</p>
      <RetroButton 
        onClick={() => setShouldError(true)}
        variant="secondary"
        size="sm"
      >
        Trigger Error
      </RetroButton>
    </div>
  );
}

export default function UIComponentsDemo() {
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [showNetworkError, setShowNetworkError] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    service: ""
  });

  // Demo form validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return null;
  };

  return (
    <div className="min-h-screen">
      <Header />
      <NetworkStatus />
      
      <main className="py-20">
        <div className="container mx-auto px-6">
          {/* Page Title */}
          <div className="text-center mb-16">
            <h1 style={{
              fontFamily: "Poppins, sans-serif",
              fontSize: "48px",
              fontWeight: 800,
              textTransform: "uppercase",
              color: "#FFC700",
              marginBottom: "16px",
              textShadow: "2px 2px 0px #111111"
            }}>
              UI Components Demo
            </h1>
            <p style={{
              fontSize: "18px",
              color: "#FFFFFF",
              maxWidth: "700px",
              margin: "0 auto"
            }}>
              Demonstration of enhanced Loading States & Error Handling UI components
            </p>
          </div>

          {/* Skeleton Loading Demo */}
          <section className="mb-16">
            <h2 style={{
              fontFamily: "Poppins, sans-serif",
              fontSize: "32px",
              fontWeight: 700,
              color: "#FFC700",
              marginBottom: "24px",
              textTransform: "uppercase"
            }}>
              1. Skeleton Loading States
            </h2>
            
            <div className="mb-8">
              <RetroButton
                onClick={() => setShowSkeleton(!showSkeleton)}
                variant="primary"
                size="md"
              >
                {showSkeleton ? "Show Real Content" : "Show Skeleton Loading"}
              </RetroButton>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <RetroCard padding="lg">
                <h3 style={{
                  fontFamily: "Poppins, sans-serif",
                  fontSize: "20px",
                  fontWeight: 700,
                  marginBottom: "16px",
                  color: "#111111"
                }}>
                  Card Skeletons
                </h3>
                {showSkeleton ? (
                  <RetroSkeletonGrid count={3} />
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    <RetroCard padding="md">
                      <h4 style={{ fontWeight: 700, marginBottom: "8px" }}>Real Content 1</h4>
                      <p>This is actual content that would load after the skeleton.</p>
                    </RetroCard>
                    <RetroCard padding="md">
                      <h4 style={{ fontWeight: 700, marginBottom: "8px" }}>Real Content 2</h4>
                      <p>Another piece of content with more details.</p>
                    </RetroCard>
                    <RetroCard padding="md">
                      <h4 style={{ fontWeight: 700, marginBottom: "8px" }}>Real Content 3</h4>
                      <p>Final content item showing the complete loading experience.</p>
                    </RetroCard>
                  </div>
                )}
              </RetroCard>

              <RetroCard padding="lg">
                <h3 style={{
                  fontFamily: "Poppins, sans-serif",
                  fontSize: "20px",
                  fontWeight: 700,
                  marginBottom: "16px",
                  color: "#111111"
                }}>
                  Stats Dashboard Skeleton
                </h3>
                {showSkeleton ? (
                  <>
                    <RetroSkeletonStatsGrid count={4} />
                    <div className="mt-6">
                      <RetroSkeleton variant="card" height="200px" />
                    </div>
                  </>
                ) : (
                  <div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {[
                        { label: "Projects", value: "24", color: "#FFC700" },
                        { label: "Clients", value: "12", color: "#FF3EA5" },
                        { label: "Revenue", value: "$45K", color: "#00FF00" },
                        { label: "Tasks", value: "89", color: "#00FFFF" }
                      ].map((stat, index) => (
                        <div key={index} style={{
                          backgroundColor: "#FFFFFF",
                          border: "2px solid #111111",
                          boxShadow: "3px 3px 0px #111111",
                          padding: "16px",
                          textAlign: "center"
                        }}>
                          <div style={{
                            fontSize: "24px",
                            fontWeight: 800,
                            color: stat.color,
                            marginBottom: "8px"
                          }}>{stat.value}</div>
                          <div style={{ fontSize: "12px", color: "#111111" }}>{stat.label}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{
                      backgroundColor: "#E0E0E0",
                      border: "2px solid #111111",
                      height: "200px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      color: "#111111"
                    }}>
                      📊 Chart Would Be Here
                    </div>
                  </div>
                )}
              </RetroCard>
            </div>
          </section>

          {/* Progressive Image Loading Demo */}
          <section className="mb-16">
            <h2 style={{
              fontFamily: "Poppins, sans-serif",
              fontSize: "32px",
              fontWeight: 700,
              color: "#FFC700",
              marginBottom: "24px",
              textTransform: "uppercase"
            }}>
              2. Progressive Image Loading
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <RetroCard padding="lg">
                <h3 style={{
                  fontFamily: "Poppins, sans-serif",
                  fontSize: "18px",
                  fontWeight: 700,
                  marginBottom: "16px",
                  color: "#111111"
                }}>
                  Normal Image
                </h3>
                <RetroImage
                  src="https://picsum.photos/300/200?random=1"
                  alt="Demo image 1"
                  width="100%"
                  height="200px"
                  className="mb-4"
                />
                <p style={{ fontSize: "14px", color: "#111111" }}>
                  Image with lazy loading and error handling
                </p>
              </RetroCard>

              <RetroCard padding="lg">
                <h3 style={{
                  fontFamily: "Poppins, sans-serif",
                  fontSize: "18px",
                  fontWeight: 700,
                  marginBottom: "16px",
                  color: "#111111"
                }}>
                  Failed Image
                </h3>
                <RetroImage
                  src="https://invalid-url-that-will-fail.com/image.jpg"
                  alt="Demo failed image"
                  width="100%"
                  height="200px"
                  className="mb-4"
                  retryCount={2}
                />
                <p style={{ fontSize: "14px", color: "#111111" }}>
                  Image that fails to load with error state
                </p>
              </RetroCard>

              <RetroCard padding="lg">
                <h3 style={{
                  fontFamily: "Poppins, sans-serif",
                  fontSize: "18px",
                  fontWeight: 700,
                  marginBottom: "16px",
                  color: "#111111"
                }}>
                  Avatar Component
                </h3>
                <div className="flex justify-center mb-4">
                  <RetroAvatar
                    src="https://picsum.photos/150/150?random=2"
                    alt="User avatar"
                    size="120px"
                    fallback="WX"
                  />
                </div>
                <p style={{ fontSize: "14px", color: "#111111", textAlign: "center" }}>
                  Avatar with fallback text
                </p>
              </RetroCard>
            </div>
          </section>

          {/* Error Boundary Demo */}
          <section className="mb-16">
            <h2 style={{
              fontFamily: "Poppins, sans-serif",
              fontSize: "32px",
              fontWeight: 700,
              color: "#FFC700",
              marginBottom: "24px",
              textTransform: "uppercase"
            }}>
              3. Error Boundary
            </h2>
            
            <RetroCard padding="lg">
              <h3 style={{
                fontFamily: "Poppins, sans-serif",
                fontSize: "20px",
                fontWeight: 700,
                marginBottom: "16px",
                color: "#111111"
              }}>
                Error Boundary Demo
              </h3>
              <p style={{ marginBottom: "16px", color: "#111111" }}>
                Click the button below to trigger an error and see the Error Boundary in action:
              </p>
              
              <RetroErrorBoundary showDetails={true}>
                <ErrorTrigger />
              </RetroErrorBoundary>
            </RetroCard>
          </section>

          {/* Network Error Demo */}
          <section className="mb-16">
            <h2 style={{
              fontFamily: "Poppins, sans-serif",
              fontSize: "32px",
              fontWeight: 700,
              color: "#FFC700",
              marginBottom: "24px",
              textTransform: "uppercase"
            }}>
              4. Network Error Handling
            </h2>
            
            <div className="mb-8">
              <RetroButton
                onClick={() => setShowNetworkError(!showNetworkError)}
                variant="secondary"
                size="md"
              >
                {showNetworkError ? "Hide Network Error" : "Show Network Error"}
              </RetroButton>
            </div>

            {showNetworkError && (
              <NetworkError
                error="Failed to connect to the server. Please check your internet connection."
                onRetry={() => {
                  console.log("Retrying network request...");
                  setTimeout(() => setShowNetworkError(false), 2000);
                }}
                retryCount={1}
                maxRetries={3}
                showDetails={true}
                variant="inline"
                autoRetry={false}
              />
            )}
          </section>

          {/* Enhanced Form Demo */}
          <section className="mb-16">
            <h2 style={{
              fontFamily: "Poppins, sans-serif",
              fontSize: "32px",
              fontWeight: 700,
              color: "#FFC700",
              marginBottom: "24px",
              textTransform: "uppercase"
            }}>
              5. Enhanced Form Validation
            </h2>
            
            <RetroCard padding="lg">
              <RetroForm
                onSubmit={(e) => {
                  e.preventDefault();
                  console.log("Form submitted:", formData);
                }}
                errors={[]}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <RetroInput
                    label="Full Name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    validation={{
                      required: true,
                      minLength: 2
                    }}
                    hint="At least 2 characters required"
                  />

                  <RetroInput
                    label="Email Address"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    validation={{
                      required: true,
                      custom: validateEmail
                    }}
                    success={formData.email && !validateEmail(formData.email) ? "Valid email address" : undefined}
                  />

                  <RetroInput
                    label="Password"
                    type="password"
                    placeholder="Enter secure password"
                    showPasswordToggle={true}
                    validation={{
                      required: true,
                      minLength: 8
                    }}
                    hint="Minimum 8 characters"
                  />

                  <RetroSelect
                    label="Service Type"
                    placeholder="Select a service"
                    value={formData.service}
                    onChange={(e) => setFormData({...formData, service: e.target.value})}
                    options={[
                      { value: "web", label: "Web Development" },
                      { value: "mobile", label: "Mobile App" },
                      { value: "desktop", label: "Desktop App" },
                      { value: "consultation", label: "Consultation" }
                    ]}
                    validation={{ required: true }}
                  />
                </div>

                <div className="mt-6">
                  <RetroTextarea
                    label="Project Description"
                    placeholder="Tell us about your project..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    validation={{
                      required: true,
                      minLength: 10,
                      maxLength: 500
                    }}
                    rows={4}
                    showCharCount={true}
                    hint="Describe your project requirements in detail"
                  />
                </div>

                <div className="mt-8">
                  <RetroButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                  >
                    Submit Demo Form
                  </RetroButton>
                </div>
              </RetroForm>
            </RetroCard>
          </section>

          {/* Summary */}
          <section className="mb-16">
            <RetroCard padding="lg" style={{ backgroundColor: "#FFF8DC" }}>
              <h2 style={{
                fontFamily: "Poppins, sans-serif",
                fontSize: "24px",
                fontWeight: 800,
                color: "#111111",
                marginBottom: "16px",
                textTransform: "uppercase"
              }}>
                🎉 Implementation Complete!
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 style={{
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#111111",
                    marginBottom: "12px"
                  }}>
                    ✅ Completed Components:
                  </h3>
                  <ul style={{ 
                    listStyle: "none", 
                    padding: 0,
                    fontSize: "14px",
                    color: "#111111"
                  }}>
                    <li>🎨 Enhanced Skeleton Components</li>
                    <li>🖼️ Progressive Image Loading</li>
                    <li>⚠️ Error Boundary with Retro Theme</li>
                    <li>🌐 Network Error Handler</li>
                    <li>📝 Visual Form Validation</li>
                    <li>🎮 Interactive 404 Page</li>
                  </ul>
                </div>
                
                <div>
                  <h3 style={{
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#111111",
                    marginBottom: "12px"
                  }}>
                    🎯 Key Features:
                  </h3>
                  <ul style={{ 
                    listStyle: "none", 
                    padding: 0,
                    fontSize: "14px",
                    color: "#111111"
                  }}>
                    <li>🎪 Consistent retro theme</li>
                    <li>⚡ Smooth animations</li>
                    <li>🔄 Auto-retry functionality</li>
                    <li>♿ Accessibility support</li>
                    <li>📱 Mobile responsive</li>
                    <li>🎭 Interactive feedback</li>
                  </ul>
                </div>
              </div>
            </RetroCard>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
