"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RetroCard } from "@/components/ui/retro-card";
import { RetroButton } from "@/components/ui/retro-button";
import { RetroInput } from "@/components/ui/retro-input";
import { trpc } from "@/lib/trpc";
import toast from "react-hot-toast";
import { 
  ArrowLeft, 
  Plus, 
  FileText,
  DollarSign,
  Calendar,
  User,
  Building,
  Save,
  Send,
  Eye,
  AlertCircle
} from "lucide-react";

export default function NewInvoicePage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    projectId: "",
    clientId: "",
    amount: "",
    currency: "IDR",
    description: "",
    dueDate: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch projects and users for dropdowns
  const { data: projects, isLoading: projectsLoading } = trpc.project.getAll.useQuery();
  const { data: users, isLoading: usersLoading } = trpc.admin.getUsers.useQuery();
  
  const createInvoiceMutation = trpc.payment.createInvoice.useMutation({
    onSuccess: (data) => {
      toast.success("Invoice created successfully!", {
        style: {
          background: '#00FF00',
          color: '#111111',
          border: '2px solid #111111',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 700,
        }
      });
      router.push('/admin/invoices');
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create invoice", {
        style: {
          background: '#FF3EA5',
          color: '#FFFFFF',
          border: '2px solid #111111',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 700,
        }
      });
    },
  });

  // Get clients (users with CLIENT role)
  const clients = users?.filter(user => user.role === "CLIENT") || [];

  // Get project for selected client
  const selectedProject = projects?.find(p => p.id === formData.projectId);
  const projectClient = selectedProject?.client;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.projectId) {
      newErrors.projectId = "Project is required";
    }
    
    if (!formData.clientId) {
      newErrors.clientId = "Client is required";
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    } else {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        newErrors.dueDate = "Due date cannot be in the past";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createInvoiceMutation.mutateAsync({
        projectId: formData.projectId,
        clientId: formData.clientId,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        description: formData.description || undefined,
        dueDate: new Date(formData.dueDate).toISOString(),
      });
    } catch (error) {
      console.error("Failed to create invoice:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }

    // Auto-select client when project is selected
    if (field === "projectId") {
      const project = projects?.find(p => p.id === value);
      if (project) {
        setFormData(prev => ({ ...prev, clientId: project.clientId }));
        if (errors.clientId) {
          setErrors(prev => ({ ...prev, clientId: "" }));
        }
      }
    }
  };

  // Get default due date (30 days from now)
  const getDefaultDueDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
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
      
      <main className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Back Navigation */}
          <div className="mb-6">
            <Link href="/admin/invoices">
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
                Back to Invoices
              </button>
            </Link>
          </div>
          
          {/* Page Header */}
          <div className="mb-8 text-center">
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
                <Plus size={40} strokeWidth={3} color="#FFFFFF" />
              </div>
            </div>
            <h1 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '42px',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#FF3EA5',
              marginBottom: '16px',
              textShadow: '2px 2px 0px #111111'
            }}>
              Create New Invoice
            </h1>
            <p style={{
              fontSize: '18px',
              color: '#FFFFFF',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Generate an invoice for your client projects
            </p>
          </div>

          {/* Form */}
          <RetroCard padding="xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Project Selection */}
              <div>
                <label style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '16px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#111111',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  Project *
                </label>
                <select
                  value={formData.projectId}
                  onChange={(e) => handleInputChange("projectId", e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `2px solid ${errors.projectId ? '#FF3EA5' : '#111111'}`,
                    backgroundColor: '#FFFFFF',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '16px',
                    fontWeight: 500,
                    boxShadow: '2px 2px 0px #111111',
                    outline: 'none'
                  }}
                  disabled={projectsLoading}
                >
                  <option value="">Select a project...</option>
                  {projects?.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title} - {project.client.name}
                    </option>
                  ))}
                </select>
                {errors.projectId && (
                  <p style={{
                    color: '#FF3EA5',
                    fontSize: '14px',
                    marginTop: '4px',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600
                  }}>
                    {errors.projectId}
                  </p>
                )}
              </div>

              {/* Client Selection */}
              <div>
                <label style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '16px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#111111',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  Client *
                </label>
                <select
                  value={formData.clientId}
                  onChange={(e) => handleInputChange("clientId", e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `2px solid ${errors.clientId ? '#FF3EA5' : '#111111'}`,
                    backgroundColor: formData.projectId ? '#F5F5F5' : '#FFFFFF',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '16px',
                    fontWeight: 500,
                    boxShadow: '2px 2px 0px #111111',
                    outline: 'none'
                  }}
                  disabled={usersLoading || !!formData.projectId}
                >
                  <option value="">Select a client...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} - {client.email}
                    </option>
                  ))}
                </select>
                {formData.projectId && projectClient && (
                  <p style={{
                    color: '#666666',
                    fontSize: '14px',
                    marginTop: '4px',
                    fontFamily: 'Poppins, sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertCircle size={16} />
                    Client auto-selected from project: {projectClient.name}
                  </p>
                )}
                {errors.clientId && (
                  <p style={{
                    color: '#FF3EA5',
                    fontSize: '14px',
                    marginTop: '4px',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600
                  }}>
                    {errors.clientId}
                  </p>
                )}
              </div>

              {/* Amount and Currency */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '16px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#111111',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Amount *
                  </label>
                  <RetroInput
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => handleInputChange("amount", e.target.value)}
                    error={errors.amount}
                  />
                </div>
                
                <div>
                  <label style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '16px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#111111',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => handleInputChange("currency", e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #111111',
                      backgroundColor: '#FFFFFF',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '16px',
                      fontWeight: 500,
                      boxShadow: '2px 2px 0px #111111',
                      outline: 'none'
                    }}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="IDR">IDR (Rp)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '16px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#111111',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  Due Date *
                </label>
                <RetroInput
                  type="date"
                  value={formData.dueDate || getDefaultDueDate()}
                  onChange={(e) => handleInputChange("dueDate", e.target.value)}
                  error={errors.dueDate}
                />
              </div>

              {/* Description */}
              <div>
                <label style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '16px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#111111',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  Description (Optional)
                </label>
                <textarea
                  rows={4}
                  placeholder="Add any additional details about this invoice..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #111111',
                    backgroundColor: '#FFFFFF',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '16px',
                    fontWeight: 500,
                    boxShadow: '2px 2px 0px #111111',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: '100px'
                  }}
                />
              </div>

              {/* Invoice Preview */}
              {formData.projectId && formData.amount && (
                <RetroCard padding="md" className="bg-gray-50">
                  <h3 style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '18px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#111111',
                    marginBottom: '16px'
                  }}>
                    Invoice Preview
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Project:</strong> {selectedProject?.title}</p>
                      <p><strong>Client:</strong> {projectClient?.name}</p>
                      <p><strong>Email:</strong> {projectClient?.email}</p>
                    </div>
                    <div className="text-right">
                      <p><strong>Amount:</strong> {formData.currency} {formData.amount}</p>
                      <p><strong>Due Date:</strong> {formData.dueDate ? new Date(formData.dueDate).toLocaleDateString() : 'Not set'}</p>
                      <p><strong>Status:</strong> <span className="text-yellow-600">PENDING</span></p>
                    </div>
                  </div>
                  
                  {formData.description && (
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <p><strong>Description:</strong></p>
                      <p className="mt-1 text-gray-600">{formData.description}</p>
                    </div>
                  )}
                </RetroCard>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-300">
                <Link href="/admin/invoices">
                  <RetroButton variant="secondary" size="lg">
                    Cancel
                  </RetroButton>
                </Link>
                
                <RetroButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting || !formData.projectId || !formData.amount}
                >
                  <Save size={20} />
                  {isSubmitting ? 'Creating...' : 'Create Invoice'}
                </RetroButton>
              </div>
            </form>
          </RetroCard>
        </div>
      </main>

      <Footer />
    </div>
  );
}
