"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { Edit2, Trash2, Check, X, MoreVertical, Paperclip, Send, Smile } from "lucide-react";

interface ProjectChatProps {
  projectId: string;
}

export function ProjectChat({ projectId }: ProjectChatProps) {
  const { data: session } = useSession();
  const [newMessage, setNewMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [pendingAttachments, setPendingAttachments] = useState<Array<{fileName: string, fileUrl: string, fileSize: number, mimeType: string}>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: messages, refetch } = trpc.chat.getMessages.useQuery(
    { projectId },
    { refetchInterval: 5000 } // Poll every 5 seconds
  );
  
  const sendMessage = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      setNewMessage("");
      refetch();
    },
  });

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && pendingAttachments.length === 0) || !session) return;
    
    await sendMessage.mutateAsync({
      content: newMessage || "📎 File attachment",
      projectId,
      attachments: pendingAttachments.length > 0 ? pendingAttachments : undefined,
    });
    
    // Clear pending attachments after sending
    setPendingAttachments([]);
  };

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!session) return null;

  return (
    <div className="card p-0 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-muted/30">
        <h3 className="font-semibold flex items-center gap-2">
          💬 Project Chat
        </h3>
        <p className="text-sm text-muted-foreground">
          Communicate directly with your project team
        </p>
      </div>

      {/* Messages */}
      <div className="h-80 overflow-y-auto p-4 space-y-4">
        {messages && messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderId === session.user.id
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.senderId === session.user.id
                    ? "bg-primary-500 text-white"
                    : "bg-muted"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium">
                    {message.sender.name || "Unknown"}
                  </span>
                  {message.sender.role === "ADMIN" && (
                    <span className="text-xs bg-white/20 px-1 rounded">
                      Team
                    </span>
                  )}
                </div>
                <p className="text-sm">{message.content}</p>
                
                {/* Display attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.attachments.map((attachment) => (
                      <div key={attachment.id} className="bg-black/10 rounded p-2">
                        <div className="flex items-center gap-2">
                          <Paperclip size={12} className="text-current opacity-70" />
                          <a 
                            href={attachment.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs hover:underline truncate max-w-[200px]"
                          >
                            {attachment.fileName}
                          </a>
                          <span className="text-xs opacity-70">
                            ({(attachment.fileSize / 1024 / 1024).toFixed(1)} MB)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <div className="text-3xl mb-2">💬</div>
            <p>No messages yet. Start a conversation!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200">
        {/* Pending Attachments */}
        {pendingAttachments.length > 0 && (
          <div className="px-4 py-3 bg-blue-50 border-b border-blue-200">
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
                    type="button"
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
          <div className="px-4 py-3 bg-yellow-50 border-b border-yellow-200">
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
        
        <form onSubmit={handleSendMessage} className="p-4">
          <div className="flex gap-2">
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
            
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={sendMessage.isLoading}
            />
            <button
              type="submit"
              disabled={(!newMessage.trim() && pendingAttachments.length === 0) || sendMessage.isLoading}
              className={`px-4 py-2 rounded transition-all ${
                (newMessage.trim() || pendingAttachments.length > 0) 
                  ? "btn-primary" 
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {sendMessage.isLoading ? "..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
