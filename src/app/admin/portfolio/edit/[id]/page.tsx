"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RetroCard } from "@/components/ui/retro-card";
import { RetroButton } from "@/components/ui/retro-button";
import { RetroInput } from "@/components/ui/retro-input";
import { trpc } from "@/lib/trpc";
import { Edit3, ArrowLeft, Image, FileText, Tag, Link as LinkIcon, Star, Loader } from "lucide-react";

export default function EditPortfolioPage() {
  const router = useRouter();
  const params = useParams();
  const portfolioId = params.id as string;
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
  const [isLoading, setIsLoading] = useState(true);
  
  // Get portfolio data
  const { data: portfolio, isLoading: portfolioLoading } = trpc.portfolio.getById.useQuery(
    { id: portfolioId },
    { enabled: !!portfolioId }
  );
  
  const updatePortfolio = trpc.portfolio.update.useMutation({
    onSuccess: () => {
      router.push("/admin/portfolio");
    },
    onError: (error) => {
      console.error("Error updating portfolio item:", error);
      alert("Error updating portfolio item: " + error.message);
    },
  });
  
  // Pre-fill form when portfolio data loads
  useEffect(() => {
    if (portfolio) {
      setFormData({
        title: portfolio.title,
        description: portfolio.description,
        imageUrl: portfolio.imageUrl,
        category: portfolio.category as any,
        liveUrl: portfolio.liveUrl || "",
        featured: portfolio.featured,
      });
      setIsLoading(false);
    }
  }, [portfolio]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await updatePortfolio.mutateAsync({
        id: portfolioId,
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl,
        category: formData.category,
        liveUrl: formData.liveUrl || undefined,
        featured: formData.featured,
      });
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
  
  if (isLoading || portfolioLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Loader className="animate-spin" size={32} />
              <span className="text-xl font-semibold">Loading portfolio item...</span>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!portfolio) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-20">
          <div className="container mx-auto px-4 text-center">
            <RetroCard padding="xl" className="max-w-md mx-auto">
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>❌</div>
              <h1 className="text-2xl font-bold mb-4">Portfolio Item Not Found</h1>
              <p className="mb-6">The portfolio item you're looking for doesn't exist.</p>
              <Link href="/admin/portfolio">
                <RetroButton variant="primary">
                  Back to Portfolio
                </RetroButton>
              </Link>
            </RetroCard>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Back Navigation */}
          <div className="mb-6">
            <Link
              href="/admin/portfolio"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary-600 transition-colors"
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
                backgroundColor: '#FFC700',
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
                <Edit3 size={40} strokeWidth={3} color="#111111" />
              </div>
            </div>
            <h1 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '42px',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#FFC700',
              marginBottom: '16px',
              textShadow: '2px 2px 0px #111111'
            }}>
              Edit Portfolio Item
            </h1>
            <p style={{
              fontSize: '18px',
              color: '#FFFFFF',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Update your portfolio showcase and keep it fresh!
            </p>
          </div>
          
          {/* Edit Portfolio Form */}
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
                  {isSubmitting ? "Updating..." : "💾 Update Portfolio Item"}
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
