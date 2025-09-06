import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import {
  Building,
  DollarSign,
  Calendar,
  FileText,
  Plus,
  Bell,
  Check,
  Clock,
  ArrowUp,
  Upload,
  ClipboardCheck,
  HelpCircle,
} from "lucide-react";
import type { Property, Activity } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiService } from "@/lib/apiService";
import { MainLayout } from "@/layouts/MainLayout";
import { PermitsCompliance } from "@/components/PermitsCompliance";

interface DashboardStats {
  activeProjects: number;
  totalBudget: number;
  spentBudget: number;
  avgScheduleAdherence: number;
  pendingPermits: number;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'completed': return 'bg-blue-100 text-blue-800';
    case 'on-hold': return 'bg-yellow-100 text-yellow-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const StatusBadge = ({ status }: { status: string }) => (
  <Badge className={getStatusColor(status)}>
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </Badge>
);

const PropertyCard = ({ property }: { property: Property }) => (
  <Card
    className="rounded-xl border-0 shadow-sm"
    data-testid={`card-property-${property.id}`}
  >
    <CardContent className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">{property.name || property.address}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {property.city && property.state ? 
              `${property.city}, ${property.state}${property.zipCode ? ' ' + property.zipCode : ''}` : 
              property.type
            }
          </p>
        </div>
        <StatusBadge status={property.status} />
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium text-gray-900">
              {typeof property.progress === 'number' ? `${property.progress}%` : '—'}
            </span>
          </div>
          <Progress value={typeof property.progress === 'number' ? property.progress : 0} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Budget</p>
            <p className="font-medium text-gray-900">
              {typeof property.totalBudget === 'number'
                ? property.totalBudget.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                : '—'}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Type</p>
            <p className="font-medium text-gray-900">{property.type}</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Dashboard Component
const Dashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Safe formatter helpers
  const fmtInt = (n: unknown) =>
    typeof n === 'number' && Number.isFinite(n) ? n : '—';

  const fmtUSDk = (n: unknown) => {
    if (typeof n === 'number' && Number.isFinite(n)) return `$${Math.round(n / 1000)}k`;
    return '—';
  };
  
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectAddress, setNewProjectAddress] = useState("");
  const [newProjectCity, setNewProjectCity] = useState("");
  const [newProjectState, setNewProjectState] = useState("");
  const [newProjectZip, setNewProjectZip] = useState("");

  // Helper function for fetch requests
  const fetchJSON = async (url: string) => {
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    return res.json();
  };

  // Data fetching
  const { data: stats, isLoading: statsLoading, isError: statsError } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    queryFn: () => fetchJSON('/api/dashboard/stats'),
    retry: (failureCount, error) => !isUnauthorizedError(error) && failureCount < 2,
    staleTime: 60_000,
  });

  const { data: properties = [], isLoading: propertiesLoading, isError: propertiesError } = useQuery({
    queryKey: ['/api/properties'],
    queryFn: () => fetchJSON('/api/properties'),
    retry: (failureCount, error) => !isUnauthorizedError(error) && failureCount < 2,
    staleTime: 30_000,
  });

  const { data: activities = [], isLoading: activitiesLoading, isError: activitiesError } = useQuery({
    queryKey: ['/api/activities'],
    queryFn: () => fetchJSON('/api/activities'),
    retry: (failureCount, error) => !isUnauthorizedError(error) && failureCount < 2,
    staleTime: 30_000,
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/properties', {
        method: 'POST',
        body: JSON.stringify(data),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Create project error:', response.status, errorText);
        throw new Error(`Failed to create project: ${response.status} ${errorText}`);
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      setNewProjectName("");
      setNewProjectAddress("");
      setNewProjectCity("");
      setNewProjectState("");
      setNewProjectZip("");
      toast({ title: "Success", description: "Project created successfully!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create project",
        variant: "destructive"
      });
    },
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    createProjectMutation.mutate({
      name: newProjectName,
      address: newProjectAddress,
      city: newProjectCity,
      state: newProjectState,
      zipCode: newProjectZip,
      status: 'active',
      progress: 0,
      type: 'residential',
    });
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Project overview and quick actions</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button data-testid="button-create-project">
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleCreateProject}>
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                      Add a new construction project to your portfolio.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">Name</Label>
                      <Input
                        id="name"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="address" className="text-right">Address</Label>
                      <Input
                        id="address"
                        value={newProjectAddress}
                        onChange={(e) => setNewProjectAddress(e.target.value)}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="city" className="text-right">City</Label>
                      <Input
                        id="city"
                        value={newProjectCity}
                        onChange={(e) => setNewProjectCity(e.target.value)}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="state" className="text-right">State</Label>
                      <Input
                        id="state"
                        value={newProjectState}
                        onChange={(e) => setNewProjectState(e.target.value)}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="zip" className="text-right">Zip Code</Label>
                      <Input
                        id="zip"
                        value={newProjectZip}
                        onChange={(e) => setNewProjectZip(e.target.value)}
                        className="col-span-3"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createProjectMutation.isPending}>
                      {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Button 
              variant="ghost" 
              size="icon" 
              data-testid="button-notifications"
              onClick={() => toast({ title: "Notifications", description: "You have no new notifications." })}
            >
              <Bell className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Error States */}
        {statsError && (
          <Card className="rounded-xl border-0 shadow-sm p-6">
            <p className="text-sm text-red-600">Couldn't load dashboard stats.</p>
            <Button size="sm" className="mt-2" onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] })}>
              Retry
            </Button>
          </Card>
        )}

        {/* Stats Cards */}
        {stats && typeof stats === 'object' && 'activeProjects' in stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="rounded-xl border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Projects</p>
                    <p className="text-3xl font-bold text-gray-900" data-testid="text-stat-projects">
                      {fmtInt((stats as any)?.activeProjects)}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Building className="text-blue-600 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Budget</p>
                    <p className="text-3xl font-bold text-gray-900" data-testid="text-stat-budget">
                      {fmtUSDk((stats as any)?.totalBudget)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <DollarSign className="text-green-600 text-xl" />
                  </div>
                </div>
                {typeof (stats as any)?.spentBudget === 'number' && (
                  <div className="flex items-center mt-4 text-sm">
                    <span className="text-gray-600">{fmtUSDk((stats as any).spentBudget)} spent</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-xl border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Schedule</p>
                    <p className="text-3xl font-bold text-gray-900" data-testid="text-stat-schedule">
                      {typeof (stats as any)?.avgScheduleAdherence === 'number'
                        ? `${(stats as any).avgScheduleAdherence}%`
                        : '—'}
                    </p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <Calendar className="text-amber-600 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Permits Pending</p>
                    <p className="text-3xl font-bold text-gray-900" data-testid="text-stat-permits">
                      {fmtInt((stats as any)?.pendingPermits)}
                    </p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <FileText className="text-red-600 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Projects Grid */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Projects</h2>
          {propertiesError && (
            <Card className="rounded-xl border-0 shadow-sm p-6 mb-6">
              <p className="text-sm text-red-600">Couldn't load projects.</p>
              <Button size="sm" className="mt-2" onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/properties'] })}>
                Retry
              </Button>
            </Card>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {propertiesLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse rounded-xl border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4 w-2/3"></div>
                    <div className="h-2 bg-gray-200 rounded mb-6"></div>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="h-8 bg-gray-200 rounded"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                {Array.isArray(properties) && properties.map((property: any) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
                {!propertiesLoading && Array.isArray(properties) && properties.length === 0 && (
                  <Card className="rounded-xl border-0 shadow-sm">
                    <CardContent className="p-8 text-center text-gray-600">
                      No projects yet. Use <span className="font-medium">New Project</span> to create your first one.
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="rounded-xl border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                variant="ghost" 
                className="h-auto p-4 bg-blue-50 hover:bg-blue-100 justify-start rounded-xl" 
                data-testid="button-create-rfq"
                onClick={() => toast({ title: "Create RFQ", description: "RFQ creation feature coming soon!" })}
              >
                <div className="p-2 bg-blue-500 rounded-lg mr-3">
                  <Plus className="text-white text-sm" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Create RFQ</p>
                  <p className="text-xs text-gray-600">Get bids for work</p>
                </div>
              </Button>

              <Button 
                variant="ghost" 
                className="h-auto p-4 bg-green-50 hover:bg-green-100 justify-start rounded-xl" 
                data-testid="button-upload-document"
                onClick={() => toast({ title: "Upload Document", description: "Document upload feature coming soon!" })}
              >
                <div className="p-2 bg-green-500 rounded-lg mr-3">
                  <Upload className="text-white text-sm" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Upload Document</p>
                  <p className="text-xs text-gray-600">Add project files</p>
                </div>
              </Button>

              <Button 
                variant="ghost" 
                className="h-auto p-4 bg-amber-50 hover:bg-amber-100 justify-start rounded-xl" 
                data-testid="button-daily-log"
                onClick={() => toast({ title: "Daily Log", description: "Daily log feature coming soon!" })}
              >
                <div className="p-2 bg-amber-500 rounded-lg mr-3">
                  <ClipboardCheck className="text-white text-sm" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Daily Log</p>
                  <p className="text-xs text-gray-600">Record site activity</p>
                </div>
              </Button>

              <Button 
                variant="ghost" 
                className="h-auto p-4 bg-purple-50 hover:bg-purple-100 justify-start rounded-xl" 
                data-testid="button-submit-rfi"
                onClick={() => toast({ title: "Submit RFI", description: "RFI submission feature coming soon!" })}
              >
                <div className="p-2 bg-purple-500 rounded-lg mr-3">
                  <HelpCircle className="text-white text-sm" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Submit RFI</p>
                  <p className="text-xs text-gray-600">Request information</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="rounded-xl border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activitiesError && (
              <div className="mb-4">
                <p className="text-sm text-red-600">Couldn't load activities.</p>
                <Button size="sm" className="mt-2" onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/activities'] })}>
                  Retry
                </Button>
              </div>
            )}
            <div className="space-y-4">
              {Array.isArray(activities) && activities
                .slice() // copy
                .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 4)
                .map((activity: any) => (
                <div key={activity.id} className="flex items-start space-x-4" data-testid={`activity-${activity.id}`}>
                  <div className="p-2 bg-green-100 rounded-full">
                    <Check className="text-green-600 text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.description}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.createdAt!).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {!activitiesLoading && Array.isArray(activities) && activities.length === 0 && (
                <div className="text-center text-gray-600">No activity yet.</div>
              )}
            </div>

            <Button 
              variant="ghost" 
              className="w-full mt-4" 
              data-testid="button-view-all-activity"
              onClick={() => toast({ title: "View All Activity", description: "Full activity view coming soon!" })}
            >
              View All Activity
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Analytics Component
const Analytics = () => (
  <div className="h-full overflow-y-auto">
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Performance insights and reports</p>
      </div>
    </header>
    <div className="p-6">
      <Card className="rounded-xl border-0 shadow-sm">
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Advanced analytics and reporting features coming soon!</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

// Schedule Component
const Schedule = () => (
  <div className="h-full overflow-y-auto">
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
        <p className="text-gray-600 mt-1">Project timelines and milestones</p>
      </div>
    </header>
    <div className="p-6">
      <Card className="rounded-xl border-0 shadow-sm">
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Project scheduling features coming soon!</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

// Budget Component
const Budget = () => (
  <div className="h-full overflow-y-auto">
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Budget</h1>
        <p className="text-gray-600 mt-1">Financial tracking and cost management</p>
      </div>
    </header>
    <div className="p-6">
      <Card className="rounded-xl border-0 shadow-sm">
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Budget management features coming soon!</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

// Vendors Component
const Vendors = () => (
  <div className="h-full overflow-y-auto">
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
        <p className="text-gray-600 mt-1">Contractor and supplier management</p>
      </div>
    </header>
    <div className="p-6">
      <Card className="rounded-xl border-0 shadow-sm">
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Vendor management features coming soon!</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

// Permits Component
const Permits = () => <PermitsCompliance selectedProject={null} />;

// Documents Component
const Documents = () => (
  <div className="h-full overflow-y-auto">
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <p className="text-gray-600 mt-1">Project files and documentation</p>
      </div>
    </header>
    <div className="p-6">
      <Card className="rounded-xl border-0 shadow-sm">
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Document management features coming soon!</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

// Main Home Component
export default function Home() {
  const { user, isLoading } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = '/api/auth/login';
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard />;
      case 'analytics': return <Analytics />;
      case 'schedule': return <Schedule />;
      case 'budget': return <Budget />;
      case 'vendors': return <Vendors />;
      case 'permits': return <Permits />;
      case 'documents': return <Documents />;
      default: return <Dashboard />;
    }
  };

  return (
    <MainLayout activeView={activeView} onViewChange={setActiveView}>
      {renderActiveView()}
    </MainLayout>
  );
}