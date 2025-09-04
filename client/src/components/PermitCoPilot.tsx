import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiService } from '@/lib/apiService';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, ExternalLink, Sparkles, MapPin, FileText } from 'lucide-react';

interface PermitCoPilotProps {
  selectedProject: any;
}

interface PermitResult {
  permitName: string;
  issuingAuthority: string;
  formUrl: string;
  notes: string;
}

const permitLookupSchema = z.object({
  scopeOfWork: z.string().min(1, "Please describe the scope of work"),
});

type PermitLookupFormData = z.infer<typeof permitLookupSchema>;

export function PermitCoPilot({ selectedProject }: PermitCoPilotProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [permitResult, setPermitResult] = useState<PermitResult | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PermitLookupFormData>({
    resolver: zodResolver(permitLookupSchema),
    defaultValues: {
      scopeOfWork: '',
    },
  });

  const permitLookupMutation = useMutation({
    mutationFn: async (data: PermitLookupFormData) => {
      if (!selectedProject?.address) {
        throw new Error('No project address available');
      }
      
      return apiService.lookupPermit({
        projectAddress: selectedProject.address,
        scopeOfWork: data.scopeOfWork,
      });
    },
    onSuccess: (result: PermitResult) => {
      setPermitResult(result);
      toast({
        title: "Permit Requirements Found",
        description: `Found requirements for ${result.permitName}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lookup Failed",
        description: error.message || "Failed to lookup permit requirements. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLookup = (data: PermitLookupFormData) => {
    permitLookupMutation.mutate(data);
  };

  const handleAddToProject = () => {
    if (!permitResult) return;
    
    // Here you would typically open the regular permit form with pre-filled data
    // For now, we'll show a success message
    toast({
      title: "Feature Coming Soon",
      description: "Adding permits to project ledger will be available soon!",
    });
    
    setIsModalOpen(false);
    setPermitResult(null);
    form.reset();
  };

  const resetModal = () => {
    setPermitResult(null);
    form.reset();
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* AI Permit Co-Pilot Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            AI Permit Co-Pilot
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Get instant, location-specific permit requirements for your construction project using AI-powered lookup.
          </p>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              {selectedProject?.address || 'Select a project to get started'}
            </span>
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button 
                className="w-full" 
                disabled={!selectedProject}
                data-testid="button-find-permit-requirements"
              >
                <Search className="h-4 w-4 mr-2" />
                🔎 Find Permit Requirements
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  AI Permit Lookup
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {!permitResult ? (
                  // Lookup Form
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleLookup)} className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>Project Address: {selectedProject?.address}</span>
                        </div>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="scopeOfWork"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description of Work</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe your construction project (e.g., 'Adding a 500 sq ft deck to rear of single family home', 'Kitchen remodel with electrical and plumbing updates', 'New 2-car garage construction')..."
                                className="min-h-[100px]"
                                data-testid="textarea-scope-of-work"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex gap-2">
                        <Button 
                          type="submit" 
                          disabled={permitLookupMutation.isPending}
                          className="flex-1"
                          data-testid="button-lookup-permits"
                        >
                          {permitLookupMutation.isPending ? (
                            <>
                              <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                              Looking up requirements...
                            </>
                          ) : (
                            <>
                              <Search className="h-4 w-4 mr-2" />
                              Lookup Requirements
                            </>
                          )}
                        </Button>
                        <Button type="button" variant="outline" onClick={resetModal} data-testid="button-cancel-lookup">
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  // Results Display
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="h-2 w-2 bg-green-500 rounded-full" />
                      <span className="text-sm font-medium">Requirements Found</span>
                    </div>
                    
                    <Card className="border-green-200">
                      <CardContent className="p-4 space-y-4">
                        <div>
                          <h4 className="font-semibold text-foreground" data-testid="text-permit-name">
                            {permitResult.permitName}
                          </h4>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground">Issuing Authority</p>
                          <p className="font-medium" data-testid="text-issuing-authority">
                            {permitResult.issuingAuthority}
                          </p>
                        </div>
                        
                        {permitResult.formUrl && (
                          <div>
                            <p className="text-sm text-muted-foreground">Application Form</p>
                            <a 
                              href={permitResult.formUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                              data-testid="link-permit-form"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View Application Form
                            </a>
                          </div>
                        )}
                        
                        {permitResult.notes && (
                          <div>
                            <p className="text-sm text-muted-foreground">Additional Notes</p>
                            <p className="text-sm" data-testid="text-permit-notes">
                              {permitResult.notes}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleAddToProject} 
                        className="flex-1"
                        data-testid="button-add-to-project"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        + Add to Project
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={resetModal}
                        data-testid="button-new-lookup"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        New Lookup
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Existing Permits Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Project Permits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Permit tracking and compliance management features coming soon!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}