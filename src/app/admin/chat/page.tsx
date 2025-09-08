"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RetroCard } from "@/components/ui/retro-card";
import { RetroButton } from "@/components/ui/retro-button";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Send, Paperclip, Download, Eye, Loader2 } from "lucide-react";
import { RetroProjectChat } from "@/components/chat/retro-project-chat";

function AdminChatContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  
  // Get all conversations
  const { data: conversations, refetch: refetchConversations } = trpc.chat.getConversations.useQuery();
  
  // Get unread counts for all projects
  const { data: unreadCounts, refetch: refetchUnreadCounts } = trpc.chat.getUnreadCount.useQuery();
  
  // Get messages for selected project
  const { data: messages, refetch: refetchMessages } = trpc.chat.getMessages.useQuery(
    { projectId: selectedProjectId! },
    { 
      enabled: !!selectedProjectId,
      refetchInterval: 10000, // Reduced from 5000ms to 10000ms
      refetchIntervalInBackground: false // Don't refetch when tab is not active
    }
  );
  
  // Send message mutation
  const sendMessage = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      setNewMessage("");
      refetchMessages();
      refetchConversations();
      refetchUnreadCounts();
    },
  });
  
  // Handle URL query parameter to auto-select project
  useEffect(() => {
    const projectParam = searchParams.get('project');
    if (projectParam && conversations) {
      // Check if project exists in conversations
      const projectExists = conversations.some(conv => conv.id === projectParam);
      if (projectExists) {
        setSelectedProjectId(projectParam);
      }
    }
  }, [searchParams, conversations]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedProjectId) return;
    
    // Get the client ID from selected project
    const project = conversations?.find(c => c.id === selectedProjectId);
    if (!project) return;
    
    await sendMessage.mutateAsync({
      content: newMessage,
      projectId: selectedProjectId,
      receiverId: project.clientId,
    });
  };

  if (!session || session.user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RetroCard padding="lg" className="text-center max-w-md">
          <div style={{
            fontSize: '72px',
            marginBottom: '24px'
          }}>🛡️</div>
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
      
      <main className="py-20">
        <div className="container mx-auto px-6">
          {/* Back Navigation */}
          <div className="mb-8">
            <Link href="/admin/dashboard">
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

          {/* Page Header */}
          <div className="text-center mb-16">
            <div style={{
              display: 'inline-block',
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
                transform: 'rotate(-3deg)'
              }}>
                <MessageSquare size={40} strokeWidth={3} color="#111111" />
              </div>
            </div>
            <h1 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '48px',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#FFC700',
              marginBottom: '16px',
              textShadow: '2px 2px 0px #111111'
            }}>
              Chat Management
            </h1>
            <p style={{
              fontSize: '18px',
              color: '#FFFFFF',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Communicate with clients across all projects
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversations List */}
            <div className="lg:col-span-1">
              <RetroCard padding="none" className="overflow-hidden">
                <div style={{
                  padding: '16px',
                  borderBottom: '2px solid #111111',
                  backgroundColor: '#FF3EA5',
                  color: '#FFFFFF'
                }}>
                  <h2 style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '18px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    marginBottom: '4px'
                  }}>Conversations</h2>
                  <p style={{
                    fontSize: '12px',
                    opacity: 0.9,
                    fontWeight: 600
                  }}>
                    {conversations?.length || 0} active chats
                  </p>
                </div>
                
                <div style={{ borderTop: '2px solid #111111' }}>
                  {conversations && conversations.length > 0 ? (
                    conversations.map((conversation) => {
                      const hasUnread = unreadCounts?.byProject?.[conversation.id] > 0;
                      const lastMessage = conversation.messages[0];
                      const isSelected = selectedProjectId === conversation.id;
                      
                      return (
                        <button
                          key={conversation.id}
                          onClick={() => setSelectedProjectId(conversation.id)}
                          style={{
                            width: '100%',
                            padding: '16px',
                            textAlign: 'left',
                            backgroundColor: isSelected ? '#FFC700' : '#FFFFFF',
                            color: '#111111',
                            border: 'none',
                            borderBottom: '1px solid #CCCCCC',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontFamily: 'Poppins, sans-serif'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = '#00FFFF';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = '#FFFFFF';
                            }
                          }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 style={{
                              fontWeight: 700,
                              fontSize: '14px',
                              textTransform: 'uppercase',
                              color: '#111111',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              flex: 1,
                              marginRight: '8px'
                            }}>
                              {conversation.title}
                            </h3>
                            {hasUnread && (
                              <span style={{
                                backgroundColor: '#FF3EA5',
                                color: '#FFFFFF',
                                fontSize: '10px',
                                padding: '2px 8px',
                                border: '1px solid #111111',
                                fontWeight: 700,
                                textTransform: 'uppercase'
                              }}>
                                New
                              </span>
                            )}
                          </div>
                          
                          <p style={{
                            fontSize: '12px',
                            color: '#666666',
                            marginBottom: '8px',
                            fontWeight: 600
                          }}>
                            {conversation.client?.name}
                          </p>
                          
                          {lastMessage && (
                            <p style={{
                              fontSize: '11px',
                              color: '#888888',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              marginBottom: '8px'
                            }}>
                              {lastMessage.sender.role === "CLIENT" ? "Client: " : "You: "}
                              {lastMessage.content}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <span style={{
                              fontSize: '10px',
                              color: '#999999',
                              fontWeight: 600
                            }}>
                              {conversation._count.messages} messages
                            </span>
                            {lastMessage && (
                              <span style={{
                                fontSize: '10px',
                                color: '#999999',
                                fontWeight: 600
                              }}>
                                {new Date(lastMessage.createdAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div style={{
                      padding: '32px',
                      textAlign: 'center',
                      color: '#111111'
                    }}>
                      <div style={{
                        fontSize: '48px',
                        marginBottom: '16px'
                      }}>💬</div>
                      <p style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '14px',
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}>No conversations yet</p>
                    </div>
                  )}
                </div>
              </RetroCard>
            </div>

            {/* Chat Window */}
            <div className="lg:col-span-2">
              {selectedProjectId ? (
                <div>
                  {/* Chat Header with Project Info */}
                  <RetroCard padding="md" className="mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 style={{
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: '20px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          color: '#111111',
                          marginBottom: '4px'
                        }}>
                          📋 {conversations?.find(c => c.id === selectedProjectId)?.title}
                        </h3>
                        <p style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#666666',
                          fontFamily: 'Poppins, sans-serif'
                        }}>
                          💼 Client: {conversations?.find(c => c.id === selectedProjectId)?.client?.name}
                        </p>
                      </div>
                      <Link href={`/admin/projects/edit/${selectedProjectId}`}>
                        <RetroButton variant="secondary" size="sm">
                          View Project
                        </RetroButton>
                      </Link>
                    </div>
                  </RetroCard>
                  
                  {/* Use RetroProjectChat Component */}
                  <RetroProjectChat projectId={selectedProjectId} isAdmin={true} />
                </div>
              ) : (
                <RetroCard padding="lg" style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center', color: '#111111' }}>
                    <div style={{
                      fontSize: '72px',
                      marginBottom: '24px'
                    }}>💬</div>
                    <h3 style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '24px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      marginBottom: '12px'
                    }}>Select a conversation</h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#666666',
                      fontWeight: 600
                    }}>Choose a conversation from the left to start chatting</p>
                  </div>
                </RetroCard>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Loading fallback component
function AdminChatLoading() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="py-20">
        <div className="container mx-auto px-6">
          {/* Back Navigation */}
          <div className="mb-8">
            <Link href="/admin/dashboard">
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
              }}>
                <ArrowLeft size={16} strokeWidth={2} />
                Back to Dashboard
              </button>
            </Link>
          </div>

          {/* Page Header */}
          <div className="text-center mb-16">
            <div style={{
              display: 'inline-block',
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
                transform: 'rotate(-3deg)'
              }}>
                <MessageSquare size={40} strokeWidth={3} color="#111111" />
              </div>
            </div>
            <h1 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '48px',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#FFC700',
              marginBottom: '16px',
              textShadow: '2px 2px 0px #111111'
            }}>
              Chat Management
            </h1>
            <p style={{
              fontSize: '18px',
              color: '#FFFFFF',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Loading chat...
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <RetroCard padding="lg">
                <div className="text-center">
                  <Loader2 className="animate-spin mx-auto mb-4" size={48} style={{ color: '#3D52F1' }} />
                  <p>Loading conversations...</p>
                </div>
              </RetroCard>
            </div>
            <div className="lg:col-span-2">
              <RetroCard padding="lg" style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: '#111111' }}>
                  <Loader2 className="animate-spin mx-auto mb-4" size={48} style={{ color: '#3D52F1' }} />
                  <p>Preparing chat interface...</p>
                </div>
              </RetroCard>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Main component with Suspense boundary
export default function AdminChatPage() {
  return (
    <Suspense fallback={<AdminChatLoading />}>
      <AdminChatContent />
    </Suspense>
  );
}
