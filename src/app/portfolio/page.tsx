"use client";

import Link from "next/link";
import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { trpc } from "@/lib/trpc";
import { RetroCard } from "@/components/ui/retro-card";
import { RetroButton } from "@/components/ui/retro-button";
import { ExternalLink, Palette } from "lucide-react";

export default function Portfolio() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const { data: portfolioItems, isLoading } = trpc.portfolio.getAll.useQuery();

  const categories = ["All", "Web", "Mobile", "Desktop"];

  // Ensure portfolioItems is an array before filtering
  const items = Array.isArray(portfolioItems) ? portfolioItems : [];
  const filteredItems = items.filter(
    (item) => selectedCategory === "All" || item.category === selectedCategory
  );

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '48px',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#FFC700',
              marginBottom: '16px',
              textShadow: '2px 2px 0px #111111'
            }}>
              Our Portfolio
            </h1>
            <p style={{
              fontSize: '18px',
              color: '#FFFFFF',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Explore our collection of successful projects and digital solutions
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex justify-center mb-12">
            <div className="flex flex-wrap gap-6">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: selectedCategory === category ? '#FFC700' : '#FFFFFF',
                    color: '#111111',
                    border: '2px solid #111111',
                    boxShadow: selectedCategory === category 
                      ? '4px 4px 0px #111111' 
                      : '2px 2px 0px #111111',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    transform: selectedCategory === category ? 'translate(-2px, -2px)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCategory !== category) {
                      e.currentTarget.style.backgroundColor = '#FF3EA5';
                      e.currentTarget.style.transform = 'translate(-1px, -1px)';
                      e.currentTarget.style.boxShadow = '3px 3px 0px #111111';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategory !== category) {
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '2px 2px 0px #111111';
                    }
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Portfolio Grid */}
          {isLoading ? (
            <div className="text-center py-20">
              <div style={{
                display: 'inline-block',
                width: '48px',
                height: '48px',
                border: '4px solid #FFC700',
                borderRightColor: 'transparent',
                borderRadius: '0',
                animation: 'spin 1s linear infinite'
              }} />
              <p style={{
                marginTop: '16px',
                fontSize: '16px',
                color: '#FFFFFF',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
                textTransform: 'uppercase'
              }}>Loading portfolio...</p>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item) => (
                <RetroCard key={item.id} padding="none" className="overflow-hidden">
                  <div className="relative overflow-hidden" style={{ borderBottom: '2px solid #111111' }}>
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />
                    {item.featured && (
                      <div style={{
                        position: 'absolute',
                        top: '16px',
                        left: '16px',
                        backgroundColor: '#FFC700',
                        color: '#111111',
                        padding: '4px 12px',
                        border: '2px solid #111111',
                        boxShadow: '2px 2px 0px #111111',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '12px',
                        fontWeight: 700,
                        textTransform: 'uppercase'
                      }}>
                        Featured
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '20px',
                        fontWeight: 700,
                        color: '#111111',
                        textTransform: 'uppercase'
                      }}>
                        {item.title}
                      </h3>
                      <span style={{
                        backgroundColor: '#FF3EA5',
                        color: '#111111',
                        padding: '4px 8px',
                        border: '2px solid #111111',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase'
                      }}>
                        {item.category}
                      </span>
                    </div>
                    <p style={{
                      fontSize: '14px',
                      color: '#111111',
                      lineHeight: 1.6,
                      marginBottom: '16px'
                    }}>
                      {item.description}
                    </p>
                    {item.liveUrl && (
                      <Link 
                        href={item.liveUrl} 
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <RetroButton variant="primary" size="sm">
                          Visit Site
                        </RetroButton>
                      </Link>
                    )}
                  </div>
                </RetroCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="flex justify-center mb-6">
                <div style={{
                  backgroundColor: '#FFC700',
                  padding: '20px',
                  border: '2px solid #111111',
                  boxShadow: '4px 4px 0px #111111',
                  display: 'inline-block'
                }}>
                  <Palette size={64} strokeWidth={2} color="#111111" />
                </div>
              </div>
              <h3 style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '32px',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: '#FFC700',
                marginBottom: '8px',
                textShadow: '2px 2px 0px #111111'
              }}>
                No Projects Found
              </h3>
              <p style={{
                fontSize: '16px',
                color: '#FFFFFF',
                marginBottom: '32px'
              }}>
                We're working on adding more amazing projects to our portfolio.
              </p>
              <Link href="/contact">
                <RetroButton variant="primary" size="lg">
                  Start Your Project
                </RetroButton>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
