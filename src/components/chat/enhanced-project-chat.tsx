"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { 
  Edit2, Trash2, Check, X, MoreVertical, Paperclip, 
  Send, Smile, Clock, CheckCheck, Eye, Download 
} from "lucide-react";

interface EnhancedProjectChatProps {
  projectId: string;
}

const emojis = ["😀", "😃", "😄", "😁", "😊", "😍", "🤩", "😎", "🤔", "😮", "😯", "😲", "😢", "😭", "😡", "👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙", "👋", "🙏", "💪", "🎉", "🎊", "🎈", "🎁", "❤️", "💔", "💯", "🔥", "⭐", "🌟", "✨", "💫"];

export function EnhancedProjectChat({ projectId }: EnhancedProjectChatProps) {
  const { data: session } = useSession();
  const [newMessage, setNewMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [showMessageMenu, setShowMessageMenu] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [pendingAttachments, setPendingAttachments] = useState<Array<{fileName: string, fileUrl: string, fileSize: number, mimeType: string}>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const previousMessageCount = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Queries
  const { data: messages, refetch } = trpc.chat.getMessages.useQuery(
    { projectId },
    { 
      refetchInterval: 3000,
      onSuccess: (data) => {
        // Show notification for new messages
        if (data && data.length > previousMessageCount.current && previousMessageCount.current > 0) {
          const latestMessage = data[data.length - 1];
          if (latestMessage.senderId !== session?.user.id) {
            toast.success(`New message from ${latestMessage.sender.name}`, {
              icon: "💬",
              duration: 4000,
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
      refetchInterval: false, // Disable typing users polling - it causes rate limiting
      refetchIntervalInBackground: false,
      enabled: false // Completely disable typing users for now
    }
  );

  const { data: unreadCount } = trpc.chat.getUnreadCount.useQuery(
    undefined,
    { refetchInterval: 5000 }
  );
  
  // Mutations
  const sendMessage = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      setNewMessage("");
      refetch();
      toast.success("Message sent!", { duration: 1000 });
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
            ⚠️ Delete Message?
          </div>
          <div style={{
            fontSize: '14px',
            color: '#666666',
            lineHeight: '1.4',
            marginBottom: '12px'
          }}>
            This action cannot be undone. The message will be permanently removed.
          </div>
        </div>
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={() => toast.dismiss(t.id)}
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
              await deleteMessage.mutateAsync({ messageId });
              setShowMessageMenu(false);
            }}
            disabled={deleteMessage.isLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#FF3EA5',
              border: '2px solid #111111',
              color: '#FFFFFF',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              cursor: deleteMessage.isLoading ? 'not-allowed' : 'pointer',
              opacity: deleteMessage.isLoading ? 0.6 : 1,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              if (!deleteMessage.isLoading) {
                e.currentTarget.style.backgroundColor = '#E1306C';
              }
            }}
            onMouseLeave={(e) => {
              if (!deleteMessage.isLoading) {
                e.currentTarget.style.backgroundColor = '#FF3EA5';
              }
            }}
          >
            {deleteMessage.isLoading ? (
              <>
                <div style={{
                  width: '12px',
                  height: '12px',
                  border: '2px solid #FFFFFF',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Deleting...
              </>
            ) : (
              <>
                🗑️ Delete
              </>
            )}
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      style: {
        background: '#FFFFFF',
        border: '3px solid #111111',
        boxShadow: '6px 6px 0px #111111',
        borderRadius: '0px',
        maxWidth: '400px',
        padding: '16px'
      },
      id: 'delete-message-confirmation'
    });
  };

  // Add emoji to message
  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    handleTyping();
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

        const response = await fetch('/api/upload/chat-attachment', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }

        const { file: uploadedFile } = await response.json();
        newAttachments.push(uploadedFile);
      }

      setPendingAttachments(prev => [...prev, ...newAttachments]);
      toast.success(`${files.length} file(s) uploaded successfully!`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload files');
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
    <div className="card p-0 overflow-hidden h-[600px] flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              💬 Project Chat
              {unreadCount && unreadCount.byProject[projectId] > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                  {unreadCount.byProject[projectId]} new
                </span>
              )}
            </h3>
            <p className="text-sm text-muted-foreground">
              Communicate directly with your project team
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white">
        {messageGroupDates.length > 0 ? (
          messageGroupDates.map(date => (
            <div key={date}>
              {/* Date Separator */}
              <div className="flex items-center justify-center my-4">
                <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
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
                      className={`px-4 py-2 rounded-2xl shadow-sm ${
                        message.senderId === session.user.id
                          ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-br-none"
                          : "bg-white border border-gray-200 rounded-bl-none"
                      } ${editingMessageId === message.id ? "ring-2 ring-primary-500" : ""}`}
                    >
                      {/* Sender info */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium ${
                          message.senderId === session.user.id ? "text-white/90" : "text-gray-600"
                        }`}>
                          {message.sender.name || "Unknown"}
                        </span>
                        {message.sender.role === "ADMIN" && (
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            message.senderId === session.user.id 
                              ? "bg-white/20 text-white" 
                              : "bg-primary-100 text-primary-700"
                          }`}>
                            Team
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
                            className="w-full px-2 py-1 text-sm border rounded text-gray-900"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={saveEdit}
                              className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm break-words">
                            {message.content}
                            {message.isEdited && (
                              <span className={`text-xs ml-2 italic ${
                                message.senderId === session.user.id ? "text-white/70" : "text-gray-400"
                              }`}>
                                (edited)
                              </span>
                            )}
                          </p>
                          
                          {/* Attachments */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <div className={`text-xs font-medium flex items-center gap-1 ${
                                message.senderId === session.user.id ? "text-white/80" : "text-gray-500"
                              }`}>
                                <Paperclip size={10} />
                                Attachments ({message.attachments.length})
                              </div>
                              {message.attachments.map((attachment: any, index: number) => {
                                const isImage = attachment.mimeType?.startsWith('image/');
                                return (
                                  <div key={index} className={`flex items-center gap-2 p-2 rounded ${
                                    message.senderId === session.user.id 
                                      ? "bg-white/10 border border-white/20" 
                                      : "bg-gray-50 border border-gray-200"
                                  }`}>
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      {isImage ? (
                                        <div className="w-8 h-8 bg-blue-100 border border-blue-200 rounded flex items-center justify-center flex-shrink-0">
                                          <img 
                                            src={attachment.fileUrl} 
                                            alt={attachment.fileName}
                                            className="w-7 h-7 object-cover rounded"
                                            onError={(e) => {
                                              const target = e.target as HTMLImageElement;
                                              target.style.display = 'none';
                                              target.parentElement!.innerHTML = '🖼️';
                                            }}
                                          />
                                        </div>
                                      ) : (
                                        <div className="w-8 h-8 bg-pink-100 border border-pink-200 rounded flex items-center justify-center flex-shrink-0">
                                          📄
                                        </div>
                                      )}
                                      <div className="min-w-0 flex-1">
                                        <div className={`text-xs font-medium truncate ${
                                          message.senderId === session.user.id ? "text-white" : "text-gray-700"
                                        }`}>
                                          {attachment.fileName}
                                        </div>
                                        <div className={`text-xs ${
                                          message.senderId === session.user.id ? "text-white/60" : "text-gray-500"
                                        }`}>
                                          {attachment.fileSize ? `${(attachment.fileSize / 1024 / 1024).toFixed(1)} MB` : 'Size unknown'}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex gap-1">
                                      {isImage && (
                                        <button
                                          onClick={() => window.open(attachment.fileUrl, '_blank')}
                                          className="p-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-xs flex items-center justify-center"
                                          title="View image"
                                        >
                                          <Eye size={10} />
                                        </button>
                                      )}
                                      <button
                                        onClick={() => window.open(attachment.fileUrl, '_blank')}
                                        className="p-1 rounded bg-green-500 hover:bg-green-600 text-white text-xs flex items-center justify-center"
                                        title="Download file"
                                      >
                                        <Download size={10} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </>
                      )}
                      
                      {/* Time and status */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs ${
                          message.senderId === session.user.id ? "text-white/70" : "text-gray-400"
                        }`}>
                          {formatMessageTime(message.createdAt)}
                        </span>
                        
                        {/* Read status for sent messages */}
                        {message.senderId === session.user.id && (
                          <span className="text-xs">
                            {message.readBy && message.readBy.length > 0 ? (
                              <CheckCheck size={14} className="text-white/70" />
                            ) : (
                              <Check size={14} className="text-white/50" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Message actions (only for own messages) */}
                    {message.senderId === session.user.id && !editingMessageId && (
                      <div className="absolute -left-20 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-1 bg-white border border-gray-200 rounded-lg shadow-lg p-1">
                          <button
                            onClick={() => handleEditMessage(message.id, message.content)}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            title="Edit message"
                          >
                            <Edit2 size={14} className="text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            title="Delete message"
                          >
                            <Trash2 size={14} className="text-red-500" />
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
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="text-6xl mb-4 opacity-50">💬</div>
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-sm">Start a conversation!</p>
          </div>
        )}
        
        {/* Typing indicator */}
        {typingUsers && typingUsers.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500">
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
      <div className="border-t border-gray-200 bg-white p-4">
        {/* Pending Attachments */}
        {pendingAttachments.length > 0 && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-xs text-blue-700 font-medium mb-2">Pending attachments ({pendingAttachments.length})</div>
            <div className="space-y-2">
              {pendingAttachments.map((attachment, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                  <div className="flex items-center gap-2 min-w-0">
                    <Paperclip size={14} className="text-blue-600 flex-shrink-0" />
                    <span className="text-xs text-gray-700 truncate">{attachment.fileName}</span>
                    <span className="text-xs text-gray-500">({(attachment.fileSize / 1024 / 1024).toFixed(1)} MB)</span>
                  </div>
                  <button
                    onClick={() => removePendingAttachment(index)}
                    className="p-1 hover:bg-red-100 rounded transition-colors"
                    title="Remove attachment"
                  >
                    <X size={12} className="text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Uploading Files */}
        {uploadingFiles.length > 0 && (
          <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-xs text-yellow-700 font-medium mb-2">Uploading files... ({uploadingFiles.length})</div>
            <div className="space-y-2">
              {uploadingFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-gray-700">{file.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-20 left-4 bg-white border border-gray-200 rounded-lg shadow-xl p-3 grid grid-cols-8 gap-1 max-w-sm">
            {emojis.map(emoji => (
              <button
                key={emoji}
                onClick={() => addEmoji(emoji)}
                className="text-xl hover:bg-gray-100 p-1 rounded transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
        
        <form onSubmit={handleSendMessage} className="flex gap-2">
          {/* Emoji button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Smile size={20} className="text-gray-500" />
          </button>
          
          {/* Attachment button */}
          <button
            type="button"
            onClick={handleAttachmentClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Attach files (max 10MB each)"
            disabled={uploadingFiles.length > 0}
          >
            <Paperclip size={20} className={uploadingFiles.length > 0 ? "text-blue-500" : "text-gray-500"} />
          </button>
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            multiple
            accept="image/*,application/pdf,.doc,.docx,.txt,.zip,.rar"
          />
          
          {/* Message input */}
          <input
            type="text"
            value={newMessage}
            onChange={handleMessageChange}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            disabled={sendMessage.isLoading}
          />
          
          {/* Send button */}
          <button
            type="submit"
            disabled={(!newMessage.trim() && pendingAttachments.length === 0) || sendMessage.isLoading}
            className={`p-2 rounded-full transition-all ${
              (newMessage.trim() || pendingAttachments.length > 0) 
                ? "bg-primary-500 hover:bg-primary-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105" 
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {sendMessage.isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send size={20} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
