"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { RetroAdminLayout, RetroPageHeader, RetroAnimations } from "@/components/ui/retro-admin-layout";
import { RetroCard } from "@/components/ui/retro-card";
import { RetroButton } from "@/components/ui/retro-button";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import toast from "react-hot-toast";
import { Shield, ShieldOff, Users, UserCheck, AlertCircle, ArrowLeft, UserPlus } from "lucide-react";

export default function AdminUsersPage() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  
  const { data: users, refetch } = trpc.admin.getUsers.useQuery();
  const { data: stats } = trpc.admin.getAdminStats.useQuery();
  
  const promoteUser = trpc.admin.promoteToAdmin.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedUser(null);
    },
  });
  
  const demoteUser = trpc.admin.demoteToClient.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedUser(null);
    },
  });

  const handlePromote = (userId: string) => {
    const user = users?.find(u => u.id === userId);
    if (!user) return;
    
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
            🚪 Promote to Admin?
          </div>
          <div style={{
            fontSize: '14px',
            color: '#666666',
            lineHeight: '1.4',
            marginBottom: '12px'
          }}>
            Are you sure you want to promote {user.name} to admin? They will gain access to the admin dashboard.
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
            onClick={() => {
              toast.dismiss(t.id);
              promoteUser.mutate({ userId });
              toast.success(`${user.name} promoted to admin successfully`, {
                style: {
                  background: '#00FF00',
                  color: '#111111',
                  border: '2px solid #111111',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 700,
                }
              });
            }}
            disabled={promoteUser.isLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#00FF00',
              border: '2px solid #111111',
              color: '#111111',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              cursor: promoteUser.isLoading ? 'not-allowed' : 'pointer',
              opacity: promoteUser.isLoading ? 0.6 : 1,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              if (!promoteUser.isLoading) {
                e.currentTarget.style.backgroundColor = '#00FFFF';
              }
            }}
            onMouseLeave={(e) => {
              if (!promoteUser.isLoading) {
                e.currentTarget.style.backgroundColor = '#00FF00';
              }
            }}
          >
            {promoteUser.isLoading ? (
              <>
                <div style={{
                  width: '12px',
                  height: '12px',
                  border: '2px solid #111111',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Promoting...
              </>
            ) : (
              <>
                🚀 Promote
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
      id: 'promote-user-confirmation'
    });
  };

  const handleDemote = (userId: string) => {
    const user = users?.find(u => u.id === userId);
    if (!user) return;
    
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
            ⚠️ Demote to Client?
          </div>
          <div style={{
            fontSize: '14px',
            color: '#666666',
            lineHeight: '1.4',
            marginBottom: '12px'
          }}>
            Are you sure you want to demote {user.name} to client? They will lose access to admin features.
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
            onClick={() => {
              toast.dismiss(t.id);
              demoteUser.mutate({ userId });
              toast.success(`${user.name} demoted to client successfully`, {
                style: {
                  background: '#FF3EA5',
                  color: '#FFFFFF',
                  border: '2px solid #111111',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 700,
                }
              });
            }}
            disabled={demoteUser.isLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#FF3EA5',
              border: '2px solid #111111',
              color: '#FFFFFF',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              cursor: demoteUser.isLoading ? 'not-allowed' : 'pointer',
              opacity: demoteUser.isLoading ? 0.6 : 1,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              if (!demoteUser.isLoading) {
                e.currentTarget.style.backgroundColor = '#E1306C';
              }
            }}
            onMouseLeave={(e) => {
              if (!demoteUser.isLoading) {
                e.currentTarget.style.backgroundColor = '#FF3EA5';
              }
            }}
          >
            {demoteUser.isLoading ? (
              <>
                <div style={{
                  width: '12px',
                  height: '12px',
                  border: '2px solid #FFFFFF',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Demoting...
              </>
            ) : (
              <>
                🔄 Demote
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
      id: 'demote-user-confirmation'
    });
  };

  return (
    <RetroAdminLayout>
      <RetroAnimations />
      
      {/* Back Navigation - Positioned closer to topbar */}
      <div className="container mx-auto px-6 pt-4 mb-2">
        <Link href="/admin/dashboard">
          <button style={{
            backgroundColor: '#FFFFFF',
            color: '#111111',
            border: '2px solid #111111',
            padding: '8px 16px',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            textTransform: 'uppercase',
            boxShadow: '2px 2px 0px #111111',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translate(-1px, -1px)';
            e.currentTarget.style.boxShadow = '3px 3px 0px #111111';
            e.currentTarget.style.backgroundColor = '#FFC700';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translate(0, 0)';
            e.currentTarget.style.boxShadow = '2px 2px 0px #111111';
            e.currentTarget.style.backgroundColor = '#FFFFFF';
          }}>
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </Link>
      </div>
      
      <div className="container mx-auto px-6">
        
        <RetroPageHeader 
          icon="👥" 
          title="User Management" 
          description="Manage user roles and permissions with retro style"
        />

        {/* Retro Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <RetroCard padding="lg" className="text-center">
            <div className="flex items-center justify-between">
              <div>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#111111', 
                  fontWeight: 600, 
                  textTransform: 'uppercase',
                  marginBottom: '8px'
                }}>Total Users</p>
                <p style={{ 
                  fontSize: '32px', 
                  fontWeight: 800, 
                  color: '#FF3EA5',
                  fontFamily: 'Poppins, sans-serif'
                }}>{stats?.totalUsers || 0}</p>
              </div>
              <div style={{
                backgroundColor: '#FFC700',
                padding: '12px',
                border: '2px solid #111111',
                boxShadow: '3px 3px 0px #111111'
              }}>
                <Users size={24} strokeWidth={2} color="#111111" />
              </div>
            </div>
          </RetroCard>
          
          <RetroCard padding="lg" className="text-center">
            <div className="flex items-center justify-between">
              <div>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#111111', 
                  fontWeight: 600, 
                  textTransform: 'uppercase',
                  marginBottom: '8px'
                }}>Admins</p>
                <p style={{ 
                  fontSize: '32px', 
                  fontWeight: 800, 
                  color: '#FF3EA5',
                  fontFamily: 'Poppins, sans-serif'
                }}>{stats?.adminCount || 0}</p>
              </div>
              <div style={{
                backgroundColor: '#00FFFF',
                padding: '12px',
                border: '2px solid #111111',
                boxShadow: '3px 3px 0px #111111'
              }}>
                <Shield size={24} strokeWidth={2} color="#111111" />
              </div>
            </div>
          </RetroCard>
          
          <RetroCard padding="lg" className="text-center">
            <div className="flex items-center justify-between">
              <div>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#111111', 
                  fontWeight: 600, 
                  textTransform: 'uppercase',
                  marginBottom: '8px'
                }}>Clients</p>
                <p style={{ 
                  fontSize: '32px', 
                  fontWeight: 800, 
                  color: '#FF3EA5',
                  fontFamily: 'Poppins, sans-serif'
                }}>{stats?.clientCount || 0}</p>
              </div>
              <div style={{
                backgroundColor: '#FFC700',
                padding: '12px',
                border: '2px solid #111111',
                boxShadow: '3px 3px 0px #111111'
              }}>
                <UserCheck size={24} strokeWidth={2} color="#111111" />
              </div>
            </div>
          </RetroCard>
          
          <RetroCard padding="lg" className="text-center">
            <div className="flex items-center justify-between">
              <div>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#111111', 
                  fontWeight: 600, 
                  textTransform: 'uppercase',
                  marginBottom: '8px'
                }}>Projects</p>
                <p style={{ 
                  fontSize: '32px', 
                  fontWeight: 800, 
                  color: '#FF3EA5',
                  fontFamily: 'Poppins, sans-serif'
                }}>{stats?.totalProjects || 0}</p>
              </div>
              <div style={{
                backgroundColor: '#00FFFF',
                padding: '12px',
                border: '2px solid #111111',
                boxShadow: '3px 3px 0px #111111'
              }}>
                <AlertCircle size={24} strokeWidth={2} color="#111111" />
              </div>
            </div>
          </RetroCard>
        </div>

        {/* Retro Users Table */}
        <RetroCard padding="none" className="overflow-hidden">
          <div style={{
            padding: '20px',
            borderBottom: '3px solid #111111',
            backgroundColor: '#FFC700'
          }}>
            <h2 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '24px',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#111111',
              textShadow: '2px 2px 0px #FFFFFF'
            }}>All Users</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: '#FF3EA5' }}>
                <tr>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontFamily: 'Poppins, sans-serif'
                  }}>User</th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontFamily: 'Poppins, sans-serif'
                  }}>Email</th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontFamily: 'Poppins, sans-serif'
                  }}>Role</th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontFamily: 'Poppins, sans-serif'
                  }}>Joined</th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontFamily: 'Poppins, sans-serif'
                  }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: '#FFFFFF' }}>
                {users?.map((user, index) => (
                  <tr key={user.id} style={{
                    backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F8F9FF',
                    borderBottom: '2px solid #111111',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFC700';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#FFFFFF' : '#F8F9FF';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}>
                    <td style={{ padding: '20px 24px', whiteSpace: 'nowrap' }}>
                      <div className="flex items-center">
                        {user.image ? (
                          <img
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '50%',
                              border: '3px solid #111111',
                              boxShadow: '2px 2px 0px #111111'
                            }}
                            src={user.image}
                            alt={user.name || "User"}
                          />
                        ) : (
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            backgroundColor: '#FF3EA5',
                            border: '3px solid #111111',
                            boxShadow: '2px 2px 0px #111111',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <span style={{
                              color: '#FFFFFF',
                              fontSize: '18px',
                              fontWeight: 800,
                              fontFamily: 'Poppins, sans-serif'
                            }}>
                              {user.name?.charAt(0) || user.email.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div style={{ marginLeft: '16px' }}>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: 700,
                            color: '#111111',
                            fontFamily: 'Poppins, sans-serif'
                          }}>
                            {user.name || "No name"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: '14px', color: '#111111' }}>{user.email}</div>
                    </td>
                    <td style={{ padding: '20px 24px', whiteSpace: 'nowrap' }}>
                      <span style={{
                        padding: '6px 16px',
                        display: 'inline-flex',
                        fontSize: '12px',
                        lineHeight: '1.5',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        border: '2px solid #111111',
                        boxShadow: '2px 2px 0px #111111',
                        backgroundColor: user.role === "ADMIN" ? '#00FFFF' : '#FFC700',
                        color: '#111111',
                        fontFamily: 'Poppins, sans-serif'
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '20px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#111111' }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '20px 24px', whiteSpace: 'nowrap', fontSize: '14px', fontWeight: 600 }}>
                      {user.role === "CLIENT" ? (
                        <button
                          onClick={() => handlePromote(user.id)}
                          disabled={promoteUser.isPending}
                          style={{
                            backgroundColor: '#00FFFF',
                            border: '2px solid #111111',
                            padding: '8px',
                            boxShadow: '2px 2px 0px #111111',
                            cursor: promoteUser.isPending ? 'not-allowed' : 'pointer',
                            opacity: promoteUser.isPending ? 0.5 : 1,
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (!promoteUser.isPending) {
                              e.currentTarget.style.backgroundColor = '#FF3EA5';
                              e.currentTarget.style.transform = 'scale(1.1)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#00FFFF';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                          title="Promote to admin"
                        >
                          <Shield size={16} strokeWidth={2} color="#111111" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDemote(user.id)}
                          disabled={demoteUser.isPending || stats?.adminCount === 1}
                          style={{
                            backgroundColor: '#FFC700',
                            border: '2px solid #111111',
                            padding: '8px',
                            boxShadow: '2px 2px 0px #111111',
                            cursor: (demoteUser.isPending || stats?.adminCount === 1) ? 'not-allowed' : 'pointer',
                            opacity: (demoteUser.isPending || stats?.adminCount === 1) ? 0.5 : 1,
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (!demoteUser.isPending && stats?.adminCount !== 1) {
                              e.currentTarget.style.backgroundColor = '#FF3EA5';
                              e.currentTarget.style.transform = 'scale(1.1)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#FFC700';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                          title={stats?.adminCount === 1 ? "Cannot demote last admin" : "Demote to client"}
                        >
                          <ShieldOff size={16} strokeWidth={2} color="#111111" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </RetroCard>

        {/* Retro Error Messages */}
        {(promoteUser.error || demoteUser.error) && (
          <div style={{
            marginTop: '24px',
            backgroundColor: '#FF3EA5',
            border: '3px solid #111111',
            boxShadow: '4px 4px 0px #111111',
            color: '#FFFFFF',
            padding: '20px 24px',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 700,
            textTransform: 'uppercase'
          }}>
            ⚠️ {promoteUser.error?.message || demoteUser.error?.message}
          </div>
        )}
      </div>
    </RetroAdminLayout>
  );
}
