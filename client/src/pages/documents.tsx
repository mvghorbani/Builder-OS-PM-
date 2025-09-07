import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [activeTab, setActiveTab] = useState('browse');
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

  // Fetch documents
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['/api/documents'],
    queryFn: () => apiRequest('/api/documents')
  });

  // Fetch projects for dropdown
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
    if (mimeType.includes('pdf')) return <FilePdf className="w-5 h-5" />;
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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">
      {/* Glass morphism background overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-black/60 via-gray-900/40 to-black/60 backdrop-blur-2xl pointer-events-none" />
      
      {/* Header Section */}
      <div className="relative z-10 mb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-gray-300 to-white bg-clip-text text-transparent mb-2">
            Document Management
          </h1>
          <p className="text-gray-300 text-lg">Organize, version, and collaborate on project documents</p>
        </div>

        {/* Main Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* File Browser */}
          <div className="bg-white/[0.15] backdrop-blur-lg border border-white/[0.1] shadow-lg shadow-white/10 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">File Browser</h3>
            </div>
            <p className="text-gray-300 mb-4 text-sm">Browse and organize project files with advanced filtering and sorting.</p>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setActiveTab('browse')}
              data-testid="button-browse-files"
            >
              Browse Files
            </Button>
          </div>

          {/* Bulk Upload */}
          <div className="bg-white/[0.15] backdrop-blur-lg border border-white/[0.1] shadow-lg shadow-white/10 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                <Upload className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Bulk Upload</h3>
            </div>
            <p className="text-gray-300 mb-4 text-sm">Upload multiple files simultaneously with automatic categorization.</p>
            <Button 
              onClick={() => setShowUploadDialog(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="button-upload-documents"
            >
              Upload Documents
            </Button>
          </div>

          {/* Version Control */}
          <div className="bg-white/[0.15] backdrop-blur-lg border border-white/[0.1] shadow-lg shadow-white/10 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-500/20 rounded-2xl flex items-center justify-center">
                <History className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Version Control</h3>
            </div>
            <p className="text-gray-300 mb-4 text-sm">Track document versions and maintain revision history.</p>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setActiveTab('versions')}
              data-testid="button-manage-versions"
            >
              Manage Versions
            </Button>
          </div>

          {/* Access Control */}
          <div className="bg-white/[0.15] backdrop-blur-lg border border-white/[0.1] shadow-lg shadow-white/10 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Access Control</h3>
            </div>
            <p className="text-gray-300 mb-4 text-sm">Manage user permissions and secure document access.</p>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setActiveTab('access')}
              data-testid="button-manage-access"
            >
              Manage Access
            </Button>
          </div>

          {/* Advanced Search */}
          <div className="bg-white/[0.15] backdrop-blur-lg border border-white/[0.1] shadow-lg shadow-white/10 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-500/20 rounded-2xl flex items-center justify-center">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Advanced Search</h3>
            </div>
            <p className="text-gray-300 mb-4 text-sm">Search documents by content, metadata, and project association.</p>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setActiveTab('search')}
              data-testid="button-search-documents"
            >
              Search Documents
            </Button>
          </div>

          {/* Export & Backup */}
          <div className="bg-white/[0.15] backdrop-blur-lg border border-white/[0.1] shadow-lg shadow-white/10 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                <Database className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Export & Backup</h3>
            </div>
            <p className="text-gray-300 mb-4 text-sm">Export document collections and create automated backups.</p>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setActiveTab('export')}
              data-testid="button-export-files"
            >
              Export Files
            </Button>
          </div>
        </div>
      </div>

      {/* Upload Dialog - Working functionality preserved */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-800/80 backdrop-blur-2xl border border-gray-700/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-white bg-clip-text text-transparent">
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
                className="bg-gray-800/50 border-gray-600/30 text-white"
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
                className="bg-gray-800/50 border-gray-600/30 text-white"
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
                className="bg-gray-800/50 border-gray-600/30 text-white"
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
                  <SelectTrigger className="bg-gray-800/50 border-gray-600/30 text-white" data-testid="select-document-category">
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
                  <SelectTrigger className="bg-gray-800/50 border-gray-600/30 text-white" data-testid="select-document-type">
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
                  <SelectTrigger className="bg-gray-800/50 border-gray-600/30 text-white" data-testid="select-document-project">
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
                  <SelectTrigger className="bg-gray-800/50 border-gray-600/30 text-white" data-testid="select-access-level">
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
                className="bg-gray-800/50 border-gray-600/30 text-white"
                data-testid="input-document-tags"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowUploadDialog(false)}
                className="bg-gray-800/50 border-gray-600/30 text-white"
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

      {/* Recent Documents Section */}
      <div className="relative z-10 mb-8">
        <div className="bg-white/[0.15] backdrop-blur-lg border border-white/[0.1] shadow-lg shadow-white/10 rounded-3xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Recent Documents</h2>
          
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200/50 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-300 mb-2">No documents yet</h3>
              <p className="text-gray-400 mb-4">Upload your first document to get started</p>
              <Button 
                onClick={() => setShowUploadDialog(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.slice(0, 5).map((doc: Document) => (
                <div key={doc.id} className="bg-white/[0.15] backdrop-blur-lg border border-white/[0.1] shadow-lg shadow-white/10 rounded-2xl p-4 hover:bg-white/[0.2] transition-all duration-300 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                      {getFileIcon(doc.mimeType)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{doc.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>{doc.category}</span>
                        <span>•</span>
                        <span>{formatFileSize(doc.fileSize)}</span>
                        <span>•</span>
                        <span>Uploaded {new Date(doc.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(doc.status)}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share className="w-4 h-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Document Categories Section */}
      <div className="relative z-10">
        <div className="bg-white/[0.15] backdrop-blur-lg border border-white/[0.1] shadow-lg shadow-white/10 rounded-3xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Document Categories</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Plans & Drawings */}
            <div className="bg-white/[0.15] backdrop-blur-lg border border-white/[0.1] shadow-lg shadow-white/10 rounded-2xl p-6 hover:bg-white/[0.2] transition-all duration-300 cursor-pointer">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Plans & Drawings</h3>
              <p className="text-sm text-gray-300 mb-4">Architectural and engineering plans</p>
              <p className="text-2xl font-bold text-blue-400">{documents.filter((d: any) => d.category === 'plans').length} files</p>
            </div>

            {/* Photos & Media */}
            <div className="bg-white/[0.15] backdrop-blur-lg border border-white/[0.1] shadow-lg shadow-white/10 rounded-2xl p-6 hover:bg-white/[0.2] transition-all duration-300 cursor-pointer">
              <div className="w-12 h-12 bg-gray-500/20 rounded-xl flex items-center justify-center mb-4">
                <Image className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Photos & Media</h3>
              <p className="text-sm text-gray-300 mb-4">Progress photos and videos</p>
              <p className="text-2xl font-bold text-gray-400">{documents.filter((d: any) => d.category === 'photos').length} files</p>
            </div>

            {/* Permits & Legal */}
            <div className="bg-white/[0.15] backdrop-blur-lg border border-white/[0.1] shadow-lg shadow-white/10 rounded-2xl p-6 hover:bg-white/[0.2] transition-all duration-300 cursor-pointer">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Permits & Legal</h3>
              <p className="text-sm text-gray-300 mb-4">Official documentation</p>
              <p className="text-2xl font-bold text-blue-400">{documents.filter((d: any) => d.category === 'permits' || d.category === 'legal').length} files</p>
            </div>

            {/* Contracts */}
            <div className="bg-white/[0.15] backdrop-blur-lg border border-white/[0.1] shadow-lg shadow-white/10 rounded-2xl p-6 hover:bg-white/[0.2] transition-all duration-300 cursor-pointer">
              <div className="w-12 h-12 bg-gray-500/20 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Contracts</h3>
              <p className="text-sm text-gray-300 mb-4">Vendor and client agreements</p>
              <p className="text-2xl font-bold text-gray-400">{documents.filter((d: any) => d.category === 'contracts').length} files</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}