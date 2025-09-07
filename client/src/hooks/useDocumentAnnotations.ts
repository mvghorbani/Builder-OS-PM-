import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentAnnotationService, Annotation } from '@/lib/documentAnnotationService';

export function useDocumentAnnotations(documentId: string) {
  const queryClient = useQueryClient();
  
  const { data: annotations = [], isLoading } = useQuery({
    queryKey: ['document', documentId, 'annotations'],
    queryFn: () => documentAnnotationService.getAnnotations(documentId),
  });

  const addAnnotation = useMutation({
    mutationFn: (annotation: Omit<Annotation, 'id' | 'createdAt'>) => 
      documentAnnotationService.addAnnotation(documentId, annotation),
    onSuccess: () => {
      queryClient.invalidateQueries(['document', documentId, 'annotations']);
    },
  });

  const deleteAnnotation = useMutation({
    mutationFn: (annotationId: string) => 
      documentAnnotationService.deleteAnnotation(documentId, annotationId),
    onSuccess: () => {
      queryClient.invalidateQueries(['document', documentId, 'annotations']);
    },
  });

  return {
    annotations,
    isLoading,
    addAnnotation,
    deleteAnnotation,
  };
}

export function useSavedSignatures() {
  const queryClient = useQueryClient();

  const { data: signatures = [], isLoading } = useQuery({
    queryKey: ['saved-signatures'],
    queryFn: () => documentAnnotationService.getSavedSignatures(),
  });

  const saveSignature = useMutation({
    mutationFn: (dataUrl: string) => documentAnnotationService.saveSignature(dataUrl),
    onSuccess: () => {
      queryClient.invalidateQueries(['saved-signatures']);
    },
  });

  const deleteSignature = useMutation({
    mutationFn: (signatureId: string) => 
      documentAnnotationService.deleteSignature(signatureId),
    onSuccess: () => {
      queryClient.invalidateQueries(['saved-signatures']);
    },
  });

  return {
    signatures,
    isLoading,
    saveSignature,
    deleteSignature,
  };
}

export function useSavedStamps() {
  const queryClient = useQueryClient();

  const { data: stamps = [], isLoading } = useQuery({
    queryKey: ['saved-stamps'],
    queryFn: () => documentAnnotationService.getSavedStamps(),
  });

  const saveStamp = useMutation({
    mutationFn: (stampData: { type: string; preview: string }) => 
      documentAnnotationService.saveStamp(stampData),
    onSuccess: () => {
      queryClient.invalidateQueries(['saved-stamps']);
    },
  });

  const deleteStamp = useMutation({
    mutationFn: (stampId: string) => documentAnnotationService.deleteStamp(stampId),
    onSuccess: () => {
      queryClient.invalidateQueries(['saved-stamps']);
    },
  });

  return {
    stamps,
    isLoading,
    saveStamp,
    deleteStamp,
  };
}
