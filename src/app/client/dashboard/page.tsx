"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RetroCard } from "@/components/ui/retro-card";
import { RetroButton } from "@/components/ui/retro-button";
import { trpc } from "@/lib/trpc";
import { 
  Rocket, CreditCard, MessageCircle, Plus, CheckCircle, Clock, 
  AlertCircle, FileText, Download, Upload, Calendar, Bell,
  TrendingUp, Activity, DollarSign, FolderOpen, Star, Users, Shield
} from "lucide-react";

// Helper function to format time ago
function formatTimeAgo(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

// Helper function to get activity icon color based on type
function getActivityColor(type: string) {
  const colorMap: { [key: string]: string } = {
    'PROJECT_CREATED': '#00FF00',
    'PROJECT_UPDATED': '#FFC700',
    'PROJECT_STATUS_CHANGED': '#FF3EA5',
    'PROJECT_PROGRESS_UPDATED': '#00FFFF',
    'PROJECT_COMPLETED': '#00FF00',
    'MILESTONE_COMPLETED': '#FFC700',
    'MILESTONE_UPDATED': '#00FFFF',
    'MESSAGE_SENT': '#FF3EA5',
    'MESSAGE_RECEIVED': '#00FFFF',
    'PAYMENT_RECEIVED': '#00FF00',
    'INVOICE_CREATED': '#FFC700',
    'INVOICE_PAID': '#00FF00',
    'USER_REGISTERED': '#FF3EA5',
    'USER_LOGIN': '#00FFFF',
  };
  return colorMap[type] || '#666';
}

export default function ClientDashboard() {
  const { data: session } = useSession();
  const { data: projectsData, isLoading } = trpc.project.getForClient.useQuery();
  const { data: activitiesData, isLoading: activitiesLoading, refetch: refetchActivities } = trpc.activity.getRecentForUser.useQuery(
    { limit: 10 },
    { 
      enabled: !!session?.user?.id,
      refetchOnWindowFocus: true,
      refetchInterval: 30000, // Refetch every 30 seconds
      staleTime: 10000, // Consider data stale after 10 seconds
    }
  );
  
  // Fetch realtime deadlines
  const { data: deadlinesData, isLoading: deadlinesLoading } = trpc.deadline.getUpcoming.useQuery(
    { limit: 5, daysAhead: 14 },
    {
      enabled: !!session?.user?.id,
      refetchOnWindowFocus: true,
      refetchInterval: 30000, // Refetch every 30 seconds - same as activities
      staleTime: 10000, // Consider data stale after 10 seconds
    }
  );
  
  // Ensure projects is always an array
  const projects = Array.isArray(projectsData) ? projectsData : [];
  const activities = activitiesData || [];
  
  // Check if user is admin
  const isAdmin = session?.user?.role === 'ADMIN';

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RetroCard padding="lg" className="text-center max-w-md">
          <div style={{
            fontSize: '72px',
            marginBottom: '24px'
          }}>🔒</div>
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
          }}>Please sign in to access your dashboard.</p>
          <Link href="/auth/signin">
            <RetroButton variant="primary" size="lg">
              Sign In Now
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
          {/* Dashboard Switcher for Admin */}
          {isAdmin && (
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
                    <Shield size={16} strokeWidth={2} />
                    Admin View
                  </button>
                </Link>
                <Link href="/client/dashboard">
                  <button style={{
                    backgroundColor: '#FF3EA5',
                    color: '#FFFFFF',
                    border: '2px solid #111111',
                    borderLeft: 'none',
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
                  }}>
                    <Users size={16} strokeWidth={2} />
                    Client View
                  </button>
                </Link>
              </div>
            </div>
          )}

          {/* Welcome Section with Animation */}
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
                <Rocket size={40} strokeWidth={3} color="#FFFFFF" />
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
              Welcome back, {session.user.name}!
            </h1>
            <p style={{
              fontSize: '18px',
              color: '#FFFFFF',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Here's an overview of your dashboard
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              { 
                icon: FolderOpen, 
                label: 'Active Projects', 
                value: projects.filter(p => p.status === 'IN_PROGRESS').length,
                color: '#FFC700'
              },
              { 
                icon: CheckCircle, 
                label: 'Completed', 
                value: projects.filter(p => p.status === 'COMPLETED').length,
                color: '#00FF00'
              },
              { 
                icon: Clock, 
                label: 'In Review', 
                value: projects.filter(p => p.status === 'ON_HOLD').length,
                color: '#FF3EA5'
              },
              { 
                icon: TrendingUp, 
                label: 'Total Progress', 
                value: `${projects.length > 0 ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projects.length) : 0}%`,
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
                    fontSize: '28px',
                    fontWeight: 800,
                    color: '#111111'
                  }}>{stat.value}</p>
                </div>
              );
            })}
          </div>

          {/* Projects Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <RetroCard key={i} padding="lg" className="animate-pulse">
                  <div style={{
                    height: '24px',
                    backgroundColor: '#F0F0F0',
                    marginBottom: '16px'
                  }}></div>
                  <div style={{
                    height: '80px',
                    backgroundColor: '#F0F0F0',
                    marginBottom: '16px'
                  }}></div>
                  <div style={{
                    height: '8px',
                    backgroundColor: '#F0F0F0'
                  }}></div>
                </RetroCard>
              ))}
            </div>
          ) : projects.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {projects.map((project) => {
                  const statusColors = {
                    'IN_PROGRESS': { bg: '#FFC700', text: '#111111', icon: Clock },
                    'COMPLETED': { bg: '#00FF00', text: '#111111', icon: CheckCircle },
                    'ON_HOLD': { bg: '#FF3EA5', text: '#111111', icon: AlertCircle },
                    'PLANNING': { bg: '#00FFFF', text: '#111111', icon: Rocket }
                  };
                  const statusConfig = statusColors[project.status as keyof typeof statusColors] || statusColors['IN_PROGRESS'];
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <Link 
                      key={project.id} 
                      href={`/client/projects/${project.id}`}
                    >
                      <RetroCard padding="lg" hover={true} className="h-full">
                        <div className="flex items-start justify-between mb-6">
                          <h3 style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '20px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            color: '#111111',
                            lineHeight: 1.2,
                            flex: 1,
                            marginRight: '12px'
                          }}>
                            {project.title}
                          </h3>
                          <div style={{
                            backgroundColor: statusConfig.bg,
                            color: statusConfig.text,
                            padding: '4px 8px',
                            border: '2px solid #111111',
                            boxShadow: '2px 2px 0px #111111',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '10px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            flexShrink: 0
                          }}>
                            <StatusIcon size={12} />
                            {project.status.replace('_', ' ')}
                          </div>
                        </div>
                        
                        <p style={{
                          fontSize: '14px',
                          color: '#111111',
                          marginBottom: '24px',
                          lineHeight: 1.6,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {project.description}
                        </p>
                        
                        <div style={{ marginBottom: '16px' }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '8px'
                          }}>
                            <span style={{
                              fontFamily: 'Poppins, sans-serif',
                              fontSize: '12px',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              color: '#111111'
                            }}>Progress</span>
                            <span style={{
                              fontFamily: 'Poppins, sans-serif',
                              fontSize: '14px',
                              fontWeight: 700,
                              color: '#111111'
                            }}>{project.progress}%</span>
                          </div>
                          <div style={{
                            width: '100%',
                            height: '12px',
                            backgroundColor: '#F0F0F0',
                            border: '2px solid #111111',
                            position: 'relative'
                          }}>
                            <div style={{
                              width: `${project.progress}%`,
                              height: '100%',
                              backgroundColor: '#FFC700',
                              transition: 'width 0.3s ease'
                            }}></div>
                          </div>
                        </div>

                        {project.milestones && project.milestones.length > 0 && (
                          <div style={{
                            paddingTop: '16px',
                            borderTop: '2px solid #111111'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}>
                              <span style={{
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '12px',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                color: '#111111'
                              }}>Milestones</span>
                              <span style={{
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '12px',
                                fontWeight: 700,
                                color: '#111111'
                              }}>
                                {project.milestones.filter(m => m.status === 'COMPLETED').length} / {project.milestones.length}
                              </span>
                            </div>
                          </div>
                        )}
                      </RetroCard>
                    </Link>
                  )}
                )}
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Actions - Left Side */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Quick Actions */}
                  <RetroCard padding="lg">
                    <h2 style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '24px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: '#111111',
                      marginBottom: '20px',
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
                        <Rocket size={20} strokeWidth={2} color="#111111" />
                      </div>
                      Quick Actions
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        { icon: Plus, label: 'New Project', href: '/services', color: '#FF3EA5' },
                        { icon: CreditCard, label: 'Payments', href: '/client/payment', color: '#FFC700' },
                        { icon: MessageCircle, label: 'Messages', href: '/contact', color: '#00FFFF' },
                        { icon: FileText, label: 'Documents', href: '#', color: '#00FF00' },
                        { icon: Download, label: 'Downloads', href: '#', color: '#FF3EA5' },
                        { icon: Bell, label: 'Notifications', href: '#', color: '#FFC700' },
                      ].map((action, index) => {
                        const ActionIcon = action.icon;
                        return (
                          <Link key={index} href={action.href}>
                            <div style={{
                              backgroundColor: '#FFFFFF',
                              border: '2px solid #111111',
                              boxShadow: '3px 3px 0px #111111',
                              padding: '16px',
                              textAlign: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              height: '100%'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = action.color;
                              e.currentTarget.style.transform = 'translate(-2px, -2px)';
                              e.currentTarget.style.boxShadow = '5px 5px 0px #111111';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#FFFFFF';
                              e.currentTarget.style.transform = 'translate(0, 0)';
                              e.currentTarget.style.boxShadow = '3px 3px 0px #111111';
                            }}>
                              <ActionIcon size={24} strokeWidth={2} style={{ margin: '0 auto 8px' }} />
                              <p style={{
                                fontSize: '12px',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                color: '#111111'
                              }}>{action.label}</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </RetroCard>

                  {/* Recent Activity */}
                  <RetroCard padding="lg">
                    <h2 style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '24px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: '#111111',
                      marginBottom: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <div style={{
                        backgroundColor: '#FF3EA5',
                        padding: '8px',
                        border: '2px solid #111111',
                        boxShadow: '2px 2px 0px #111111'
                      }}>
                        <Activity size={20} strokeWidth={2} color="#FFFFFF" />
                      </div>
                      Recent Activity
                    </h2>
                    <div className="space-y-4">
                      {activitiesLoading ? (
                        // Loading skeleton
                        [...Array(4)].map((_, index) => (
                          <div key={index} style={{
                            padding: '12px',
                            backgroundColor: '#F0F0F0',
                            border: '2px solid #111111',
                            boxShadow: '2px 2px 0px #111111'
                          }}>
                            <div className="animate-pulse">
                              <div style={{
                                height: '16px',
                                backgroundColor: '#E0E0E0',
                                marginBottom: '8px',
                                width: '70%'
                              }}></div>
                              <div style={{
                                height: '12px',
                                backgroundColor: '#E0E0E0',
                                width: '90%'
                              }}></div>
                            </div>
                          </div>
                        ))
                      ) : activities.length > 0 ? (
                        activities.map((activity, index) => {
                          const activityColor = getActivityColor(activity.type);
                          return (
                            <div key={activity.id} style={{
                              padding: '12px',
                              backgroundColor: index % 2 === 0 ? '#FFF8DC' : '#F0F0F0',
                              border: '2px solid #111111',
                              boxShadow: '2px 2px 0px #111111'
                            }}>
                              <div className="flex justify-between items-start">
                                <div style={{ flex: 1 }}>
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '4px'
                                  }}>
                                    <div style={{
                                      width: '8px',
                                      height: '8px',
                                      backgroundColor: activityColor,
                                      border: '1px solid #111111',
                                      borderRadius: '2px',
                                      flexShrink: 0
                                    }}></div>
                                    <p style={{
                                      fontSize: '14px',
                                      fontWeight: 700,
                                      color: '#111111'
                                    }}>{activity.title}</p>
                                  </div>
                                  <p style={{
                                    fontSize: '12px',
                                    color: '#666',
                                    marginLeft: '16px'
                                  }}>{activity.description}</p>
                                  {activity.project && (
                                    <p style={{
                                      fontSize: '10px',
                                      color: '#999',
                                      marginLeft: '16px',
                                      marginTop: '4px',
                                      fontWeight: 600
                                    }}>Project: {activity.project.title}</p>
                                  )}
                                </div>
                                <span style={{
                                  fontSize: '10px',
                                  color: activityColor,
                                  fontWeight: 600,
                                  textTransform: 'uppercase',
                                  flexShrink: 0,
                                  marginLeft: '12px'
                                }}>{formatTimeAgo(new Date(activity.createdAt))}</span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        // Empty state
                        <div style={{
                          padding: '24px',
                          textAlign: 'center',
                          backgroundColor: '#F0F0F0',
                          border: '2px solid #111111',
                          boxShadow: '2px 2px 0px #111111'
                        }}>
                          <Activity size={32} strokeWidth={2} color="#666" style={{ marginBottom: '12px' }} />
                          <p style={{
                            fontSize: '14px',
                            color: '#666',
                            fontWeight: 600
                          }}>No recent activity</p>
                          <p style={{
                            fontSize: '12px',
                            color: '#999',
                            marginTop: '4px'
                          }}>Activity will appear here when you start working on projects</p>
                        </div>
                      )}
                    </div>
                  </RetroCard>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-8">
                  {/* Upcoming Deadlines */}
                  <RetroCard padding="lg">
                    <h3 style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '18px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: '#111111',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Calendar size={20} strokeWidth={2} color="#FF3EA5" />
                      Deadlines
                    </h3>
                    <div className="space-y-3">
                      {deadlinesLoading ? (
                        // Loading skeleton for deadlines
                        [...Array(3)].map((_, index) => (
                          <div key={index} style={{
                            padding: '8px',
                            backgroundColor: '#F0F0F0',
                            border: '2px solid #111111',
                            boxShadow: '2px 2px 0px #111111'
                          }}>
                            <div className="animate-pulse">
                              <div style={{
                                height: '12px',
                                backgroundColor: '#E0E0E0',
                                marginBottom: '4px',
                                width: '60%'
                              }}></div>
                              <div style={{
                                height: '10px',
                                backgroundColor: '#E0E0E0',
                                width: '30%'
                              }}></div>
                            </div>
                          </div>
                        ))
                      ) : deadlinesData && deadlinesData.length > 0 ? (
                        deadlinesData.map((deadline) => {
                          // Helper function to determine urgency
                          const getDaysUntilDeadline = (date: Date) => {
                            const now = new Date();
                            const diffTime = date.getTime() - now.getTime();
                            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          };
                          
                          const daysRemaining = getDaysUntilDeadline(new Date(deadline.deadline));
                          const isUrgent = daysRemaining <= 1;
                          const isOverdue = daysRemaining < 0;
                          
                          // Format date
                          const formatDate = (date: Date) => {
                            const now = new Date();
                            const deadlineDate = new Date(date);
                            
                            if (daysRemaining === 0) return 'Today';
                            if (daysRemaining === 1) return 'Tomorrow';
                            if (isOverdue) return `${Math.abs(daysRemaining)}d overdue`;
                            if (daysRemaining <= 7) return `${daysRemaining}d left`;
                            
                            return deadlineDate.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            });
                          };
                          
                          const getDeadlineColor = () => {
                            if (isOverdue) return '#FF3EA5'; // Pink for overdue
                            if (isUrgent) return '#FF6B6B';   // Red for urgent
                            if (daysRemaining <= 7) return '#FFC700'; // Yellow for upcoming
                            return '#666'; // Gray for normal
                          };
                          
                          return (
                            <div key={deadline.id} style={{
                              padding: '8px',
                              backgroundColor: isOverdue ? '#FFE4E1' : (isUrgent ? '#FFF5F5' : '#F0F0F0'),
                              border: `2px solid ${isOverdue || isUrgent ? '#FF3EA5' : '#111111'}`,
                              boxShadow: '2px 2px 0px #111111',
                              position: 'relative'
                            }}>
                              {/* Type indicator */}
                              <div style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                fontSize: '8px',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                color: '#999',
                                backgroundColor: '#FFFFFF',
                                padding: '2px 4px',
                                border: '1px solid #E0E0E0',
                                borderRadius: '2px'
                              }}>
                                {deadline.type}
                              </div>
                              
                              <div className="flex justify-between items-start">
                                <div style={{ flex: 1, paddingRight: '20px' }}>
                                  <span style={{
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: '#111111',
                                    display: 'block',
                                    marginBottom: '2px'
                                  }}>{deadline.title}</span>
                                  
                                  {deadline.projectTitle && (
                                    <span style={{
                                      fontSize: '9px',
                                      color: '#666',
                                      fontStyle: 'italic'
                                    }}>Project: {deadline.projectTitle}</span>
                                  )}
                                </div>
                                
                                <span style={{
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  color: getDeadlineColor(),
                                  textTransform: 'uppercase',
                                  flexShrink: 0
                                }}>
                                  {formatDate(new Date(deadline.deadline))}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        // Empty state for deadlines
                        <div style={{
                          padding: '16px',
                          textAlign: 'center',
                          backgroundColor: '#F0F0F0',
                          border: '2px solid #111111',
                          boxShadow: '2px 2px 0px #111111'
                        }}>
                          <Calendar size={24} strokeWidth={2} color="#666" style={{ marginBottom: '8px' }} />
                          <p style={{
                            fontSize: '12px',
                            color: '#666',
                            fontWeight: 600
                          }}>No upcoming deadlines</p>
                          <p style={{
                            fontSize: '10px',
                            color: '#999',
                            marginTop: '2px'
                          }}>Deadlines will appear here when set</p>
                        </div>
                      )}
                    </div>
                  </RetroCard>

                  {/* Support Card */}
                  <RetroCard padding="lg" style={{ backgroundColor: '#FFC700' }}>
                    <div className="text-center">
                      <div style={{
                        backgroundColor: '#FFFFFF',
                        width: '60px',
                        height: '60px',
                        margin: '0 auto 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '3px solid #111111',
                        boxShadow: '3px 3px 0px #111111',
                        transform: 'rotate(-5deg)'
                      }}>
                        <Users size={30} strokeWidth={2} color="#111111" />
                      </div>
                      <h3 style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '16px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: '#111111',
                        marginBottom: '8px'
                      }}>Need Help?</h3>
                      <p style={{
                        fontSize: '12px',
                        color: '#111111',
                        marginBottom: '16px'
                      }}>Our support team is available 24/7</p>
                      <Link href="/contact">
                        <button style={{
                          backgroundColor: '#111111',
                          color: '#FFC700',
                          border: '2px solid #111111',
                          padding: '8px 16px',
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '12px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          boxShadow: '3px 3px 0px #FFFFFF',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translate(-2px, -2px)';
                          e.currentTarget.style.boxShadow = '5px 5px 0px #FFFFFF';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translate(0, 0)';
                          e.currentTarget.style.boxShadow = '3px 3px 0px #FFFFFF';
                        }}>
                          Contact Support
                        </button>
                      </Link>
                    </div>
                  </RetroCard>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <RetroCard padding="lg" className="max-w-2xl mx-auto">
                <div style={{
                  fontSize: '72px',
                  marginBottom: '24px'
                }}>🚀</div>
                <h2 style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '36px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: '#111111',
                  marginBottom: '16px'
                }}>
                  Welcome to WMX Services!
                </h2>
                <p style={{
                  fontSize: '16px',
                  color: '#111111',
                  marginBottom: '32px',
                  maxWidth: '500px',
                  margin: '0 auto 32px',
                  lineHeight: 1.6
                }}>
                  You don't have any active projects yet. Let's get started on bringing your ideas to life!
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link href="/services">
                    <RetroButton variant="primary" size="lg">
                      <Rocket size={20} />
                      Start New Project
                    </RetroButton>
                  </Link>
                  <Link href="/contact">
                    <RetroButton variant="secondary" size="lg">
                      <MessageCircle size={20} />
                      Get Consultation
                    </RetroButton>
                  </Link>
                </div>
              </RetroCard>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
