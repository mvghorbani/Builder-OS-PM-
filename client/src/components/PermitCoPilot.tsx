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
import { Search, Plus, ExternalLink, Sparkles, MapPin, FileText, CheckCircle2, Circle, DollarSign, Clock } from 'lucide-react';

interface PermitCoPilotProps {
  selectedProject: any;
}

interface PermitOption {
  permitName: string;
  issuingAuthority: string;
  formUrl: string;
  estimatedFee: string;
  processingTime: string;
  notes: string;
}

interface PermitResult {
  permits: PermitOption[];
  searchInfo: {
    address: string;
    city: string;
    scopeOfWork: string;
  };
}

const permitLookupSchema = z.object({
  scopeOfWork: z.string().min(1, "Please describe the scope of work"),
});

type PermitLookupFormData = z.infer<typeof permitLookupSchema>;

export function PermitCoPilot({ selectedProject }: PermitCoPilotProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [permitResult, setPermitResult] = useState<PermitResult | null>(null);
  const [selectedPermits, setSelectedPermits] = useState<Set<number>>(new Set());
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
      setSelectedPermits(new Set()); // Reset selections
      toast({
        title: "Permit Requirements Found",
        description: `Found ${result.permits.length} permit option${result.permits.length > 1 ? 's' : ''} for ${result.searchInfo.city}`,
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

  const savePermitsMutation = useMutation({
    mutationFn: async (permits: PermitOption[]) => {
      if (!selectedProject?.id) {
        throw new Error('No project selected');
      }
      
      const permitPromises = permits.map(permit => 
        apiService.createPermit(selectedProject.id, {
          type: permit.permitName,
          status: 'not_started',
          cost: permit.estimatedFee.replace(/[^0-9.]/g, '') || '0', // Extract numbers
          notes: `${permit.notes}\n\nIssuing Authority: ${permit.issuingAuthority}\nProcessing Time: ${permit.processingTime}${permit.formUrl ? `\nApplication URL: ${permit.formUrl}` : ''}`
        })
      );
      
      return Promise.all(permitPromises);
    },
    onSuccess: (savedPermits) => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      queryClient.invalidateQueries({ queryKey: [`/api/properties/${selectedProject?.id}/permits`] });
      
      toast({
        title: "Permits Added Successfully",
        description: `Added ${savedPermits.length} permit${savedPermits.length > 1 ? 's' : ''} to your project.`,
      });
      
      setIsModalOpen(false);
      setPermitResult(null);
      setSelectedPermits(new Set());
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Save Permits",
        description: error.message || "Could not save permits to project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddToProject = () => {
    if (!permitResult || selectedPermits.size === 0) {
      toast({
        title: "No Permits Selected",
        description: "Please select at least one permit to add to your project.",
        variant: "destructive",
      });
      return;
    }
    
    const selectedPermitDetails = Array.from(selectedPermits).map(index => 
      permitResult.permits[index]
    );
    
    savePermitsMutation.mutate(selectedPermitDetails);
  };

  const togglePermitSelection = (index: number) => {
    const newSelection = new Set(selectedPermits);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedPermits(newSelection);
  };

  const resetModal = () => {
    setPermitResult(null);
    setSelectedPermits(new Set());
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
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="h-2 w-2 bg-green-500 rounded-full" />
                      <span className="text-sm font-medium">Requirements Found for {permitResult.searchInfo.city}</span>
                    </div>
                    
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Select the permits you need for your project:
                      </p>
                      
                      {permitResult.permits.map((permit, index) => (
                        <Card 
                          key={index} 
                          className={`border-2 cursor-pointer transition-all ${
                            selectedPermits.has(index) 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => togglePermitSelection(index)}
                          data-testid={`card-permit-${index}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="mt-1">
                                {selectedPermits.has(index) ? (
                                  <CheckCircle2 className="h-5 w-5 text-blue-500" />
                                ) : (
                                  <Circle className="h-5 w-5 text-gray-400" />
                                )}
                              </div>
                              
                              <div className="flex-1 space-y-3">
                                <div>
                                  <h4 className="font-semibold text-foreground" data-testid={`text-permit-name-${index}`}>
                                    {permit.permitName}
                                  </h4>
                                  <p className="text-sm text-muted-foreground" data-testid={`text-issuing-authority-${index}`}>
                                    {permit.issuingAuthority}
                                  </p>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div className="flex items-center gap-2 text-sm">
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                    <span className="text-muted-foreground">Fee:</span>
                                    <span className="font-medium" data-testid={`text-fee-${index}`}>
                                      {permit.estimatedFee}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 text-sm">
                                    <Clock className="h-4 w-4 text-blue-600" />
                                    <span className="text-muted-foreground">Processing:</span>
                                    <span className="font-medium" data-testid={`text-processing-${index}`}>
                                      {permit.processingTime}
                                    </span>
                                  </div>
                                </div>
                                
                                {permit.formUrl && (
                                  <div>
                                    <a 
                                      href={permit.formUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                                      data-testid={`link-permit-form-${index}`}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                      View Application Form
                                    </a>
                                  </div>
                                )}
                                
                                {permit.notes && (
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-1">Notes:</p>
                                    <p className="text-sm" data-testid={`text-permit-notes-${index}`}>
                                      {permit.notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleAddToProject} 
                        className="flex-1"
                        disabled={selectedPermits.size === 0 || savePermitsMutation.isPending}
                        data-testid="button-add-to-project"
                      >
                        {savePermitsMutation.isPending ? (
                          <>
                            <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Add {selectedPermits.size > 0 ? `${selectedPermits.size} ` : ''}Selected Permits
                          </>
                        )}
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