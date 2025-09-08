"use client";

import React from "react";
import { trpc } from "@/lib/trpc";
import { retroToast } from "@/utils/toast";
import {
  X,
  FileText,
  User,
  Calendar,
  DollarSign,
  Building,
  Mail,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  CreditCard,
  Download,
  Printer,
  Send,
  Edit,
  Trash2
} from "lucide-react";
import { RetroButton } from "@/components/ui/retro-button";

interface InvoiceDetailModalProps {
  invoiceId: string;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (invoiceId: string) => void;
  onDelete?: (invoiceId: string) => void;
}

export function InvoiceDetailModal({ 
  invoiceId, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete 
}: InvoiceDetailModalProps) {
  const { data: invoice, isLoading } = trpc.payment.getInvoiceDetails.useQuery(
    { id: invoiceId },
    { enabled: isOpen && !!invoiceId }
  );

  const sendReminderMutation = trpc.payment.sendInvoiceReminders.useMutation();
  const updateStatusMutation = trpc.payment.updateInvoice.useMutation();

  const handleSendReminder = async () => {
    retroToast.invoice.confirmSendReminder(async () => {
      const loadingToastId = retroToast.invoice.sendingReminder();

      try {
        await sendReminderMutation.mutateAsync({ invoiceId });
        retroToast.dismiss(loadingToastId);
        retroToast.invoice.reminderSent();
      } catch (error) {
        console.error("Failed to send reminder:", error);
        retroToast.dismiss(loadingToastId);
        retroToast.invoice.reminderFailed();
      }
    });
  };

  const handleMarkAsPaid = async () => {
    retroToast.confirm({
      title: "Mark as Paid?",
      message: "This will mark the invoice as paid. Are you sure?",
      confirmText: "Mark as Paid",
      confirmColor: '#00FF00',
      icon: <CheckCircle size={20} />,
      onConfirm: async () => {
        try {
          await updateStatusMutation.mutateAsync({
            id: invoiceId,
            status: "PAID"
          });
          retroToast.success("💰 Invoice marked as paid!");
        } catch (error) {
          console.error('Failed to mark invoice as paid:', error);
          retroToast.error("❌ Failed to update invoice status");
        }
      }
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID":
        return <CheckCircle size={20} className="text-green-600" />;
      case "PENDING":
        return <Clock size={20} className="text-yellow-600" />;
      case "OVERDUE":
        return <AlertTriangle size={20} className="text-red-600" />;
      case "CANCELLED":
        return <XCircle size={20} className="text-gray-600" />;
      default:
        return <FileText size={20} className="text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return '#00FF00';
      case "PENDING":
        return '#FFC700';
      case "OVERDUE":
        return '#FF3EA5';
      case "CANCELLED":
        return '#666666';
      default:
        return '#00FFFF';
    }
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: '#FFFFFF',
          border: '3px solid #111111',
          boxShadow: '8px 8px 0px #111111',
          width: '100%',
          maxWidth: '800px',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          backgroundColor: '#3D52F1',
          color: '#FFFFFF',
          padding: '20px',
          borderBottom: '3px solid #111111',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FileText size={24} />
            <h2 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '24px',
              fontWeight: 800,
              textTransform: 'uppercase',
              margin: 0
            }}>
              Invoice Details
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#FF3EA5',
              color: '#FFFFFF',
              border: '2px solid #111111',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #3D52F1',
                borderTop: '4px solid transparent',
                borderRadius: '50%',
                margin: '0 auto 16px',
                animation: 'spin 1s linear infinite'
              }} />
              <p style={{
                fontFamily: 'Poppins, sans-serif',
                color: '#666666'
              }}>Loading invoice details...</p>
            </div>
          ) : invoice ? (
            <>
              {/* Invoice Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
              }}>
                <div>
                  <h3 style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '32px',
                    fontWeight: 800,
                    color: '#111111',
                    margin: '0 0 8px 0'
                  }}>
                    {invoice.invoiceNumber}
                  </h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '16px'
                  }}>
                    {getStatusIcon(invoice.status)}
                    <div style={{
                      backgroundColor: getStatusColor(invoice.status),
                      color: invoice.status === 'PAID' || invoice.status === 'PENDING' ? '#111111' : '#FFFFFF',
                      padding: '4px 12px',
                      border: '2px solid #111111',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 700,
                      fontSize: '12px',
                      textTransform: 'uppercase'
                    }}>
                      {invoice.status}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '36px',
                    fontWeight: 800,
                    color: '#111111',
                    marginBottom: '8px'
                  }}>
                    {formatCurrency(invoice.amount, invoice.currency)}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#666666'
                  }}>
                    {invoice.currency} • Due: {new Date(invoice.dueDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Client & Project Info */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
              }}>
                <div style={{
                  backgroundColor: '#F8F9FF',
                  border: '2px solid #111111',
                  padding: '20px'
                }}>
                  <h4 style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#111111',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <User size={16} />
                    Client Details
                  </h4>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>{invoice.client.name}</strong>
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#666666',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Mail size={12} />
                    {invoice.client.email}
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#F8F9FF',
                  border: '2px solid #111111',
                  padding: '20px'
                }}>
                  <h4 style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#111111',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Building size={16} />
                    Project Details
                  </h4>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>{invoice.project.title}</strong>
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#666666'
                  }}>
                    Status: {invoice.project.status}
                  </div>
                </div>
              </div>

              {/* Description */}
              {invoice.description && (
                <div style={{
                  backgroundColor: '#FFFFFF',
                  border: '2px solid #111111',
                  padding: '20px',
                  marginBottom: '32px'
                }}>
                  <h4 style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#111111',
                    marginBottom: '12px'
                  }}>
                    Description
                  </h4>
                  <p style={{
                    lineHeight: '1.6',
                    color: '#333333',
                    margin: 0
                  }}>
                    {invoice.description}
                  </p>
                </div>
              )}

              {/* Payment History */}
              {invoice.payments && invoice.payments.length > 0 && (
                <div style={{
                  backgroundColor: '#FFFFFF',
                  border: '2px solid #111111',
                  padding: '20px',
                  marginBottom: '32px'
                }}>
                  <h4 style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#111111',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <CreditCard size={16} />
                    Payment History
                  </h4>
                  {invoice.payments.map((payment) => (
                    <div key={payment.id} style={{
                      padding: '12px',
                      backgroundColor: '#F8F9FF',
                      border: '1px solid #E0E0E0',
                      marginBottom: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>
                          {formatCurrency(payment.amount, payment.currency)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666666' }}>
                          {payment.paymentMethod && `via ${payment.paymentMethod}`}
                          {payment.transactionId && ` • TX: ${payment.transactionId}`}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          fontSize: '12px',
                          color: payment.status === 'COMPLETED' ? '#00AA00' : '#666666',
                          fontWeight: 600,
                          textTransform: 'uppercase'
                        }}>
                          {payment.status}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666666' }}>
                          {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Invoice Timeline */}
              <div style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid #111111',
                padding: '20px',
                marginBottom: '32px'
              }}>
                <h4 style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#111111',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Calendar size={16} />
                  Timeline
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Invoice Created:</span>
                    <strong>{new Date(invoice.issuedAt).toLocaleDateString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Due Date:</span>
                    <strong style={{
                      color: new Date(invoice.dueDate) < new Date() && invoice.status === 'PENDING' ? '#FF3EA5' : '#111111'
                    }}>
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </strong>
                  </div>
                  {invoice.paidAt && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Paid Date:</span>
                      <strong style={{ color: '#00AA00' }}>
                        {new Date(invoice.paidAt).toLocaleDateString()}
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{
                fontFamily: 'Poppins, sans-serif',
                color: '#FF3EA5',
                fontSize: '18px',
                fontWeight: 600
              }}>
                Invoice not found
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {invoice && (
          <div style={{
            backgroundColor: '#F8F9FF',
            borderTop: '3px solid #111111',
            padding: '20px',
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            justifyContent: 'flex-end'
          }}>
            {invoice.status === 'PENDING' && (
              <>
                <RetroButton
                  variant="secondary"
                  size="sm"
                  onClick={handleSendReminder}
                  disabled={sendReminderMutation.isLoading}
                >
                  <Send size={16} />
                  Send Reminder
                </RetroButton>
                <RetroButton
                  variant="primary"
                  size="sm"
                  onClick={handleMarkAsPaid}
                  disabled={updateStatusMutation.isLoading}
                >
                  <CheckCircle size={16} />
                  Mark as Paid
                </RetroButton>
              </>
            )}
            
            <RetroButton
              variant="secondary"
              size="sm"
              onClick={() => onEdit?.(invoice.id)}
            >
              <Edit size={16} />
              Edit
            </RetroButton>

            {invoice.status !== 'PAID' && (
              <RetroButton
                variant="danger"
                size="sm"
                onClick={() => onDelete?.(invoice.id)}
              >
                <Trash2 size={16} />
                Cancel
              </RetroButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
