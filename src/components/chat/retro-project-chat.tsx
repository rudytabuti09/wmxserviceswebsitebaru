"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { 
  Edit2, Trash2, Check, X, MoreVertical, Paperclip, 
  Send, Smile, Clock, CheckCheck, Eye 
} from "lucide-react";
import { RetroCard } from "@/components/ui/retro-card";

interface RetroProjectChatProps {
  projectId: string;
  isAdmin?: boolean; // Add admin mode prop
}

const emojis = ["😀", "😃", "😄", "😁", "😊", "😍", "🤩", "😎", "🤔", "😮", "😯", "😲", "😢", "😭", "😡", "👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙", "👋", "🙏", "💪", "🎉", "🎊", "🎈", "🎁", "❤️", "💔", "💯", "🔥", "⭐", "🌟", "✨", "💫"];

export function RetroProjectChat({ projectId, isAdmin = false }: RetroProjectChatProps) {
  const { data: session } = useSession();
  const [newMessage, setNewMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [showMessageMenu, setShowMessageMenu] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [pendingAttachments, setPendingAttachments] = useState<Array<{fileName: string, fileUrl: string, fileSize: number, mimeType: string}>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const previousMessageCount = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Queries with much reduced polling
  const { data: messages, refetch } = trpc.chat.getMessages.useQuery(
    { projectId },
    { 
      refetchInterval: isPageVisible ? 20000 : false, // Much slower: 20 seconds when active, disabled when not visible
      refetchIntervalInBackground: false,
      onSuccess: (data) => {
        // Show notification for new messages
        if (data && data.length > previousMessageCount.current && previousMessageCount.current > 0) {
          const latestMessage = data[data.length - 1];
          if (latestMessage.senderId !== session?.user.id) {
            toast.success(`💬 ${latestMessage.sender.name || 'Team'}`, {
              duration: 4000,
              style: {
                background: '#FFC700',
                color: '#111111',
                border: '2px solid #111111',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 700,
              }
            });
          }
        }
        previousMessageCount.current = data?.length || 0;
      }
    }
  );

  const { data: typingUsers } = trpc.chat.getTypingUsers.useQuery(
    { projectId },
    { 
      refetchInterval: false, // Disable typing users polling - it causes the most spam
      refetchIntervalInBackground: false,
      enabled: false // Completely disable typing users for now
    }
  );

  const { data: unreadCount } = trpc.chat.getUnreadCount.useQuery(
    undefined,
    { 
      refetchInterval: isPageVisible ? 30000 : false, // Much slower: 30 seconds when active, disabled when not visible
      refetchIntervalInBackground: false
    }
  );
  
  // Mutations
  const sendMessage = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      setNewMessage("");
      refetch();
      toast.success("Message sent! 🚀", { 
        duration: 1000,
        style: {
          background: '#00FF00',
          color: '#111111',
          border: '2px solid #111111',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 700,
        }
      });
    },
    onError: (error) => {
      toast.error("Failed to send message");
    }
  });

  const editMessage = trpc.chat.editMessage.useMutation({
    onSuccess: () => {
      setEditingMessageId(null);
      setEditContent("");
      refetch();
      toast.success("Message edited");
    },
    onError: () => {
      toast.error("Failed to edit message");
    }
  });

  const deleteMessage = trpc.chat.deleteMessage.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Message deleted");
    },
    onError: () => {
      toast.error("Failed to delete message");
    }
  });

  const setTyping = trpc.chat.setTyping.useMutation();
  
  // Add clear chat mutation (admin only)
  const clearProjectChat = trpc.chat.clearProjectChat.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("All chat messages deleted! 🗑️", {
        style: {
          background: '#FF3EA5',
          color: '#FFFFFF',
          border: '2px solid #111111',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 700,
        }
      });
    },
    onError: () => {
      toast.error("Failed to clear chat");
    }
  });

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!session) return;
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set typing to true
    setTyping.mutate({ projectId, isTyping: true });

    // Set timeout to stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      setTyping.mutate({ projectId, isTyping: false });
    }, 3000);
  }, [projectId, session, setTyping]);

  // Handle message input change
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (e.target.value.trim()) {
      handleTyping();
    }
  };

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setUploadingFiles(files);
    const newAttachments: Array<{fileName: string, fileUrl: string, fileSize: number, mimeType: string}> = [];

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectId', projectId);

        // Upload to real endpoint only
        const response = await fetch('/api/upload/chat-attachment', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('[RetroChat] Upload failed:', errorData);
          throw new Error(errorData.error || errorData.details || 'Upload failed');
        }

        const { file: uploadedFile } = await response.json();
        newAttachments.push(uploadedFile);
      }

      setPendingAttachments(prev => [...prev, ...newAttachments]);
      toast.success(`🚀 ${files.length} file(s) uploaded successfully!`, {
        style: {
          background: '#00FF00',
          color: '#111111',
          border: '2px solid #111111',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 700,
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload files', {
        style: {
          background: '#FF3EA5',
          color: '#FFFFFF',
          border: '2px solid #111111',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 700,
        }
      });
    } finally {
      setUploadingFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Remove pending attachment
  const removePendingAttachment = (index: number) => {
    setPendingAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Handle attachment button click
  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  // Handle send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && pendingAttachments.length === 0) || !session) return;
    
    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setTyping.mutate({ projectId, isTyping: false });
    
    await sendMessage.mutateAsync({
      content: newMessage || "📎 File attachment",
      projectId,
      attachments: pendingAttachments.length > 0 ? pendingAttachments : undefined,
    });
    
    // Clear pending attachments after sending
    setPendingAttachments([]);
  };

  // Handle edit message
  const handleEditMessage = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditContent(content);
    setShowMessageMenu(false);
  };

  const saveEdit = async () => {
    if (!editContent.trim()) return;
    
    await editMessage.mutateAsync({
      messageId: editingMessageId!,
      content: editContent,
    });
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditContent("");
  };

  // Handle delete message
  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    
    await deleteMessage.mutateAsync({ messageId });
    setShowMessageMenu(false);
  };

  // Add emoji to message
  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    handleTyping();
  };
  
  // Handle clear chat (admin only)
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  
  const handleClearChat = () => {
    if (!isAdmin) return;
    
    // Show professional confirmation toast
    setShowClearConfirmation(true);
    
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
            ⚠️ Clear All Messages?
          </div>
          <div style={{
            fontSize: '14px',
            color: '#666666',
            lineHeight: '1.4',
            marginBottom: '12px'
          }}>
            This will permanently delete all chat messages for both admin and client. This action cannot be undone.
          </div>
        </div>
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              setShowClearConfirmation(false);
            }}
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
              setShowClearConfirmation(false);
              
              try {
                await clearProjectChat.mutateAsync({ projectId });
              } catch (error) {
                console.error('Failed to clear chat:', error);
                toast.error('Failed to clear chat. Please try again.', {
                  style: {
                    background: '#FF3EA5',
                    color: '#FFFFFF',
                    border: '2px solid #111111',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 700,
                  }
                });
              }
            }}
            disabled={clearProjectChat.isLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#FF3EA5',
              border: '2px solid #111111',
              color: '#FFFFFF',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              cursor: clearProjectChat.isLoading ? 'not-allowed' : 'pointer',
              opacity: clearProjectChat.isLoading ? 0.6 : 1,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              if (!clearProjectChat.isLoading) {
                e.currentTarget.style.backgroundColor = '#E1306C';
              }
            }}
            onMouseLeave={(e) => {
              if (!clearProjectChat.isLoading) {
                e.currentTarget.style.backgroundColor = '#FF3EA5';
              }
            }}
          >
            {clearProjectChat.isLoading ? (
              <>
                <div style={{
                  width: '12px',
                  height: '12px',
                  border: '2px solid #FFFFFF',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Clearing...
              </>
            ) : (
              <>
                🗑️ Clear All
              </>
            )}
          </button>
        </div>
      </div>
    ), {
      duration: Infinity, // Keep open until user decides
      style: {
        background: '#FFFFFF',
        border: '3px solid #111111',
        boxShadow: '6px 6px 0px #111111',
        borderRadius: '0px',
        maxWidth: '400px',
        padding: '16px'
      },
      id: 'clear-chat-confirmation'
    });
  };

  // Format message time
  const formatMessageTime = (date: string | Date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      });
    } else {
      return formatDistanceToNow(messageDate, { addSuffix: true });
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages: any[]) => {
    const groups: { [key: string]: any[] } = {};
    
    messages?.forEach(message => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  if (!session) return null;

  const messageGroups = groupMessagesByDate(messages || []);
  const messageGroupDates = Object.keys(messageGroups);

  return (
    <RetroCard className="overflow-hidden h-[600px] flex flex-col">
      {/* Chat Header */}
      <div style={{
        padding: '24px',
        borderBottom: '2px solid #111111',
        background: 'linear-gradient(135deg, #FFC700 0%, #FF3EA5 100%)'
      }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '20px',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#111111',
              textShadow: '1px 1px 0px #FFFFFF',
              marginBottom: '4px'
            }}>
              💬 Project Chat
              {unreadCount && unreadCount.byProject[projectId] > 0 && (
                <span style={{
                  backgroundColor: '#FF3EA5',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '4px 8px',
                  border: '2px solid #111111',
                  marginLeft: '12px',
                  animation: 'pulse 2s infinite'
                }}>
                  {unreadCount.byProject[projectId]} NEW
                </span>
              )}
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#111111',
              fontWeight: 600,
              fontFamily: 'Poppins, sans-serif'
            }}>
              Communicate directly with your project team
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F8F8F8 100%)'
      }}>
        {messageGroupDates.length > 0 ? (
          messageGroupDates.map(date => (
            <div key={date}>
              {/* Date Separator */}
              <div className="flex items-center justify-center my-4">
                <div style={{
                  backgroundColor: '#3D52F1',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 700,
                  fontFamily: 'Poppins, sans-serif',
                  padding: '6px 12px',
                  border: '2px solid #111111',
                  textTransform: 'uppercase'
                }}>
                  {new Date(date).toDateString() === new Date().toDateString() 
                    ? "Today" 
                    : new Date(date).toDateString() === new Date(Date.now() - 86400000).toDateString()
                    ? "Yesterday"
                    : new Date(date).toLocaleDateString()}
                </div>
              </div>
              
              {/* Messages for this date */}
              {messageGroups[date].map((message: any) => (
                <div
                  key={message.id}
                  ref={el => messageRefs.current[message.id] = el}
                  className={`flex mb-4 ${
                    message.senderId === session.user.id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div className={`group relative max-w-xs lg:max-w-md`}>
                    {/* Message bubble */}
                    <div
                      style={{
                        padding: '16px',
                        borderWidth: '2px',
                        borderStyle: 'solid',
                        borderColor: editingMessageId === message.id ? '#FF3EA5' : '#111111',
                        boxShadow: editingMessageId === message.id ? '3px 3px 0px #FF3EA5' : '3px 3px 0px #111111',
                        borderRadius: '0px',
                        backgroundColor: message.senderId === session.user.id ? '#FFC700' : '#FFFFFF',
                        color: '#111111',
                        fontFamily: 'Poppins, sans-serif'
                      }}
                    >
                      {/* Sender info */}
                      <div className="flex items-center gap-2 mb-2">
                        <span style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#111111',
                          textTransform: 'uppercase'
                        }}>
                          {message.sender.name || "Unknown"}
                        </span>
                        {message.sender.role === "ADMIN" && (
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            backgroundColor: message.senderId === session.user.id ? '#111111' : '#3D52F1',
                            color: '#FFFFFF',
                            border: '1px solid #111111',
                            textTransform: 'uppercase'
                          }}>
                            TEAM
                          </span>
                        )}
                      </div>
                      
                      {/* Message content */}
                      {editingMessageId === message.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px',
                              fontSize: '14px',
                              border: '2px solid #111111',
                              fontFamily: 'Poppins, sans-serif',
                              backgroundColor: '#FFFFFF',
                              color: '#111111'
                            }}
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={saveEdit}
                              style={{
                                fontSize: '12px',
                                backgroundColor: '#00FF00',
                                color: '#111111',
                                padding: '6px 8px',
                                border: '2px solid #111111',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              ✓
                            </button>
                            <button
                              onClick={cancelEdit}
                              style={{
                                fontSize: '12px',
                                backgroundColor: '#FF3EA5',
                                color: '#111111',
                                padding: '6px 8px',
                                border: '2px solid #111111',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p style={{
                            fontSize: '14px',
                            fontWeight: 500,
                            wordBreak: 'break-words',
                            marginBottom: '8px',
                            lineHeight: '1.4'
                          }}>
                            {message.content}
                            {message.isEdited && (
                              <span style={{
                                fontSize: '11px',
                                marginLeft: '8px',
                                fontStyle: 'italic',
                                opacity: 0.7
                              }}>
                                (edited)
                              </span>
                            )}
                          </p>
                          
                          {/* Display attachments */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                              {message.attachments.map((attachment: any) => {
                                const isImage = attachment.mimeType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(attachment.fileName);
                                const isDocument = attachment.mimeType?.includes('pdf') || /\.(pdf|doc|docx|txt)$/i.test(attachment.fileName);
                                
                                return (
                                  <div key={attachment.id} style={{
                                    backgroundColor: message.senderId === session.user.id ? '#111111' : '#F0F0F0',
                                    padding: '8px',
                                    marginBottom: '4px',
                                    border: '2px solid #111111',
                                    borderRadius: '4px'
                                  }}>
                                    {/* Image Preview */}
                                    {isImage && attachment.fileUrl !== '#' && attachment.fileUrl && !attachment.fileUrl.startsWith('#') && (
                                      <div style={{ marginBottom: '8px' }}>
                                        <img 
                                          src={attachment.fileUrl} 
                                          alt={attachment.fileName}
                                          style={{
                                            maxWidth: '200px',
                                            maxHeight: '150px',
                                            width: 'auto',
                                            height: 'auto',
                                            border: '2px solid #111111',
                                            cursor: 'pointer',
                                            display: 'block'
                                          }}
                                          onClick={() => window.open(attachment.fileUrl, '_blank')}
                                          onError={(e) => {
                                            console.log('Image failed to load:', attachment.fileUrl);
                                            e.currentTarget.style.display = 'none';
                                          }}
                                        />
                                      </div>
                                    )}
                                    
                                    {/* Image Icon for Mock/Invalid URLs */}
                                    {isImage && (attachment.fileUrl === '#' || !attachment.fileUrl || attachment.fileUrl.startsWith('#')) && (
                                      <div style={{
                                        marginBottom: '8px',
                                        textAlign: 'center',
                                        padding: '16px'
                                      }}>
                                        <div style={{
                                          fontSize: '32px',
                                          marginBottom: '4px'
                                        }}>
                                          🖼️
                                        </div>
                                        <div style={{
                                          fontSize: '10px',
                                          fontWeight: 600,
                                          color: message.senderId === session.user.id ? '#FFFFFF' : '#666666',
                                          opacity: 0.8
                                        }}>
                                          (Preview not available)
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Document/PDF Preview Icon */}
                                    {isDocument && (
                                      <div style={{
                                        marginBottom: '8px',
                                        textAlign: 'center',
                                        padding: '16px'
                                      }}>
                                        <div style={{
                                          fontSize: '32px',
                                          marginBottom: '4px'
                                        }}>
                                          {attachment.mimeType?.includes('pdf') ? '📄' : '📝'}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* File Info */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <Paperclip size={12} color={message.senderId === session.user.id ? '#FFFFFF' : '#111111'} />
                                      {attachment.fileUrl !== '#' && attachment.fileUrl && !attachment.fileUrl.startsWith('#') ? (
                                        <a 
                                          href={attachment.fileUrl} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          style={{
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            color: message.senderId === session.user.id ? '#FFFFFF' : '#3D52F1',
                                            textDecoration: 'underline',
                                            maxWidth: '150px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                          }}
                                        >
                                          {attachment.fileName}
                                        </a>
                                      ) : (
                                        <span style={{
                                          fontSize: '12px',
                                          fontWeight: 600,
                                          color: message.senderId === session.user.id ? '#FFFFFF' : '#111111',
                                          maxWidth: '150px',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                          opacity: 0.8
                                        }}>
                                          {attachment.fileName} (Test Mode)
                                        </span>
                                      )}
                                      <span style={{
                                        fontSize: '10px',
                                        color: message.senderId === session.user.id ? '#FFFFFF' : '#111111',
                                        opacity: 0.7,
                                        fontWeight: 600
                                      }}>
                                        ({(attachment.fileSize / 1024 / 1024).toFixed(1)} MB)
                                      </span>
                                    </div>
                                    
                                    {/* File Type Badge */}
                                    <div style={{
                                      marginTop: '4px',
                                      fontSize: '10px',
                                      fontWeight: 700,
                                      textTransform: 'uppercase',
                                      color: message.senderId === session.user.id ? '#FFC700' : '#3D52F1',
                                      opacity: 0.8
                                    }}>
                                      {isImage ? 'IMAGE' : isDocument ? 'DOCUMENT' : 'FILE'}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </>
                      
                      )}
                      
                      {/* Time and status */}
                      <div className="flex items-center justify-between">
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          opacity: 0.7
                        }}>
                          {formatMessageTime(message.createdAt)}
                        </span>
                        
                        {/* Read status for sent messages */}
                        {message.senderId === session.user.id && (
                          <span style={{ fontSize: '12px' }}>
                            {message.readBy && message.readBy.length > 0 ? (
                              <CheckCheck size={14} style={{ color: '#00FF00' }} />
                            ) : (
                              <Check size={14} style={{ color: '#111111', opacity: 0.5 }} />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Message actions (only for own messages) */}
                    {message.senderId === session.user.id && !editingMessageId && (
                      <div className="absolute -left-20 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div style={{
                          display: 'flex',
                          gap: '4px',
                          backgroundColor: '#FFFFFF',
                          border: '2px solid #111111',
                          boxShadow: '3px 3px 0px #111111',
                          padding: '4px'
                        }}>
                          <button
                            onClick={() => handleEditMessage(message.id, message.content)}
                            style={{
                              padding: '6px',
                              backgroundColor: '#FFC700',
                              border: '1px solid #111111',
                              cursor: 'pointer'
                            }}
                            title="Edit message"
                          >
                            <Edit2 size={14} color="#111111" />
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            style={{
                              padding: '6px',
                              backgroundColor: '#FF3EA5',
                              border: '1px solid #111111',
                              cursor: 'pointer'
                            }}
                            title="Delete message"
                          >
                            <Trash2 size={14} color="#111111" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <div style={{
              fontSize: '48px',
              marginBottom: '16px',
              filter: 'grayscale(100%)'
            }}>💬</div>
            <p style={{
              fontSize: '18px',
              fontWeight: 700,
              fontFamily: 'Poppins, sans-serif',
              color: '#111111',
              marginBottom: '8px'
            }}>No messages yet</p>
            <p style={{
              fontSize: '14px',
              fontWeight: 500,
              fontFamily: 'Poppins, sans-serif',
              color: '#666666'
            }}>Start a conversation!</p>
          </div>
        )}
        
        {/* Typing indicator */}
        {typingUsers && typingUsers.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            fontSize: '12px',
            fontWeight: 600,
            fontFamily: 'Poppins, sans-serif',
            color: '#111111',
            backgroundColor: '#F0F0F0',
            border: '2px solid #111111',
            marginBottom: '8px'
          }}>
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
            </div>
            <span>
              {typingUsers.map(u => u.user.name).join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
            </span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div style={{
        borderTop: '2px solid #111111',
        backgroundColor: '#FFFFFF',
        padding: '20px'
      }}>
        {/* Pending Attachments */}
        {pendingAttachments.length > 0 && (
          <div style={{
            marginBottom: '16px',
            padding: '12px',
            backgroundColor: '#E0F2FF',
            border: '2px solid #3D52F1',
            boxShadow: '2px 2px 0px #3D52F1'
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#3D52F1',
              marginBottom: '8px',
              textTransform: 'uppercase',
              fontFamily: 'Poppins, sans-serif'
            }}>
              📎 PENDING ATTACHMENTS ({pendingAttachments.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pendingAttachments.map((attachment, index) => {
                const isImage = attachment.mimeType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(attachment.fileName);
                const isDocument = attachment.mimeType?.includes('pdf') || /\.(pdf|doc|docx|txt)$/i.test(attachment.fileName);
                
                return (
                  <div key={index} style={{
                    backgroundColor: '#FFFFFF',
                    padding: '8px',
                    border: '2px solid #111111',
                    borderRadius: '4px'
                  }}>
                    {/* Image Preview */}
                    {isImage && attachment.fileUrl !== '#' && (
                      <div style={{ marginBottom: '8px', textAlign: 'center' }}>
                        <img 
                          src={attachment.fileUrl} 
                          alt={attachment.fileName}
                          style={{
                            maxWidth: '100px',
                            maxHeight: '80px',
                            width: 'auto',
                            height: 'auto',
                            border: '1px solid #111111',
                            borderRadius: '2px'
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Document Icon */}
                    {isDocument && (
                      <div style={{
                        marginBottom: '8px',
                        textAlign: 'center',
                        fontSize: '24px'
                      }}>
                        {attachment.mimeType?.includes('pdf') ? '📄' : '📝'}
                      </div>
                    )}
                    
                    {/* File Info and Actions */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <Paperclip size={14} color="#3D52F1" />
                        <span style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#111111',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {attachment.fileName}
                        </span>
                        <span style={{
                          fontSize: '10px',
                          color: '#666666',
                          fontWeight: 500
                        }}>
                          ({(attachment.fileSize / 1024 / 1024).toFixed(1)} MB)
                        </span>
                      </div>
                      <button
                        onClick={() => removePendingAttachment(index)}
                        style={{
                          padding: '4px',
                          backgroundColor: '#FF3EA5',
                          border: '1px solid #111111',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#FFFFFF'
                        }}
                        title="Remove attachment"
                      >
                        ✕
                      </button>
                    </div>
                    
                    {/* File Type Badge */}
                    <div style={{
                      marginTop: '4px',
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: '#3D52F1',
                      opacity: 0.8
                    }}>
                      {isImage ? 'IMAGE' : isDocument ? 'DOCUMENT' : 'FILE'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Uploading Files */}
        {uploadingFiles.length > 0 && (
          <div style={{
            marginBottom: '16px',
            padding: '12px',
            backgroundColor: '#FFF8E1',
            border: '2px solid #FFC700',
            boxShadow: '2px 2px 0px #FFC700'
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#FFC700',
              marginBottom: '8px',
              textTransform: 'uppercase',
              fontFamily: 'Poppins, sans-serif'
            }}>
              ⏳ UPLOADING FILES... ({uploadingFiles.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {uploadingFiles.map((file, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #FFC700',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#111111'
                  }}>
                    {file.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div style={{
            position: 'absolute',
            bottom: '100px',
            left: '20px',
            backgroundColor: '#FFFFFF',
            border: '2px solid #111111',
            boxShadow: '3px 3px 0px #111111',
            padding: '12px',
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            gap: '4px',
            maxWidth: '300px',
            zIndex: 10
          }}>
            {emojis.map(emoji => (
              <button
                key={emoji}
                onClick={() => addEmoji(emoji)}
                style={{
                  fontSize: '20px',
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '4px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFC700';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
        
        <form onSubmit={handleSendMessage} className="flex gap-3">
          {/* Emoji button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            style={{
              padding: '12px',
              backgroundColor: '#FFFFFF',
              border: '2px solid #111111',
              boxShadow: '2px 2px 0px #111111',
              cursor: 'pointer',
              transition: 'transform 0.1s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translate(-1px, -1px)';
              e.currentTarget.style.backgroundColor = '#FFC700';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translate(0, 0)';
              e.currentTarget.style.backgroundColor = '#FFFFFF';
            }}
          >
            <Smile size={20} color="#111111" />
          </button>
          
          {/* Attachment button */}
          <button
            type="button"
            onClick={handleAttachmentClick}
            disabled={uploadingFiles.length > 0}
            style={{
              padding: '12px',
              backgroundColor: '#FFFFFF',
              border: '2px solid #111111',
              boxShadow: '2px 2px 0px #111111',
              cursor: uploadingFiles.length > 0 ? 'not-allowed' : 'pointer',
              transition: 'transform 0.1s ease',
              opacity: uploadingFiles.length > 0 ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (uploadingFiles.length === 0) {
                e.currentTarget.style.transform = 'translate(-1px, -1px)';
                e.currentTarget.style.backgroundColor = '#FF3EA5';
              }
            }}
            onMouseLeave={(e) => {
              if (uploadingFiles.length === 0) {
                e.currentTarget.style.transform = 'translate(0, 0)';
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }
            }}
            title={uploadingFiles.length > 0 ? "Uploading..." : "Attach files (max 10MB each)"}
          >
            <Paperclip size={20} color={uploadingFiles.length > 0 ? "#3D52F1" : "#111111"} />
          </button>
          
          {/* Clear Chat button (Admin only) */}
          {isAdmin && (
            <button
              type="button"
              onClick={handleClearChat}
              disabled={clearProjectChat.isLoading || !messages || messages.length === 0}
              style={{
                padding: '12px',
                backgroundColor: '#FFFFFF',
                border: '2px solid #111111',
                boxShadow: '2px 2px 0px #111111',
                cursor: (clearProjectChat.isLoading || !messages || messages.length === 0) ? 'not-allowed' : 'pointer',
                transition: 'transform 0.1s ease',
                opacity: (clearProjectChat.isLoading || !messages || messages.length === 0) ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!clearProjectChat.isLoading && messages && messages.length > 0) {
                  e.currentTarget.style.transform = 'translate(-1px, -1px)';
                  e.currentTarget.style.backgroundColor = '#FF3EA5';
                }
              }}
              onMouseLeave={(e) => {
                if (!clearProjectChat.isLoading && messages && messages.length > 0) {
                  e.currentTarget.style.transform = 'translate(0, 0)';
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                }
              }}
              title={messages && messages.length > 0 ? "Clear all chat messages (Admin only)" : "No messages to clear"}
            >
              {clearProjectChat.isLoading ? (
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #FF3EA5',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              ) : (
                <Trash2 size={20} color={messages && messages.length > 0 ? "#FF3EA5" : "#CCCCCC"} />
              )}
            </button>
          )}
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            multiple
            accept="image/*,application/pdf,.doc,.docx,.txt,.zip,.rar"
          />
          
          {/* Message input */}
          <input
            type="text"
            value={newMessage}
            onChange={handleMessageChange}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: '12px 16px',
              borderWidth: '2px',
              borderStyle: 'solid',
              borderColor: '#111111',
              backgroundColor: '#FFFFFF',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              color: '#111111',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#3D52F1';
              e.currentTarget.style.boxShadow = '0 0 0 2px #3D52F1';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#111111';
              e.currentTarget.style.boxShadow = 'none';
            }}
            disabled={sendMessage.isLoading}
          />
          
          {/* Send button */}
          <button
            type="submit"
            disabled={(!newMessage.trim() && pendingAttachments.length === 0) || sendMessage.isLoading}
            style={{
              padding: '12px 16px',
              backgroundColor: (newMessage.trim() || pendingAttachments.length > 0) ? '#00FF00' : '#CCCCCC',
              color: '#111111',
              border: '2px solid #111111',
              boxShadow: '3px 3px 0px #111111',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '14px',
              fontWeight: 700,
              textTransform: 'uppercase',
              cursor: (newMessage.trim() || pendingAttachments.length > 0) ? 'pointer' : 'not-allowed',
              transition: 'transform 0.1s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              if (newMessage.trim() || pendingAttachments.length > 0) {
                e.currentTarget.style.transform = 'translate(-2px, -2px)';
                e.currentTarget.style.boxShadow = '5px 5px 0px #111111';
                e.currentTarget.style.backgroundColor = '#00FFFF';
              }
            }}
            onMouseLeave={(e) => {
              if (newMessage.trim() || pendingAttachments.length > 0) {
                e.currentTarget.style.transform = 'translate(0, 0)';
                e.currentTarget.style.boxShadow = '3px 3px 0px #111111';
                e.currentTarget.style.backgroundColor = '#00FF00';
              }
            }}
          >
            {sendMessage.isLoading ? (
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #111111',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            ) : (
              <>
                <Send size={16} />
                SEND
              </>
            )}
          </button>
        </form>
      </div>
    </RetroCard>
  );
}
