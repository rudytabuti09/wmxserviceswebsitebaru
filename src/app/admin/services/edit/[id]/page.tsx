"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { RetroCard } from "@/components/ui/retro-card";
import { RetroButton } from "@/components/ui/retro-button";
import { RetroInput } from "@/components/ui/retro-input";
import { trpc } from "@/lib/trpc";
import { 
  Package, Save, X, Globe, Smartphone, Monitor, 
  Palette, TrendingUp, Cloud, ArrowLeft, Edit, Plus
} from "lucide-react";
import toast from "react-hot-toast";

interface EditServicePageProps {
  params: {
    id: string;
  };
}

export default function EditServicePage({ params }: EditServicePageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Web");
  const [price, setPrice] = useState<number>(0);
  const [icon, setIcon] = useState("Globe");
  const [isVisible, setIsVisible] = useState(true);
  const [order, setOrder] = useState<number>(1);
  const [features, setFeatures] = useState<string[]>([""]);

  // Fetch service data
  const { data: service, isLoading } = trpc.services.getById.useQuery(
    { id: params.id },
    {
      onSuccess: (data) => {
        if (data) {
          setTitle(data.title);
          setDescription(data.description);
          setCategory(data.category);
          setPrice(data.price);
          setIcon(data.icon);
          setIsVisible(data.isVisible);
          setOrder(data.order);
          setFeatures(data.features.length > 0 ? data.features : [""]);
        }
      },
      onError: (error) => {
        toast.error("Failed to load service data");
        router.push("/admin/services");
      }
    }
  );

  const updateService = trpc.services.update.useMutation({
    onSuccess: () => {
      toast.success("Service updated successfully!");
      router.push("/admin/services");
    },
    onError: (error) => {
      toast.error("Failed to update service");
      console.error(error);
      setIsSubmitting(false);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    const filteredFeatures = features.filter(f => f.trim() !== "");
    if (filteredFeatures.length === 0) {
      toast.error("Please add at least one feature");
      setIsSubmitting(false);
      return;
    }

    try {
      await updateService.mutateAsync({
        id: params.id,
        title: title.trim(),
        description: description.trim(),
        category,
        price,
        icon,
        isVisible,
        order,
        features: filteredFeatures
      });
    } catch (error) {
      console.error("Error updating service:", error);
    }
  };

  const addFeature = () => {
    setFeatures([...features, ""]);
  };

  const removeFeature = (index: number) => {
    if (features.length > 1) {
      setFeatures(features.filter((_, i) => i !== index));
    }
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  // Available icons
  const iconOptions = [
    { value: "Globe", label: "Globe", component: Globe },
    { value: "Smartphone", label: "Smartphone", component: Smartphone },
    { value: "Monitor", label: "Monitor", component: Monitor },
    { value: "Palette", label: "Palette", component: Palette },
    { value: "TrendingUp", label: "Trending Up", component: TrendingUp },
    { value: "Cloud", label: "Cloud", component: Cloud },
    { value: "Package", label: "Package", component: Package },
  ];

  const categoryOptions = [
    "Web", "Mobile", "Desktop", "Design", "Marketing", "Infrastructure", "Consulting"
  ];

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RetroCard padding="lg" className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full mb-4" />
          <p>Loading service data...</p>
        </RetroCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Back Navigation */}
          <div className="mb-8">
            <Link href="/admin/services">
              <button style={{
                backgroundColor: '#FFFFFF',
                color: '#111111',
                border: '3px solid #111111',
                boxShadow: '4px 4px 0px #111111',
                padding: '12px 24px',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FFC700';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}>
                <ArrowLeft size={16} />
                Back to Services
              </button>
            </Link>
          </div>

          {/* Page Header */}
          <div className="mb-12 text-center">
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
                <Edit size={40} strokeWidth={3} color="#111111" />
              </div>
            </div>
            <h1 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '48px',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#FFC700',
              marginBottom: '16px',
              textShadow: '2px 2px 0px #111111'
            }}>
              Edit Service
            </h1>
            <p style={{
              fontSize: '18px',
              color: '#666666',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Update service information and settings
            </p>
          </div>

          {/* Form */}
          <RetroCard padding="xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div>
                <h2 style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#111111',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    backgroundColor: '#FFC700',
                    padding: '8px',
                    border: '2px solid #111111',
                    boxShadow: '2px 2px 0px #111111'
                  }}>
                    <Package size={20} color="#111111" />
                  </div>
                  Basic Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#111111',
                      marginBottom: '8px',
                      textTransform: 'uppercase'
                    }}>
                      Service Title *
                    </label>
                    <RetroInput
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Web Development"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#111111',
                      marginBottom: '8px',
                      textTransform: 'uppercase'
                    }}>
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: '#FFFFFF',
                        color: '#111111',
                        border: '3px solid #111111',
                        boxShadow: '3px 3px 0px #111111',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '16px',
                        fontWeight: 500
                      }}
                      required
                    >
                      {categoryOptions.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#111111',
                      marginBottom: '8px',
                      textTransform: 'uppercase'
                    }}>
                      Price (IDR) *
                    </label>
                    <RetroInput
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      placeholder="25000000"
                      min="0"
                      required
                    />
                    <p style={{
                      fontSize: '12px',
                      color: '#888',
                      marginTop: '4px'
                    }}>
                      Starting from price in Indonesian Rupiah
                    </p>
                  </div>

                  {/* Order */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#111111',
                      marginBottom: '8px',
                      textTransform: 'uppercase'
                    }}>
                      Display Order *
                    </label>
                    <RetroInput
                      type="number"
                      value={order}
                      onChange={(e) => setOrder(Number(e.target.value))}
                      placeholder="1"
                      min="1"
                      required
                    />
                    <p style={{
                      fontSize: '12px',
                      color: '#888',
                      marginTop: '4px'
                    }}>
                      Lower numbers appear first
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-6">
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#111111',
                    marginBottom: '8px',
                    textTransform: 'uppercase'
                  }}>
                    Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your service in detail..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: '#FFFFFF',
                      color: '#111111',
                      border: '3px solid #111111',
                      boxShadow: '3px 3px 0px #111111',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      fontWeight: 500,
                      resize: 'vertical'
                    }}
                    required
                  />
                </div>
              </div>

              {/* Icon Selection */}
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#111111',
                  marginBottom: '16px',
                  textTransform: 'uppercase'
                }}>
                  Select Icon
                </h3>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-4">
                  {iconOptions.map(iconOption => {
                    const IconComponent = iconOption.component;
                    return (
                      <button
                        key={iconOption.value}
                        type="button"
                        onClick={() => setIcon(iconOption.value)}
                        style={{
                          backgroundColor: icon === iconOption.value ? '#FFC700' : '#FFFFFF',
                          color: '#111111',
                          border: '3px solid #111111',
                          boxShadow: '3px 3px 0px #111111',
                          padding: '16px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        onMouseEnter={(e) => {
                          if (icon !== iconOption.value) {
                            e.currentTarget.style.backgroundColor = '#00FFFF';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (icon !== iconOption.value) {
                            e.currentTarget.style.backgroundColor = '#FFFFFF';
                          }
                        }}
                      >
                        <IconComponent size={24} />
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          textTransform: 'uppercase'
                        }}>
                          {iconOption.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Features */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#111111',
                    textTransform: 'uppercase'
                  }}>
                    Features *
                  </h3>
                  <button
                    type="button"
                    onClick={addFeature}
                    style={{
                      backgroundColor: '#00FF00',
                      color: '#111111',
                      border: '2px solid #111111',
                      boxShadow: '2px 2px 0px #111111',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Plus size={14} />
                    Add Feature
                  </button>
                </div>

                <div className="space-y-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex gap-3">
                      <RetroInput
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder={`Feature ${index + 1}`}
                        className="flex-1"
                      />
                      {features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          style={{
                            backgroundColor: '#FF3EA5',
                            color: '#FFFFFF',
                            border: '2px solid #111111',
                            boxShadow: '2px 2px 0px #111111',
                            padding: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Visibility */}
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#111111',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={(e) => setIsVisible(e.target.checked)}
                    style={{
                      width: '20px',
                      height: '20px',
                      accentColor: '#FFC700'
                    }}
                  />
                  Make this service visible on the public page
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-8">
                <RetroButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Update Service
                    </>
                  )}
                </RetroButton>

                <Link href="/admin/services" className="flex-1">
                  <RetroButton
                    type="button"
                    variant="secondary" 
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    <X size={20} />
                    Cancel
                  </RetroButton>
                </Link>
              </div>
            </form>
          </RetroCard>
        </div>
      </main>
    </div>
  );
}
