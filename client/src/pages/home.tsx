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
  Building2,
  Wallet,
  Calendar,
  FileCheck,
  FilePlus,
  Bell,
  Check,
  Upload,
  ClipboardCheck,
  HelpCircle,
  Download,
  FileDown,
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
import { MainLayout } from "@/layouts/MainLayout";
import { PermitsCompliance } from "@/components/PermitsCompliance";
import { exportProject } from "@/lib/exportUtils";

interface DashboardStats {
  activeProjects: number;
  totalBudget: number;
  spentBudget: number;
  avgScheduleAdherence: number | null; // allow null
  scheduleSampleSize: number;          // NEW: how many projects contributed
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

const getWhen = (a: Activity) => {
  const raw = (a as any).createdAt ?? (a as any).created_at ?? null;
  return raw ? new Date(raw).toLocaleString() : '—';
};

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
        <StatusBadge status={property.status || 'active'} />
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
              {property.totalBudget 
                ? parseFloat(property.totalBudget.toString()).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                : '—'}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Type</p>
            <p className="font-medium text-gray-900">{property.type}</p>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              exportProject(property.id, 'pdf').catch((error: any) => {
                console.error('PDF export failed:', error);
              });
            }}
            data-testid={`button-export-pdf-${property.id}`}
          >
            <FileDown className="w-3 h-3 mr-1" />
            PDF
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              exportProject(property.id, 'excel').catch((error: any) => {
                console.error('Excel export failed:', error);
              });
            }}
            data-testid={`button-export-excel-${property.id}`}
          >
            <Download className="w-3 h-3 mr-1" />
            Excel
          </Button>
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
  const { data: stats, isLoading: statsLoading, isError: statsError } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    queryFn: () => fetchJSON('/api/dashboard/stats'),
    retry: (failureCount, error) => !isUnauthorizedError(error) && failureCount < 2,
    staleTime: 60_000,
  });

  const { data: properties = [], isLoading: propertiesLoading, isError: propertiesError } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
    queryFn: () => fetchJSON('/api/properties'),
    retry: (failureCount, error) => !isUnauthorizedError(error) && failureCount < 2,
    staleTime: 30_000,
  });

  const { data: activities = [], isLoading: activitiesLoading, isError: activitiesError } = useQuery<Activity[]>({
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
      name: newProjectName.trim(),
      address: newProjectAddress.trim(),
      city: newProjectCity.trim(),
      state: newProjectState.trim(),
      zipCode: newProjectZip.trim(),
      status: 'active',
      progress: 0,
      type: 'residential',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Project Dashboard</h1>
        <p className="text-sm text-gray-500">Overview and quick actions</p>
      </header>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Projects */}
        <div className="rounded-2xl border border-black/5 bg-white p-4 text-center">
          <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl bg-blue-50">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-xs uppercase tracking-wide text-gray-500">Active Projects</div>
          <div className="mt-1 text-2xl font-bold" data-testid="text-stat-projects">
            {fmtInt(stats?.activeProjects)}
          </div>
        </div>

        {/* Budget */}
        <div className="rounded-2xl border border-black/5 bg-white p-4 text-center">
          <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl bg-blue-50">
            <Wallet className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-xs uppercase tracking-wide text-gray-500">Total Budget</div>
          <div className="mt-1 text-2xl font-bold" data-testid="text-stat-budget">
            {fmtUSDk(stats?.totalBudget)}
          </div>
        </div>

        {/* Schedule */}
        <div className="rounded-2xl border border-black/5 bg-white p-4 text-center">
          <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl bg-green-50">
            <Calendar className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-xs uppercase tracking-wide text-gray-500">Schedule Health</div>
          <div className="mt-1 text-2xl font-bold" data-testid="text-stat-schedule">
            {Number.isFinite(stats?.avgScheduleAdherence) && (stats?.scheduleSampleSize || 0) > 0
              ? `${Math.max(0, Math.min(100, Number(stats!.avgScheduleAdherence))).toFixed(0)}%`
              : '—'}
          </div>
        </div>

        {/* Permits */}
        <div className="rounded-2xl border border-black/5 bg-white p-4 text-center">
          <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl bg-yellow-50">
            <FileCheck className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="text-xs uppercase tracking-wide text-gray-500">Open Permits</div>
          <div className="mt-1 text-2xl font-bold" data-testid="text-stat-permits">
            {fmtInt(stats?.pendingPermits)}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <section className="mb-8">
        <h2 className="mb-4 text-center text-2xl font-bold tracking-tight">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Button 
            variant="ghost" 
            className="group h-auto p-4 bg-blue-50 hover:bg-blue-100 justify-start rounded-xl" 
            data-testid="button-create-rfq"
            onClick={() => toast({ title: "Create RFQ", description: "RFQ creation feature coming soon!" })}
          >
            <div className="mx-auto mb-1 grid h-8 w-8 place-items-center rounded-lg bg-blue-50">
              <FilePlus className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-sm font-medium">Create RFQ</div>
            <div className="text-[11px] text-gray-500">Get bids for work</div>
          </Button>

          <Button 
            variant="ghost" 
            className="group h-auto p-4 bg-green-50 hover:bg-green-100 justify-start rounded-xl" 
            data-testid="button-upload-document"
            onClick={() => toast({ title: "Upload Document", description: "Document upload feature coming soon!" })}
          >
            <div className="mx-auto mb-1 grid h-8 w-8 place-items-center rounded-lg bg-green-50">
              <Upload className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-sm font-medium">Upload Document</div>
            <div className="text-[11px] text-gray-500">Add project files</div>
          </Button>

          <Button 
            variant="ghost" 
            className="group h-auto p-4 bg-amber-50 hover:bg-amber-100 justify-start rounded-xl" 
            data-testid="button-daily-log"
            onClick={() => toast({ title: "Daily Log", description: "Daily log feature coming soon!" })}
          >
            <div className="mx-auto mb-1 grid h-8 w-8 place-items-center rounded-lg bg-amber-50">
              <ClipboardCheck className="h-4 w-4 text-amber-600" />
            </div>
            <div className="text-sm font-medium">Daily Log</div>
            <div className="text-[11px] text-gray-500">Record site activity</div>
          </Button>

          <Button 
            variant="ghost" 
            className="group h-auto p-4 bg-blue-50 hover:bg-blue-100 justify-start rounded-xl" 
            data-testid="button-submit-rfi"
            onClick={() => toast({ title: "Submit RFI", description: "RFI submission feature coming soon!" })}
          >
            <div className="mx-auto mb-1 grid h-8 w-8 place-items-center rounded-lg bg-blue-50">
              <HelpCircle className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-sm font-medium">Submit RFI</div>
            <div className="text-[11px] text-gray-500">Request information</div>
          </Button>
        </div>
      </section>

      {/* Content */}
      <div className="space-y-8">
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
        {statsLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({length: 4}).map((_, i) => (
              <Card key={i} className="rounded-xl border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="h-6 w-24 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 w-32 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
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
                .sort((a: Activity, b: Activity) => {
                  const aDate = (a as any).createdAt ?? (a as any).created_at ?? null;
                  const bDate = (b as any).createdAt ?? (b as any).created_at ?? null;
                  const da = aDate ? Date.parse(aDate) : 0;
                  const db = bDate ? Date.parse(bDate) : 0;
                  return db - da;
                })
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
                    <p className="text-xs text-gray-500">{getWhen(activity)}</p>
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