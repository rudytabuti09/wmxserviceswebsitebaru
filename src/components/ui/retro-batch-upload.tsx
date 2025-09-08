"use client";

import { useState, useRef } from "react";
import { RetroButton } from "./retro-button";
import { RetroCard } from "./retro-card";
import { useUpload } from "@/hooks/use-upload";
import { Upload, X, File, CheckCircle, AlertCircle } from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  url?: string;
  status: 'uploading' | 'success' | 'error';
  progress?: number;
  error?: string;
}

interface BatchUploadProps {
  uploadType: "profile" | "portfolio" | "attachment";
  maxFiles?: number;
  acceptedTypes?: string[];
  maxSizePerFile?: number; // in MB
  onUploadComplete?: (files: UploadedFile[]) => void;
  onFilesChange?: (files: UploadedFile[]) => void;
  initialFiles?: UploadedFile[];
}

export function RetroBatchUpload({
  uploadType,
  maxFiles = 10,
  acceptedTypes = ['image/*', '.pdf', '.doc', '.docx', '.txt'],
  maxSizePerFile = 10, // 10MB
  onUploadComplete,
  onFilesChange,
  initialFiles = []
}: BatchUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>(initialFiles);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading } = useUpload();

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSizePerFile * 1024 * 1024) {
      return `File size must be less than ${maxSizePerFile}MB`;
    }

    // Check file type if specified
    if (acceptedTypes.length > 0) {
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        if (type.includes('/*')) {
          const mainType = type.split('/')[0];
          return file.type.startsWith(mainType);
        }
        return file.type === type;
      });

      if (!isAccepted) {
        return `File type not accepted. Allowed: ${acceptedTypes.join(', ')}`;
      }
    }

    return null;
  };

  const handleFiles = async (fileList: FileList) => {
    const newFiles: UploadedFile[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      if (files.length + newFiles.length >= maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`);
        break;
      }

      const file = fileList[i];
      const validationError = validateFile(file);
      
      const uploadedFile: UploadedFile = {
        id: `${Date.now()}-${i}`,
        name: file.name,
        size: file.size,
        status: validationError ? 'error' : 'uploading',
        error: validationError || undefined,
        progress: 0
      };

      newFiles.push(uploadedFile);
    }

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);

    // Upload valid files
    for (const uploadedFile of newFiles) {
      if (uploadedFile.status === 'error') continue;

      try {
        const fileToUpload = Array.from(fileList).find(f => 
          f.name === uploadedFile.name && f.size === uploadedFile.size
        );
        
        if (!fileToUpload) continue;

        const result = await uploadFile(fileToUpload, uploadType);
        
        if (result.success && result.url) {
          uploadedFile.status = 'success';
          uploadedFile.url = result.url;
          uploadedFile.progress = 100;
        } else {
          uploadedFile.status = 'error';
          uploadedFile.error = result.error || 'Upload failed';
        }
      } catch (error) {
        uploadedFile.status = 'error';
        uploadedFile.error = error instanceof Error ? error.message : 'Upload failed';
      }

      // Update files array
      setFiles(prev => {
        const updated = prev.map(f => f.id === uploadedFile.id ? uploadedFile : f);
        onFilesChange?.(updated);
        return updated;
      });
    }

    // Call onUploadComplete when all uploads are done
    const allCompleted = updatedFiles.every(f => f.status !== 'uploading');
    if (allCompleted) {
      onUploadComplete?.(updatedFiles.filter(f => f.status === 'success'));
    }
  };

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return <div className="animate-spin">⏳</div>;
      case 'success':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return <File size={16} />;
    }
  };

  const successCount = files.filter(f => f.status === 'success').length;
  const errorCount = files.filter(f => f.status === 'error').length;
  const uploadingCount = files.filter(f => f.status === 'uploading').length;

  return (
    <RetroCard padding="lg">
      <div className="space-y-4">
        {/* Header */}
        <div className="text-center">
          <h3 style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '18px',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#111111',
            marginBottom: '8px'
          }}>
            📎 File Attachments
          </h3>
          <p style={{
            fontSize: '12px',
            color: '#666666',
            fontWeight: 600
          }}>
            Upload up to {maxFiles} files ({maxSizePerFile}MB max per file)
          </p>
        </div>

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          style={{
            border: `3px dashed ${isDragging ? '#FFC700' : '#CCCCCC'}`,
            backgroundColor: isDragging ? '#FFF9E6' : '#FAFAFA',
            padding: '32px',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={48} color={isDragging ? '#FFC700' : '#CCCCCC'} className="mx-auto mb-4" />
          <p style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '16px',
            fontWeight: 600,
            color: '#111111',
            marginBottom: '8px'
          }}>
            {isDragging ? 'Drop files here!' : 'Click or drag files to upload'}
          </p>
          <p style={{
            fontSize: '12px',
            color: '#666666'
          }}>
            Accepted: {acceptedTypes.join(', ')}
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          style={{ display: 'none' }}
        />

        {/* Upload Status */}
        {files.length > 0 && (
          <div style={{
            padding: '12px',
            backgroundColor: '#F0F8FF',
            border: '2px solid #111111',
            boxShadow: '2px 2px 0px #111111'
          }}>
            <div className="flex items-center justify-between text-sm">
              <span style={{ fontWeight: 600, color: '#111111' }}>
                Total: {files.length} files
              </span>
              <div className="flex gap-4 text-xs">
                {successCount > 0 && (
                  <span style={{ color: '#22C55E', fontWeight: 600 }}>
                    ✅ {successCount} uploaded
                  </span>
                )}
                {uploadingCount > 0 && (
                  <span style={{ color: '#F59E0B', fontWeight: 600 }}>
                    ⏳ {uploadingCount} uploading
                  </span>
                )}
                {errorCount > 0 && (
                  <span style={{ color: '#EF4444', fontWeight: 600 }}>
                    ❌ {errorCount} failed
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: '#FFFFFF',
                  border: '2px solid #111111',
                  boxShadow: '2px 2px 0px #111111'
                }}
              >
                {getStatusIcon(file.status)}
                
                <div className="flex-1 min-w-0">
                  <p style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#111111',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap'
                  }}>
                    {file.name}
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: '#666666'
                  }}>
                    {formatFileSize(file.size)}
                  </p>
                  {file.error && (
                    <p style={{
                      fontSize: '11px',
                      color: '#EF4444',
                      fontWeight: 600
                    }}>
                      {file.error}
                    </p>
                  )}
                </div>

                {file.status === 'uploading' && (
                  <div style={{
                    width: '60px',
                    height: '4px',
                    backgroundColor: '#E5E7EB',
                    borderRadius: '2px'
                  }}>
                    <div
                      style={{
                        width: `${file.progress || 0}%`,
                        height: '100%',
                        backgroundColor: '#FFC700',
                        borderRadius: '2px',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                )}

                <button
                  onClick={() => removeFile(file.id)}
                  style={{
                    padding: '4px',
                    backgroundColor: '#FF3EA5',
                    border: '1px solid #111111',
                    color: '#FFFFFF',
                    cursor: 'pointer'
                  }}
                  title="Remove file"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 justify-center">
          <RetroButton
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || files.length >= maxFiles}
          >
            + Add More Files
          </RetroButton>
          
          {files.length > 0 && (
            <RetroButton
              variant="danger"
              size="sm"
              onClick={() => {
                setFiles([]);
                onFilesChange?.([]);
              }}
            >
              Clear All
            </RetroButton>
          )}
        </div>
      </div>
    </RetroCard>
  );
}
