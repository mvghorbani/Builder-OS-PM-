import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { SignaturePad } from '@/components/SignaturePad';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function MobileSign() {
  const { documentId } = useParams();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSignatureSave = async (signatureDataUrl: string) => {
    try {
      setIsSaving(true);
      
      // TODO: Implement your API call to save the signature
      await fetch(`/api/documents/${documentId}/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ signature: signatureDataUrl }),
      });

      toast({
        title: "Success",
        description: "Signature saved successfully",
      });

      // Close the window after successful save
      window.close();
    } catch (error) {
      console.error('Failed to save signature:', error);
      toast({
        title: "Error",
        description: "Failed to save signature",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col">
      <div className="max-w-md w-full mx-auto space-y-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-xl font-semibold mb-4">Sign Document</h1>
          <p className="text-sm text-gray-600 mb-4">
            Use your finger to sign below. Make sure to sign within the box.
          </p>
          
          <div className="bg-gray-50 border rounded-lg p-4">
            <SignaturePad
              onSave={handleSignatureSave}
              onCancel={() => window.close()}
            />
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => window.close()}
            >
              Cancel
            </Button>
            <Button
              disabled={isSaving}
              onClick={() => {/* Trigger save */}}
            >
              {isSaving ? "Saving..." : "Save Signature"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
