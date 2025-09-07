import React from 'react';
import { 
  PenLine, 
  Stamp, 
  Type, 
  Highlighter, 
  MessageSquare,
  Smartphone,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QRCode from 'qrcode.react';

interface AnnotationSidebarProps {
  onMobileSign?: () => void;
  onAddStamp?: (stampType: string) => void;
  onAddText?: () => void;
  onAddHighlight?: () => void;
  onAddComment?: () => void;
  documentId: string;
  savedSignatures?: Array<{id: string; preview: string}>;
  savedStamps?: Array<{id: string; type: string; preview: string}>;
}

export const DocumentAnnotationSidebar = ({
  onMobileSign,
  onAddStamp,
  onAddText,
  onAddHighlight,
  onAddComment,
  documentId,
  savedSignatures = [],
  savedStamps = []
}: AnnotationSidebarProps) => {
  const [mobileSigningUrl, setMobileSigningUrl] = React.useState<string>('');
  
  // This would be replaced with your actual mobile signing URL generation
  const generateMobileSigningUrl = () => {
    const url = `https://yourdomain.com/sign/${documentId}`;
    setMobileSigningUrl(url);
    // You would typically make an API call here to create a temporary signing session
  };

  const standardStamps = [
    { id: 'approved', type: 'APPROVED', preview: '✓' },
    { id: 'rejected', type: 'REJECTED', preview: '✗' },
    { id: 'draft', type: 'DRAFT', preview: '⚡' },
    { id: 'final', type: 'FINAL', preview: '★' },
  ];

  return (
    <div className="w-80 border-l border-gray-200 h-full bg-white/95 backdrop-blur-sm">
      <Tabs defaultValue="tools" className="h-full flex flex-col">
        <div className="px-4 py-2 border-b border-gray-200">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="stamps">Stamps</TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <TabsContent value="tools" className="p-4 space-y-4">
            {/* Mobile Signing */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Mobile Signing</h3>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={generateMobileSigningUrl}
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Sign on Mobile
              </Button>
              {mobileSigningUrl && (
                <div className="p-4 bg-gray-50 rounded-lg flex flex-col items-center">
                  <QRCode value={mobileSigningUrl} size={120} />
                  <p className="text-xs text-gray-500 mt-2">Scan to sign on mobile</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Annotation Tools */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Annotation Tools</h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={onAddText}
                >
                  <Type className="w-4 h-4 mr-2" />
                  Add Text
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={onAddHighlight}
                >
                  <Highlighter className="w-4 h-4 mr-2" />
                  Highlight
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={onAddComment}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Add Comment
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stamps" className="p-4 space-y-4">
            {/* Saved Signatures */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Your Signatures</h3>
              <div className="grid grid-cols-2 gap-2">
                {savedSignatures.map(sig => (
                  <button
                    key={sig.id}
                    className="p-2 border rounded hover:bg-gray-50"
                    onClick={() => onAddStamp?.('signature-' + sig.id)}
                  >
                    <img src={sig.preview} alt="Signature" className="w-full" />
                  </button>
                ))}
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => onAddStamp?.('new-signature')}
                >
                  <User className="w-4 h-4 mb-1" />
                  <span className="text-xs">Add New</span>
                </Button>
              </div>
            </div>

            <Separator />

            {/* Standard Stamps */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Standard Stamps</h3>
              <div className="grid grid-cols-2 gap-2">
                {standardStamps.map(stamp => (
                  <Button
                    key={stamp.id}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center"
                    onClick={() => onAddStamp?.(stamp.type)}
                  >
                    <span className="text-2xl mb-1">{stamp.preview}</span>
                    <span className="text-xs">{stamp.type}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Stamps */}
            {savedStamps.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Custom Stamps</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {savedStamps.map(stamp => (
                      <button
                        key={stamp.id}
                        className="p-2 border rounded hover:bg-gray-50"
                        onClick={() => onAddStamp?.('custom-' + stamp.id)}
                      >
                        <img src={stamp.preview} alt="Custom Stamp" className="w-full" />
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};
