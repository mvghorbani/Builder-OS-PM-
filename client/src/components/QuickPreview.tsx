import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DocumentViewer } from './DocumentViewer';
import { X } from 'lucide-react';

interface QuickPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    name: string;
    url: string;
    mimeType: string;
  } | null;
}

export const QuickPreview: React.FC<QuickPreviewProps> = ({
  isOpen,
  onClose,
  document
}) => {
  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0 overflow-hidden border border-gray-200 shadow-2xl bg-white/95 backdrop-blur">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white/50">
          <h3 className="text-lg font-medium">{document.name}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Preview Content */}
        <div className="h-[calc(80vh-4rem)] w-full overflow-auto p-4">
          <DocumentViewer 
            url={document.url} 
            mimeType={document.mimeType}
            canSign={document.mimeType === 'application/pdf'}
            onSign={async (signatureDataUrl) => {
              // Here we would integrate with your document signing API
              console.log('Signature data:', signatureDataUrl);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
