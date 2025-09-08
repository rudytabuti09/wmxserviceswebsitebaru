"use client";

import { formatDistanceToNow } from "date-fns";
import { Check, X, ExternalLink } from "lucide-react";

interface NotificationItemProps {
  notification: {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    actionUrl?: string | null;
    createdAt: string | Date;
  };
  onClick: () => void;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationItem({ 
  notification, 
  onClick, 
  onMarkAsRead, 
  onDelete 
}: NotificationItemProps) {
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return '✅';
      case 'WARNING':
        return '⚠️';
      case 'ERROR':
        return '❌';
      case 'PROJECT_UPDATE':
        return '📈';
      case 'MESSAGE':
        return '💬';
      case 'PAYMENT':
        return '💰';
      case 'SYSTEM':
        return '⚙️';
      default:
        return 'ℹ️';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return '#00FF00';
      case 'WARNING':
        return '#FFC700';
      case 'ERROR':
        return '#FF3EA5';
      case 'PROJECT_UPDATE':
        return '#00FFFF';
      case 'MESSAGE':
        return '#3D52F1';
      case 'PAYMENT':
        return '#00FF00';
      case 'SYSTEM':
        return '#111111';
      default:
        return '#666666';
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead(notification.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification.id);
  };

  return (
    <div
      onClick={onClick}
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid #E0E0E0',
        backgroundColor: notification.isRead ? '#FFFFFF' : '#FFF8E1',
        cursor: notification.actionUrl ? 'pointer' : 'default',
        position: 'relative',
        transition: 'background-color 0.2s',
      }}
      onMouseEnter={(e) => {
        if (notification.actionUrl) {
          e.currentTarget.style.backgroundColor = notification.isRead ? '#F5F5F5' : '#FFF3CD';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = notification.isRead ? '#FFFFFF' : '#FFF8E1';
      }}
    >
      {/* Unread Indicator */}
      {!notification.isRead && (
        <div
          style={{
            position: 'absolute',
            left: '0',
            top: '0',
            bottom: '0',
            width: '4px',
            backgroundColor: getNotificationColor(notification.type),
          }}
        />
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {/* Notification Icon */}
        <div
          style={{
            fontSize: '18px',
            marginTop: '2px',
            filter: 'drop-shadow(1px 1px 0px rgba(0,0,0,0.1))'
          }}
        >
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title and Actions */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: notification.isRead ? 600 : 700,
              color: '#111111',
              margin: 0,
              lineHeight: '1.3',
              fontFamily: 'Poppins, sans-serif'
            }}>
              {notification.title}
              {notification.actionUrl && (
                <ExternalLink size={12} style={{ marginLeft: '4px', opacity: 0.6 }} />
              )}
            </h4>
            
            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
              {!notification.isRead && (
                <button
                  onClick={handleMarkAsRead}
                  style={{
                    padding: '2px 4px',
                    backgroundColor: '#00FFFF',
                    border: '1px solid #111111',
                    cursor: 'pointer',
                    fontSize: '10px'
                  }}
                  title="Mark as read"
                >
                  <Check size={10} />
                </button>
              )}
              <button
                onClick={handleDelete}
                style={{
                  padding: '2px 4px',
                  backgroundColor: '#FF3EA5',
                  color: '#FFFFFF',
                  border: '1px solid #111111',
                  cursor: 'pointer',
                  fontSize: '10px'
                }}
                title="Delete"
              >
                <X size={10} />
              </button>
            </div>
          </div>

          {/* Message */}
          <p style={{
            fontSize: '13px',
            color: notification.isRead ? '#666666' : '#111111',
            margin: 0,
            lineHeight: '1.4',
            fontFamily: 'Poppins, sans-serif',
            opacity: notification.isRead ? 0.8 : 1
          }}>
            {notification.message}
          </p>

          {/* Timestamp */}
          <div style={{
            fontSize: '11px',
            color: '#999999',
            marginTop: '6px',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </div>

          {/* Type Badge */}
          <div
            style={{
              display: 'inline-block',
              fontSize: '9px',
              fontWeight: 700,
              textTransform: 'uppercase',
              padding: '2px 6px',
              backgroundColor: getNotificationColor(notification.type),
              color: notification.type === 'SYSTEM' ? '#FFFFFF' : '#111111',
              border: '1px solid #111111',
              marginTop: '6px',
              fontFamily: 'Poppins, sans-serif',
              opacity: 0.8
            }}
          >
            {notification.type.replace('_', ' ')}
          </div>
        </div>
      </div>
    </div>
  );
}
