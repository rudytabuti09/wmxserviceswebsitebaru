import toast from "react-hot-toast";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info, 
  Loader2,
  Trash2,
  Send,
  Edit,
  Eye,
  X
} from "lucide-react";

// Professional toast styles following the app's design system
const toastStyles = {
  success: {
    background: '#00FF00',
    color: '#111111',
    border: '3px solid #111111',
    boxShadow: '6px 6px 0px #111111',
    fontFamily: 'Poppins, sans-serif',
    fontWeight: 700,
    borderRadius: '8px',
    padding: '16px 20px',
    minWidth: '300px',
    maxWidth: '500px',
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  error: {
    background: '#FF3EA5',
    color: '#FFFFFF',
    border: '3px solid #111111',
    boxShadow: '6px 6px 0px #111111',
    fontFamily: 'Poppins, sans-serif',
    fontWeight: 700,
    borderRadius: '8px',
    padding: '16px 20px',
    minWidth: '300px',
    maxWidth: '500px',
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  loading: {
    background: '#FFC700',
    color: '#111111',
    border: '3px solid #111111',
    boxShadow: '6px 6px 0px #111111',
    fontFamily: 'Poppins, sans-serif',
    fontWeight: 700,
    borderRadius: '8px',
    padding: '16px 20px',
    minWidth: '300px',
    maxWidth: '500px',
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  info: {
    background: '#00FFFF',
    color: '#111111',
    border: '3px solid #111111',
    boxShadow: '6px 6px 0px #111111',
    fontFamily: 'Poppins, sans-serif',
    fontWeight: 700,
    borderRadius: '8px',
    padding: '16px 20px',
    minWidth: '300px',
    maxWidth: '500px',
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  warning: {
    background: '#FF6B35',
    color: '#FFFFFF',
    border: '3px solid #111111',
    boxShadow: '6px 6px 0px #111111',
    fontFamily: 'Poppins, sans-serif',
    fontWeight: 700,
    borderRadius: '8px',
    padding: '16px 20px',
    minWidth: '300px',
    maxWidth: '500px',
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
};

// Confirmation dialog styles
const confirmationStyles = {
  container: {
    background: '#FFFFFF',
    color: '#111111',
    border: '3px solid #111111',
    boxShadow: '8px 8px 0px #111111',
    padding: '24px',
    fontFamily: 'Poppins, sans-serif',
    maxWidth: '450px',
    borderRadius: '12px',
    position: 'relative' as const,
  },
  title: {
    fontSize: '18px',
    fontWeight: 800,
    marginBottom: '12px',
    textTransform: 'uppercase' as const,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  message: {
    fontSize: '14px',
    color: '#666666',
    lineHeight: '1.5',
    marginBottom: '20px',
  },
  buttonContainer: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#FFFFFF',
    border: '2px solid #111111',
    color: '#111111',
    fontFamily: 'Poppins, sans-serif',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: '#F5F5F5',
      transform: 'translateY(-1px)',
    }
  },
  confirmButton: {
    padding: '10px 20px',
    border: '2px solid #111111',
    fontFamily: 'Poppins, sans-serif',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
    ':hover': {
      transform: 'translateY(-1px)',
    }
  },
};

export const retroToast = {
  success: (message: string, options?: any) => {
    return toast.success(
      <div style={{ display: 'contents' }}>
        <CheckCircle size={20} />
        <span>{message}</span>
      </div>,
      {
        style: toastStyles.success,
        duration: 4000,
        ...options,
      }
    );
  },

  error: (message: string, options?: any) => {
    return toast.error(
      <div style={{ display: 'contents' }}>
        <XCircle size={20} />
        <span>{message}</span>
      </div>,
      {
        style: toastStyles.error,
        duration: 5000,
        ...options,
      }
    );
  },

  loading: (message: string, options?: any) => {
    return toast.loading(
      <div style={{ display: 'contents' }}>
        <Loader2 size={20} className="animate-spin" />
        <span>{message}</span>
      </div>,
      {
        style: toastStyles.loading,
        ...options,
      }
    );
  },

  info: (message: string, options?: any) => {
    return toast(
      <div style={{ display: 'contents' }}>
        <Info size={20} />
        <span>{message}</span>
      </div>,
      {
        style: toastStyles.info,
        duration: 4000,
        ...options,
      }
    );
  },

  warning: (message: string, options?: any) => {
    return toast(
      <div style={{ display: 'contents' }}>
        <AlertCircle size={20} />
        <span>{message}</span>
      </div>,
      {
        style: toastStyles.warning,
        duration: 5000,
        ...options,
      }
    );
  },

  // Professional confirmation dialog
  confirm: (options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: string;
    icon?: React.ReactNode;
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
  }) => {
    const {
      title,
      message,
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      confirmColor = '#FF3EA5',
      icon = <AlertCircle size={20} />,
      onConfirm,
      onCancel,
    } = options;

    return toast(
      (t) => (
        <div style={confirmationStyles.container}>
          <div style={confirmationStyles.title}>
            {icon}
            {title}
          </div>
          <div style={confirmationStyles.message}>
            {message}
          </div>
          <div style={confirmationStyles.buttonContainer}>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                onCancel?.();
              }}
              style={confirmationStyles.cancelButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F5F5F5';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {cancelText}
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await onConfirm();
                } catch (error) {
                  console.error('Confirmation action failed:', error);
                }
              }}
              style={{
                ...confirmationStyles.confirmButton,
                backgroundColor: confirmColor,
                color: confirmColor === '#FFC700' ? '#111111' : '#FFFFFF',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        style: { background: 'transparent', boxShadow: 'none' },
      }
    );
  },

  // Specialized invoice-related toasts
  invoice: {
    reminderSent: () => retroToast.success("📧 Invoice reminder sent successfully!"),
    reminderFailed: () => retroToast.error("❌ Failed to send invoice reminder"),
    cancelled: () => retroToast.success("🗑️ Invoice cancelled successfully!"),
    cancelFailed: () => retroToast.error("❌ Failed to cancel invoice"),
    updated: () => retroToast.success("✅ Invoice updated successfully!"),
    updateFailed: () => retroToast.error("❌ Failed to update invoice"),
    created: () => retroToast.success("🎉 Invoice created successfully!"),
    createFailed: () => retroToast.error("❌ Failed to create invoice"),
    pdfGenerated: () => retroToast.success("📄 PDF generated successfully!"),
    pdfFailed: () => retroToast.error("❌ Failed to generate PDF"),
    
    sendingReminder: () => retroToast.loading("📤 Sending invoice reminder..."),
    processing: () => retroToast.loading("⚙️ Processing invoice..."),
    generatingPdf: () => retroToast.loading("📄 Generating PDF..."),

    confirmCancel: (onConfirm: () => void | Promise<void>) => 
      retroToast.confirm({
        title: "Cancel Invoice?",
        message: "This will cancel the invoice. This action cannot be undone for paid invoices.",
        confirmText: "Cancel Invoice",
        confirmColor: '#FF3EA5',
        icon: <Trash2 size={20} />,
        onConfirm,
      }),

    confirmSendReminder: (onConfirm: () => void | Promise<void>) => 
      retroToast.confirm({
        title: "Send Reminder?",
        message: "This will send an email reminder to the client about this pending invoice.",
        confirmText: "Send Reminder",
        confirmColor: '#FFC700',
        icon: <Send size={20} />,
        onConfirm,
      }),
  },

  // Specialized notification-related toasts
  notification: {
    allMarkedRead: () => retroToast.success("✅ All notifications marked as read!"),
    markReadFailed: () => retroToast.error("❌ Failed to mark notifications as read"),
    allCleared: () => retroToast.success("🗑️ All notifications cleared successfully!"),
    clearFailed: () => retroToast.error("❌ Failed to clear notifications"),
    deleted: () => retroToast.success("🗑️ Notification deleted!"),
    deleteFailed: () => retroToast.error("❌ Failed to delete notification"),
    markedRead: () => retroToast.success("✅ Notification marked as read!"),
    
    confirmClearAll: (onConfirm: () => void | Promise<void>) => 
      retroToast.confirm({
        title: "Clear All Notifications?",
        message: "This will permanently delete all notifications. This action cannot be undone.",
        confirmText: "Clear All",
        confirmColor: '#FF3EA5',
        icon: <Trash2 size={20} />,
        onConfirm,
      }),
  },

  // Dismiss toast by id
  dismiss: toast.dismiss,
  
  // Dismiss all toasts
  dismissAll: () => toast.dismiss(),
};

export default retroToast;
