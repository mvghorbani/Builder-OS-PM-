import React, { useRef, useEffect, useState } from 'react';
import { Annotation } from '@/lib/documentAnnotationService';
import { X } from 'lucide-react';

interface AnnotationLayerProps {
  annotations: Annotation[];
  pageNumber: number;
  scale: number;
  rotation: number;
  onDeleteAnnotation?: (id: string) => void;
  pageWidth: number;
  pageHeight: number;
}

export const AnnotationLayer: React.FC<AnnotationLayerProps> = ({
  annotations,
  pageNumber,
  scale,
  rotation,
  onDeleteAnnotation,
  pageWidth,
  pageHeight,
}) => {
  const layerRef = useRef<HTMLDivElement>(null);

  // Filter annotations for current page
  const pageAnnotations = annotations.filter(a => a.position.pageNumber === pageNumber);

  const getAnnotationStyle = (annotation: Annotation) => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      transform: `scale(${scale}) rotate(${rotation}deg)`,
      transformOrigin: '0 0',
      left: `${annotation.position.x * pageWidth}px`,
      top: `${annotation.position.y * pageHeight}px`,
    };

    switch (annotation.type) {
      case 'text':
        return {
          ...baseStyle,
          padding: '4px 8px',
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '4px',
          fontSize: '14px',
          cursor: 'move',
        };
      
      case 'highlight':
        return {
          ...baseStyle,
          backgroundColor: annotation.color || 'rgba(255, 255, 0, 0.3)',
          padding: '2px 4px',
          cursor: 'pointer',
        };
      
      case 'comment':
        return {
          ...baseStyle,
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '4px',
          padding: '8px',
          maxWidth: '200px',
          cursor: 'move',
        };
      
      case 'stamp':
      case 'signature':
        return {
          ...baseStyle,
          cursor: 'move',
        };
      
      default:
        return baseStyle;
    }
  };

  const renderAnnotation = (annotation: Annotation) => {
    switch (annotation.type) {
      case 'text':
        return (
          <div
            key={annotation.id}
            style={getAnnotationStyle(annotation)}
            className="group"
          >
            <div className="flex items-center gap-2">
              <span>{annotation.content}</span>
              {onDeleteAnnotation && (
                <button
                  onClick={() => onDeleteAnnotation(annotation.id)}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        );

      case 'highlight':
        return (
          <div
            key={annotation.id}
            style={getAnnotationStyle(annotation)}
            className="group"
          >
            <span>{annotation.content}</span>
            {onDeleteAnnotation && (
              <button
                onClick={() => onDeleteAnnotation(annotation.id)}
                className="opacity-0 group-hover:opacity-100 absolute -top-4 -right-4 hover:text-red-500 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        );

      case 'comment':
        return (
          <div
            key={annotation.id}
            style={getAnnotationStyle(annotation)}
            className="group"
          >
            <div className="flex flex-col gap-1">
              <div className="text-xs text-gray-500">
                Comment by {annotation.createdBy}
              </div>
              <div>{annotation.content}</div>
              {onDeleteAnnotation && (
                <button
                  onClick={() => onDeleteAnnotation(annotation.id)}
                  className="opacity-0 group-hover:opacity-100 absolute -top-2 -right-2 hover:text-red-500 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        );

      case 'stamp':
      case 'signature':
        return (
          <div
            key={annotation.id}
            style={getAnnotationStyle(annotation)}
            className="group"
          >
            <img 
              src={annotation.content} 
              alt={annotation.type === 'stamp' ? annotation.stampType : 'Signature'}
              className="max-w-[200px] max-h-[100px] object-contain"
            />
            {onDeleteAnnotation && (
              <button
                onClick={() => onDeleteAnnotation(annotation.id)}
                className="opacity-0 group-hover:opacity-100 absolute -top-4 -right-4 hover:text-red-500 transition-opacity bg-white rounded-full p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        );
    }
  };

  return (
    <div 
      ref={layerRef}
      className="absolute inset-0 pointer-events-none"
      style={{
        width: pageWidth * scale,
        height: pageHeight * scale,
      }}
    >
      <div className="relative w-full h-full">
        {pageAnnotations.map(renderAnnotation)}
      </div>
    </div>
  );
};
