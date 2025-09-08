"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RetroCard } from "@/components/ui/retro-card";
import { RetroButton } from "@/components/ui/retro-button";
import { trpc } from "@/lib/trpc";
import { retroToast } from "@/utils/toast";
import { InvoiceDetailModal } from "@/components/modals/InvoiceDetailModal";
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Filter,
  FileText,
  DollarSign,
  Calendar,
  User,
  Eye,
  Edit,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Trash2
} from "lucide-react";

export default function InvoicesPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const { data: invoices, isLoading, refetch } = trpc.payment.getAllInvoices.useQuery();
  const { data: stats } = trpc.payment.getPaymentStats.useQuery();

  const sendReminderMutation = trpc.payment.sendInvoiceReminders.mutateAsync;
  const deleteInvoiceMutation = trpc.payment.deleteInvoice.useMutation();

  const handleViewDetails = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setIsDetailModalOpen(true);
  };

  const handleEditInvoice = (invoiceId: string) => {
    window.location.href = `/admin/invoices/edit/${invoiceId}`;
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    retroToast.invoice.confirmCancel(async () => {
      try {
        await deleteInvoiceMutation.mutateAsync({ id: invoiceId });
        retroToast.invoice.cancelled();
        refetch();
      } catch (error: any) {
        retroToast.invoice.cancelFailed();
        console.error('Failed to cancel invoice:', error);
      }
    });
  };

  const handleSendReminder = async (invoiceId: string) => {
    retroToast.invoice.confirmSendReminder(async () => {
      const loadingToastId = retroToast.invoice.sendingReminder();

      try {
        await sendReminderMutation({ invoiceId });
        retroToast.dismiss(loadingToastId);
        retroToast.invoice.reminderSent();
      } catch (error) {
        console.error("Failed to send reminder:", error);
        retroToast.dismiss(loadingToastId);
        retroToast.invoice.reminderFailed();
      }
    });
  };

  const filteredInvoices = invoices?.filter((invoice) => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.client.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.project.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800 border-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "OVERDUE":
        return "bg-red-100 text-red-800 border-red-200";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID":
        return <CheckCircle size={16} className="text-green-600" />;
      case "PENDING":
        return <Clock size={16} className="text-yellow-600" />;
      case "OVERDUE":
        return <AlertTriangle size={16} className="text-red-600" />;
      case "CANCELLED":
        return <XCircle size={16} className="text-gray-600" />;
      default:
        return <FileText size={16} className="text-blue-600" />;
    }
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const formatCurrencyIDR = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Back Navigation */}
          <div className="mb-6">
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
                <FileText size={40} strokeWidth={3} color="#111111" />
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
              Invoice Management
            </h1>
            <p style={{
              fontSize: '18px',
              color: '#FFFFFF',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Create, manage, and track all your invoices
            </p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <RetroCard padding="md" className="text-center">
                <div style={{
                  fontSize: '32px',
                  fontWeight: 800,
                  color: '#FFC700',
                  fontFamily: 'Poppins, sans-serif',
                  textShadow: '2px 2px 0px #111111'
                }}>
                  {stats.totalInvoices}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#111111',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  fontFamily: 'Poppins, sans-serif'
                }}>Total Invoices</div>
              </RetroCard>
              
              <RetroCard padding="md" className="text-center">
                <div style={{
                  fontSize: '32px',
                  fontWeight: 800,
                  color: '#00FF00',
                  fontFamily: 'Poppins, sans-serif',
                  textShadow: '2px 2px 0px #111111'
                }}>
                  {stats.paidInvoices}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#111111',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  fontFamily: 'Poppins, sans-serif'
                }}>Paid</div>
              </RetroCard>
              
              <RetroCard padding="md" className="text-center">
                <div style={{
                  fontSize: '32px',
                  fontWeight: 800,
                  color: '#FF3EA5',
                  fontFamily: 'Poppins, sans-serif',
                  textShadow: '2px 2px 0px #111111'
                }}>
                  {stats.pendingInvoices}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#111111',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  fontFamily: 'Poppins, sans-serif'
                }}>Pending</div>
              </RetroCard>
              
              <RetroCard padding="md" className="text-center">
                <div style={{
                  fontSize: '32px',
                  fontWeight: 800,
                  color: '#00FFFF',
                  fontFamily: 'Poppins, sans-serif',
                  textShadow: '2px 2px 0px #111111'
                }}>
                  {formatCurrencyIDR(stats.totalRevenue)}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#111111',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  fontFamily: 'Poppins, sans-serif'
                }}>Total Revenue</div>
              </RetroCard>
            </div>
          )}

          {/* Actions and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="flex-1">
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none bg-white"
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                  <option value="OVERDUE">Overdue</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Link href="/admin/invoices/new">
                <RetroButton variant="primary" size="md">
                  <Plus size={18} />
                  Create Invoice
                </RetroButton>
              </Link>
            </div>
          </div>

          {/* Invoices Table */}
          {isLoading ? (
            <div className="grid gap-6">
              {[...Array(5)].map((_, i) => (
                <RetroCard key={i} padding="lg">
                  <div style={{
                    height: '20px',
                    backgroundColor: '#E0E0E0',
                    width: '30%',
                    marginBottom: '12px',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }} />
                  <div style={{
                    height: '16px',
                    backgroundColor: '#E0E0E0',
                    width: '60%',
                    marginBottom: '8px',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }} />
                  <div style={{
                    height: '16px',
                    backgroundColor: '#E0E0E0',
                    width: '40%',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }} />
                </RetroCard>
              ))}
            </div>
          ) : filteredInvoices && filteredInvoices.length > 0 ? (
            <div className="space-y-6">
              {filteredInvoices.map((invoice) => (
                <RetroCard key={invoice.id} padding="lg">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {getStatusIcon(invoice.status)}
                        <div>
                          <h3 style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '20px',
                            fontWeight: 700,
                            color: '#111111',
                            marginBottom: '4px'
                          }}>
                            {invoice.invoiceNumber}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <User size={14} />
                              {invoice.client.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText size={14} />
                              {invoice.project.title}
                            </span>
                          </div>
                        </div>
                      </div>

                      {invoice.description && (
                        <p className="text-gray-600 mb-3">
                          {invoice.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span>Issued: {new Date(invoice.issuedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                        {invoice.paidAt && (
                          <>
                            <span>•</span>
                            <span>Paid: {new Date(invoice.paidAt).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col lg:items-end gap-4">
                      <div className="text-right">
                        <div style={{
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '24px',
                          fontWeight: 800,
                          color: '#111111',
                          marginBottom: '8px'
                        }}>
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </div>
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(invoice.id)}
                          className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} className="text-blue-600" />
                        </button>
                        
                        <button
                          onClick={() => handleEditInvoice(invoice.id)}
                          className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                          title="Edit Invoice"
                        >
                          <Edit size={16} className="text-green-600" />
                        </button>

                        {invoice.status === "PENDING" && (
                          <button
                            onClick={() => handleSendReminder(invoice.id)}
                            className="p-2 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors"
                            title="Send Reminder"
                          >
                            <Send size={16} className="text-yellow-600" />
                          </button>
                        )}

                        {invoice.status !== "PAID" && (
                          <button
                            onClick={() => handleDeleteInvoice(invoice.id)}
                            className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                            title="Cancel Invoice"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </RetroCard>
              ))}
            </div>
          ) : (
            <RetroCard padding="xl" className="text-center">
              <div style={{ fontSize: '80px', marginBottom: '24px' }}>📄</div>
              <h2 style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '36px',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: '#FF3EA5',
                marginBottom: '16px',
                textShadow: '2px 2px 0px #111111'
              }}>
                No Invoices Found
              </h2>
              <p style={{
                fontSize: '16px',
                color: '#111111',
                marginBottom: '32px',
                maxWidth: '500px',
                margin: '0 auto 32px',
                lineHeight: '1.6',
                fontFamily: 'Poppins, sans-serif'
              }}>
                {searchQuery || statusFilter !== "ALL" 
                  ? "No invoices match your search criteria."
                  : "Start by creating your first invoice."
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/admin/invoices/new">
                  <RetroButton variant="primary" size="lg">
                    <Plus size={20} />
                    Create Invoice
                  </RetroButton>
                </Link>
                <Link href="/admin/projects">
                  <RetroButton variant="secondary" size="lg">
                    View Projects
                  </RetroButton>
                </Link>
              </div>
            </RetroCard>
          )}
        </div>
      </main>

      <Footer />
      
      {/* Invoice Detail Modal */}
      {selectedInvoiceId && (
        <InvoiceDetailModal
          invoiceId={selectedInvoiceId}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedInvoiceId(null);
          }}
          onInvoiceUpdated={() => {
            refetch();
            setIsDetailModalOpen(false);
            setSelectedInvoiceId(null);
          }}
        />
      )}
    </div>
  );
}
