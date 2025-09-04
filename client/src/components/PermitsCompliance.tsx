import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiService } from '@/lib/apiService';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, ExternalLink, AlertTriangle, Calendar, DollarSign, FileText, Edit } from 'lucide-react';

interface PermitsComplianceProps {
  selectedProject: any;
}

// Schema for permit lookup form
const permitLookupSchema = z.object({
  scopeOfWork: z.string().min(10, "Please provide at least 10 characters describing the work"),
});

// Schema for manual permit form
const permitFormSchema = z.object({
  type: z.string().min(1, "Permit type is required"),
  permitNumber: z.string().optional(),
  status: z.enum(['not_started', 'submitted', 'under_review', 'approved', 'issued', 'expired']).default('not_started'),
  submittedDate: z.string().optional(),
  approvedDate: z.string().optional(),
  expiryDate: z.string().optional(),
  cost: z.string().optional(),
  notes: z.string().optional(),
});

type PermitLookupFormData = z.infer<typeof permitLookupSchema>;
type PermitFormData = z.infer<typeof permitFormSchema>;

interface PermitDiscoveryResult {
  permitName: string;
  issuingAuthority: string;
  formUrl: string;
  notes: string;
}

export function PermitsCompliance({ selectedProject }: PermitsComplianceProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [isDiscoveryModalOpen, setIsDiscoveryModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [discoveryResult, setDiscoveryResult] = useState<PermitDiscoveryResult | null>(null);
  const [editingPermit, setEditingPermit] = useState<any>(null);

  // Forms
  const discoveryForm = useForm<PermitLookupFormData>({
    resolver: zodResolver(permitLookupSchema),
    defaultValues: {
      scopeOfWork: '',
    },
  });

  const permitForm = useForm<PermitFormData>({
    resolver: zodResolver(permitFormSchema),
    defaultValues: {
      type: '',
      status: 'not_started',
    },
  });

  // Fetch permits for the project
  const { data: permits = [], isLoading: permitsLoading } = useQuery({
    queryKey: [`/api/properties/${selectedProject?.id}/permits`],
    enabled: !!selectedProject?.id,
    select: (data: any) => Array.isArray(data) ? data : [],
  });

  // AI permit discovery mutation
  const discoveryMutation = useMutation({
    mutationFn: async (data: PermitLookupFormData) => {
      const response = await fetch('/api/v1/permits/lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          projectAddress: selectedProject.address,
          scopeOfWork: data.scopeOfWork,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to discover permit requirements');
      }
      
      return response.json();
    },
    onSuccess: (result: PermitDiscoveryResult) => {
      setDiscoveryResult(result);
      toast({
        title: "Permit Requirements Found",
        description: `Found requirements from ${result.issuingAuthority}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Discovery Failed",
        description: error.message || "Failed to discover permit requirements. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create permit mutation
  const createPermitMutation = useMutation({
    mutationFn: async (permitData: PermitFormData) => {
      return apiService.createPermit(selectedProject.id, permitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/properties/${selectedProject?.id}/permits`] });
      toast({
        title: "Permit Added",
        description: "Permit has been successfully added to your project.",
      });
      setIsManualModalOpen(false);
      setDiscoveryResult(null);
      permitForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Permit",
        description: error.message || "Could not add permit to project. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update permit mutation
  const updatePermitMutation = useMutation({
    mutationFn: async ({ permitId, updates }: { permitId: string; updates: Partial<PermitFormData> }) => {
      const response = await fetch(`/api/permits/${permitId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update permit');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/properties/${selectedProject?.id}/permits`] });
      toast({
        title: "Permit Updated",
        description: "Permit has been successfully updated.",
      });
      setEditingPermit(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update Permit",
        description: error.message || "Could not update permit. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handlers
  const handleDiscovery = (data: PermitLookupFormData) => {
    discoveryMutation.mutate(data);
  };

  const handleAddToProject = () => {
    if (!discoveryResult) return;
    
    // Pre-populate form with AI discovery data
    permitForm.reset({
      type: discoveryResult.permitName,
      status: 'not_started',
      notes: `Issuing Authority: ${discoveryResult.issuingAuthority}\n${discoveryResult.notes}${discoveryResult.formUrl ? `\nApplication URL: ${discoveryResult.formUrl}` : ''}`,
    });
    
    setIsDiscoveryModalOpen(false);
    setIsManualModalOpen(true);
  };

  const handleManualAdd = () => {
    permitForm.reset();
    setIsManualModalOpen(true);
  };

  const handleSubmitPermit = (data: PermitFormData) => {
    if (editingPermit) {
      updatePermitMutation.mutate({ permitId: editingPermit.id, updates: data });
    } else {
      createPermitMutation.mutate(data);
    }
  };

  const handleEditPermit = (permit: any) => {
    setEditingPermit(permit);
    permitForm.reset({
      type: permit.type,
      permitNumber: permit.permitNumber || '',
      status: permit.status,
      submittedDate: permit.submittedDate ? new Date(permit.submittedDate).toISOString().split('T')[0] : '',
      approvedDate: permit.approvedDate ? new Date(permit.approvedDate).toISOString().split('T')[0] : '',
      expiryDate: permit.expiryDate ? new Date(permit.expiryDate).toISOString().split('T')[0] : '',
      cost: permit.cost || '',
      notes: permit.notes || '',
    });
    setIsManualModalOpen(true);
  };

  const resetDiscoveryModal = () => {
    setDiscoveryResult(null);
    discoveryForm.reset();
    setIsDiscoveryModalOpen(false);
  };

  const resetPermitModal = () => {
    setEditingPermit(null);
    permitForm.reset();
    setIsManualModalOpen(false);
  };

  // Helper functions
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'not_started': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'issued': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const isPermitExpiringSoon = (permit: any) => {
    if (!permit.expiryDate) return false;
    const expiryDate = new Date(permit.expiryDate);
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    return expiryDate <= thirtyDaysFromNow && expiryDate >= today;
  };

  if (!selectedProject) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Please select a project to manage permits and compliance.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Permit Discovery Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            AI Permit Discovery Engine
          </CardTitle>
          <CardDescription>
            Let AI find the exact permit requirements for your project based on location and scope of work.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => setIsDiscoveryModalOpen(true)}
            className="w-full sm:w-auto"
            data-testid="button-find-permit-requirements"
          >
            <Search className="h-4 w-4 mr-2" />
            🔎 Find Permit Requirements
          </Button>
        </CardContent>
      </Card>

      {/* Permit Tracking Ledger */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Permit Tracking Ledger</CardTitle>
            <CardDescription>
              Manage all permits for {selectedProject.name}
            </CardDescription>
          </div>
          <Button 
            onClick={handleManualAdd}
            data-testid="button-add-permit-manual"
          >
            <Plus className="h-4 w-4 mr-2" />
            + Add Permit
          </Button>
        </CardHeader>
        <CardContent>
          {permitsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : permits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No permits found for this project.</p>
              <p className="text-sm">Use the discovery engine or add permits manually.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Permit Type</TableHead>
                    <TableHead>Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Issued Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permits.map((permit: any) => (
                    <TableRow 
                      key={permit.id} 
                      className={`${isPermitExpiringSoon(permit) ? 'bg-yellow-50 border-yellow-200' : ''}`}
                      data-testid={`row-permit-${permit.id}`}
                    >
                      <TableCell className="font-medium" data-testid={`cell-permit-type-${permit.id}`}>
                        {permit.type}
                        {isPermitExpiringSoon(permit) && (
                          <AlertTriangle className="inline h-4 w-4 ml-2 text-yellow-600" />
                        )}
                      </TableCell>
                      <TableCell data-testid={`cell-permit-number-${permit.id}`}>
                        {permit.permitNumber || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={getStatusBadgeColor(permit.status)}
                          data-testid={`badge-status-${permit.id}`}
                        >
                          {getStatusText(permit.status)}
                        </Badge>
                      </TableCell>
                      <TableCell data-testid={`cell-submitted-date-${permit.id}`}>
                        {permit.submittedDate ? new Date(permit.submittedDate).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell data-testid={`cell-approved-date-${permit.id}`}>
                        {permit.approvedDate ? new Date(permit.approvedDate).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell data-testid={`cell-expiry-date-${permit.id}`}>
                        {permit.expiryDate ? new Date(permit.expiryDate).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditPermit(permit)}
                          data-testid={`button-edit-permit-${permit.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Discovery Modal */}
      <Dialog open={isDiscoveryModalOpen} onOpenChange={setIsDiscoveryModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>🔎 Find Permit Requirements</DialogTitle>
            <DialogDescription>
              Describe the scope of work for your project at {selectedProject.address}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!discoveryResult ? (
              <Form {...discoveryForm}>
                <form onSubmit={discoveryForm.handleSubmit(handleDiscovery)} className="space-y-4">
                  <FormField
                    control={discoveryForm.control}
                    name="scopeOfWork"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description of Work</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Replace all windows on the second floor"
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
                      className="flex-1"
                      disabled={discoveryMutation.isPending}
                      data-testid="button-submit-discovery"
                    >
                      {discoveryMutation.isPending ? (
                        <>
                          <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Find Requirements
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={resetDiscoveryModal}
                      data-testid="button-cancel-discovery"
                    >
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
                        {discoveryResult.permitName}
                      </h4>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Issuing Authority</p>
                      <p className="font-medium" data-testid="text-issuing-authority">
                        {discoveryResult.issuingAuthority}
                      </p>
                    </div>
                    
                    {discoveryResult.formUrl && (
                      <div>
                        <p className="text-sm text-muted-foreground">Application Form</p>
                        <a 
                          href={discoveryResult.formUrl} 
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
                    
                    {discoveryResult.notes && (
                      <div>
                        <p className="text-sm text-muted-foreground">Additional Notes</p>
                        <p className="text-sm" data-testid="text-permit-notes">
                          {discoveryResult.notes}
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
                    onClick={resetDiscoveryModal}
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

      {/* Manual/Edit Permit Modal */}
      <Dialog open={isManualModalOpen} onOpenChange={setIsManualModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingPermit ? 'Edit Permit' : 'Add Permit Manually'}
            </DialogTitle>
            <DialogDescription>
              {editingPermit ? 'Update permit information' : 'Enter permit details for your project'}
            </DialogDescription>
          </DialogHeader>

          <Form {...permitForm}>
            <form onSubmit={permitForm.handleSubmit(handleSubmitPermit)} className="space-y-4">
              <FormField
                control={permitForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permit Type</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Building Permit, Electrical Permit"
                        data-testid="input-permit-type"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={permitForm.control}
                  name="permitNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Permit Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Optional"
                          data-testid="input-permit-number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={permitForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-permit-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="not_started">Not Started</SelectItem>
                          <SelectItem value="submitted">Submitted</SelectItem>
                          <SelectItem value="under_review">Under Review</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="issued">Issued</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={permitForm.control}
                  name="submittedDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Applied Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          data-testid="input-submitted-date"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={permitForm.control}
                  name="approvedDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issued Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          data-testid="input-approved-date"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={permitForm.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          data-testid="input-expiry-date"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={permitForm.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 125.00"
                        data-testid="input-permit-cost"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={permitForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes or requirements"
                        data-testid="textarea-permit-notes"
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
                  className="flex-1"
                  disabled={createPermitMutation.isPending || updatePermitMutation.isPending}
                  data-testid="button-save-permit"
                >
                  {(createPermitMutation.isPending || updatePermitMutation.isPending) ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      {editingPermit ? 'Update Permit' : 'Save Permit'}
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetPermitModal}
                  data-testid="button-cancel-permit"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}