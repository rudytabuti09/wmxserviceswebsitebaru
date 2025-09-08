"use client";

import { use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProgressBar } from "@/components/ui/progress-bar";
import { RetroCard } from "@/components/ui/retro-card";
import { RetroButton } from "@/components/ui/retro-button";
import { RetroProjectChat } from "@/components/chat/retro-project-chat";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Calendar, Clock, User, Hash, CreditCard, MessageSquare, Plus } from "lucide-react";

interface ProjectDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = use(params);
  const { data: project, isLoading, error, isFetching } = trpc.project.getById.useQuery(
    {
      id: id,
    },
    {
      enabled: !!id && !!session?.user?.id,
      refetchOnWindowFocus: true,
      refetchInterval: 15000, // Refetch every 15 seconds for realtime updates
      staleTime: 5000, // Consider data stale after 5 seconds
    }
  );

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RetroCard padding="lg" className="text-center max-w-md mx-auto">
          <div style={{
            fontSize: '64px',
            marginBottom: '16px',
            filter: 'grayscale(100%)'
          }}>🔒</div>
          <h1 style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '24px',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: '#FF3EA5',
            marginBottom: '16px',
            textShadow: '2px 2px 0px #FFC700'
          }}>Access Denied</h1>
          <p style={{
            fontSize: '16px',
            color: '#111111',
            marginBottom: '24px'
          }}>Please sign in to access this project.</p>
          <Link href="/">
            <RetroButton variant="primary" size="md">
              Go to Homepage
            </RetroButton>
          </Link>
        </RetroCard>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-20">
              <div style={{
                display: 'inline-block',
                width: '64px',
                height: '64px',
                backgroundColor: '#FFC700',
                border: '4px solid #111111',
                boxShadow: '4px 4px 0px #111111',
                animation: 'spin 2s linear infinite, pulse 1s ease-in-out infinite alternate',
                marginBottom: '24px'
              }} />
              <h2 style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '24px',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: '#FFFFFF',
                marginBottom: '8px',
                textShadow: '2px 2px 0px #111111'
              }}>Loading Project</h2>
              <p style={{
                fontSize: '16px',
                color: '#FFFFFF',
                opacity: 0.9
              }}>Please wait while we fetch your project details...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-8">
              <RetroCard padding="lg" className="text-center max-w-lg mx-auto">
                <div style={{
                  fontSize: '64px',
                  marginBottom: '24px',
                  filter: 'sepia(100%) saturate(200%) hue-rotate(320deg)'
                }}>🔍</div>
                <h1 style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '36px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: '#FF3EA5',
                  marginBottom: '16px',
                  textShadow: '2px 2px 0px #111111'
                }}>Project Not Found</h1>
                <p style={{
                  fontSize: '16px',
                  color: '#111111',
                  marginBottom: '24px',
                  lineHeight: '1.6'
                }}>
                  The project you're looking for doesn't exist or you don't have access to it.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/client/dashboard">
                    <RetroButton variant="primary" size="md">
                      Back to Dashboard
                    </RetroButton>
                  </Link>
                  <Link href="/services">
                    <RetroButton variant="secondary" size="md">
                      Start New Project
                    </RetroButton>
                  </Link>
                </div>
              </RetroCard>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return {
          backgroundColor: '#FFFFFF',
          color: '#111111',
          border: '2px solid #00FF00',
          boxShadow: '2px 2px 0px #00FF00'
        };
      case "IN_PROGRESS":
        return {
          backgroundColor: '#FFFFFF', 
          color: '#111111',
          border: '2px solid #FFC700',
          boxShadow: '2px 2px 0px #FFC700'
        };
      case "PENDING":
        return {
          backgroundColor: '#FFFFFF',
          color: '#111111', 
          border: '2px solid #FF3EA5',
          boxShadow: '2px 2px 0px #FF3EA5'
        };
      default:
        return {
          backgroundColor: '#FFFFFF',
          color: '#111111',
          border: '2px solid #CCCCCC',
          boxShadow: '2px 2px 0px #CCCCCC'
        };
    }
  };

  const getMilestoneIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "✅";
      case "IN_PROGRESS":
        return "⏳";
      case "PENDING":
        return "⏸️";
      default:
        return "❓";
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="py-20">
        <div className="container mx-auto px-6">
          {/* Back Navigation */}
          <div className="mb-8">
            <Link
              href="/client/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#FFFFFF',
                color: '#111111',
                border: '2px solid #111111',
                padding: '12px 20px',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'uppercase',
                boxShadow: '3px 3px 0px #111111',
                transition: 'all 0.2s',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(-2px, -2px)';
                e.currentTarget.style.boxShadow = '5px 5px 0px #111111';
                e.currentTarget.style.backgroundColor = '#FFC700';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translate(0, 0)';
                e.currentTarget.style.boxShadow = '3px 3px 0px #111111';
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>
          </div>

          {/* Project Header */}
          <RetroCard padding="lg" className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '36px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: '#FF3EA5',
                  marginBottom: '16px',
                  textShadow: '2px 2px 0px #111111'
                }}>
                  {project.title}
                </h1>
                <p style={{
                  fontSize: '16px',
                  color: '#111111',
                  marginBottom: '20px',
                  lineHeight: '1.6'
                }}>
                  {project.description}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2" style={{ color: '#111111' }}>
                    <Calendar size={16} />
                    <span>Started: {new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2" style={{ color: '#111111' }}>
                    <Clock size={16} />
                    <span>Updated: {new Date(project.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="text-center lg:text-right space-y-4">
                <div 
                  style={{
                    ...getStatusColor(project.status),
                    display: 'inline-block',
                    padding: '12px 20px',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}
                >
                  {project.status.replace('_', ' ')}
                </div>
                
                {/* Preview Demo Button */}
                {project.demoUrl && (
                  <div>
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: '#00FFFF',
                        color: '#111111',
                        border: '3px solid #111111',
                        padding: '12px 20px',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '14px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        textDecoration: 'none',
                        boxShadow: '3px 3px 0px #111111',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translate(-2px, -2px)';
                        e.currentTarget.style.boxShadow = '5px 5px 0px #111111';
                        e.currentTarget.style.backgroundColor = '#FFC700';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translate(0, 0)';
                        e.currentTarget.style.boxShadow = '3px 3px 0px #111111';
                        e.currentTarget.style.backgroundColor = '#00FFFF';
                      }}
                    >
                      🚀 Preview Demo
                    </a>
                  </div>
                )}
              </div>
            </div>
          </RetroCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Project Progress & Milestones */}
            <div className="space-y-8">
              {/* Progress Overview */}
              <RetroCard padding="lg">
                <h2 style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '24px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#FF3EA5',
                  marginBottom: '20px',
                  textShadow: '1px 1px 0px #111111'
                }}>Progress Overview</h2>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#111111'
                    }}>Overall Progress</span>
                    <span style={{
                      fontSize: '32px',
                      fontWeight: 800,
                      color: '#FFC700',
                      fontFamily: 'Poppins, sans-serif',
                      textShadow: '2px 2px 0px #111111'
                    }}>{project.progress}%</span>
                  </div>
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    border: '3px solid #111111',
                    height: '24px',
                    position: 'relative',
                    boxShadow: 'inset 2px 2px 0px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{
                      width: `${project.progress}%`,
                      height: '100%',
                      backgroundColor: project.progress === 100 ? '#00FF00' : project.progress >= 75 ? '#FFC700' : project.progress >= 50 ? '#00FFFF' : '#FF3EA5',
                      transition: 'width 0.5s ease',
                      position: 'relative'
                    }} />
                  </div>
                  <div style={{
                    backgroundColor: 'rgba(255, 199, 0, 0.1)',
                    border: '2px solid #FFC700',
                    padding: '12px',
                    fontSize: '14px',
                    color: '#111111',
                    fontWeight: 600
                  }}>
                    {project.progress === 100 ? "🎉 Project completed!" : 
                     project.progress >= 75 ? "🏆 Almost there! Final touches in progress." :
                     project.progress >= 50 ? "🚀 Making great progress!" :
                     project.progress >= 25 ? "⚖️ Project is underway." :
                     "🌱 Project just started."}
                  </div>
                </div>
              </RetroCard>

              {/* Milestones */}
              <RetroCard padding="lg">
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <h2 style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '24px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#FF3EA5',
                    textShadow: '1px 1px 0px #111111'
                  }}>Project Milestones</h2>
                  
                  {/* Realtime Update Indicator */}
                  {isFetching && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12px',
                      color: '#00FFFF',
                      fontWeight: 600
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#00FFFF',
                        borderRadius: '50%',
                        animation: 'pulse 1s infinite'
                      }} />
                      Updating...
                    </div>
                  )}
                </div>
                {project.milestones && project.milestones.length > 0 ? (
                  <div className="space-y-4">
                    {project.milestones.map((milestone, index) => (
                      <div key={milestone.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        border: '2px solid #111111',
                        boxShadow: '2px 2px 0px #111111'
                      }}>
                        <div style={{
                          fontSize: '24px',
                          filter: 'drop-shadow(1px 1px 0px #111111)'
                        }}>
                          {getMilestoneIcon(milestone.status)}
                        </div>
                        <div className="flex-1">
                          <h3 style={{
                            fontWeight: 700,
                            color: '#111111',
                            marginBottom: '8px',
                            fontFamily: 'Poppins, sans-serif'
                          }}>{milestone.title}</h3>
                          <div 
                            style={{
                              ...getStatusColor(milestone.status),
                              display: 'inline-block',
                              padding: '4px 12px',
                              fontSize: '12px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              fontFamily: 'Poppins, sans-serif'
                            }}
                          >
                            {milestone.status.replace('_', ' ')}
                          </div>
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#111111',
                          fontWeight: 600,
                          backgroundColor: '#FFC700',
                          padding: '4px 8px',
                          border: '1px solid #111111'
                        }}>
                          Step {index + 1}
                        </div>
                      </div>
                    ))}
                    
                    {/* Milestone Summary */}
                    <div style={{
                      marginTop: '24px',
                      padding: '20px',
                      backgroundColor: '#FFFFFF',
                      border: '3px solid #FF3EA5',
                      boxShadow: '3px 3px 0px #FF3EA5'
                    }}>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div style={{
                            fontSize: '24px',
                            fontWeight: 800,
                            color: '#00FF00',
                            fontFamily: 'Poppins, sans-serif',
                            textShadow: '1px 1px 0px #111111'
                          }}>
                            {project.milestones.filter(m => m.status === 'COMPLETED').length}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#111111',
                            fontWeight: 600,
                            textTransform: 'uppercase'
                          }}>Completed</div>
                        </div>
                        <div>
                          <div style={{
                            fontSize: '24px',
                            fontWeight: 800,
                            color: '#FFC700',
                            fontFamily: 'Poppins, sans-serif',
                            textShadow: '1px 1px 0px #111111'
                          }}>
                            {project.milestones.filter(m => m.status === 'IN_PROGRESS').length}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#111111',
                            fontWeight: 600,
                            textTransform: 'uppercase'
                          }}>In Progress</div>
                        </div>
                        <div>
                          <div style={{
                            fontSize: '24px',
                            fontWeight: 800,
                            color: '#FF3EA5',
                            fontFamily: 'Poppins, sans-serif',
                            textShadow: '1px 1px 0px #111111'
                          }}>
                            {project.milestones.filter(m => m.status === 'PENDING').length}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#111111',
                            fontWeight: 600,
                            textTransform: 'uppercase'
                          }}>Pending</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div style={{
                      fontSize: '48px',
                      marginBottom: '16px',
                      filter: 'grayscale(100%)'
                    }}>📋</div>
                    <p style={{
                      fontSize: '16px',
                      color: '#111111',
                      fontWeight: 600
                    }}>No milestones defined for this project yet.</p>
                  </div>
                )}
              </RetroCard>
            </div>

            {/* Chat & Actions */}
            <div className="space-y-8">
              {/* Project Chat */}
              <RetroProjectChat projectId={project.id} />

              {/* Quick Actions */}
              <RetroCard padding="lg">
                <h3 style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '20px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#FFC700',
                  marginBottom: '20px',
                  textShadow: '1px 1px 0px #111111'
                }}>Quick Actions</h3>
                <div className="space-y-4">
                  <Link href="/client/payment">
                    <button style={{
                      width: '100%',
                      backgroundColor: '#FFFFFF',
                      color: '#111111',
                      border: '3px solid #111111',
                      padding: '16px 20px',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '14px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      boxShadow: '3px 3px 0px #111111',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translate(-2px, -2px)';
                      e.currentTarget.style.boxShadow = '5px 5px 0px #111111';
                      e.currentTarget.style.backgroundColor = '#00FFFF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translate(0, 0)';
                      e.currentTarget.style.boxShadow = '3px 3px 0px #111111';
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }}>
                      <CreditCard size={18} />
                      View Payment History
                    </button>
                  </Link>
                  <Link href="/contact">
                    <button style={{
                      width: '100%',
                      backgroundColor: '#FFFFFF',
                      color: '#111111',
                      border: '3px solid #111111',
                      padding: '16px 20px',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '14px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      boxShadow: '3px 3px 0px #111111',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translate(-2px, -2px)';
                      e.currentTarget.style.boxShadow = '5px 5px 0px #111111';
                      e.currentTarget.style.backgroundColor = '#FF3EA5';
                      e.currentTarget.style.color = '#FFFFFF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translate(0, 0)';
                      e.currentTarget.style.boxShadow = '3px 3px 0px #111111';
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                      e.currentTarget.style.color = '#111111';
                    }}>
                      <MessageSquare size={18} />
                      Request Changes
                    </button>
                  </Link>
                  <Link href="/services">
                    <button style={{
                      width: '100%',
                      backgroundColor: '#FFC700',
                      color: '#111111',
                      border: '3px solid #111111',
                      padding: '16px 20px',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '14px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      boxShadow: '3px 3px 0px #111111',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translate(-2px, -2px)';
                      e.currentTarget.style.boxShadow = '5px 5px 0px #111111';
                      e.currentTarget.style.backgroundColor = '#FFD700';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translate(0, 0)';
                      e.currentTarget.style.boxShadow = '3px 3px 0px #111111';
                      e.currentTarget.style.backgroundColor = '#FFC700';
                    }}>
                      <Plus size={18} />
                      Start New Project
                    </button>
                  </Link>
                </div>
              </RetroCard>

              {/* Project Info */}
              <RetroCard padding="lg">
                <h3 style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '20px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#FFC700',
                  marginBottom: '20px',
                  textShadow: '1px 1px 0px #111111'
                }}>Project Details</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center" style={{
                    padding: '12px 16px',
                    backgroundColor: 'rgba(255, 62, 165, 0.1)',
                    border: '2px solid #FF3EA5'
                  }}>
                    <div className="flex items-center gap-2">
                      <Hash size={16} color="#FF3EA5" />
                      <span style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#111111'
                      }}>Project ID:</span>
                    </div>
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#FF3EA5',
                      backgroundColor: '#FFFFFF',
                      padding: '4px 8px',
                      border: '1px solid #FF3EA5'
                    }}>{project.id.slice(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between items-center" style={{
                    padding: '12px 16px',
                    backgroundColor: 'rgba(255, 199, 0, 0.1)',
                    border: '2px solid #FFC700'
                  }}>
                    <div className="flex items-center gap-2">
                      <User size={16} color="#FFC700" />
                      <span style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#111111'
                      }}>Client:</span>
                    </div>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#FFC700'
                    }}>{project.client?.name || session.user.name}</span>
                  </div>
                  <div className="flex justify-between items-center" style={{
                    padding: '12px 16px',
                    backgroundColor: 'rgba(0, 255, 255, 0.1)',
                    border: '2px solid #00FFFF'
                  }}>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} color="#00FFFF" />
                      <span style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#111111'
                      }}>Created:</span>
                    </div>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#00FFFF'
                    }}>{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center" style={{
                    padding: '12px 16px',
                    backgroundColor: 'rgba(0, 255, 0, 0.1)',
                    border: '2px solid #00FF00'
                  }}>
                    <div className="flex items-center gap-2">
                      <Clock size={16} color="#00FF00" />
                      <span style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#111111'
                      }}>Last Update:</span>
                    </div>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#00FF00'
                    }}>{new Date(project.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </RetroCard>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
