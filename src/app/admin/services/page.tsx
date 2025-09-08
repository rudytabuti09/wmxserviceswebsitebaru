"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { RetroCard } from "@/components/ui/retro-card";
import { RetroButton } from "@/components/ui/retro-button";
import { trpc } from "@/lib/trpc";
import { 
  Package, Plus, Eye, EyeOff, Edit, Trash2, Star, 
  Globe, Smartphone, Monitor, Palette, TrendingUp, 
  Cloud, ArrowUp, ArrowDown, DollarSign
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminServicesPage() {
  const { data: session } = useSession();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  
  const { data: servicesData, isLoading, refetch } = trpc.services.getAll.useQuery();
  
  // Ensure services is always an array
  const services = Array.isArray(servicesData) ? servicesData : [];
  
  const toggleVisibility = trpc.services.toggleVisibility.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Service visibility updated!");
    },
    onError: (error) => {
      toast.error("Failed to update visibility");
      console.error(error);
    }
  });

  const deleteService = trpc.services.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Service deleted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to delete service");
      console.error(error);
    }
  });

  const updateOrder = trpc.services.updateOrder.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Service order updated!");
    },
    onError: (error) => {
      toast.error("Failed to update order");
      console.error(error);
    }
  });

  const handleToggleVisibility = async (id: string) => {
    await toggleVisibility.mutateAsync({ id });
  };

  const handleDeleteService = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      await deleteService.mutateAsync({ id });
    }
  };

  const handleMoveUp = async (service: any) => {
    const newOrder = Math.max(1, service.order - 1);
    await updateOrder.mutateAsync({ id: service.id, order: newOrder });
  };

  const handleMoveDown = async (service: any) => {
    const newOrder = service.order + 1;
    await updateOrder.mutateAsync({ id: service.id, order: newOrder });
  };

  // Icon mapping
  const iconMap: Record<string, any> = {
    Globe,
    Smartphone,
    Monitor,
    Palette,
    TrendingUp,
    Cloud,
    Package
  };

  const categories = ["All", ...new Set(services.map(s => s.category))];
  const filteredServices = services.filter(
    (service) => selectedCategory === "All" || service.category === selectedCategory
  );

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
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
    <div className="min-h-screen">
      <Header />
      
      <main className="py-20">
        <div className="container mx-auto px-6">
          {/* Dashboard Switcher */}
          <div className="mb-8 flex justify-center">
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '3px solid #111111',
              boxShadow: '4px 4px 0px #111111',
              display: 'inline-flex',
              padding: '4px'
            }}>
              <Link href="/admin/dashboard">
                <button style={{
                  backgroundColor: '#FFFFFF',
                  color: '#111111',
                  border: '2px solid #111111',
                  padding: '12px 24px',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFC700';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                }}>
                  ← Dashboard
                </button>
              </Link>
              <button style={{
                backgroundColor: '#FFC700',
                color: '#111111',
                border: '2px solid #111111',
                borderLeft: 'none',
                padding: '12px 24px',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Package size={16} strokeWidth={2} />
                Services Management
              </button>
            </div>
          </div>

          {/* Page Header */}
          <div className="mb-16 text-center">
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
                <Package size={40} strokeWidth={3} color="#111111" />
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
              Services Management
            </h1>
            <p style={{
              fontSize: '18px',
              color: '#666666',
              maxWidth: '600px',
              margin: '0 auto 32px'
            }}>
              Manage all your services, pricing, and visibility
            </p>
            <Link href="/admin/services/new">
              <RetroButton variant="primary" size="lg">
                <Plus size={20} strokeWidth={2} />
                Add New Service
              </RetroButton>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { 
                icon: Package, 
                label: 'Total Services', 
                value: services.length,
                subtext: 'All services',
                color: '#FFC700'
              },
              { 
                icon: Eye, 
                label: 'Visible', 
                value: services.filter(s => s.isVisible).length,
                subtext: 'Public services',
                color: '#00FF00'
              },
              { 
                icon: EyeOff, 
                label: 'Hidden', 
                value: services.filter(s => !s.isVisible).length,
                subtext: 'Draft services',
                color: '#FF3EA5'
              },
              { 
                icon: DollarSign, 
                label: 'Avg Price', 
                value: services.length > 0 ? `${Math.round(services.reduce((sum, s) => sum + s.price, 0) / services.length / 1000000)}M` : '0M',
                subtext: 'IDR millions',
                color: '#00FFFF'
              }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} style={{
                  backgroundColor: '#FFFFFF',
                  border: '3px solid #111111',
                  boxShadow: '4px 4px 0px #111111',
                  padding: '20px',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translate(-2px, -2px)';
                  e.currentTarget.style.boxShadow = '6px 6px 0px #111111';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translate(0, 0)';
                  e.currentTarget.style.boxShadow = '4px 4px 0px #111111';
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '60px',
                    height: '60px',
                    backgroundColor: stat.color,
                    clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
                    opacity: 0.2
                  }} />
                  <div className="flex items-center justify-between mb-3">
                    <div style={{
                      backgroundColor: stat.color,
                      padding: '8px',
                      border: '2px solid #111111',
                      boxShadow: '2px 2px 0px #111111'
                    }}>
                      <Icon size={20} strokeWidth={2} color="#111111" />
                    </div>
                  </div>
                  <p style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: '#666',
                    marginBottom: '4px'
                  }}>{stat.label}</p>
                  <p style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '24px',
                    fontWeight: 800,
                    color: '#111111',
                    marginBottom: '4px'
                  }}>{stat.value}</p>
                  <p style={{
                    fontSize: '11px',
                    color: '#888',
                    fontWeight: 500
                  }}>{stat.subtext}</p>
                </div>
              );
            })}
          </div>

          {/* Category Filter */}
          <div className="flex justify-center mb-8">
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '3px solid #111111',
              boxShadow: '4px 4px 0px #111111',
              padding: '8px',
              display: 'inline-flex',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: selectedCategory === category ? '#FFC700' : '#FFFFFF',
                    color: '#111111',
                    border: '2px solid #111111',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCategory !== category) {
                      e.currentTarget.style.backgroundColor = '#FF3EA5';
                      e.currentTarget.style.color = '#FFFFFF';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategory !== category) {
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                      e.currentTarget.style.color = '#111111';
                    }
                  }}
                >
                  {category} {category !== "All" && `(${services.filter(s => s.category === category).length})`}
                </button>
              ))}
            </div>
          </div>

          {/* Services List */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <RetroCard padding="lg">
                    <div className="h-6 bg-gray-300 rounded mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded w-2/3 mb-4"></div>
                    <div className="h-20 bg-gray-300 rounded"></div>
                  </RetroCard>
                </div>
              ))}
            </div>
          ) : filteredServices.length > 0 ? (
            <div className="space-y-6">
              {filteredServices
                .sort((a, b) => a.order - b.order)
                .map((service) => {
                  const IconComponent = iconMap[service.icon] || Package;
                  return (
                    <RetroCard key={service.id} padding="lg">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Service Icon & Basic Info */}
                        <div className="flex items-start gap-4">
                          <div style={{
                            backgroundColor: service.isVisible ? '#00FF00' : '#FF3EA5',
                            padding: '16px',
                            border: '3px solid #111111',
                            boxShadow: '3px 3px 0px #111111',
                            minWidth: '80px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <IconComponent size={32} strokeWidth={2} color="#111111" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h3 style={{
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '24px',
                                fontWeight: 700,
                                color: '#111111',
                                marginBottom: '8px'
                              }}>
                                {service.title}
                              </h3>
                              
                              <div className="flex items-center gap-2">
                                <span style={{
                                  backgroundColor: service.isVisible ? '#00FF00' : '#FF3EA5',
                                  color: '#111111',
                                  padding: '4px 8px',
                                  border: '2px solid #111111',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  textTransform: 'uppercase'
                                }}>
                                  {service.isVisible ? 'VISIBLE' : 'HIDDEN'}
                                </span>
                                
                                <span style={{
                                  backgroundColor: '#00FFFF',
                                  color: '#111111',
                                  padding: '4px 8px',
                                  border: '2px solid #111111',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  textTransform: 'uppercase'
                                }}>
                                  {service.category}
                                </span>
                              </div>
                            </div>
                            
                            <p style={{
                              fontSize: '14px',
                              color: '#666',
                              marginBottom: '12px',
                              lineHeight: '1.5'
                            }}>
                              {service.description}
                            </p>
                            
                            <div className="mb-3">
                              <p style={{
                                fontSize: '12px',
                                color: '#888',
                                marginBottom: '8px',
                                fontWeight: 600,
                                textTransform: 'uppercase'
                              }}>Features:</p>
                              <div className="flex flex-wrap gap-1">
                                {service.features.slice(0, 4).map((feature: string, idx: number) => (
                                  <span key={idx} style={{
                                    backgroundColor: '#FFC700',
                                    color: '#111111',
                                    padding: '2px 6px',
                                    border: '1px solid #111111',
                                    fontSize: '10px',
                                    fontWeight: 600
                                  }}>
                                    {feature}
                                  </span>
                                ))}
                                {service.features.length > 4 && (
                                  <span style={{
                                    color: '#888',
                                    fontSize: '10px',
                                    padding: '2px 6px'
                                  }}>
                                    +{service.features.length - 4} more
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <p style={{
                                  fontFamily: 'Poppins, sans-serif',
                                  fontSize: '18px',
                                  fontWeight: 700,
                                  color: '#111111'
                                }}>
                                  {formatIDR(service.price)}
                                </p>
                                <p style={{
                                  fontSize: '11px',
                                  color: '#888'
                                }}>
                                  Order: #{service.order}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2 min-w-[200px]">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleToggleVisibility(service.id)}
                              style={{
                                backgroundColor: service.isVisible ? '#FF3EA5' : '#00FF00',
                                color: '#FFFFFF',
                                border: '2px solid #111111',
                                boxShadow: '2px 2px 0px #111111',
                                padding: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title={service.isVisible ? 'Hide Service' : 'Show Service'}
                            >
                              {service.isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            
                            <button
                              onClick={() => handleMoveUp(service)}
                              disabled={service.order <= 1}
                              style={{
                                backgroundColor: service.order <= 1 ? '#ccc' : '#00FFFF',
                                color: '#111111',
                                border: '2px solid #111111',
                                boxShadow: '2px 2px 0px #111111',
                                padding: '8px',
                                cursor: service.order <= 1 ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Move Up"
                            >
                              <ArrowUp size={16} />
                            </button>
                            
                            <button
                              onClick={() => handleMoveDown(service)}
                              style={{
                                backgroundColor: '#00FFFF',
                                color: '#111111',
                                border: '2px solid #111111',
                                boxShadow: '2px 2px 0px #111111',
                                padding: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Move Down"
                            >
                              <ArrowDown size={16} />
                            </button>
                          </div>
                          
                          <div className="flex gap-2">
                            <Link href={`/admin/services/edit/${service.id}`} className="flex-1">
                              <button style={{
                                backgroundColor: '#FFC700',
                                color: '#111111',
                                border: '2px solid #111111',
                                boxShadow: '2px 2px 0px #111111',
                                padding: '8px 12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                fontSize: '12px',
                                fontWeight: 600,
                                textTransform: 'uppercase'
                              }}>
                                <Edit size={14} />
                                Edit
                              </button>
                            </Link>
                            
                            <button
                              onClick={() => handleDeleteService(service.id, service.title)}
                              style={{
                                backgroundColor: '#FF3EA5',
                                color: '#FFFFFF',
                                border: '2px solid #111111',
                                boxShadow: '2px 2px 0px #111111',
                                padding: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Delete Service"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </RetroCard>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-20">
              <RetroCard padding="lg" className="max-w-md mx-auto">
                <Package size={64} color="#666" className="mx-auto mb-4" />
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#111111',
                  marginBottom: '16px'
                }}>No Services Found</h3>
                <p style={{
                  fontSize: '16px',
                  color: '#666',
                  marginBottom: '24px'
                }}>
                  {selectedCategory !== "All" 
                    ? `No services found in "${selectedCategory}" category.`
                    : "Start by adding your first service."
                  }
                </p>
                <Link href="/admin/services/new">
                  <RetroButton variant="primary" size="lg">
                    <Plus size={20} />
                    Add New Service
                  </RetroButton>
                </Link>
              </RetroCard>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
