"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RetroCard } from "@/components/ui/retro-card";
import { RetroButton } from "@/components/ui/retro-button";
import { trpc } from "@/lib/trpc";
import toast from "react-hot-toast";
import { Palette, Plus, Star, Trash2, Edit, ExternalLink } from "lucide-react";

export default function AdminPortfolioPage() {
  const { data: session } = useSession();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  
  const { data: portfolioData, isLoading, refetch } = trpc.portfolio.getAll.useQuery();
  
  // Ensure portfolioItems is always an array
  const portfolioItems = Array.isArray(portfolioData) ? portfolioData : [];
  
  const toggleFeatured = trpc.portfolio.toggleFeatured.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const deleteItem = trpc.portfolio.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleToggleFeatured = async (id: string) => {
    await toggleFeatured.mutateAsync({ id });
  };

  const handleDeleteItem = async (id: string, title: string) => {
    toast((t) => (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '4px',
        fontFamily: 'Poppins, sans-serif'
      }}>
        <div>
          <div style={{
            fontSize: '16px',
            fontWeight: 700,
            color: '#111111',
            marginBottom: '8px',
            textTransform: 'uppercase'
          }}>
            ⚠️ Delete Portfolio Item?
          </div>
          <div style={{
            fontSize: '14px',
            color: '#666666',
            lineHeight: '1.4',
            marginBottom: '12px'
          }}>
            Are you sure you want to delete "{title}"? This action cannot be undone.
          </div>
        </div>
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#FFFFFF',
              border: '2px solid #111111',
              color: '#111111',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F0F0F0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
            }}
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              await deleteItem.mutateAsync({ id });
              toast.success(`"${title}" deleted successfully`, {
                style: {
                  background: '#FF3EA5',
                  color: '#FFFFFF',
                  border: '2px solid #111111',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 700,
                }
              });
            }}
            disabled={deleteItem.isLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#FF3EA5',
              border: '2px solid #111111',
              color: '#FFFFFF',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              cursor: deleteItem.isLoading ? 'not-allowed' : 'pointer',
              opacity: deleteItem.isLoading ? 0.6 : 1,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              if (!deleteItem.isLoading) {
                e.currentTarget.style.backgroundColor = '#E1306C';
              }
            }}
            onMouseLeave={(e) => {
              if (!deleteItem.isLoading) {
                e.currentTarget.style.backgroundColor = '#FF3EA5';
              }
            }}
          >
            {deleteItem.isLoading ? (
              <>
                <div style={{
                  width: '12px',
                  height: '12px',
                  border: '2px solid #FFFFFF',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Deleting...
              </>
            ) : (
              <>
                🗑️ Delete
              </>
            )}
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      style: {
        background: '#FFFFFF',
        border: '3px solid #111111',
        boxShadow: '6px 6px 0px #111111',
        borderRadius: '0px',
        maxWidth: '400px',
        padding: '16px'
      },
      id: 'delete-portfolio-item-confirmation'
    });
  };

  const categories = ["All", "Web", "Mobile", "Desktop"];
  const filteredItems = portfolioItems.filter(
    (item) => selectedCategory === "All" || item.category === selectedCategory
  );

  if (!session || session.user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RetroCard padding="lg" className="text-center max-w-md">
          <div style={{
            fontSize: '72px',
            marginBottom: '24px'
          }}>🛡️</div>
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
          {/* Dashboard Switcher for consistency with admin dashboard */}
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
                <Palette size={16} strokeWidth={2} />
                Portfolio Management
              </button>
            </div>
          </div>

          {/* Page Header - consistent with other admin pages */}
          <div className="mb-16 text-center">
            <div style={{
              display: 'inline-block',
              animation: 'bounce 2s infinite'
            }}>
              <div style={{
                backgroundColor: '#00FFFF',
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
                <Palette size={40} strokeWidth={3} color="#111111" />
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
              Portfolio Showcase
            </h1>
            <p style={{
              fontSize: '18px',
              color: '#666666',
              maxWidth: '600px',
              margin: '0 auto 32px'
            }}>
              Manage and showcase your amazing portfolio items
            </p>
            <Link href="/admin/portfolio/new">
              <RetroButton variant="primary" size="lg">
                <Plus size={20} strokeWidth={2} />
                Add Portfolio Item
              </RetroButton>
            </Link>
          </div>

          {/* Key Metrics Stats Cards - consistent with dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { 
                icon: Palette, 
                label: 'Total Items', 
                value: portfolioItems.length,
                subtext: 'Portfolio pieces',
                color: '#FFC700'
              },
              { 
                icon: Star, 
                label: 'Featured', 
                value: portfolioItems.filter(p => p.featured).length,
                subtext: 'Highlighted items',
                color: '#FF3EA5'
              },
              { 
                icon: ExternalLink, 
                label: 'Web Projects', 
                value: portfolioItems.filter(p => p.category === "Web").length,
                subtext: 'Web applications',
                color: '#00FF00'
              },
              { 
                icon: ExternalLink, 
                label: 'Mobile Apps', 
                value: portfolioItems.filter(p => p.category === "Mobile").length,
                subtext: 'Mobile projects',
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

          {/* Category Filter - Retro Style */}
          <div className="flex justify-center mb-8">
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '3px solid #111111',
              boxShadow: '4px 4px 0px #111111',
              padding: '8px',
              display: 'inline-flex',
              gap: '8px'
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
                  {category} {category !== "All" && `(${portfolioItems.filter(p => p.category === category).length})`}
                </button>
              ))}
            </div>
          </div>

          {/* Portfolio Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card overflow-hidden animate-pulse">
                  <div className="h-48 bg-muted"></div>
                  <div className="p-6">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-2/3 mb-4"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <RetroCard key={item.id} padding="sm" className="overflow-hidden">
                  <div className="relative -m-4 mb-4">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />
                    {item.featured && (
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        backgroundColor: '#FFC700',
                        color: '#111111',
                        padding: '4px 12px',
                        border: '2px solid #111111',
                        boxShadow: '2px 2px 0px #111111',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Star size={12} /> Featured
                      </div>
                    )}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: '#00FFFF',
                      color: '#111111',
                      padding: '4px 12px',
                      border: '2px solid #111111',
                      boxShadow: '2px 2px 0px #111111',
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}>
                      {item.category}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#111111',
                      marginBottom: '8px'
                    }}>
                      {item.title}
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#666',
                      marginBottom: '12px',
                      lineHeight: '1.5'
                    }}>
                      {item.description.substring(0, 100)}...
                    </p>
                    
                    <div style={{
                      fontSize: '12px',
                      color: '#888',
                      marginBottom: '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      {item.liveUrl && (
                        <a 
                          href={item.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#3D52F1',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            textDecoration: 'none'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#FF3EA5';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#3D52F1';
                          }}
                        >
                          <ExternalLink size={12} /> Live
                        </a>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/portfolio/edit/${item.id}`}
                        style={{ flex: 1 }}
                      >
                        <RetroButton variant="outline" size="sm" className="w-full">
                          <Edit size={14} /> Edit
                        </RetroButton>
                      </Link>
                      
                      <button
                        onClick={() => handleToggleFeatured(item.id)}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: item.featured ? '#FFC700' : '#FFFFFF',
                          color: '#111111',
                          border: '2px solid #111111',
                          boxShadow: '2px 2px 0px #111111',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        disabled={toggleFeatured.isLoading}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translate(-1px, -1px)';
                          e.currentTarget.style.boxShadow = '3px 3px 0px #111111';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translate(0, 0)';
                          e.currentTarget.style.boxShadow = '2px 2px 0px #111111';
                        }}
                      >
                        {toggleFeatured.isLoading ? "..." : <Star size={14} />}
                      </button>
                      
                      <button
                        onClick={() => handleDeleteItem(item.id, item.title)}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#FFFFFF',
                          color: '#FF0000',
                          border: '2px solid #FF0000',
                          boxShadow: '2px 2px 0px #111111',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        disabled={deleteItem.isLoading}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#FF0000';
                          e.currentTarget.style.color = '#FFFFFF';
                          e.currentTarget.style.transform = 'translate(-1px, -1px)';
                          e.currentTarget.style.boxShadow = '3px 3px 0px #111111';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#FFFFFF';
                          e.currentTarget.style.color = '#FF0000';
                          e.currentTarget.style.transform = 'translate(0, 0)';
                          e.currentTarget.style.boxShadow = '2px 2px 0px #111111';
                        }}
                      >
                        {deleteItem.isLoading ? "..." : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>
                </RetroCard>
              ))}
            </div>
          ) : (
            <RetroCard padding="lg" className="text-center py-12">
              <div style={{
                fontSize: '72px',
                marginBottom: '24px'
              }}>🎨</div>
              <h2 style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '32px',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#111111',
                marginBottom: '16px'
              }}>
                {selectedCategory === "All" ? "No Portfolio Items Yet" : `No ${selectedCategory} Items`}
              </h2>
              <p style={{
                fontSize: '16px',
                color: '#666',
                marginBottom: '32px',
                maxWidth: '500px',
                margin: '0 auto 32px'
              }}>
                {selectedCategory === "All" 
                  ? "Start showcasing your work by adding your first portfolio item."
                  : `No ${selectedCategory.toLowerCase()} projects to display. Try a different category or add new items.`
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/admin/portfolio/new">
                  <RetroButton variant="primary" size="lg">
                    <Plus size={20} /> Add Portfolio Item
                  </RetroButton>
                </Link>
                {selectedCategory !== "All" && (
                  <RetroButton 
                    variant="outline" 
                    size="lg"
                    onClick={() => setSelectedCategory("All")}
                  >
                    View All Items
                  </RetroButton>
                )}
              </div>
            </RetroCard>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
