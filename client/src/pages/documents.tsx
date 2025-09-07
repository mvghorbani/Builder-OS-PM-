
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit3, 
  MoreVertical, 
  FileText, 
  Image, 
  FileSpreadsheet, 
  FileText as FilePdf, 
  FileVideo,
  Share,
  Archive,
  Clock,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  MessageSquare,
  History,
  FolderOpen,
  Tag,
  Shield,
  Database,
  ExternalLink
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Document {
  id: string;
  name: string;
  description?: string;
  type: string;
  category: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  version: number;
  parentDocumentId?: string;
  versionNotes?: string;
  status: 'draft' | 'review' | 'approved' | 'rejected' | 'archived';
  accessLevel: 'public' | 'internal' | 'confidential' | 'project_team';
  tags: string[];
  propertyId?: string;
  milestoneId?: string;
  uploadedBy: string;
  approvedBy?: string;
  approvedAt?: string;
  lastModifiedBy: string;
  isArchived: boolean;
  archiveReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface UploadFormData {
  name: string;
  description: string;
  type: string;
  category: string;
  propertyId: string;
  milestoneId: string;
  tags: string;
  accessLevel: string;
  file: File | null;
}

const DOCUMENT_TYPES = [
  'contract', 'invoice', 'receipt', 'permit', 'plan', 'specification', 
  'report', 'photo', 'video', 'correspondence', 'legal', 'other'
];

const DOCUMENT_CATEGORIES = [
  'permits', 'contracts', 'financial', 'plans', 'photos', 'reports', 
  'correspondence', 'legal', 'safety', 'quality', 'other'
];

const ACCESS_LEVELS = [
  { value: 'public', label: 'Public', icon: '🌐' },
  { value: 'internal', label: 'Internal', icon: '🏢' },
  { value: 'project_team', label: 'Project Team', icon: '👥' },
  { value: 'confidential', label: 'Confidential', icon: '🔒' },
];

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  review: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  archived: 'bg-gray-100 text-gray-600',
};

