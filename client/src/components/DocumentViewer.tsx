import React, { useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight,
  PenLine,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw
} from 'lucide-react';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentViewerProps {
  url: string;
  mimeType: string;
  isFullScreen?: boolean;
  onClose?: () => void;
}

export const DocumentViewer = ({ 
  url, 
  mimeType,
  isFullScreen = false,
  onClose 
}: DocumentViewerProps) => {
  const [numPages, setNumPages] = useState<number>(1);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  // Reset view settings when document changes
  useEffect(() => {
    setPageNumber(1);
    setScale(1);
    setRotation(0);
  }, [url]);

  if (mimeType.startsWith('image/')) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <img 
          src={url} 
          alt="Document preview" 
          className="max-w-full max-h-full object-contain"
          style={{ transform: `scale(${scale}) rotate(${rotation}deg)` }}
        />
      </div>
    );
  }

  if (mimeType === 'application/pdf') {
    return (
      <div className="w-full h-full flex flex-col">
        {/* Toolbar */}
        <div className="sticky top-0 z-10 bg-white border-b px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Page Navigation */}
            {numPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                  disabled={pageNumber <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm">
                  Page {pageNumber} of {numPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
                  disabled={pageNumber >= numPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {isFullScreen && (
            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm w-16 text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScale(s => Math.min(2, s + 0.1))}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>

              {/* Rotation */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRotation(r => (r + 90) % 360)}
              >
                <RotateCw className="w-4 h-4" />
              </Button>

              {/* Edit Tools */}
              <Button
                variant="outline"
                size="sm"
              >
                <PenLine className="w-4 h-4 mr-2" />
                Edit
              </Button>

              {/* Download */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(url, '_blank')}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Document Content */}
        <div className="flex-1 overflow-auto p-4 bg-gray-50">
          <div className="mx-auto max-w-5xl">
            <Document 
              file={url} 
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="w-full h-32 flex items-center justify-center">
                  <span className="text-gray-500">Loading...</span>
                </div>
              }
            >
              <Page 
                pageNumber={pageNumber} 
                scale={scale}
                rotate={rotation}
              />
            </Document>
          </div>
        </div>
      </div>
    );
  }

  // For other file types, show download button
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-gray-600 mb-4">
          Preview not available for this file type
        </p>
        <Button
          variant="outline"
          onClick={() => window.open(url, '_blank')}
        >
          <Download className="w-4 h-4 mr-2" />
          Download File
        </Button>
      </div>
    </div>
  );
};
