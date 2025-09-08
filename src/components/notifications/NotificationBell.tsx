"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, X, Check, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { retroToast } from "@/utils/toast";
import { NotificationItem } from "./NotificationItem";
import { useRouter } from "next/navigation";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { 
    data: notificationData, 
    refetch: refetchNotifications,
    isLoading 
  } = trpc.notification.getAll.useQuery(
    { 
      limit: showAll ? 50 : 10,
      unreadOnly: false 
    },
    { 
      enabled: isOpen,
      refetchInterval: isOpen ? 10000 : false, // Poll every 10s when open
    }
  );

  const { data: unreadCount, refetch: refetchCount } = trpc.notification.getUnreadCount.useQuery(
    undefined,
    { 
      refetchInterval: 30000, // Poll every 30s for unread count
    }
  );

  const markAsReadMutation = trpc.notification.markAsRead.useMutation({
    onSuccess: () => {
      refetchNotifications();
      refetchCount();
    },
  });

  const markAllAsReadMutation = trpc.notification.markAllAsRead.useMutation({
    onSuccess: () => {
      refetchNotifications();
      refetchCount();
      retroToast.success("✅ All notifications marked as read!");
    },
    onError: (error) => {
      console.error('Failed to mark all as read:', error);
      retroToast.error("❌ Failed to mark notifications as read");
    }
  });

  const deleteMutation = trpc.notification.delete.useMutation({
    onSuccess: () => {
      refetchNotifications();
      refetchCount();
    },
  });

  const deleteAllMutation = trpc.notification.deleteAll.useMutation({
    onSuccess: () => {
      refetchNotifications();
      refetchCount();
      setIsOpen(false);
    },
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNotificationClick = (notification: any) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      markAsReadMutation.mutate({ id: notification.id });
    }

    // Navigate to action URL if available
    if (notification.actionUrl) {
      setIsOpen(false);
      router.push(notification.actionUrl);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDeleteAll = () => {
    retroToast.confirm({
      title: "Clear All Notifications?",
      message: "This will permanently delete all notifications. This action cannot be undone.",
      confirmText: "Clear All",
      confirmColor: '#FF3EA5',
      icon: <Trash2 size={20} />,
      onConfirm: async () => {
        try {
          await deleteAllMutation.mutateAsync();
          retroToast.success("🗑️ All notifications cleared successfully!");
        } catch (error) {
          console.error('Failed to clear notifications:', error);
          retroToast.error("❌ Failed to clear notifications");
        }
      }
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          padding: '4px',
          backgroundColor: isOpen ? '#FFC700' : '#FFFFFF',
          border: '2px solid #111111',
          borderRadius: '4px',
          boxShadow: isOpen ? '3px 3px 0px #111111' : '2px 2px 0px #111111',
          cursor: 'pointer',
          transition: 'all 0.2s',
          transform: isOpen ? 'translate(-1px, -1px)' : 'translate(0, 0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          marginLeft: '8px'
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = '#FFC700';
            e.currentTarget.style.transform = 'translate(-1px, -1px)';
            e.currentTarget.style.boxShadow = '3px 3px 0px #111111';
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = '#FFFFFF';
            e.currentTarget.style.transform = 'translate(0, 0)';
            e.currentTarget.style.boxShadow = '2px 2px 0px #111111';
          }
        }}
      >
        <Bell size={22} color="#000000" strokeWidth={2} fill="none" />
        
        {/* Unread Badge - Only show if count > 0 */}
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              backgroundColor: '#FF3EA5',
              color: '#FFFFFF',
              fontSize: '10px',
              fontWeight: 700,
              padding: '2px 6px',
              border: '2px solid #111111',
              minWidth: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Poppins, sans-serif',
              animation: 'pulse 2s infinite'
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: '0',
            marginTop: '8px',
            width: '380px',
            maxWidth: '90vw',
            backgroundColor: '#FFFFFF',
            border: '3px solid #111111',
            boxShadow: '4px 4px 0px #111111',
            maxHeight: '500px',
            zIndex: 1000,
            fontFamily: 'Poppins, sans-serif'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px',
              borderBottom: '2px solid #111111',
              backgroundColor: '#FFC700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#111111',
                textTransform: 'uppercase',
                margin: 0
              }}>
                🔔 Notifications
              </h3>
              {unreadCount && unreadCount > 0 && (
                <span style={{
                  fontSize: '12px',
                  color: '#111111',
                  fontWeight: 600
                }}>
                  {unreadCount} unread
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                padding: '4px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={16} color="#111111" />
            </button>
          </div>

          {/* Action Buttons */}
          {notificationData && notificationData.notifications.length > 0 && (
            <div
              style={{
                padding: '12px',
                borderBottom: '2px solid #111111',
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap'
              }}
            >
              {unreadCount && unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={markAllAsReadMutation.isLoading}
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    padding: '6px 10px',
                    backgroundColor: '#00FFFF',
                    color: '#111111',
                    border: '2px solid #111111',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Check size={12} />
                  Mark All Read
                </button>
              )}
              <button
                onClick={handleDeleteAll}
                disabled={deleteAllMutation.isLoading}
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  padding: '6px 10px',
                  backgroundColor: '#FF3EA5',
                  color: '#FFFFFF',
                  border: '2px solid #111111',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Trash2 size={12} />
                Clear All
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div
            style={{
              maxHeight: '300px',
              overflowY: 'auto'
            }}
          >
            {isLoading ? (
              <div style={{
                padding: '20px',
                textAlign: 'center',
                fontSize: '14px',
                color: '#666666'
              }}>
                Loading notifications...
              </div>
            ) : !notificationData || notificationData.notifications.length === 0 ? (
              <div style={{
                padding: '20px',
                textAlign: 'center',
                fontSize: '14px',
                color: '#666666'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔕</div>
                No notifications yet
              </div>
            ) : (
              <>
                {notificationData.notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                    onMarkAsRead={(id) => markAsReadMutation.mutate({ id })}
                    onDelete={(id) => deleteMutation.mutate({ id })}
                  />
                ))}
                
                {notificationData.hasMore && !showAll && (
                  <div style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => setShowAll(true)}
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#3D52F1',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      Show more notifications
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
