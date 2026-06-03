'use client';

import { useState, useCallback } from 'react';
import { 
  Upload, 
  File, 
  Image as ImageIcon, 
  Video, 
  Music,
  FileText,
  X,
  Download,
  Eye,
  Trash2,
  Grid,
  List,
  Search,
  Filter,
  FolderOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface UploadedFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'other';
  size: number;
  url: string;
  thumbnail?: string;
  uploadedAt: Date;
  uploadProgress?: number;
}

const sampleFiles: UploadedFile[] = [
  {
    id: '1',
    name: 'dashboard-mockup.png',
    type: 'image',
    size: 2450000,
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200',
    uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '2',
    name: 'project-proposal.pdf',
    type: 'document',
    size: 1250000,
    url: '#',
    uploadedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    id: '3',
    name: 'team-photo.jpg',
    type: 'image',
    size: 3200000,
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200',
    uploadedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: '4',
    name: 'presentation.pptx',
    type: 'document',
    size: 5500000,
    url: '#',
    uploadedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
  },
  {
    id: '5',
    name: 'background-music.mp3',
    type: 'audio',
    size: 4800000,
    url: '#',
    uploadedAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
  },
  {
    id: '6',
    name: 'demo-video.mp4',
    type: 'video',
    size: 25000000,
    url: '#',
    uploadedAt: new Date(Date.now() - 96 * 60 * 60 * 1000),
  },
];

export function FileSharing() {
  const [files, setFiles] = useState<UploadedFile[]>(sampleFiles);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<UploadedFile[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    simulateUpload(droppedFiles);
  }, []);

  const simulateUpload = (droppedFiles: File[]) => {
    droppedFiles.forEach((file) => {
      const newFile: UploadedFile = {
        id: `upload-${Date.now()}-${Math.random()}`,
        name: file.name,
        type: getFileType(file.type),
        size: file.size,
        url: URL.createObjectURL(file),
        uploadedAt: new Date(),
        uploadProgress: 0,
      };

      setUploadingFiles(prev => [...prev, newFile]);

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setUploadingFiles(prev => prev.filter(f => f.id !== newFile.id));
          setFiles(prev => [{ ...newFile, uploadProgress: undefined }, ...prev]);
        } else {
          setUploadingFiles(prev => 
            prev.map(f => f.id === newFile.id ? { ...f, uploadProgress: progress } : f)
          );
        }
      }, 200);
    });
  };

  const getFileType = (mimeType: string): UploadedFile['type'] => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
    return 'other';
  };

  const getFileIcon = (type: UploadedFile['type']) => {
    switch (type) {
      case 'image': return ImageIcon;
      case 'video': return Video;
      case 'audio': return Music;
      case 'document': return FileText;
      default: return File;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-background">
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-border px-6">
          <div className="flex items-center gap-3">
            <FolderOpen className="h-5 w-5 text-primary" />
            <h1 className="font-semibold text-foreground">Files</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setViewMode('grid')}>
              <Grid className={cn('h-4 w-4', viewMode === 'grid' && 'text-primary')} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setViewMode('list')}>
              <List className={cn('h-4 w-4', viewMode === 'list' && 'text-primary')} />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Search and Filter */}
          <div className="mb-6 flex gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'mb-6 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground/50'
            )}
          >
            <div className={cn(
              'mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-colors',
              isDragging ? 'bg-primary/20' : 'bg-secondary'
            )}>
              <Upload className={cn(
                'h-8 w-8 transition-colors',
                isDragging ? 'text-primary' : 'text-muted-foreground'
              )} />
            </div>
            <p className="mb-2 text-center font-medium text-foreground">
              {isDragging ? 'Drop files here' : 'Drag and drop files here'}
            </p>
            <p className="mb-4 text-center text-sm text-muted-foreground">
              or click to browse from your computer
            </p>
            <Button className="nexus-gradient text-white">
              <Upload className="mr-2 h-4 w-4" />
              Upload Files
            </Button>
          </div>

          {/* Uploading Files */}
          {uploadingFiles.length > 0 && (
            <div className="mb-6 space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Uploading</h3>
              {uploadingFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    {(() => {
                      const Icon = getFileIcon(file.type);
                      return <Icon className="h-5 w-5 text-muted-foreground" />;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full nexus-gradient transition-all duration-300"
                        style={{ width: `${file.uploadProgress}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(file.uploadProgress || 0)}%
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Files Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredFiles.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  getFileIcon={getFileIcon}
                  formatFileSize={formatFileSize}
                  onPreview={() => setSelectedFile(file)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFiles.map((file) => (
                <FileRow
                  key={file.id}
                  file={file}
                  getFileIcon={getFileIcon}
                  formatFileSize={formatFileSize}
                  onPreview={() => setSelectedFile(file)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative max-h-[90vh] max-w-4xl w-full overflow-hidden rounded-xl bg-card">
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <p className="font-medium text-foreground">{selectedFile.name}</p>
              <Button variant="ghost" size="icon" onClick={() => setSelectedFile(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4">
              {selectedFile.type === 'image' ? (
                <img
                  src={selectedFile.url}
                  alt={selectedFile.name}
                  className="max-h-[70vh] w-full rounded-lg object-contain"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  {(() => {
                    const Icon = getFileIcon(selectedFile.type);
                    return <Icon className="h-16 w-16 text-muted-foreground" />;
                  })()}
                  <p className="mt-4 text-lg font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-border p-4">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface FileCardProps {
  file: UploadedFile;
  getFileIcon: (type: UploadedFile['type']) => React.ElementType;
  formatFileSize: (bytes: number) => string;
  onPreview: () => void;
}

function FileCard({ file, getFileIcon, formatFileSize, onPreview }: FileCardProps) {
  const Icon = getFileIcon(file.type);

  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg cursor-pointer"
      onClick={onPreview}
    >
      {/* Preview */}
      <div className="aspect-square overflow-hidden bg-secondary">
        {file.type === 'image' && file.thumbnail ? (
          <img
            src={file.thumbnail}
            alt={file.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            crossOrigin="anonymous"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Icon className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
      </div>

      {/* Actions Overlay */}
      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
        <Button variant="secondary" size="icon" className="h-10 w-10">
          <Eye className="h-5 w-5" />
        </Button>
        <Button variant="secondary" size="icon" className="h-10 w-10">
          <Download className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

interface FileRowProps {
  file: UploadedFile;
  getFileIcon: (type: UploadedFile['type']) => React.ElementType;
  formatFileSize: (bytes: number) => string;
  onPreview: () => void;
}

function FileRow({ file, getFileIcon, formatFileSize, onPreview }: FileRowProps) {
  const Icon = getFileIcon(file.type);

  return (
    <div
      className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary/30 cursor-pointer"
      onClick={onPreview}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
        {file.type === 'image' && file.thumbnail ? (
          <img
            src={file.thumbnail}
            alt={file.name}
            className="h-full w-full rounded-lg object-cover"
            crossOrigin="anonymous"
          />
        ) : (
          <Icon className="h-6 w-6 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate font-medium text-foreground">{file.name}</p>
        <p className="text-sm text-muted-foreground">
          {formatFileSize(file.size)} · {file.uploadedAt.toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); }}>
          <Download className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); }}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
