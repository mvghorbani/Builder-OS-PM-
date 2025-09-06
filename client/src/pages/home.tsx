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
  MessageSquare,
  AlertCircle,
  User,
  FileText,
  CheckCircle,
  Clock,
  Activity,
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

const getRelativeTime = (dateString: string | Date) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    ...(date.getFullYear() !== now.getFullYear() && { year: 'numeric' })
  });
};

const getActivityIcon = (type: string) => {
  const iconMap = {
    'document_upload': FileText,
    'permit_approved': CheckCircle,
    'permit_pending': Clock,
    'comment': MessageSquare,
    'task_completed': Check,
    'milestone_reached': Activity,
    'budget_updated': Wallet,
    'rfi_submitted': HelpCircle,
    'user_joined': User,
    'alert': AlertCircle,
    'default': Activity
  };
  
  return iconMap[type as keyof typeof iconMap] || iconMap.default;
};

const getActivityColor = (type: string) => {
  const colorMap = {
    'document_upload': 'bg-blue-100 text-blue-600',
    'permit_approved': 'bg-green-100 text-green-600',
    'permit_pending': 'bg-yellow-100 text-yellow-600',
    'comment': 'bg-teal-100 text-teal-600',
    'task_completed': 'bg-green-100 text-green-600',
    'milestone_reached': 'bg-blue-100 text-blue-600',
    'budget_updated': 'bg-yellow-100 text-yellow-600',
    'rfi_submitted': 'bg-gray-100 text-gray-600',
    'user_joined': 'bg-teal-100 text-teal-600',
    'alert': 'bg-red-100 text-red-600',
    'default': 'bg-gray-100 text-gray-600'
  };
  
  return colorMap[type as keyof typeof colorMap] || colorMap.default;
};

// Mock activity data for demonstration (replace with real data)
const mockRecentActivities = [
  {
    id: 1,
    type: 'document_upload',
    user: { name: 'Sarah Chen', avatar: null },
    action: 'uploaded',
    object: 'Structural Plans v2.pdf',
    target: 'Downtown Office Renovation',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    clickableObject: true,
    clickableTarget: true
  },
  {
    id: 2,
    type: 'permit_approved',
    user: { name: 'System', avatar: null },
    action: 'approved',
    object: 'Permit #B-2025-1138',
    target: 'Downtown Office Renovation',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    clickableObject: true,
    clickableTarget: true
  },
  {
    id: 3,
    type: 'comment',
    user: { name: 'Mike Rivera', avatar: null },
    action: 'left a comment on',
    object: 'RFI-004',
    target: 'Residential Complex Phase 2',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    clickableObject: true,
    clickableTarget: true
  },
  {
    id: 4,
    type: 'task_completed',
    user: { name: 'Jessica Park', avatar: null },
    action: 'completed',
    object: 'Foundation Inspection',
    target: 'Harbor View Apartments',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    clickableObject: false,
    clickableTarget: true
  }
];

