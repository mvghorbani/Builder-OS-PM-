export interface Document {
  id: string;
  name: string;
  description?: string;
  type: string;
  category: string;
  fileName: string;
  url: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
  summary?: string;
  version: string;
}

export interface DocumentCardProps {
  document: Document;
  onPreview: () => void;
}
