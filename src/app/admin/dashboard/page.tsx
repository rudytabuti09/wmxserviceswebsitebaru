"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RetroCard } from "@/components/ui/retro-card";
import { RetroButton } from "@/components/ui/retro-button";
import { trpc } from "@/lib/trpc";
import { 
  Shield, Rocket, DollarSign, Clock, Palette, MessageSquare,
  Plus, FileText, CreditCard, TrendingUp, Users, Activity,
  FolderOpen, CheckCircle, AlertCircle, Settings, Database,
  BarChart3, Package, Bell, Zap
} from "lucide-react";

export default function AdminDashboard() {
  const { data: session } = useSession();
  
  const { data: projectsData, isLoading: projectsLoading } = trpc.project.getAll.useQuery();
  const { data: paymentStats, isLoading: paymentLoading } = trpc.payment.getPaymentStats.useQuery();
  const { data: portfolioItems } = trpc.portfolio.getAll.useQuery();
  const { data: conversations } = trpc.chat.getConversations.useQuery();
  
  // Ensure arrays are safe
  const projects = Array.isArray(projectsData) ? projectsData : [];
  const portfolio = Array.isArray(portfolioItems) ? portfolioItems : [];
  const chats = Array.isArray(conversations) ? conversations : [];

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProjectStatusConfig = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return { bg: '#00FF00', text: '#111111', icon: CheckCircle };
      case "IN_PROGRESS":
        return { bg: '#FFC700', text: '#111111', icon: Clock };
      case "ON_HOLD":
        return { bg: '#FF3EA5', text: '#FFFFFF', icon: AlertCircle };
      case "PLANNING":
        return { bg: '#00FFFF', text: '#111111', icon: Rocket };
      default:
        return { bg: '#FFC700', text: '#111111', icon: Clock };
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="py-20">
        <div className="container mx-auto px-6">
          {/* Dashboard Switcher for Admin */}
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
                  backgroundColor: '#FFC700',
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
                }}>
                  <Shield size={16} strokeWidth={2} />
                  Admin View
                </button>
              </Link>
              <Link href="/client/dashboard">
                <button style={{
                  backgroundColor: '#FFFFFF',
                  color: '#111111',
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
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FF3EA5';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.color = '#111111';
                }}>
                  <Users size={16} strokeWidth={2} />
                  Client View
                </button>
              </Link>
            </div>
          </div>

          {/* Welcome Section with Animation */}
          <div className="mb-16 text-center">
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
                <Shield size={40} strokeWidth={3} color="#111111" />
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
              Admin Control Center
            </h1>
            <p style={{
              fontSize: '18px',
              color: '#FFFFFF',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Welcome back, {session.user.name}! Manage your business empire
            </p>
          </div>

          {/* Key Metrics Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { 
                icon: FolderOpen, 
                label: 'Total Projects', 
                value: projects.length,
                subtext: `${projects.filter(p => p.status === 'IN_PROGRESS').length} active`,
                color: '#FFC700'
              },
              { 
                icon: DollarSign, 
                label: 'Total Revenue', 
                value: formatCurrency(paymentStats?.totalRevenue || 0),
                subtext: 'Total earned',
                color: '#00FF00'
              },
              { 
                icon: Clock, 
                label: 'Pending Payment', 
                value: formatCurrency(paymentStats?.pendingAmount || 0),
                subtext: `${paymentStats?.pendingInvoices || 0} invoices`,
                color: '#FF3EA5'
              },
              { 
                icon: Palette, 
                label: 'Portfolio Items', 
                value: portfolio.length,
                subtext: `${portfolio.filter(p => p.featured).length} featured`,
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Projects */}
            <RetroCard padding="lg">
              <div className="flex items-center justify-between mb-6">
                <h2 style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '24px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#111111',
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
                    <FolderOpen size={20} strokeWidth={2} color="#111111" />
                  </div>
                  Recent Projects
                </h2>
                <Link href="/admin/projects">
                  <RetroButton variant="secondary" size="sm">
                    View All
                  </RetroButton>
                </Link>
              </div>
              
              {projectsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2 mb-3"></div>
                      <div className="h-2 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : projects.length > 0 ? (
                <div className="space-y-4">
                  {projects.slice(0, 5).map((project) => {
                    const statusConfig = getProjectStatusConfig(project.status);
                    const StatusIcon = statusConfig.icon;
                    return (
                      <div key={project.id} style={{
                        padding: '12px',
                        backgroundColor: '#F8F8F8',
                        border: '2px solid #111111',
                        boxShadow: '3px 3px 0px #111111',
                        borderLeft: `6px solid ${statusConfig.bg}`
                      }}>
                        <div className="flex items-center justify-between mb-2">
                          <h3 style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '14px',
                            fontWeight: 700,
                            color: '#111111'
                          }}>{project.title}</h3>
                          <div style={{
                            backgroundColor: statusConfig.bg,
                            color: statusConfig.text,
                            padding: '2px 8px',
                            border: '2px solid #111111',
                            fontSize: '10px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <StatusIcon size={10} />
                            {project.status.replace('_', ' ')}
                          </div>
                        </div>
                        <p style={{
                          fontSize: '12px',
                          color: '#666',
                          marginBottom: '8px'
                        }}>
                          Client: {project.client.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <div style={{
                            flex: 1,
                            height: '8px',
                            backgroundColor: '#FFFFFF',
                            border: '2px solid #111111'
                          }}>
                            <div style={{
                              width: `${project.progress}%`,
                              height: '100%',
                              backgroundColor: '#FFC700'
                            }} />
                          </div>
                          <span style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#111111'
                          }}>{project.progress}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-3xl mb-2">📋</div>
                  <p>No projects yet</p>
                </div>
              )}
            </RetroCard>

            {/* Recent Conversations */}
            <RetroCard padding="lg">
              <div className="flex items-center justify-between mb-6">
                <h2 style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '24px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#111111',
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
                    <MessageSquare size={20} strokeWidth={2} color="#FFFFFF" />
                  </div>
                  Recent Messages
                </h2>
                <Link href="/admin/chat">
                  <RetroButton variant="secondary" size="sm">
                    View All
                  </RetroButton>
                </Link>
              </div>
              
              {conversations && conversations.length > 0 ? (
                <div className="space-y-4">
                  {conversations.slice(0, 5).map((conversation) => (
                    <div key={conversation.id} className="flex items-start gap-3 p-3 hover:bg-muted/30 rounded-lg transition-colors">
                      <div className="text-xl">💬</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium truncate">{conversation.title}</h4>
                          <span className="text-xs text-muted-foreground">
                            {conversation._count.messages}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Client: {conversation.client?.name}
                        </p>
                        {conversation.messages[0] && (
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.messages[0].sender.role === "CLIENT" ? "Client: " : "Team: "}
                            {conversation.messages[0].content}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div style={{
                    fontSize: '48px',
                    marginBottom: '12px'
                  }}>💬</div>
                  <p style={{ color: '#666' }}>No conversations yet</p>
                </div>
              )}
            </RetroCard>
          </div>

          {/* Quick Actions */}
          <div className="mt-12">
            <h2 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '32px',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#FFC700',
              marginBottom: '24px',
              textAlign: 'center',
              textShadow: '2px 2px 0px #111111'
            }}>Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Plus, label: 'New Project', desc: 'Create project', href: '/admin/projects/new', color: '#FFC700' },
                { icon: Palette, label: 'Add Portfolio', desc: 'Add portfolio item', href: '/admin/portfolio/new', color: '#FF3EA5' },
                { icon: Package, label: 'Services', desc: 'Manage services', href: '/admin/services', color: '#00FF00' },
                { icon: CreditCard, label: 'Invoices', desc: 'Manage invoices', href: '/admin/invoices', color: '#00FFFF' },
                { icon: MessageSquare, label: 'Messages', desc: 'View all messages', href: '/admin/chat', color: '#FFC700' },
                { icon: Users, label: 'Manage Users', desc: 'User management', href: '/admin/users', color: '#FF3EA5' },
                { icon: BarChart3, label: 'Analytics', desc: 'View statistics', href: '/admin/analytics', color: '#00FF00' },
                { icon: Settings, label: 'Settings', desc: 'System settings', href: '/admin/settings', color: '#00FFFF' },
              ].map((action, index) => {
                const ActionIcon = action.icon;
                return (
                  <Link key={index} href={action.href}>
                    <div style={{
                      backgroundColor: '#FFFFFF',
                      border: '3px solid #111111',
                      boxShadow: '4px 4px 0px #111111',
                      padding: '24px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      height: '100%',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translate(-3px, -3px) rotate(-2deg)';
                      e.currentTarget.style.boxShadow = '7px 7px 0px #111111';
                      e.currentTarget.style.backgroundColor = action.color;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translate(0, 0) rotate(0deg)';
                      e.currentTarget.style.boxShadow = '4px 4px 0px #111111';
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }}>
                      <div style={{
                        backgroundColor: action.color,
                        width: '60px',
                        height: '60px',
                        margin: '0 auto 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '3px solid #111111',
                        boxShadow: '3px 3px 0px #111111',
                        transform: 'rotate(-5deg)'
                      }}>
                        <ActionIcon size={30} strokeWidth={2} color="#111111" />
                      </div>
                      <h3 style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '16px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: '#111111',
                        marginBottom: '4px'
                      }}>{action.label}</h3>
                      <p style={{
                        fontSize: '12px',
                        color: '#666'
                      }}>{action.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
