export interface Document {
  id: string;
  name: string;
  description?: string;
  fileSize: number;
  createdAt: string;
  updatedAt?: string;
  mimeType: string;
  url: string;
  type?: string;
  category?: string;
  fileName?: string;
  version?: string;
  status?: 'draft' | 'review' | 'approved' | 'rejected';
  tags?: string[];
  uploadedBy?: string;
  lastModifiedBy?: string;
  propertyId?: string;
  summary?: string;
}

export interface DocumentCardProps {
  document: Document;
  onPreview: () => void;
}
