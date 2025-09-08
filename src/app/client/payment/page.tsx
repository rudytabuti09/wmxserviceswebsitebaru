"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Script from "next/script";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RetroCard } from "@/components/ui/retro-card";
import { RetroButton } from "@/components/ui/retro-button";
import { trpc } from "@/lib/trpc";
import toast from "react-hot-toast";
import { useCSRF } from "@/hooks/useCSRF";
import { ArrowLeft, CreditCard, DollarSign, Calendar, CheckCircle } from "lucide-react";

export default function PaymentPage() {
  const { data: session } = useSession();
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [snapScriptLoaded, setSnapScriptLoaded] = useState(false);
  const { csrfToken, getCSRFHeaders, isLoading: csrfLoading } = useCSRF();
  
  const { data: invoices, isLoading: invoicesLoading } = trpc.payment.getClientInvoices.useQuery();
  
  const isLoading = invoicesLoading || csrfLoading;

  const checkPaymentStatus = async (invoiceId: string) => {
    try {
      // Find the payment record to get the orderId
      const invoice = invoices?.find(inv => inv.id === invoiceId);
      if (!invoice || !invoice.payments.length) {
        toast.error('No payment found for this invoice');
        return;
      }

      const payment = invoice.payments[0]; // Get the latest payment
      if (!payment.midtransOrderId) {
        toast.error('No Midtrans order ID found');
        return;
      }

      setSelectedInvoice(invoiceId);

      const response = await fetch('/api/payment/check-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: payment.midtransOrderId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check payment status');
      }

      if (data.updated) {
        toast.success(
          `Payment status updated to ${data.paymentStatus}!`,
          {
            duration: 4000,
            style: {
              background: '#00FF00',
              color: '#111111',
              border: '2px solid #111111',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 700,
            }
          }
        );
        // Refresh the page to show updated status
        window.location.reload();
      } else {
        toast.success(
          `Payment status: ${data.paymentStatus} (no update needed)`,
          {
            duration: 3000,
            style: {
              background: '#FFC700',
              color: '#111111',
              border: '2px solid #111111',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 700,
            }
          }
        );
      }
    } catch (error) {
      console.error('Check payment status error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to check payment status';
      toast.error(errorMessage, {
        style: {
          background: '#FF3EA5',
          color: '#FFFFFF',
          border: '2px solid #111111',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 700,
        }
      });
    } finally {
      setSelectedInvoice(null);
    }
  };

  const handlePayment = async (invoiceId: string) => {
    try {
      setSelectedInvoice(invoiceId);
      
      // Create payment token
      const response = await fetch("/api/payment/create-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getCSRFHeaders(),
        },
        body: JSON.stringify({ invoiceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Payment API error:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        
        // Handle different error types
        if (response.status === 401) {
          throw new Error('Please sign in again to continue with payment.');
        }
        if (response.status === 404) {
          throw new Error('Invoice not found or already paid.');
        }
        if (response.status === 429) {
          const resetTime = data.reset ? new Date(data.reset) : null;
          const waitTime = resetTime ? Math.ceil((resetTime.getTime() - Date.now()) / 1000 / 60) : 5;
          throw new Error(`Too many payment attempts. Please wait ${waitTime} minutes before trying again.`);
        }
        if (response.status === 403 && data.code === 'CSRF_TOKEN_INVALID') {
          throw new Error('Security token expired. Please refresh the page and try again.');
        }
        
        // Show detailed error in development
        const errorMessage = data.details ? `${data.error}: ${data.details}` : (data.error || "Failed to create payment");
        throw new Error(errorMessage);
      }

      // Check if Snap script is loaded, if not wait for it
      if (!snapScriptLoaded || !window.snap) {
        toast.error("Payment system is loading. Please try again in a moment.", {
          style: {
            background: '#FFC700',
            color: '#111111',
            border: '2px solid #111111',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 700,
          }
        });
        setSelectedInvoice(null);
        return;
      }

      // Use Snap to process payment
      window.snap.pay(data.token, {
        onSuccess: (result: any) => {
          console.log("Payment success:", result);
          
          // Show success toast with check status action
          toast.success(
            "Pembayaran berhasil! Silahkan klik 'Check Status' untuk memperbarui status invoice.",
            {
              duration: 8000, // Show for 8 seconds
              style: {
                background: '#00FF00',
                color: '#111111',
                border: '3px solid #111111',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                fontWeight: 700,
                padding: '16px',
                borderRadius: '0px',
                boxShadow: '4px 4px 0px #111111',
                maxWidth: '500px',
              },
            }
          );
          
          // Set selected invoice to null to enable check status button
          setSelectedInvoice(null);
        },
        onPending: (result: any) => {
          console.log("Payment pending:", result);
          // Refresh the page to show updated payment status
          window.location.reload();
        },
        onError: (result: any) => {
          console.error("Payment error:", result);
          toast.error("Payment failed. Please try again.", {
            style: {
              background: '#FF3EA5',
              color: '#FFFFFF',
              border: '2px solid #111111',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 700,
            }
          });
        },
        onClose: () => {
          console.log("Payment popup closed");
          setSelectedInvoice(null);
        },
      });
    } catch (error) {
      console.error("Payment error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to initiate payment. Please try again.";
      
      toast.error(errorMessage, {
        duration: 5000, // Show for 5 seconds for rate limit messages
        style: {
          background: '#FF3EA5',
          color: '#FFFFFF',
          border: '2px solid #111111',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 700,
          maxWidth: '500px',
          textAlign: 'center'
        }
      });
      setSelectedInvoice(null);
    }
  };

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
        return "✅";
      case "PENDING":
        return "⏳";
      case "OVERDUE":
        return "⚠️";
      case "CANCELLED":
        return "❌";
      default:
        return "📄";
    }
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    // Use Indonesian locale for IDR, US locale for others
    const locale = currency === "IDR" ? "id-ID" : "en-US";
    
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(amount);
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>Please sign in to access your payment history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Load Midtrans Snap Script */}
      <Script
        src={process.env.NODE_ENV === "production" 
          ? "https://app.midtrans.com/snap/snap.js" 
          : "https://app.sandbox.midtrans.com/snap/snap.js"}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ""}
        strategy="lazyOnload"
        onLoad={() => {
          console.log("✅ Midtrans Snap script loaded successfully");
          setSnapScriptLoaded(true);
        }}
        onError={(e) => {
          console.error("❌ Failed to load Midtrans Snap script:", e);
          toast.error("Failed to load payment system. Please refresh the page.", {
            style: {
              background: '#FF3EA5',
              color: '#FFFFFF',
              border: '2px solid #111111',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 700,
            }
          });
        }}
      />
      
      <Header />
      
      <main className="py-20">
        <div className="container mx-auto px-6">
          {/* Back Navigation */}
          <div className="mb-8">
            <Link href="/client/dashboard">
              <button style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#FFFFFF',
                color: '#111111',
                border: '2px solid #111111',
                padding: '12px 20px',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '2px 2px 0px #111111'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FF3EA5';
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.transform = 'translate(-1px, -1px)';
                e.currentTarget.style.boxShadow = '3px 3px 0px #111111';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.color = '#111111';
                e.currentTarget.style.transform = 'translate(0, 0)';
                e.currentTarget.style.boxShadow = '2px 2px 0px #111111';
              }}>
                <ArrowLeft size={16} strokeWidth={2} />
                Back to Dashboard
              </button>
            </Link>
          </div>

          {/* Page Header dengan Animasi */}
          <div className="text-center mb-16">
            <div style={{
              display: 'inline-block',
              animation: 'bounce 2s infinite',
              marginBottom: '20px'
            }}>
              <div style={{
                backgroundColor: '#FFC700',
                width: '80px',
                height: '80px',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid #111111',
                boxShadow: '4px 4px 0px #111111',
                transform: 'rotate(-5deg)'
              }}>
                <CreditCard size={40} strokeWidth={3} color="#111111" />
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
              Payment Center
            </h1>
            <p style={{
              fontSize: '18px',
              color: '#FFFFFF',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Manage your invoices and payment history
            </p>
          </div>

          {isLoading ? (
            <div className="grid gap-6">
              {[...Array(3)].map((_, i) => (
                <RetroCard key={i} padding="lg">
                  <div style={{
                    height: '16px',
                    backgroundColor: '#E0E0E0',
                    width: '25%',
                    marginBottom: '16px',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }} />
                  <div style={{
                    height: '24px',
                    backgroundColor: '#E0E0E0',
                    width: '50%',
                    marginBottom: '8px',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }} />
                  <div style={{
                    height: '16px',
                    backgroundColor: '#E0E0E0',
                    width: '75%',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }} />
                </RetroCard>
              ))}
            </div>
          ) : invoices && invoices.length > 0 ? (
            <>
              {/* Invoice Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <RetroCard padding="md" className="text-center">
                  <div style={{
                    fontSize: '32px',
                    fontWeight: 800,
                    color: '#00FF00',
                    fontFamily: 'Poppins, sans-serif',
                    textShadow: '2px 2px 0px #111111'
                  }}>
                    {invoices.filter(inv => inv.status === "PAID").length}
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
                    color: '#FFC700',
                    fontFamily: 'Poppins, sans-serif',
                    textShadow: '2px 2px 0px #111111'
                  }}>
                    {invoices.filter(inv => inv.status === "PENDING").length}
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
                    color: '#FF3EA5',
                    fontFamily: 'Poppins, sans-serif',
                    textShadow: '2px 2px 0px #111111'
                  }}>
                    {invoices.filter(inv => inv.status === "OVERDUE").length}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#111111',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontFamily: 'Poppins, sans-serif'
                  }}>Overdue</div>
                </RetroCard>
                <RetroCard padding="md" className="text-center">
                  <div style={{
                    fontSize: '32px',
                    fontWeight: 800,
                    color: '#00FFFF',
                    fontFamily: 'Poppins, sans-serif',
                    textShadow: '2px 2px 0px #111111'
                  }}>
                    {formatCurrency(
                      invoices
                        .filter(inv => inv.status === "PAID")
                        .reduce((sum, inv) => sum + inv.amount, 0),
                      "IDR"
                    )}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#111111',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontFamily: 'Poppins, sans-serif'
                  }}>Total Paid</div>
                </RetroCard>
              </div>

              {/* Invoice List */}
              <div className="grid gap-6">
                {invoices.map((invoice) => (
                  <RetroCard key={invoice.id} padding="lg">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{getStatusIcon(invoice.status)}</span>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {invoice.invoiceNumber}
                            </h3>
                            <p className="text-muted-foreground">
                              Project: {invoice.project?.title}
                            </p>
                          </div>
                        </div>
                        
                        {invoice.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {invoice.description}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
                      
                      <div className="flex flex-col lg:items-end gap-3">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary-600">
                            {formatCurrency(invoice.amount, invoice.currency)}
                          </div>
                          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </div>
                        </div>
                        
                        {invoice.status === "PENDING" && (
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => handlePayment(invoice.id)}
                              disabled={selectedInvoice === invoice.id}
                              style={{
                                backgroundColor: selectedInvoice === invoice.id ? '#CCCCCC' : '#FFC700',
                                color: '#111111',
                                border: '2px solid #111111',
                                padding: '12px 24px',
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '14px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                cursor: selectedInvoice === invoice.id ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '3px 3px 0px #111111',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}
                              onMouseEnter={(e) => {
                                if (selectedInvoice !== invoice.id) {
                                  e.currentTarget.style.backgroundColor = '#FFD700';
                                  e.currentTarget.style.transform = 'translate(-2px, -2px)';
                                  e.currentTarget.style.boxShadow = '5px 5px 0px #111111';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (selectedInvoice !== invoice.id) {
                                  e.currentTarget.style.backgroundColor = '#FFC700';
                                  e.currentTarget.style.transform = 'translate(0, 0)';
                                  e.currentTarget.style.boxShadow = '3px 3px 0px #111111';
                                }
                              }}
                            >
                              <CreditCard size={16} strokeWidth={2} />
                              {selectedInvoice === invoice.id ? 'Processing...' : 'Pay Now'}
                            </button>
                            
                            {invoice.payments.length > 0 && (
                              <button
                                onClick={() => checkPaymentStatus(invoice.id)}
                                disabled={selectedInvoice === invoice.id}
                                style={{
                                  backgroundColor: selectedInvoice === invoice.id ? '#CCCCCC' : '#00FFFF',
                                  color: '#111111',
                                  border: '2px solid #111111',
                                  padding: '8px 16px',
                                  fontFamily: 'Poppins, sans-serif',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                  cursor: selectedInvoice === invoice.id ? 'not-allowed' : 'pointer',
                                  transition: 'all 0.2s',
                                  boxShadow: '2px 2px 0px #111111',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                                onMouseEnter={(e) => {
                                  if (selectedInvoice !== invoice.id) {
                                    e.currentTarget.style.backgroundColor = '#00CCCC';
                                    e.currentTarget.style.transform = 'translate(-1px, -1px)';
                                    e.currentTarget.style.boxShadow = '3px 3px 0px #111111';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (selectedInvoice !== invoice.id) {
                                    e.currentTarget.style.backgroundColor = '#00FFFF';
                                    e.currentTarget.style.transform = 'translate(0, 0)';
                                    e.currentTarget.style.boxShadow = '2px 2px 0px #111111';
                                  }
                                }}
                              >
                                <CheckCircle size={14} strokeWidth={2} />
                                {selectedInvoice === invoice.id ? 'Checking...' : 'Check Status'}
                              </button>
                            )}
                          </div>
                        )}
                        
                        {invoice.status === "PAID" && invoice.payments.length > 0 && (
                          <div className="text-sm text-green-600">
                            ✓ Payment received
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Payment Details */}
                    {invoice.payments.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="font-semibold mb-3">Payment Details</h4>
                        <div className="space-y-2">
                          {invoice.payments.map((payment) => (
                            <div key={payment.id} className="flex justify-between items-center text-sm bg-muted/30 p-3 rounded">
                              <div>
                                <span className="font-medium">
                                  {formatCurrency(payment.amount, payment.currency)}
                                </span>
                                {payment.paymentMethod && (
                                  <span className="text-muted-foreground ml-2">
                                    via {payment.paymentMethod}
                                  </span>
                                )}
                              </div>
                              <div className="text-muted-foreground">
                                {payment.paidAt 
                                  ? new Date(payment.paidAt).toLocaleDateString()
                                  : new Date(payment.createdAt).toLocaleDateString()
                                }
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </RetroCard>
                ))}
              </div>
            </>
          ) : (
            <RetroCard padding="xl" className="text-center">
              <div style={{
                fontSize: '80px',
                marginBottom: '24px',
                filter: 'sepia(100%) saturate(200%) hue-rotate(45deg)'
              }}>💳</div>
              <h2 style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '36px',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: '#FF3EA5',
                marginBottom: '16px',
                textShadow: '2px 2px 0px #111111'
              }}>
                No Invoices Yet
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
                Your payment history will appear here once your projects have invoices.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/client/dashboard">
                  <RetroButton variant="primary" size="lg">
                    <DollarSign size={20} />
                    View Projects
                  </RetroButton>
                </Link>
                <Link href="/contact">
                  <RetroButton variant="secondary" size="lg">
                    Contact Support
                  </RetroButton>
                </Link>
              </div>
            </RetroCard>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
