"use client";

import { useState, useEffect } from "react";
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
  Filter, 
  Download, 
  Trash2, 
  Eye, 
  ArrowLeft, 
  FileText, 
  Image, 
  Archive,
  Calendar,
  User,
  HardDrive,
  Share,
  RefreshCw
} from "lucide-react";

// Mock data for uploaded files - in real app, this would come from API/database
interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
  uploadedBy: {
    name: string;
    role: string;
  };
  category: 'profile' | 'portfolio' | 'attachment';
  project?: {
    id: string;
    title: string;
  };
}

const mockFiles: UploadedFile[] = [
  {
    id: "1",
    name: "project-requirements.pdf",
    type: "application/pdf",
    size: 2048576, // 2MB
    url: "/uploads/project-requirements.pdf",
    uploadedAt: new Date("2024-01-15"),
    uploadedBy: { name: "John Admin", role: "ADMIN" },
    category: "attachment",
    project: { id: "proj1", title: "E-commerce Website" }
  },
  {
    id: "2", 
    name: "portfolio-image-1.jpg",
    type: "image/jpeg",
    size: 1536000, // 1.5MB
    url: "/uploads/portfolio-image-1.jpg",
    uploadedAt: new Date("2024-01-14"),
    uploadedBy: { name: "Jane Client", role: "CLIENT" },
    category: "portfolio"
  },
  {
    id: "3",
    name: "wireframe-mockups.zip",
    type: "application/zip", 
    size: 5242880, // 5MB
    url: "/uploads/wireframe-mockups.zip",
    uploadedAt: new Date("2024-01-13"),
    uploadedBy: { name: "John Admin", role: "ADMIN" },
    category: "attachment",
    project: { id: "proj2", title: "Mobile App Design" }
  },
];

export default function FileManagementPage() {
  const { data: session } = useSession();
  const [files, setFiles] = useState<UploadedFile[]>(mockFiles);
  const [filteredFiles, setFilteredFiles] = useState<UploadedFile[]>(mockFiles);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  useEffect(() => {
    let filtered = files;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.project?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.uploadedBy.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter(file => file.category === filterCategory);
    }

    // Apply sorting
    switch (sortBy) {
      case "date":
        filtered.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "size":
        filtered.sort((a, b) => b.size - a.size);
        break;
      case "type":
        filtered.sort((a, b) => a.type.localeCompare(b.type));
        break;
    }

    setFilteredFiles(filtered);
  }, [files, searchQuery, filterCategory, sortBy]);

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
    if (selectedFiles.size === filteredFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredFiles.map(f => f.id)));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedFiles.size === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedFiles.size} file(s)?`)) {
      setFiles(prev => prev.filter(f => !selectedFiles.has(f.id)));
      setSelectedFiles(new Set());
    }
  };

  const handleDownloadFile = (file: UploadedFile) => {
    // In real app, this would trigger actual download
    window.open(file.url, '_blank');
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const totalFiles = files.length;

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
                  {totalFiles}
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
                  {formatFileSize(totalSize)}
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
                  {files.filter(f => {
                    const today = new Date();
                    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return f.uploadedAt >= weekAgo;
                  }).length}
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

          {/* Filters and Search */}
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
                    placeholder="Search files, projects, or users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-4">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
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
                  onChange={(e) => setSortBy(e.target.value)}
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
                    onClick={handleDeleteSelected}
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete Selected
                  </RetroButton>
                </div>
              </div>
            </RetroCard>
          )}

          {/* Files Table */}
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
                  checked={selectedFiles.size === filteredFiles.length && filteredFiles.length > 0}
                  onChange={handleSelectAll}
                  style={{ transform: 'scale(1.2)' }}
                />
                <h2 style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '18px',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}>
                  Files ({filteredFiles.length})
                </h2>
              </div>
            </div>

            <div className="overflow-x-auto">
              {filteredFiles.length > 0 ? (
                <div className="min-w-full">
                  {filteredFiles.map((file) => (
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
                            {file.name}
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
                          {file.uploadedAt.toLocaleDateString()}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownloadFile(file)}
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
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this file?')) {
                              setFiles(prev => prev.filter(f => f.id !== file.id));
                            }
                          }}
                          style={{
                            padding: '6px',
                            backgroundColor: '#FF3EA5',
                            border: '1px solid #111111',
                            color: '#FFFFFF',
                            cursor: 'pointer'
                          }}
                          title="Delete file"
                        >
                          <Trash2 size={14} />
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
