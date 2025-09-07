import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentCardProps {
  document: {
    id: string;
    name: string;
    fileSize: number;
    createdAt: string;
    description?: string;
    mimeType: string;
  };
  onPreview: () => void;
}

const getFileEmoji = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return '📸';
  if (mimeType === 'application/pdf') return '📄';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊';
  if (mimeType.includes('word')) return '📝';
  return '📎';
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const DocumentCard = ({ document, onPreview }: DocumentCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group relative bg-white/60 backdrop-blur-sm border border-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Preview Button */}
      <button
        onClick={onPreview}
        className={cn(
          "absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
          isHovered 
            ? "opacity-100 bg-gray-100 hover:bg-gray-200" 
            : "opacity-0"
        )}
      >
        <Eye className="w-4 h-4 text-gray-600" />
      </button>

      {/* Document Icon & Name */}
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xl" role="img" aria-label="document type">
          {getFileEmoji(document.mimeType)}
        </span>
        <h3 className="font-medium text-gray-900 truncate pr-8">
          {document.name}
        </h3>
      </div>

      {/* File Info */}
      <div className="text-sm text-gray-500">
        {formatFileSize(document.fileSize)} • {new Date(document.createdAt).toLocaleDateString()}
      </div>

      {/* Description/Summary */}
      {document.description && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600 line-clamp-2">
            {document.description}
          </p>
        </div>
      )}
    </div>
  );
};