const PropertyCard = ({ property }: { property: Property }) => (
  <div
    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 hover:-translate-y-1 cursor-pointer group"
    data-testid={`card-property-${property.id}`}
  >
    <div className="flex items-start justify-between mb-6">
      <div className="flex-1 min-w-0">
        <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">{property.name || property.address}</h3>
        <p className="text-sm text-gray-600">
          {property.city && property.state ? 
            `${property.city}, ${property.state}${property.zipCode ? ' ' + property.zipCode : ''}` : 
            property.type
          }
        </p>
      </div>
      <StatusBadge status={property.status || 'active'} />
    </div>
    
    <div className="space-y-4">
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">Completion</span>
          <span className="text-sm font-bold text-gray-900">
            {typeof property.progress === 'number' ? `${property.progress}%` : '—'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${typeof property.progress === 'number' ? property.progress : 0}%` }}
          ></div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">Budget</p>
          <p className="font-bold text-gray-900">
            {property.totalBudget && parseFloat(property.totalBudget.toString()) >= 1000000
              ? `$${(parseFloat(property.totalBudget.toString()) / 1000000).toFixed(1)}M`
              : property.totalBudget 
                ? `$${Math.round(parseFloat(property.totalBudget.toString()) / 1000)}k`
                : '—'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Type</p>
          <p className="font-bold text-gray-900 capitalize">{property.type}</p>
        </div>
      </div>
      
      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 text-xs font-medium hover:bg-blue-50 hover:border-blue-200 transition-colors duration-200"
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
          className="flex-1 text-xs font-medium hover:bg-green-50 hover:border-green-200 transition-colors duration-200"
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
  </div>
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <header className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Project Dashboard</h1>
          <p className="text-base sm:text-lg text-gray-600">Overview and quick actions</p>
        </header>

        {/* Stats Grid */}
        <div className="mb-8 sm:mb-12 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Active Projects */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Active Projects</p>
            <p className="text-3xl font-bold text-gray-900" data-testid="text-stat-projects">
              {fmtInt(stats?.activeProjects)}
            </p>
          </div>

          {/* Budget */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Budget</p>
            <p className="text-3xl font-bold text-gray-900" data-testid="text-stat-budget">
              {stats?.totalBudget && typeof stats.totalBudget === 'number' && stats.totalBudget >= 1000000
                ? `$${(stats.totalBudget / 1000000).toFixed(1)}M`
                : fmtUSDk(stats?.totalBudget)}
            </p>
          </div>

          {/* Schedule Health */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-xl">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              {Number.isFinite(stats?.avgScheduleAdherence) && stats!.avgScheduleAdherence >= 90 && (
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              )}
              {Number.isFinite(stats?.avgScheduleAdherence) && stats!.avgScheduleAdherence < 90 && stats!.avgScheduleAdherence >= 70 && (
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              )}
              {Number.isFinite(stats?.avgScheduleAdherence) && stats!.avgScheduleAdherence < 70 && (
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              )}
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Schedule Health</p>
            <div className="flex items-center">
              <p className="text-3xl font-bold text-gray-900 mr-2" data-testid="text-stat-schedule">
                {Number.isFinite(stats?.avgScheduleAdherence) && (stats?.scheduleSampleSize || 0) > 0
                  ? `${Math.max(0, Math.min(100, Number(stats!.avgScheduleAdherence))).toFixed(0)}%`
                  : '—'}
              </p>
              {Number.isFinite(stats?.avgScheduleAdherence) && (stats?.scheduleSampleSize || 0) > 0 && (
                <span className={`text-sm font-medium ${
                  stats!.avgScheduleAdherence >= 90 ? 'text-green-600' :
                  stats!.avgScheduleAdherence >= 70 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {stats!.avgScheduleAdherence >= 90 ? 'On Track' :
                   stats!.avgScheduleAdherence >= 70 ? 'At Risk' : 'Delayed'}
                </span>
              )}
            </div>
          </div>

          {/* Permits */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-50 rounded-xl">
                <FileCheck className="h-6 w-6 text-yellow-600" />
              </div>
              {stats?.pendingPermits && Number(stats.pendingPermits) > 0 && (
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              )}
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Open Permits</p>
            <p className="text-3xl font-bold text-gray-900" data-testid="text-stat-permits">
              {fmtInt(stats?.pendingPermits)}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <section className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Quick Actions</h2>
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <button 
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 hover:-translate-y-1 group text-center" 
              data-testid="button-daily-log"
              onClick={() => toast({ title: "Daily Log", description: "Daily log feature coming soon!" })}
            >
              <div className="w-12 h-12 bg-yellow-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-700 transition-colors duration-200">
                <ClipboardCheck className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Daily Log</h3>
              <p className="text-sm text-gray-600">Record site activity</p>
            </button>

            <button 
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 hover:-translate-y-1 group text-center" 
              data-testid="button-upload-document"
              onClick={() => toast({ title: "Upload Document", description: "Document upload feature coming soon!" })}
            >
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-700 transition-colors duration-200">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload</h3>
              <p className="text-sm text-gray-600">Add project files</p>
            </button>

            <button 
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 hover:-translate-y-1 group text-center" 
              data-testid="button-create-project"
              onClick={() => toast({ title: "Create", description: "Project creation feature coming soon!" })}
            >
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-700 transition-colors duration-200">
                <FilePlus className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Create</h3>
              <p className="text-sm text-gray-600">Start new project</p>
            </button>

            <button 
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 hover:-translate-y-1 group text-center" 
              data-testid="button-submit-rfi"
              onClick={() => toast({ title: "Submit", description: "Submit documents or requests" })}
            >
              <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-teal-700 transition-colors duration-200">
                <HelpCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Submit</h3>
              <p className="text-sm text-gray-600">Send requests & docs</p>
            </button>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Active Projects</h2>
          
          {propertiesError && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-200 mb-8">
              <p className="text-sm text-red-600 mb-4">Couldn't load projects.</p>
              <Button 
                size="sm" 
                className="bg-red-600 hover:bg-red-700 text-white" 
                onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/properties'] })}
              >
                Retry
              </Button>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
            {propertiesLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-pulse">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-2 bg-gray-200 rounded"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-12 bg-gray-200 rounded"></div>
                      <div className="h-12 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <>
                {Array.isArray(properties) && properties.map((property: any) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
                
                {!propertiesLoading && Array.isArray(properties) && properties.length === 0 && (
                  <div className="col-span-full">
                    <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center">
                      <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Building2 className="w-12 h-12 text-blue-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">No projects yet</h3>
                      <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Get started by creating your first construction project. Track progress, manage budgets, and stay on schedule.
                      </p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold">
                            <FilePlus className="w-5 h-5 mr-2" />
                            Create Your First Project
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Create New Project</DialogTitle>
                            <DialogDescription>
                              Enter the details for your new construction project.
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleCreateProject} className="space-y-4">
                            <div>
                              <Label htmlFor="name">Project Name</Label>
                              <Input
                                id="name"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                placeholder="Downtown Office Renovation"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="address">Address</Label>
                              <Input
                                id="address"
                                value={newProjectAddress}
                                onChange={(e) => setNewProjectAddress(e.target.value)}
                                placeholder="123 Main Street"
                                required
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="city">City</Label>
                                <Input
                                  id="city"
                                  value={newProjectCity}
                                  onChange={(e) => setNewProjectCity(e.target.value)}
                                  placeholder="New York"
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="state">State</Label>
                                <Input
                                  id="state"
                                  value={newProjectState}
                                  onChange={(e) => setNewProjectState(e.target.value)}
                                  placeholder="NY"
                                  maxLength={2}
                                  required
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="zip">ZIP Code</Label>
                              <Input
                                id="zip"
                                value={newProjectZip}
                                onChange={(e) => setNewProjectZip(e.target.value)}
                                placeholder="10001"
                                maxLength={10}
                              />
                            </div>
                            <DialogFooter>
                              <Button 
                                type="submit" 
                                disabled={createProjectMutation.isPending}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Recent Activity</h2>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            {activitiesError && (
              <div className="mb-6">
                <p className="text-sm text-red-600 mb-4">Couldn't load activities.</p>
                <Button 
                  size="sm" 
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/activities'] })}
                >
                  Retry
                </Button>
              </div>
            )}
            
            <div className="space-y-4">
              {/* Show mock activities if no real activities, or mix them */}
              {(!Array.isArray(activities) || activities.length === 0) && !activitiesLoading && !activitiesError ? (
                // Enhanced Empty State
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-6 relative">
                    {/* Blueprint/Timeline Illustration */}
                    <div className="w-full h-full bg-blue-50 rounded-2xl flex items-center justify-center">
                      <Activity className="w-10 h-10 text-blue-600" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No recent activity</h3>
                  <p className="text-gray-600 max-w-sm mx-auto leading-relaxed">
                    Updates on document uploads, permit statuses, team comments, and project milestones will appear here.
                  </p>
                </div>
              ) : (
                // Populated State - Show enhanced activities
                <>
                  {mockRecentActivities.map((activity) => {
                    const IconComponent = getActivityIcon(activity.type);
                    const iconColorClass = getActivityColor(activity.type);
                    
                    return (
                      <div key={activity.id} className="flex items-start space-x-4 py-4 border-b border-gray-100 last:border-b-0 last:pb-0 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors duration-150" data-testid={`activity-${activity.id}`}>
                        {/* Activity Icon */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconColorClass}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        
                        {/* User Avatar */}
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-xs font-medium text-gray-600">
                          {activity.user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        
                        {/* Activity Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 leading-relaxed">
                            <span className="font-semibold text-gray-700">{activity.user.name}</span>
                            <span className="mx-1">{activity.action}</span>
                            {activity.clickableObject ? (
                              <button 
                                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                                onClick={() => toast({ title: "Navigate", description: `Opening ${activity.object}...` })}
                              >
                                {activity.object}
                              </button>
                            ) : (
                              <span className="font-semibold text-gray-900">{activity.object}</span>
                            )}
                            {activity.target && (
                              <>
                                <span className="mx-1">
                                  {activity.action.includes('to') ? '' : activity.action.includes('on') ? '' : 'for'}
                                </span>
                                {activity.clickableTarget ? (
                                  <button 
                                    className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                                    onClick={() => toast({ title: "Navigate", description: `Opening ${activity.target}...` })}
                                  >
                                    {activity.target}
                                  </button>
                                ) : (
                                  <span className="font-semibold text-gray-900">{activity.target}</span>
                                )}
                              </>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {getRelativeTime(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Show real activities if they exist */}
                  {Array.isArray(activities) && activities.length > 0 && activities
                    .slice()
                    .sort((a: Activity, b: Activity) => {
                      const aDate = (a as any).createdAt ?? (a as any).created_at ?? null;
                      const bDate = (b as any).createdAt ?? (b as any).created_at ?? null;
                      const da = aDate ? Date.parse(aDate) : 0;
                      const db = bDate ? Date.parse(bDate) : 0;
                      return db - da;
                    })
                    .slice(0, 2) // Show fewer real activities to make room for mock ones
                    .map((activity: any) => (
                    <div key={`real-${activity.id}`} className="flex items-start space-x-4 py-4 border-b border-gray-100 last:border-b-0 last:pb-0 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors duration-150" data-testid={`activity-${activity.id}`}>
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-xs font-medium text-gray-600">
                        U
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 leading-relaxed">
                          <span className="font-semibold">{activity.description}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {getWhen(activity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            <Button 
              variant="outline" 
              className="w-full mt-6 bg-gray-50 hover:bg-gray-100 border-gray-200 transition-colors duration-200" 
              data-testid="button-view-all-activity"
              onClick={() => toast({ title: "View All Activity", description: "Full activity timeline coming soon!" })}
            >
              <Activity className="w-4 h-4 mr-2" />
              View All Activity
            </Button>
          </div>
        </section>
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