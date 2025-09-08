"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RetroCard } from "@/components/ui/retro-card";
import { RetroButton } from "@/components/ui/retro-button";
import { RetroInput } from "@/components/ui/retro-input";
import { trpc } from "@/lib/trpc";
import { Palette, ArrowLeft, Image, FileText, Tag, Link as LinkIcon, Star } from "lucide-react";

export default function CreatePortfolioPage() {
  const router = useRouter();
  const { data: session } = useSession();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    category: "Web" as const,
    liveUrl: "",
    featured: false,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const createPortfolio = trpc.portfolio.create.useMutation({
    onSuccess: () => {
      router.push("/admin/portfolio");
    },
    onError: (error) => {
      console.error("Error creating portfolio item:", error);
      // Log all properties of the error object
      console.error("Full error object:", JSON.stringify(error, null, 2));
      console.error("Error message:", error?.message);
      console.error("Error data:", error?.data);
      console.error("Error shape:", error?.shape);
      
      const errorMessage = error?.message || "An unexpected error occurred";
      alert("Error creating portfolio item: " + errorMessage);
    },
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log("Form data before send:", formData);
      console.log("Current session:", session);
      
      // Create clean payload
      const payload = {
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl,
        category: formData.category,
        featured: formData.featured,
        liveUrl: formData.liveUrl || null, // Send null instead of undefined
      };
      
      console.log("Sending payload:", payload);
      console.log("Payload JSON:", JSON.stringify(payload));
      
      await createPortfolio.mutateAsync(payload);
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
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
  
  return (
    <div className="min-h-screen" style={{
      backgroundColor: '#3D52F1',
      backgroundImage: `
        repeating-linear-gradient(
          0deg,
          rgba(255, 199, 0, 0.1),
          rgba(255, 199, 0, 0.1) 2px,
          transparent 2px,
          transparent 40px
        ),
        repeating-linear-gradient(
          90deg,
          rgba(255, 199, 0, 0.1),
          rgba(255, 199, 0, 0.1) 2px,
          transparent 2px,
          transparent 40px
        )
      `
    }}>
      <Header />
      
      {/* Floating Retro Decorations */}
      <div style={{
        position: 'fixed',
        top: '15%',
        left: '5%',
        width: '60px',
        height: '60px',
        backgroundColor: '#FFC700',
        border: '3px solid #111111',
        transform: 'rotate(45deg)',
        zIndex: 1,
        opacity: 0.6
      }} />
      <div style={{
        position: 'fixed',
        bottom: '20%',
        right: '8%',
        width: '40px',
        height: '40px',
        backgroundColor: '#FF3EA5',
        borderRadius: '50%',
        border: '3px solid #111111',
        zIndex: 1,
        opacity: 0.6
      }} />
      
      <main className="py-20 relative z-10">
        <div className="container mx-auto px-6 max-w-5xl">
          {/* Retro Back Navigation */}
          <div className="mb-8">
            <Link
              href="/admin/portfolio"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#FFFFFF',
                color: '#111111',
                padding: '12px 20px',
                border: '2px solid #111111',
                boxShadow: '3px 3px 0px #111111',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(-2px, -2px)';
                e.currentTarget.style.backgroundColor = '#FFC700';
                e.currentTarget.style.boxShadow = '5px 5px 0px #111111';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translate(0, 0)';
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.boxShadow = '3px 3px 0px #111111';
              }}
            >
              <ArrowLeft size={16} />
              Back to Portfolio
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
                <Palette size={40} strokeWidth={3} color="#FFFFFF" />
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
              Create Portfolio Item
            </h1>
            <p style={{
              fontSize: '18px',
              color: '#FFFFFF',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Showcase your amazing work and attract new clients!
            </p>
          </div>
          
          {/* Create Portfolio Form */}
          <RetroCard padding="xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Portfolio Title */}
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
                    <FileText size={16} />
                    Project Title *
                  </label>
                  <RetroInput
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter project title"
                    required
                  />
                </div>
                
                {/* Category */}
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
                    <Tag size={16} />
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    required
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
                    <option value="Web">Web Development</option>
                    <option value="Mobile">Mobile App</option>
                    <option value="Desktop">Desktop Application</option>
                    <option value="Design">UI/UX Design</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                {/* Image URL */}
                <div className="lg:col-span-2">
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
                    <Image size={16} />
                    Project Image URL *
                  </label>
                  <RetroInput
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                  <p style={{
                    fontSize: '12px',
                    color: '#666',
                    marginTop: '4px'
                  }}>
                    💡 Tip: Upload your image to a hosting service like Cloudinary, Imgur, or use a CDN URL
                  </p>
                </div>
                
                {/* Live URL */}
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
                    <LinkIcon size={16} />
                    Live Demo URL
                  </label>
                  <RetroInput
                    type="url"
                    value={formData.liveUrl}
                    onChange={(e) => handleInputChange("liveUrl", e.target.value)}
                    placeholder="https://your-project-demo.com"
                  />
                </div>
                
                {/* Featured Toggle */}
                <div className="lg:col-span-2">
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
                    <Star size={16} />
                    Featured Project
                  </label>
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
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => handleInputChange("featured", e.target.checked)}
                      style={{
                        width: '20px',
                        height: '20px',
                        accentColor: '#FF3EA5'
                      }}
                    />
                    <label 
                      htmlFor="featured"
                      style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#111111',
                        cursor: 'pointer'
                      }}
                    >
                      ⭐ Show this project as featured on homepage
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Description */}
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
                  <FileText size={16} />
                  Project Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={6}
                  placeholder="Describe the project, technologies used, challenges solved, and key features..."
                  required
                  style={{
                    width: '100%',
                    padding: '16px',
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
              
              {/* Image Preview */}
              {formData.imageUrl && (
                <div>
                  <label style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#111111',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Image Preview
                  </label>
                  <div style={{
                    border: '3px solid #111111',
                    boxShadow: '4px 4px 0px #111111',
                    overflow: 'hidden',
                    maxWidth: '400px'
                  }}>
                    <img 
                      src={formData.imageUrl} 
                      alt="Preview"
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
              
              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <RetroButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting || !formData.title || !formData.description || !formData.imageUrl}
                  className="min-w-[200px]"
                >
                  {isSubmitting ? "Creating..." : "🎨 Create Portfolio Item"}
                </RetroButton>
                
                <Link href="/admin/portfolio">
                  <RetroButton
                    type="button"
                    variant="secondary" 
                    size="lg"
                    className="min-w-[200px]"
                  >
                    Cancel
                  </RetroButton>
                </Link>
              </div>
            </form>
          </RetroCard>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