export default function Documents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    type: "",
    status: "",
    accessLevel: "",
    propertyId: "",
  });
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showDocumentDetails, setShowDocumentDetails] = useState(false);
  const [uploadForm, setUploadForm] = useState<UploadFormData>({
    name: "",
    description: "",
    type: "",
    category: "",
    propertyId: "",
    milestoneId: "",
    tags: "",
    accessLevel: "project_team",
    file: null,
  });

  const queryClient = useQueryClient();

  // Fetch documents with search and filters
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['/api/documents', searchQuery, filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') params.append(key, value);
      });
      return apiRequest(`/api/documents?${params.toString()}`);
    }
  });

  // Fetch projects for filtering
  const { data: projects = [] } = useQuery({
    queryKey: ['/api/properties'],
    queryFn: () => apiRequest('/api/properties')
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await apiRequest('/api/documents', {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      setShowUploadDialog(false);
      setUploadForm({
        name: "",
        description: "",
        type: "",
        category: "",
        propertyId: "",
        milestoneId: "",
        tags: "",
        accessLevel: "project_team",
        file: null,
      });
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    },
  });

  // Status update mutations
  const approveDocumentMutation = useMutation({
    mutationFn: ({ id, comments }: { id: string; comments?: string }) =>
      apiRequest(`/api/documents/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ comments }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({ title: "Success", description: "Document approved successfully" });
    },
  });

  const rejectDocumentMutation = useMutation({
    mutationFn: ({ id, comments }: { id: string; comments: string }) =>
      apiRequest(`/api/documents/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ comments }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({ title: "Success", description: "Document rejected" });
    },
  });

  const archiveDocumentMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiRequest(`/api/documents/${id}/archive`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({ title: "Success", description: "Document archived" });
    },
  });

  const handleUpload = () => {
    if (!uploadForm.file || !uploadForm.name || !uploadForm.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadForm.file);
    formData.append('name', uploadForm.name);
    formData.append('description', uploadForm.description);
    formData.append('type', uploadForm.type);
    formData.append('category', uploadForm.category);
    formData.append('propertyId', uploadForm.propertyId);
    formData.append('milestoneId', uploadForm.milestoneId);
    formData.append('accessLevel', uploadForm.accessLevel);
    formData.append('tags', JSON.stringify(uploadForm.tags.split(',').map(t => t.trim()).filter(t => t)));

    uploadMutation.mutate(formData);
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (mimeType === 'application/pdf') return <FilePdf className="w-5 h-5" />;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return <FileSpreadsheet className="w-5 h-5" />;
    if (mimeType.startsWith('video/')) return <FileVideo className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusBadge = (status: string) => {
    const icons = {
      draft: <Edit3 className="w-3 h-3" />,
      review: <Clock className="w-3 h-3" />,
      approved: <CheckCircle2 className="w-3 h-3" />,
      rejected: <XCircle className="w-3 h-3" />,
      archived: <Archive className="w-3 h-3" />,
    };

    return (
      <Badge className={`${STATUS_COLORS[status as keyof typeof STATUS_COLORS]} flex items-center gap-1`}>
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      {/* Glass morphism background overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-white/40 via-white/20 to-white/10 backdrop-blur-2xl pointer-events-none" />
      
      {/* Header Section */}
      <div className="relative z-10 mb-8">
        <div className="bg-gradient-to-r from-white/40 via-white/20 to-white/10 backdrop-blur-2xl rounded-3xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)] border border-white/20 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-800 via-purple-700 to-pink-600 bg-clip-text text-transparent mb-2">
                Document Management
              </h1>
              <p className="text-gray-600 text-lg">Organize, version, and collaborate on project documents</p>
            </div>

            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2"
                  data-testid="button-upload-document"
                >
                  <Upload className="w-5 h-5" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gradient-to-br from-white/40 via-white/20 to-white/10 backdrop-blur-2xl border border-white/20 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-800 to-purple-700 bg-clip-text text-transparent">
                    Upload New Document
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 mt-6">
                  <div>
                    <Label htmlFor="file">File *</Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })}
                      className="bg-white/50 border-white/30"
                      data-testid="input-file-upload"
                    />
                  </div>

                  <div>
                    <Label htmlFor="name">Document Name *</Label>
                    <Input
                      id="name"
                      value={uploadForm.name}
                      onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                      placeholder="Enter document name"
                      className="bg-white/50 border-white/30"
                      data-testid="input-document-name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                      placeholder="Enter document description"
                      className="bg-white/50 border-white/30"
                      data-testid="textarea-document-description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={uploadForm.category}
                        onValueChange={(value) => setUploadForm({ ...uploadForm, category: value })}
                      >
                        <SelectTrigger className="bg-white/50 border-white/30" data-testid="select-document-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {DOCUMENT_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={uploadForm.type}
                        onValueChange={(value) => setUploadForm({ ...uploadForm, type: value })}
                      >
                        <SelectTrigger className="bg-white/50 border-white/30" data-testid="select-document-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {DOCUMENT_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="propertyId">Project</Label>
                      <Select
                        value={uploadForm.propertyId}
                        onValueChange={(value) => setUploadForm({ ...uploadForm, propertyId: value })}
                      >
                        <SelectTrigger className="bg-white/50 border-white/30" data-testid="select-document-project">
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map((project: any) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="accessLevel">Access Level</Label>
                      <Select
                        value={uploadForm.accessLevel}
                        onValueChange={(value) => setUploadForm({ ...uploadForm, accessLevel: value })}
                      >
                        <SelectTrigger className="bg-white/50 border-white/30" data-testid="select-access-level">
                          <SelectValue placeholder="Select access level" />
                        </SelectTrigger>
                        <SelectContent>
                          {ACCESS_LEVELS.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              <span className="flex items-center gap-2">
                                {level.icon} {level.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={uploadForm.tags}
                      onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                      placeholder="e.g., contract, important, legal"
                      className="bg-white/50 border-white/30"
                      data-testid="input-document-tags"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowUploadDialog(false)}
                      className="bg-white/50 border-white/30"
                      data-testid="button-cancel-upload"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleUpload}
                      disabled={uploadMutation.isPending}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                      data-testid="button-confirm-upload"
                    >
                      {uploadMutation.isPending ? 'Uploading...' : 'Upload Document'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className="relative z-10 mb-8">
        <div className="bg-gradient-to-r from-white/40 via-white/20 to-white/10 backdrop-blur-2xl rounded-3xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)] border border-white/20 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search documents by name, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/50 border-white/30"
                data-testid="input-search-documents"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
                <SelectTrigger className="w-40 bg-white/50 border-white/30" data-testid="filter-category">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {DOCUMENT_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger className="w-32 bg-white/50 border-white/30" data-testid="filter-status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.propertyId} onValueChange={(value) => setFilters({ ...filters, propertyId: value })}>
                <SelectTrigger className="w-40 bg-white/50 border-white/30" data-testid="filter-project">
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project: any) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => setFilters({ category: "all", type: "all", status: "all", accessLevel: "all", propertyId: "all" })}
                className="bg-white/50 border-white/30"
                data-testid="button-clear-filters"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="relative z-10">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gradient-to-br from-white/40 via-white/20 to-white/10 backdrop-blur-2xl rounded-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)] border border-white/20 p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4" />
                <div className="h-3 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gradient-to-br from-white/40 via-white/20 to-white/10 backdrop-blur-2xl rounded-3xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)] border border-white/20 p-12 max-w-md mx-auto">
              <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Documents Found</h3>
              <p className="text-gray-500 mb-6">Upload your first document to get started</p>
              <Button 
                onClick={() => setShowUploadDialog(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                data-testid="button-upload-first-document"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((document: Document) => (
              <Card 
                key={document.id} 
                className="bg-gradient-to-br from-white/40 via-white/20 to-white/10 backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)] border border-white/20 hover:shadow-2xl transition-all duration-300 group"
                data-testid={`card-document-${document.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg">
                        {getFileIcon(document.mimeType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-semibold text-gray-800 truncate" title={document.name}>
                          {document.name}
                        </CardTitle>
                        <p className="text-xs text-gray-500 mt-1">
                          v{document.version} • {formatFileSize(document.fileSize)}
                        </p>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur border-white/20">
                        <DropdownMenuItem onClick={() => { setSelectedDocument(document); setShowDocumentDetails(true); }}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share className="w-4 h-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        {document.status === 'review' && (
                          <>
                            <DropdownMenuItem onClick={() => approveDocumentMutation.mutate({ id: document.id })}>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => rejectDocumentMutation.mutate({ id: document.id, comments: 'Rejected via quick action' })}>
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem 
                          onClick={() => archiveDocumentMutation.mutate({ id: document.id, reason: 'Archived via quick action' })}
                          className="text-red-600"
                        >
                          <Archive className="w-4 h-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    {getStatusBadge(document.status)}
                    <Badge variant="outline" className="text-xs">
                      {document.category}
                    </Badge>
                  </div>

                  {document.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {document.description}
                    </p>
                  )}

                  {document.tags && document.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {document.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-indigo-100 text-indigo-700">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {document.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                          +{document.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {document.uploadedBy}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(document.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Document Details Dialog */}
      <Dialog open={showDocumentDetails} onOpenChange={setShowDocumentDetails}>
        <DialogContent className="bg-gradient-to-br from-white/40 via-white/20 to-white/10 backdrop-blur-2xl border border-white/20 max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedDocument && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-800 to-purple-700 bg-clip-text text-transparent flex items-center gap-3">
                  {getFileIcon(selectedDocument.mimeType)}
                  {selectedDocument.name}
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="details" className="mt-6">
                <TabsList className="grid w-full grid-cols-4 bg-white/50">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="versions">Versions</TabsTrigger>
                  <TabsTrigger value="comments">Comments</TabsTrigger>
                  <TabsTrigger value="sharing">Sharing</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6 mt-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Description</Label>
                        <p className="text-sm text-gray-600 mt-1">
                          {selectedDocument.description || 'No description provided'}
                        </p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Category</Label>
                        <p className="text-sm text-gray-600 mt-1 capitalize">{selectedDocument.category}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Type</Label>
                        <p className="text-sm text-gray-600 mt-1 capitalize">{selectedDocument.type}</p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-700">Tags</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedDocument.tags && selectedDocument.tags.length > 0 ? (
                            selectedDocument.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">No tags</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">File Information</Label>
                        <div className="bg-white/50 rounded-lg p-3 mt-1 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">File name:</span>
                            <span className="font-medium">{selectedDocument.fileName}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Size:</span>
                            <span className="font-medium">{formatFileSize(selectedDocument.fileSize)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Type:</span>
                            <span className="font-medium">{selectedDocument.mimeType}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Version:</span>
                            <span className="font-medium">v{selectedDocument.version}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-700">Status & Access</Label>
                        <div className="bg-white/50 rounded-lg p-3 mt-1 space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Status:</span>
                            {getStatusBadge(selectedDocument.status)}
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Access Level:</span>
                            <Badge variant="outline" className="capitalize">
                              <Shield className="w-3 h-3 mr-1" />
                              {selectedDocument.accessLevel.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-700">Timeline</Label>
                        <div className="bg-white/50 rounded-lg p-3 mt-1 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Uploaded:</span>
                            <span className="font-medium">{new Date(selectedDocument.createdAt).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Modified:</span>
                            <span className="font-medium">{new Date(selectedDocument.updatedAt).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Uploaded by:</span>
                            <span className="font-medium">{selectedDocument.uploadedBy}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Last modified by:</span>
                            <span className="font-medium">{selectedDocument.lastModifiedBy}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-white/20">
                    <Button variant="outline" className="bg-white/50 border-white/30">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" className="bg-white/50 border-white/30">
                      <Share className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    {selectedDocument.status === 'review' && (
                      <>
                        <Button 
                          onClick={() => approveDocumentMutation.mutate({ id: selectedDocument.id })}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => rejectDocumentMutation.mutate({ id: selectedDocument.id, comments: 'Rejected from details view' })}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="versions" className="mt-6">
                  <div className="text-center py-8">
                    <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Version History</h3>
                    <p className="text-gray-500">Version management features coming soon</p>
                  </div>
                </TabsContent>

                <TabsContent value="comments" className="mt-6">
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Comments & Reviews</h3>
                    <p className="text-gray-500">Comment system features coming soon</p>
                  </div>
                </TabsContent>

                <TabsContent value="sharing" className="mt-6">
                  <div className="text-center py-8">
                    <ExternalLink className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Sharing & Permissions</h3>
                    <p className="text-gray-500">Document sharing features coming soon</p>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
