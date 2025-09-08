"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RetroCard } from "@/components/ui/retro-card";
import { RetroButton } from "@/components/ui/retro-button";
import { RetroInput } from "@/components/ui/retro-input";
import { trpc } from "@/lib/trpc";
import toast from "react-hot-toast";
import { 
  Files, 
  Search, 
  Download, 
  Trash2, 
  Eye, 
  ArrowLeft, 
  FileText, 
  Image, 
  Archive,
  Calendar,
  HardDrive,
  Share,
  RefreshCw,
  Loader2
} from "lucide-react";

export default function FileManagementPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<'all' | 'attachment' | 'portfolio' | 'profile'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  // tRPC Queries
  const { data: fileStats, refetch: refetchStats } = trpc.files.getFileStatistics.useQuery(
    undefined,
    { enabled: !!session && session.user.role === "ADMIN" }
  );

  const { data: filesData, refetch: refetchFiles, isLoading } = trpc.files.getAllFiles.useQuery({
    category: filterCategory,
    sortBy,
    sortOrder,
    search: searchQuery || undefined,
    limit: 100,
    offset: 0
  }, {
    enabled: !!session && session.user.role === "ADMIN"
  });

  // Mutations
  const deleteFileMutation = trpc.files.deleteFile.useMutation({
    onSuccess: () => {
      toast.success("File deleted successfully");
      refetchFiles();
      refetchStats();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete file");
    }
  });

  const bulkDeleteMutation = trpc.files.bulkDeleteFiles.useMutation({
    onSuccess: (result) => {
      if (result.failedCount > 0) {
        toast.error(`${result.deletedCount} files deleted, ${result.failedCount} failed`);
      } else {
        toast.success(`${result.deletedCount} files deleted successfully`);
      }
      setSelectedFiles(new Set());
      refetchFiles();
      refetchStats();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete files");
    }
  });

  const shareFileMutation = trpc.files.shareFileWithProject.useMutation({
    onSuccess: () => {
      toast.success("File shared successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to share file");
    }
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image size={20} className="text-blue-600" />;
    if (type === "application/pdf") return <FileText size={20} className="text-red-600" />;
    if (type.includes("zip") || type.includes("rar")) return <Archive size={20} className="text-green-600" />;
    return <FileText size={20} className="text-gray-600" />;
  };

  const handleSelectFile = (fileId: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const handleSelectAll = () => {
    if (!filesData?.files) return;
    
    if (selectedFiles.size === filesData.files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filesData.files.map(f => f.id)));
    }
  };

  const handleDeleteFile = async (fileId: string, source: 'chat' | 'portfolio') => {
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
            ⚠️ Delete File?
          </div>
          <div style={{
            fontSize: '14px',
            color: '#666666',
            lineHeight: '1.4',
            marginBottom: '12px'
          }}>
            This action cannot be undone. The file will be permanently removed from the system.
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
            onClick={() => {
              toast.dismiss(t.id);
              deleteFileMutation.mutate({ fileId, source });
            }}
            disabled={deleteFileMutation.isLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#FF3EA5',
              border: '2px solid #111111',
              color: '#FFFFFF',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              cursor: deleteFileMutation.isLoading ? 'not-allowed' : 'pointer',
              opacity: deleteFileMutation.isLoading ? 0.6 : 1,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              if (!deleteFileMutation.isLoading) {
                e.currentTarget.style.backgroundColor = '#E1306C';
              }
            }}
            onMouseLeave={(e) => {
              if (!deleteFileMutation.isLoading) {
                e.currentTarget.style.backgroundColor = '#FF3EA5';
              }
            }}
          >
            {deleteFileMutation.isLoading ? (
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
      id: 'delete-file-confirmation'
    });
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) return;
    
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
            ⚠️ Delete Multiple Files?
          </div>
          <div style={{
            fontSize: '14px',
            color: '#666666',
            lineHeight: '1.4',
            marginBottom: '12px'
          }}>
            You are about to delete {selectedFiles.size} file(s). This action cannot be undone and will permanently remove all selected files.
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
            onClick={() => {
              toast.dismiss(t.id);
              const filesToDelete = filesData?.files
                .filter(f => selectedFiles.has(f.id))
                .map(f => ({ fileId: f.id, source: f.source })) || [];
              bulkDeleteMutation.mutate({ files: filesToDelete });
            }}
            disabled={bulkDeleteMutation.isLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#FF3EA5',
              border: '2px solid #111111',
              color: '#FFFFFF',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              cursor: bulkDeleteMutation.isLoading ? 'not-allowed' : 'pointer',
              opacity: bulkDeleteMutation.isLoading ? 0.6 : 1,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              if (!bulkDeleteMutation.isLoading) {
                e.currentTarget.style.backgroundColor = '#E1306C';
              }
            }}
            onMouseLeave={(e) => {
              if (!bulkDeleteMutation.isLoading) {
                e.currentTarget.style.backgroundColor = '#FF3EA5';
              }
            }}
          >
            {bulkDeleteMutation.isLoading ? (
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
                🗑️ Delete {selectedFiles.size} Files
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
        maxWidth: '450px',
        padding: '16px'
      },
      id: 'bulk-delete-files-confirmation'
    });
  };

  const handleDownloadFile = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRefresh = () => {
    refetchFiles();
    refetchStats();
    toast.success("Files refreshed");
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
                backgroundColor: '#00FFFF',
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
                <Files size={40} strokeWidth={3} color="#111111" />
              </div>
            </div>
            <h1 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '48px',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#00FFFF',
              marginBottom: '16px',
              textShadow: '2px 2px 0px #111111'
            }}>
              File Management
            </h1>
            <p style={{
              fontSize: '18px',
              color: '#FFFFFF',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Manage all uploaded files across projects and portfolios
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <RetroCard padding="lg">
              <div className="text-center">
                <HardDrive size={32} className="mx-auto mb-2 text-blue-600" />
                <div style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#111111',
                  marginBottom: '4px'
                }}>
                  {fileStats?.totalFiles || 0}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#666666',
                  textTransform: 'uppercase',
                  fontWeight: 600
                }}>
                  Total Files
                </div>
              </div>
            </RetroCard>

            <RetroCard padding="lg">
              <div className="text-center">
                <Archive size={32} className="mx-auto mb-2 text-green-600" />
                <div style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#111111',
                  marginBottom: '4px'
                }}>
                  {formatFileSize(fileStats?.totalSize || 0)}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#666666',
                  textTransform: 'uppercase',
                  fontWeight: 600
                }}>
                  Total Size
                </div>
              </div>
            </RetroCard>

            <RetroCard padding="lg">
              <div className="text-center">
                <Calendar size={32} className="mx-auto mb-2 text-yellow-600" />
                <div style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#111111',
                  marginBottom: '4px'
                }}>
                  {fileStats?.recentFiles || 0}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#666666',
                  textTransform: 'uppercase',
                  fontWeight: 600
                }}>
                  This Week
                </div>
              </div>
            </RetroCard>
          </div>

          {/* Controls */}
          <RetroCard padding="lg" className="mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="flex-1 w-full lg:max-w-md">
                <div className="relative">
                  <Search size={20} style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#666666'
                  }} />
                  <RetroInput
                    type="text"
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>

              {/* Filters & Actions */}
              <div className="flex gap-4 items-center flex-wrap">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as any)}
                  style={{
                    padding: '8px 12px',
                    border: '2px solid #111111',
                    backgroundColor: '#FFFFFF',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    fontWeight: 600
                  }}
                >
                  <option value="all">All Categories</option>
                  <option value="attachment">Attachments</option>
                  <option value="portfolio">Portfolio</option>
                  <option value="profile">Profiles</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  style={{
                    padding: '8px 12px',
                    border: '2px solid #111111',
                    backgroundColor: '#FFFFFF',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    fontWeight: 600
                  }}
                >
                  <option value="date">Sort by Date</option>
                  <option value="name">Sort by Name</option>
                  <option value="size">Sort by Size</option>
                  <option value="type">Sort by Type</option>
                </select>

                <RetroButton
                  variant="secondary"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw size={16} className="mr-1" />
                  Refresh
                </RetroButton>
              </div>
            </div>
          </RetroCard>

          {/* Bulk Actions */}
          {selectedFiles.size > 0 && (
            <RetroCard padding="lg" className="mb-6">
              <div className="flex items-center justify-between">
                <span style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#111111'
                }}>
                  {selectedFiles.size} file(s) selected
                </span>
                <div className="flex gap-2">
                  <RetroButton
                    variant="danger"
                    size="sm"
                    onClick={handleBulkDelete}
                    disabled={bulkDeleteMutation.isLoading}
                  >
                    {bulkDeleteMutation.isLoading ? (
                      <Loader2 size={16} className="mr-2 animate-spin" />
                    ) : (
                      <Trash2 size={16} className="mr-2" />
                    )}
                    Delete Selected
                  </RetroButton>
                </div>
              </div>
            </RetroCard>
          )}

          {/* Files List */}
          <RetroCard padding="none">
            <div style={{
              padding: '16px',
              borderBottom: '2px solid #111111',
              backgroundColor: '#FF3EA5',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={filesData?.files && selectedFiles.size === filesData.files.length && filesData.files.length > 0}
                  onChange={handleSelectAll}
                  style={{ transform: 'scale(1.2)' }}
                />
                <h2 style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '18px',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}>
                  Files ({filesData?.files?.length || 0})
                </h2>
              </div>
            </div>

            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-8 text-center">
                  <Loader2 size={32} className="animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-600">Loading files...</p>
                </div>
              ) : filesData?.files && filesData.files.length > 0 ? (
                <div className="min-w-full">
                  {filesData.files.map((file) => (
                    <div
                      key={file.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '16px',
                        borderBottom: '1px solid #E5E5E5',
                        backgroundColor: selectedFiles.has(file.id) ? '#FFF9E6' : '#FFFFFF'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file.id)}
                        onChange={() => handleSelectFile(file.id)}
                        className="mr-4"
                      />

                      {/* File Icon & Name */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {getFileIcon(file.type)}
                        <div className="min-w-0 flex-1">
                          <div style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#111111',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap'
                          }}>
                            {file.fileName}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#666666'
                          }}>
                            {formatFileSize(file.size)} • {file.type}
                          </div>
                        </div>
                      </div>

                      {/* Category */}
                      <div className="hidden md:block min-w-0 px-4">
                        <span style={{
                          fontSize: '12px',
                          backgroundColor: 
                            file.category === 'attachment' ? '#FFC700' :
                            file.category === 'portfolio' ? '#00FFFF' : '#FF3EA5',
                          color: '#111111',
                          padding: '2px 8px',
                          border: '1px solid #111111',
                          fontWeight: 700,
                          textTransform: 'uppercase'
                        }}>
                          {file.category}
                        </span>
                      </div>

                      {/* Project */}
                      <div className="hidden lg:block min-w-0 px-4">
                        {file.project ? (
                          <div style={{
                            fontSize: '12px',
                            color: '#111111',
                            fontWeight: 600
                          }}>
                            {file.project.title}
                          </div>
                        ) : (
                          <div style={{
                            fontSize: '12px',
                            color: '#666666'
                          }}>
                            —
                          </div>
                        )}
                      </div>

                      {/* Uploaded By */}
                      <div className="hidden lg:block min-w-0 px-4">
                        <div style={{
                          fontSize: '12px',
                          color: '#111111',
                          fontWeight: 600
                        }}>
                          {file.uploadedBy.name}
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: '#666666'
                        }}>
                          {file.uploadedBy.role}
                        </div>
                      </div>

                      {/* Date */}
                      <div className="hidden md:block min-w-0 px-4">
                        <div style={{
                          fontSize: '12px',
                          color: '#111111',
                          fontWeight: 600
                        }}>
                          {new Date(file.uploadedAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownloadFile(file.url, file.fileName)}
                          style={{
                            padding: '6px',
                            backgroundColor: '#00FFFF',
                            border: '1px solid #111111',
                            color: '#111111',
                            cursor: 'pointer'
                          }}
                          title="Download file"
                        >
                          <Download size={14} />
                        </button>

                        <button
                          onClick={() => window.open(file.url, '_blank')}
                          style={{
                            padding: '6px',
                            backgroundColor: '#FFC700',
                            border: '1px solid #111111',
                            color: '#111111',
                            cursor: 'pointer'
                          }}
                          title="View file"
                        >
                          <Eye size={14} />
                        </button>

                        <button
                          onClick={() => handleDeleteFile(file.id, file.source)}
                          disabled={deleteFileMutation.isLoading}
                          style={{
                            padding: '6px',
                            backgroundColor: '#FF3EA5',
                            border: '1px solid #111111',
                            color: '#FFFFFF',
                            cursor: deleteFileMutation.isLoading ? 'not-allowed' : 'pointer',
                            opacity: deleteFileMutation.isLoading ? 0.6 : 1
                          }}
                          title="Delete file"
                        >
                          {deleteFileMutation.isLoading ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  padding: '48px',
                  textAlign: 'center',
                  color: '#111111'
                }}>
                  <Files size={64} className="mx-auto mb-4 text-gray-400" />
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    marginBottom: '8px'
                  }}>
                    No files found
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#666666'
                  }}>
                    {searchQuery || filterCategory !== 'all' 
                      ? 'Try adjusting your search or filters'
                      : 'Files uploaded through the system will appear here'
                    }
                  </p>
                </div>
              )}
            </div>
          </RetroCard>
        </div>
      </main>

      <Footer />
    </div>
  );
}
