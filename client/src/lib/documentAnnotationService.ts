// Types
export interface Annotation {
  id: string;
  type: 'text' | 'highlight' | 'comment' | 'stamp' | 'signature';
  content: string;
  position: {
    x: number;
    y: number;
    pageNumber: number;
  };
  createdAt: string;
  createdBy: string;
  stampType?: string;
  color?: string;
}

export interface SavedSignature {
  id: string;
  preview: string;
  createdAt: string;
}

export interface SavedStamp {
  id: string;
  type: string;
  preview: string;
  createdAt: string;
}

class DocumentAnnotationService {
  async getAnnotations(documentId: string): Promise<Annotation[]> {
    const response = await fetch(`/api/documents/${documentId}/annotations`);
    if (!response.ok) throw new Error('Failed to fetch annotations');
    return response.json();
  }

  async addAnnotation(documentId: string, annotation: Omit<Annotation, 'id' | 'createdAt'>): Promise<Annotation> {
    const response = await fetch(`/api/documents/${documentId}/annotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(annotation),
    });
    if (!response.ok) throw new Error('Failed to add annotation');
    return response.json();
  }

  async deleteAnnotation(documentId: string, annotationId: string): Promise<void> {
    const response = await fetch(`/api/documents/${documentId}/annotations/${annotationId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete annotation');
  }

  async getSavedSignatures(): Promise<SavedSignature[]> {
    const response = await fetch('/api/signatures');
    if (!response.ok) throw new Error('Failed to fetch signatures');
    return response.json();
  }

  async saveSignature(dataUrl: string): Promise<SavedSignature> {
    const response = await fetch('/api/signatures', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ signature: dataUrl }),
    });
    if (!response.ok) throw new Error('Failed to save signature');
    return response.json();
  }

  async deleteSignature(signatureId: string): Promise<void> {
    const response = await fetch(`/api/signatures/${signatureId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete signature');
  }

  async getSavedStamps(): Promise<SavedStamp[]> {
    const response = await fetch('/api/stamps');
    if (!response.ok) throw new Error('Failed to fetch stamps');
    return response.json();
  }

  async saveStamp(stampData: { type: string; preview: string }): Promise<SavedStamp> {
    const response = await fetch('/api/stamps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stampData),
    });
    if (!response.ok) throw new Error('Failed to save stamp');
    return response.json();
  }

  async deleteStamp(stampId: string): Promise<void> {
    const response = await fetch(`/api/stamps/${stampId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete stamp');
  }

  async createMobileSigningSession(documentId: string): Promise<{ url: string; expiresAt: string }> {
    const response = await fetch(`/api/documents/${documentId}/mobile-signing`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to create mobile signing session');
    return response.json();
  }
}

export const documentAnnotationService = new DocumentAnnotationService();
