import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DocumentCard } from '@/components/DocumentCard';
import { QuickPreview } from '@/components/QuickPreview';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/queryClient';

interface Document {
  id: string;
  name: string;
  description?: string;
  fileSize: number;
  createdAt: string;
  mimeType: string;
  url: string;
}

export default function Documents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch documents
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['/api/documents', searchQuery],
    queryFn: () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      return apiRequest(`/api/documents?${params.toString()}`);
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Documents</h1>
        <p className="text-gray-600">Manage and access your project documents</p>
      </div>

      {/* Search */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No documents found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((document: Document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onPreview={() => {
                  setSelectedDocument(document);
                  setShowPreview(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Preview Modal */}
      <QuickPreview
        isOpen={showPreview}
        onClose={() => {
          setShowPreview(false);
          setSelectedDocument(null);
        }}
        document={selectedDocument}
      />
    </div>
  );
}
