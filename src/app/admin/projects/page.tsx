"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { RetroAdminLayout, RetroPageHeader, RetroAnimations, RetroBackButton } from "@/components/ui/retro-admin-layout";
import { RetroCard } from "@/components/ui/retro-card";
import { RetroButton } from "@/components/ui/retro-button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { trpc } from "@/lib/trpc";
import toast from "react-hot-toast";
import { FolderOpen, Plus, Edit, Eye, Zap, Trash2 } from "lucide-react";

export default function AdminProjectsPage() {
  const { data: session } = useSession();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { data: projectsData, isLoading, refetch } = trpc.project.getAll.useQuery();
  
  // Ensure projects is always an array
  const projects = Array.isArray(projectsData) ? projectsData : [];
  
  const updateProgress = trpc.project.updateProgress.useMutation({
    onSuccess: () => {
      setIsUpdating(false);
      setSelectedProject(null);
      refetch();
    },
  });

  const deleteProject = trpc.project.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleUpdateProgress = async (projectId: string, newProgress: number) => {
    setIsUpdating(true);
    await updateProgress.mutateAsync({
      id: projectId,
      progress: newProgress,
    });
  };

  const handleDeleteProject = async (projectId: string, projectTitle: string) => {
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
            ⚠️ Delete Project?
          </div>
          <div style={{
            fontSize: '14px',
            color: '#666666',
            lineHeight: '1.4',
            marginBottom: '12px'
          }}>
            Are you sure you want to delete "{projectTitle}"? This action cannot be undone and will remove all project data.
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
              await deleteProject.mutateAsync({ id: projectId });
              toast.success(`Project "${projectTitle}" deleted successfully`, {
                style: {
                  background: '#FF3EA5',
                  color: '#FFFFFF',
                  border: '2px solid #111111',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 700,
                }
              });
            }}
            disabled={deleteProject.isLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#FF3EA5',
              border: '2px solid #111111',
              color: '#FFFFFF',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              cursor: deleteProject.isLoading ? 'not-allowed' : 'pointer',
              opacity: deleteProject.isLoading ? 0.6 : 1,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              if (!deleteProject.isLoading) {
                e.currentTarget.style.backgroundColor = '#E1306C';
              }
            }}
            onMouseLeave={(e) => {
              if (!deleteProject.isLoading) {
                e.currentTarget.style.backgroundColor = '#FF3EA5';
              }
            }}
          >
            {deleteProject.isLoading ? (
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
                🗑️ Delete Project
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
        maxWidth: '450px',
        padding: '16px'
      },
      id: 'delete-project-confirmation'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "REVIEW":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "✅";
      case "IN_PROGRESS":
        return "⚡";
      case "REVIEW":
        return "👀";
      default:
        return "📋";
    }
  };

  if (!session || session.user.role !== "ADMIN") {
    return (
      <RetroAdminLayout>
        <div className="container mx-auto px-6 text-center py-20">
          <RetroCard padding="lg">
            <h1 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '32px',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#FF3EA5',
              marginBottom: '16px'
            }}>Access Denied</h1>
            <p style={{ color: '#111111' }}>You need admin privileges to access this page.</p>
          </RetroCard>
        </div>
      </RetroAdminLayout>
    );
  }

  return (
    <RetroAdminLayout>
      <RetroAnimations />
      <div className="container mx-auto px-6">
        {/* Back Navigation */}
        <div className="mb-8">
          <RetroBackButton href="/admin/dashboard" label="Back to Dashboard" />
        </div>

        {/* Page Header */}
        <RetroPageHeader 
          icon="📁" 
          title="Project Management" 
          description="Manage all client projects and their progress with retro style"
          actionButton={
            <Link href="/admin/projects/new">
              <RetroButton
                variant="primary"
                size="lg"
                style={{
                  backgroundColor: '#FFC700',
                  color: '#111111',
                  border: '3px solid #111111',
                  boxShadow: '4px 4px 0px #111111',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Plus size={20} /> New Project
              </RetroButton>
            </Link>
          }
        />

        {/* Retro Project Statistics */}
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
                }}>Total Projects</p>
                <p style={{ 
                  fontSize: '32px', 
                  fontWeight: 800, 
                  color: '#FF3EA5',
                  fontFamily: 'Poppins, sans-serif'
                }}>{projects.length}</p>
              </div>
              <div style={{
                backgroundColor: '#FFC700',
                padding: '12px',
                border: '2px solid #111111',
                boxShadow: '3px 3px 0px #111111'
              }}>
                <FolderOpen size={24} strokeWidth={2} color="#111111" />
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
                }}>In Progress</p>
                <p style={{ 
                  fontSize: '32px', 
                  fontWeight: 800, 
                  color: '#FF3EA5',
                  fontFamily: 'Poppins, sans-serif'
                }}>{projects.filter(p => p.status === "IN_PROGRESS").length}</p>
              </div>
              <div style={{
                backgroundColor: '#00FFFF',
                padding: '12px',
                border: '2px solid #111111',
                boxShadow: '3px 3px 0px #111111'
              }}>
                <Zap size={24} strokeWidth={2} color="#111111" />
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
                }}>Completed</p>
                <p style={{ 
                  fontSize: '32px', 
                  fontWeight: 800, 
                  color: '#FF3EA5',
                  fontFamily: 'Poppins, sans-serif'
                }}>{projects.filter(p => p.status === "COMPLETED").length}</p>
              </div>
              <div style={{
                backgroundColor: '#FFC700',
                padding: '12px',
                border: '2px solid #111111',
                boxShadow: '3px 3px 0px #111111'
              }}>
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth={2}>
                  <path d="M9 12l2 2 4-4"/>
                  <circle cx="12" cy="12" r="10"/>
                </svg>
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
                }}>Avg Progress</p>
                <p style={{ 
                  fontSize: '32px', 
                  fontWeight: 800, 
                  color: '#FF3EA5',
                  fontFamily: 'Poppins, sans-serif'
                }}>{projects.length ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) : 0}%</p>
              </div>
              <div style={{
                backgroundColor: '#00FFFF',
                padding: '12px',
                border: '2px solid #111111',
                boxShadow: '3px 3px 0px #111111'
              }}>
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth={2}>
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
            </div>
          </RetroCard>
        </div>

        {/* Retro Projects List */}
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <RetroCard key={i} padding="lg" className="animate-pulse">
                <div style={{ height: '24px', backgroundColor: '#FFC700', marginBottom: '16px', width: '33%' }}></div>
                <div style={{ height: '16px', backgroundColor: '#FF3EA5', marginBottom: '16px', width: '66%' }}></div>
                <div style={{ height: '8px', backgroundColor: '#00FFFF', width: '100%' }}></div>
              </RetroCard>
            ))}
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="space-y-6">
            {projects.map((project) => (
              <RetroCard key={project.id} padding="lg">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div style={{
                        fontSize: '32px',
                        backgroundColor: '#FFC700',
                        padding: '8px',
                        border: '2px solid #111111',
                        boxShadow: '2px 2px 0px #111111',
                        display: 'inline-block'
                      }}>
                        {getStatusIcon(project.status)}
                      </div>
                      <div>
                        <h3 style={{
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '24px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          color: '#111111',
                          marginBottom: '8px'
                        }}>
                          {project.title}
                        </h3>
                        <p style={{
                          fontSize: '14px',
                          color: '#111111',
                          opacity: 0.7
                        }}>
                          Client: {project.client.name} • Created: {new Date(project.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <p style={{
                      fontSize: '16px',
                      color: '#111111',
                      marginBottom: '20px',
                      lineHeight: 1.6
                    }}>
                      {project.description}
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between" style={{ fontSize: '14px', fontWeight: 600 }}>
                        <span style={{ color: '#111111' }}>Progress</span>
                        <span style={{ 
                          color: '#FF3EA5',
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '16px'
                        }}>{project.progress}%</span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '12px',
                        backgroundColor: '#FFFFFF',
                        border: '2px solid #111111',
                        boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.2)',
                        position: 'relative'
                      }}>
                        <div style={{
                          width: `${project.progress}%`,
                          height: '100%',
                          backgroundColor: project.progress === 100 ? '#00FFFF' : '#FFC700',
                          border: project.progress > 0 ? '1px solid #111111' : 'none',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                      
                      {project.milestones && project.milestones.length > 0 && (
                        <div style={{
                          fontSize: '14px',
                          color: '#111111',
                          opacity: 0.7
                        }}>
                          Milestones: {project.milestones.filter(m => m.status === 'COMPLETED').length} / {project.milestones.length} completed
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col lg:items-end gap-4">
                    <div style={{
                      display: 'inline-block',
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      border: '2px solid #111111',
                      boxShadow: '2px 2px 0px #111111',
                      backgroundColor: project.status === 'COMPLETED' ? '#00FFFF' : 
                                       project.status === 'IN_PROGRESS' ? '#FFC700' :
                                       project.status === 'REVIEW' ? '#FF3EA5' : '#FFFFFF',
                      color: '#111111',
                      fontFamily: 'Poppins, sans-serif'
                    }}>
                      {project.status.replace('_', ' ')}
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      <Link href={`/admin/projects/edit/${project.id}`}>
                        <button style={{
                          backgroundColor: '#00FFFF',
                          border: '2px solid #111111',
                          padding: '8px 12px',
                          boxShadow: '2px 2px 0px #111111',
                          fontSize: '12px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#FF3EA5';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#00FFFF';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}>
                          <Edit size={16} /> Edit
                        </button>
                      </Link>
                      
                      <Link href={`/client/projects/${project.id}`}>
                        <button style={{
                          backgroundColor: '#FFC700',
                          border: '2px solid #111111',
                          padding: '8px 12px',
                          boxShadow: '2px 2px 0px #111111',
                          fontSize: '12px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontFamily: 'Poppins, sans-serif',
                          color: '#111111'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#FF3EA5';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#FFC700';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}>
                          <Eye size={16} strokeWidth={2} color="#111111" /> 
                          <span>View</span>
                        </button>
                      </Link>
                      
                      <button
                        onClick={() => setSelectedProject(selectedProject === project.id ? null : project.id)}
                        disabled={isUpdating}
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: '2px solid #111111',
                          padding: '8px 12px',
                          boxShadow: '2px 2px 0px #111111',
                          fontSize: '12px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          cursor: isUpdating ? 'not-allowed' : 'pointer',
                          opacity: isUpdating ? 0.5 : 1,
                          transition: 'all 0.2s',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        onMouseEnter={(e) => {
                          if (!isUpdating) {
                            e.currentTarget.style.backgroundColor = '#00FFFF';
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#FFFFFF';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <Zap size={16} /> {isUpdating && selectedProject === project.id ? "..." : "Update"}
                      </button>
                      
                      <button
                        onClick={() => handleDeleteProject(project.id, project.title)}
                        disabled={deleteProject.isLoading}
                        style={{
                          backgroundColor: '#FF3EA5',
                          border: '2px solid #111111',
                          padding: '8px 12px',
                          boxShadow: '2px 2px 0px #111111',
                          fontSize: '12px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          cursor: deleteProject.isLoading ? 'not-allowed' : 'pointer',
                          opacity: deleteProject.isLoading ? 0.5 : 1,
                          transition: 'all 0.2s',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        onMouseEnter={(e) => {
                          if (!deleteProject.isLoading) {
                            e.currentTarget.style.backgroundColor = '#FFFFFF';
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#FF3EA5';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <Trash2 size={16} /> {deleteProject.isLoading ? "..." : "Delete"}
                      </button>
                    </div>
                    
                    {/* Quick Progress Update */}
                    {selectedProject === project.id && (
                      <RetroCard padding="md" className="w-full lg:w-64">
                        <h4 style={{
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '16px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: '#111111',
                          marginBottom: '12px'
                        }}>Update Progress</h4>
                        <div className="space-y-2">
                          {[0, 25, 50, 75, 100].map((progress) => (
                            <button
                              key={progress}
                              onClick={() => handleUpdateProgress(project.id, progress)}
                              disabled={isUpdating}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                fontSize: '12px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                border: '2px solid #111111',
                                backgroundColor: project.progress === progress ? '#FF3EA5' : '#FFFFFF',
                                color: project.progress === progress ? '#FFFFFF' : '#111111',
                                cursor: isUpdating ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                if (!isUpdating && project.progress !== progress) {
                                  e.currentTarget.style.backgroundColor = '#FFC700';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (project.progress !== progress) {
                                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                                }
                              }}
                            >
                              {progress}% {progress === 100 ? "Complete" : progress === 0 ? "Not Started" : "Progress"}
                            </button>
                          ))}
                        </div>
                      </RetroCard>
                    )}
                  </div>
                </div>

                {/* Messages indicator */}
                {project._count && project._count.messages > 0 && (
                  <div style={{
                    marginTop: '20px',
                    paddingTop: '20px',
                    borderTop: '2px dashed #FF3EA5'
                  }}>
                    <Link href={`/admin/chat?project=${project.id}`}>
                      <button style={{
                        backgroundColor: '#00FFFF',
                        border: '2px solid #111111',
                        padding: '8px 16px',
                        boxShadow: '2px 2px 0px #111111',
                        fontSize: '14px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#FFC700';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#00FFFF';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}>
                        💬 {project._count.messages} message{project._count.messages !== 1 ? 's' : ''}
                      </button>
                    </Link>
                  </div>
                )}
              </RetroCard>
            ))}
          </div>
        ) : (
          <RetroCard padding="lg" className="text-center py-20">
            <div style={{
              fontSize: '80px',
              marginBottom: '24px',
              animation: 'bounce 2s infinite'
            }}>📋</div>
            <h2 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '36px',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#FF3EA5',
              marginBottom: '16px'
            }}>
              No Projects Yet
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#111111',
              marginBottom: '32px',
              maxWidth: '500px',
              margin: '0 auto 32px'
            }}>
              Start managing your client projects by creating your first project.
            </p>
            <Link href="/admin/projects/new">
              <RetroButton
                variant="primary"
                size="lg"
                style={{
                  backgroundColor: '#FFC700',
                  color: '#111111',
                  border: '3px solid #111111',
                  boxShadow: '4px 4px 0px #111111',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '16px 32px'
                }}
              >
                Create First Project
              </RetroButton>
            </Link>
          </RetroCard>
        )}
      </div>
    </RetroAdminLayout>
  );
}
