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
import { Edit3, ArrowLeft, User, Calendar, DollarSign, FileText, Target, Loader, Paperclip, Plus, Check, Clock, AlertCircle, Trash2, GripVertical } from "lucide-react";
import { RetroBatchUpload } from "@/components/ui/retro-batch-upload";
import { MilestonesManager } from "@/components/milestones/MilestonesManager";

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const { data: session } = useSession();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    clientId: "",
    budget: "",
    deadline: "",
    status: "PLANNING" as const,
    progress: 0,
    demoUrl: "",
  });
  
  const [attachments, setAttachments] = useState<Array<{id: string, name: string, url: string}>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get project data
  const { data: project, isLoading: projectLoading } = trpc.project.getById.useQuery(
    { id: projectId },
    { enabled: !!projectId }
  );
  
  // Get all users to select client
  const { data: users } = trpc.admin.getUsers.useQuery();
  const clients = Array.isArray(users) ? users.filter(user => user.role === "CLIENT") : [];
  
  const updateProject = trpc.project.update.useMutation({
    onSuccess: () => {
      router.push("/admin/projects");
    },
    onError: (error) => {
      console.error("Error updating project:", error);
      alert("Error updating project: " + error.message);
    },
  });
  
  // Pre-fill form when project data loads
  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description,
        clientId: project.clientId,
        budget: project.budget?.toString() || "",
        deadline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : "",
        status: project.status as any,
        progress: project.progress,
        demoUrl: project.demoUrl || "",
      });
      setIsLoading(false);
    }
  }, [project]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await updateProject.mutateAsync({
        id: projectId,
        title: formData.title,
        description: formData.description,
        clientId: formData.clientId,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        deadline: formData.deadline ? new Date(formData.deadline) : undefined,
        status: formData.status,
        progress: formData.progress,
        demoUrl: formData.demoUrl || "",
      });
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleInputChange = (field: string, value: string | number) => {
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
  
  if (isLoading || projectLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Loader className="animate-spin" size={32} />
              <span className="text-xl font-semibold">Loading project...</span>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-20">
          <div className="container mx-auto px-4 text-center">
            <RetroCard padding="xl" className="max-w-md mx-auto">
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>❌</div>
              <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
              <p className="mb-6">The project you're looking for doesn't exist.</p>
              <Link href="/admin/projects">
                <RetroButton variant="primary">
                  Back to Projects
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
              href="/admin/projects"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary-600 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Projects
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
              Edit Project
            </h1>
            <p style={{
              fontSize: '18px',
              color: '#FFFFFF',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Update project details and keep your workflow smooth
            </p>
          </div>
          
          {/* Edit Project Form */}
          <RetroCard padding="xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Project Title */}
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
                    <Target size={16} />
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
                
                {/* Client Selection */}
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
                    <User size={16} />
                    Client *
                  </label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => handleInputChange("clientId", e.target.value)}
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
                    <option value="">Select a client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name || client.email}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Budget */}
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
                    <DollarSign size={16} />
                    Budget (IDR)
                  </label>
                  <RetroInput
                    type="number"
                    value={formData.budget}
                    onChange={(e) => handleInputChange("budget", e.target.value)}
                    placeholder="Enter project budget"
                  />
                </div>
                
                {/* Deadline */}
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
                    <Calendar size={16} />
                    Deadline
                  </label>
                  <RetroInput
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleInputChange("deadline", e.target.value)}
                  />
                </div>
                
                {/* Status */}
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
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange("status", e.target.value)}
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
                    <option value="PLANNING">Planning</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REVIEW">Review</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
                
                {/* Progress */}
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
                    Progress (%)
                  </label>
                  <RetroInput
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress.toString()}
                    onChange={(e) => handleInputChange("progress", parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>
              
              {/* Demo URL */}
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
                  🌐 Demo URL
                </label>
                <RetroInput
                  type="url"
                  value={formData.demoUrl}
                  onChange={(e) => handleInputChange("demoUrl", e.target.value)}
                  placeholder="https://example.com/demo - URL for project preview/demo"
                />
                <p style={{
                  fontSize: '12px',
                  color: '#666666',
                  marginTop: '8px',
                  fontStyle: 'italic'
                }}>
                  Optional: Enter URL where clients can preview the project demo
                </p>
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
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={6}
                  placeholder="Describe the project goals, requirements, and deliverables..."
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
              
              {/* File Attachments */}
              <div>
                <label style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#111111',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Paperclip size={16} />
                  Project Attachments
                </label>
                <RetroBatchUpload
                  uploadType="attachment"
                  maxFiles={10}
                  acceptedTypes={['image/*', '.pdf', '.doc', '.docx', '.txt', '.zip', '.rar']}
                  maxSizePerFile={25}
                  onUploadComplete={(files) => {
                    setAttachments(files.map(f => ({
                      id: f.id,
                      name: f.name,
                      url: f.url || ''
                    })));
                  }}
                />
                <p style={{
                  fontSize: '12px',
                  color: '#666666',
                  marginTop: '8px',
                  fontStyle: 'italic'
                }}>
                  Optional: Upload additional project files, updates, or documentation
                </p>
              </div>
              
              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <RetroButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting || !formData.title || !formData.description || !formData.clientId}
                  className="min-w-[200px]"
                >
                  {isSubmitting ? "Updating..." : "💾 Update Project"}
                </RetroButton>
                
                <Link href="/admin/projects">
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
          
          {/* Milestone Management Section */}
          <div className="mt-12">
            <MilestonesManager projectId={projectId} />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
