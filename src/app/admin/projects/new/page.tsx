"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { RetroAdminLayout, RetroPageHeader, RetroAnimations, RetroBackButton } from "@/components/ui/retro-admin-layout";
import { RetroCard } from "@/components/ui/retro-card";
import { RetroButton } from "@/components/ui/retro-button";
import { RetroInput } from "@/components/ui/retro-input";
import { trpc } from "@/lib/trpc";
import { Rocket, ArrowLeft, User, Calendar, DollarSign, FileText, Target, Paperclip } from "lucide-react";
import { RetroBatchUpload } from "@/components/ui/retro-batch-upload";

export default function CreateProjectPage() {
  const router = useRouter();
  const { data: session } = useSession();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    clientId: "",
    budget: "",
    deadline: "",
    status: "PLANNING" as const,
    progress: 0,
  });
  
  const [attachments, setAttachments] = useState<Array<{id: string, name: string, url: string}>>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get all users to select client
  const { data: users } = trpc.admin.getUsers.useQuery();
  const clients = Array.isArray(users) ? users.filter(user => user.role === "CLIENT") : [];
  
  const createProject = trpc.project.create.useMutation({
    onSuccess: () => {
      router.push("/admin/projects");
    },
    onError: (error) => {
      console.error("Error creating project:", error);
      alert("Error creating project: " + error.message);
    },
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await createProject.mutateAsync({
        title: formData.title,
        description: formData.description,
        clientId: formData.clientId,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        deadline: formData.deadline ? new Date(formData.deadline) : undefined,
        status: formData.status,
        progress: formData.progress,
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
      <RetroAdminLayout>
        <div className="container mx-auto px-6 text-center py-20">
          <RetroCard padding="lg">
            <div style={{ fontSize: '72px', marginBottom: '24px' }}>🛡️</div>
            <h1 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '32px',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#FF3EA5',
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
      </RetroAdminLayout>
    );
  }
  
  return (
    <RetroAdminLayout>
      <RetroAnimations />
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Back Navigation */}
        <div className="mb-8">
          <RetroBackButton href="/admin/projects" label="Back to Projects" />
        </div>
        
        {/* Page Header */}
        <RetroPageHeader 
          icon="🚀" 
          title="Create New Project" 
          description="Launch a new project and start building something amazing!"
        />
        {/* Create Project Form */}
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
                    Initial Progress (%)
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
                  Optional: Upload project requirements, wireframes, assets, or reference materials
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
                  {isSubmitting ? "Creating..." : "🚀 Create Project"}
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
      </div>
    </RetroAdminLayout>
  );
}
