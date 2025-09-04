import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import {
  Building,
  ChartLine,
  Calendar,
  DollarSign,
  Users,
  FileText,
  Folder,
  Plus,
  Filter,
  Bell,
  Check,
  Clock,
  AlertTriangle,
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
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import { PermitCoPilot } from "@/components/PermitCoPilot";

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

const PropertyCard = ({ property, onSelect }: { property: Property; onSelect: (property: Property) => void }) => (
  <Card
    className="mb-3 cursor-pointer hover:shadow-md transition-shadow"
    onClick={() => onSelect(property)}
    data-testid={`card-property-${property.id}`}
  >
    <CardContent className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-foreground text-lg" data-testid={`text-address-${property.id}`}>
            {property.address}
          </h3>
          <p className="text-sm text-muted-foreground">{property.type}</p>
        </div>
        <StatusBadge status={property.status} />
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Progress</span>
          <span data-testid={`text-progress-${property.id}`}>{property.progress || 0}%</span>
        </div>
        <Progress value={property.progress || 0} className="h-2" />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
        <div>
          <span className="text-muted-foreground">Budget</span>
          <p className="font-medium text-foreground" data-testid={`text-budget-${property.id}`}>
            ${(parseFloat(property.spentBudget || '0') / 1000).toFixed(0)}k / ${(parseFloat(property.totalBudget || '0') / 1000).toFixed(0)}k
          </p>
        </div>
        <div>
          <span className="text-muted-foreground">Schedule</span>
          <p className={`font-medium ${(property.scheduleAdherence || 0) < 85 ? 'text-red-600' : 'text-green-600'}`}>
            {property.scheduleAdherence || 0}%
          </p>
        </div>
        <div>
          <span className="text-muted-foreground">Next Due</span>
          <p className="font-medium text-foreground">
            {property.dueDate ? new Date(property.dueDate).toLocaleDateString() : 'TBD'}
          </p>
        </div>
      </div>

      <div className="bg-muted rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="w-4 h-4 text-primary mr-2" />
            <span className="text-sm font-medium text-foreground">Next Milestone</span>
          </div>
          <span className="text-xs text-muted-foreground">
            In Progress
          </span>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function Home() {
  const [activeView, setActiveView] = useState('projects');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectAddress, setNewProjectAddress] = useState('');
  const [newProjectType, setNewProjectType] = useState('');
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: properties = [], isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
    enabled: isAuthenticated && !isLoading,
  });

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    enabled: isAuthenticated && !isLoading,
  });

  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: ['/api/activities'],
    enabled: isAuthenticated && !isLoading,
  });

  const createProjectMutation = useMutation({
    mutationFn: async ({ address, projectType }: { address: string; projectType: string }) => {
      return apiService.createProject({ address, project_type: projectType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      toast({
        title: "Project Created",
        description: "Your new project has been created successfully.",
      });
      setIsNewProjectModalOpen(false);
      setNewProjectAddress('');
      setNewProjectType('');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const PropertyCard = ({ property }: { property: Property }) => (
    <Card
      className="hover-lift cursor-pointer border border-border shadow-sm"
      onClick={() => setSelectedProperty(property)}
      data-testid={`card-property-${property.id}`}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground" data-testid={`text-address-${property.id}`}>
              {property.address}
            </h3>
            <p className="text-sm text-muted-foreground" data-testid={`text-type-${property.id}`}>
              {property.type}
            </p>
          </div>
          <StatusBadge status={property.status} />
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Progress</span>
            <span data-testid={`text-progress-${property.id}`}>{property.progress}%</span>
          </div>
          <Progress value={property.progress} className="h-2" />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
          <div className="text-center">
            <span className="text-muted-foreground block">Budget</span>
            <p className="font-semibold text-foreground" data-testid={`text-budget-${property.id}`}>
              ${Math.round(parseFloat(property.spentBudget) / 1000)}K / ${Math.round(parseFloat(property.totalBudget) / 1000)}K
            </p>
          </div>
          <div className="text-center">
            <span className="text-muted-foreground block">Schedule</span>
            <p className={`font-semibold ${property.scheduleAdherence < 85 ? 'text-red-600' : 'text-green-600'}`}>
              {property.scheduleAdherence}%
            </p>
          </div>
          <div className="text-center">
            <span className="text-muted-foreground block">Permit SLA</span>
            <p className={`font-semibold ${property.permitSLA > 21 ? 'text-red-600' : 'text-blue-600'}`}>
              {property.permitSLA}d
            </p>
          </div>
        </div>

        <div className="bg-muted rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Next Milestone</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {property.dueDate ? new Date(property.dueDate).toLocaleDateString() : 'TBD'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    createProjectMutation.mutate({ address: newProjectAddress, projectType: newProjectType });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card shadow-lg border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Building className="text-primary-foreground text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">ConstructPro</h1>
              <p className="text-xs text-muted-foreground">Project Management</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Button
            variant={activeView === 'projects' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveView('projects')}
            data-testid="button-nav-projects"
          >
            <Building className="w-5 h-5 mr-3" />
            <span className="font-medium">Projects</span>
            <Badge variant="secondary" className="ml-auto">
              {properties.length}
            </Badge>
          </Button>

          <Button
            variant={activeView === 'dashboard' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveView('dashboard')}
            data-testid="button-nav-dashboard"
          >
            <ChartLine className="w-5 h-5 mr-3" />
            <span className="font-medium">Dashboard</span>
          </Button>

          <Button
            variant={activeView === 'schedule' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveView('schedule')}
            data-testid="button-nav-schedule"
          >
            <Calendar className="w-5 h-5 mr-3" />
            <span className="font-medium">Schedule</span>
          </Button>

          <Button
            variant={activeView === 'budget' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveView('budget')}
            data-testid="button-nav-budget"
          >
            <DollarSign className="w-5 h-5 mr-3" />
            <span className="font-medium">Budget</span>
          </Button>

          <Button
            variant={activeView === 'vendors' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveView('vendors')}
            data-testid="button-nav-vendors"
          >
            <Users className="w-5 h-5 mr-3" />
            <span className="font-medium">Vendors</span>
          </Button>

          <Button
            variant={activeView === 'permits' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveView('permits')}
            data-testid="button-nav-permits"
          >
            <FileText className="w-5 h-5 mr-3" />
            <span className="font-medium">Permits</span>
          </Button>

          <Button
            variant={activeView === 'documents' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveView('documents')}
            data-testid="button-nav-documents"
          >
            <Folder className="w-5 h-5 mr-3" />
            <span className="font-medium">Documents</span>
          </Button>
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-secondary-foreground">
                {user?.firstName?.[0] || user?.email?.[0] || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate" data-testid="text-user-name">
                {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email || 'User'}
              </p>
              <p className="text-xs text-muted-foreground" data-testid="text-user-role">
                {user?.role || 'User'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/api/logout'}
              data-testid="button-logout"
            >
              <i className="fas fa-sign-out-alt text-sm"></i>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <header className="bg-card shadow-sm border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Active Projects</h2>
              <p className="text-sm text-muted-foreground">Manage your construction projects and milestones</p>
            </div>

            <div className="flex items-center space-x-4">
              <Button 
                variant="secondary" 
                data-testid="button-filter"
                onClick={() => toast({ title: "Filter", description: "Filter functionality coming soon!" })}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>

              <Dialog open={isNewProjectModalOpen} onOpenChange={setIsNewProjectModalOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-new-project">
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                      Enter the project details below. Click save when you're done.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateProject}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="address" className="text-right">
                          Address
                        </Label>
                        <Input
                          id="address"
                          value={newProjectAddress}
                          onChange={(e) => setNewProjectAddress(e.target.value)}
                          className="col-span-3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="projectType" className="text-right">
                          Project Type
                        </Label>
                        <Input
                          id="projectType"
                          value={newProjectType}
                          onChange={(e) => setNewProjectType(e.target.value)}
                          className="col-span-3"
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={createProjectMutation.isPending}>
                        {createProjectMutation.isPending ? 'Saving...' : 'Save Project'}
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
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></span>
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {activeView === 'projects' && (
              <>
                {/* Stats Cards */}
                {!statsLoading && stats && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active Projects</p>
                        <p className="text-3xl font-bold text-foreground" data-testid="text-stat-projects">
                          {stats.activeProjects}
                        </p>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Building className="text-primary text-xl" />
                      </div>
                    </div>
                    <div className="flex items-center mt-4 text-sm">
                      <ArrowUp className="text-green-500 text-xs mr-1" />
                      <span className="text-green-600 font-medium">+12%</span>
                      <span className="text-muted-foreground ml-2">from last month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Budget</p>
                        <p className="text-3xl font-bold text-foreground" data-testid="text-stat-budget">
                          ${stats.totalBudget.toFixed(2)}M
                        </p>
                      </div>
                      <div className="p-3 bg-green-500/10 rounded-lg">
                        <DollarSign className="text-green-600 text-xl" />
                      </div>
                    </div>
                    <div className="flex items-center mt-4 text-sm">
                      <span className="text-muted-foreground">Spent: </span>
                      <span className="text-foreground font-medium ml-1" data-testid="text-stat-spent">
                        ${stats.spentBudget}K
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Schedule</p>
                        <p className="text-3xl font-bold text-foreground" data-testid="text-stat-schedule">
                          {stats.avgScheduleAdherence}%
                        </p>
                      </div>
                      <div className="p-3 bg-amber-500/10 rounded-lg">
                        <Clock className="text-amber-600 text-xl" />
                      </div>
                    </div>
                    <div className="flex items-center mt-4 text-sm">
                      <span className="text-muted-foreground">On track</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Permits Pending</p>
                        <p className="text-3xl font-bold text-foreground" data-testid="text-stat-permits">
                          {stats.pendingPermits}
                        </p>
                      </div>
                      <div className="p-3 bg-red-500/10 rounded-lg">
                        <FileText className="text-red-600 text-xl" />
                      </div>
                    </div>
                    <div className="flex items-center mt-4 text-sm">
                      <span className="text-red-600 font-medium">2 overdue</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Projects Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {propertiesLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded mb-4 w-2/3"></div>
                      <div className="h-2 bg-muted rounded mb-6"></div>
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="h-8 bg-muted rounded"></div>
                        <div className="h-8 bg-muted rounded"></div>
                        <div className="h-8 bg-muted rounded"></div>
                      </div>
                      <div className="h-12 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                properties.map(property => (
                  <PropertyCard key={property.id} property={property} onSelect={setSelectedProperty} />
                ))
              )}
            </div>

            {/* Quick Actions */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button 
                    variant="ghost" 
                    className="h-auto p-4 bg-primary/5 hover:bg-primary/10 justify-start" 
                    data-testid="button-create-rfq"
                    onClick={() => toast({ title: "Create RFQ", description: "RFQ creation feature coming soon!" })}
                  >
                    <div className="p-2 bg-primary rounded-lg mr-3">
                      <Plus className="text-primary-foreground text-sm" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-foreground">Create RFQ</p>
                      <p className="text-xs text-muted-foreground">Get bids for work</p>
                    </div>
                  </Button>

                  <Button 
                    variant="ghost" 
                    className="h-auto p-4 bg-green-500/5 hover:bg-green-500/10 justify-start" 
                    data-testid="button-upload-document"
                    onClick={() => toast({ title: "Upload Document", description: "Document upload feature coming soon!" })}
                  >
                    <div className="p-2 bg-green-500 rounded-lg mr-3">
                      <Upload className="text-white text-sm" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-foreground">Upload Document</p>
                      <p className="text-xs text-muted-foreground">Add project files</p>
                    </div>
                  </Button>

                  <Button 
                    variant="ghost" 
                    className="h-auto p-4 bg-amber-500/5 hover:bg-amber-500/10 justify-start" 
                    data-testid="button-daily-log"
                    onClick={() => toast({ title: "Daily Log", description: "Daily log feature coming soon!" })}
                  >
                    <div className="p-2 bg-amber-500 rounded-lg mr-3">
                      <ClipboardCheck className="text-white text-sm" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-foreground">Daily Log</p>
                      <p className="text-xs text-muted-foreground">Record site activity</p>
                    </div>
                  </Button>

                  <Button 
                    variant="ghost" 
                    className="h-auto p-4 bg-purple-500/5 hover:bg-purple-500/10 justify-start" 
                    data-testid="button-submit-rfi"
                    onClick={() => toast({ title: "Submit RFI", description: "RFI submission feature coming soon!" })}
                  >
                    <div className="p-2 bg-purple-500 rounded-lg mr-3">
                      <HelpCircle className="text-white text-sm" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-foreground">Submit RFI</p>
                      <p className="text-xs text-muted-foreground">Request information</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {activities.slice(0, 4).map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4" data-testid={`activity-${activity.id}`}>
                      <div className="p-2 bg-green-100 rounded-full">
                        <Check className="text-green-600 text-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">
                          <span className="font-medium">{activity.description}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.createdAt!).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
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
              </>
            )}

            {activeView === 'dashboard' && (
              <AnalyticsDashboard />
            )}

            {activeView === 'schedule' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-foreground">Project Schedule</h3>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground">Schedule management and timeline view coming soon!</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeView === 'budget' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-foreground">Budget Management</h3>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground">Budget tracking and financial management coming soon!</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeView === 'vendors' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-foreground">Vendor Management</h3>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground">Vendor directory and management tools coming soon!</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeView === 'permits' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-foreground">Permits & Compliance</h3>
                <PermitCoPilot selectedProject={selectedProject} />
              </div>
            )}

            {activeView === 'documents' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-foreground">Document Management</h3>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground">Document storage and sharing tools coming soon!</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}