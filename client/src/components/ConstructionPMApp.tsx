import { useState } from 'react';
import { 
  CheckCircle, 
  Clock, 
  DollarSign, 
  FileText, 
  Camera, 
  Calendar, 
  AlertTriangle, 
  Upload, 
  Lock, 
  Shield, 
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import type { Property, Milestone, BudgetLine } from '@shared/schema';

const ConstructionPMApp = () => {
  const [activeView, setActiveView] = useState('projects');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const { user } = useAuth();

  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });

  const { data: milestones = [] } = useQuery<Milestone[]>({
    queryKey: ['/api/properties', selectedProperty?.id, 'milestones'],
    enabled: !!selectedProperty,
  });

  const { data: budgetLines = [] } = useQuery<BudgetLine[]>({
    queryKey: ['/api/properties', selectedProperty?.id, 'budget'],
    enabled: !!selectedProperty,
  });

  const StatusBadge = ({ status, type = 'status' }: { status: string; type?: string }) => {
    const colors = {
      status: {
        'planning': 'bg-blue-100 text-blue-800',
        'permits': 'bg-yellow-100 text-yellow-800', 
        'assessment': 'bg-orange-100 text-orange-800',
        'active': 'bg-green-100 text-green-800'
      },
      milestone: {
        'complete': 'bg-green-100 text-green-800',
        'active': 'bg-blue-100 text-blue-800',
        'pending': 'bg-gray-100 text-gray-600',
        'blocked': 'bg-red-100 text-red-800'
      }
    };
    
    const colorSet = colors[type as keyof typeof colors] || colors.status;
    return (
      <Badge className={colorSet[status as keyof typeof colorSet] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const PropertyCard = ({ property }: { property: Property }) => (
    <Card
      className="mb-3 cursor-pointer"
      onClick={() => setSelectedProperty(property)}
      data-testid={`card-property-${property.id}`}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-gray-900" data-testid={`text-address-${property.id}`}>
              {property.address}
            </h3>
            <p className="text-sm text-gray-600">{property.type}</p>
          </div>
          <StatusBadge status={property.status} />
        </div>
        
        <div className="mb-3">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span data-testid={`text-progress-${property.id}`}>{property.progress}%</span>
          </div>
          <Progress value={property.progress} className="h-2" />
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
          <div>
            <span className="text-gray-600">Budget</span>
            <p className="font-medium" data-testid={`text-budget-${property.id}`}>
              ${(parseFloat(property.spentBudget) / 1000).toFixed(0)}k / ${(parseFloat(property.totalBudget) / 1000).toFixed(0)}k
            </p>
          </div>
          <div>
            <span className="text-gray-600">Schedule</span>
            <p className={`font-medium ${property.scheduleAdherence < 85 ? 'text-red-600' : 'text-green-600'}`}>
              {property.scheduleAdherence}%
            </p>
          </div>
          <div>
            <span className="text-gray-600">Permit SLA</span>
            <p className={`font-medium ${property.permitSLA > 21 ? 'text-red-600' : 'text-blue-600'}`}>
              {property.permitSLA}d
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 mb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-blue-500 mr-2" />
              <span className="text-sm font-medium text-gray-900">Next Milestone</span>
            </div>
            <span className="text-xs text-gray-600">
              {property.dueDate ? new Date(property.dueDate).toLocaleDateString() : 'TBD'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const PropertyDetail = ({ property }: { property: Property }) => {
    const MilestoneScreen = () => (
      <div className="bg-white p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Schedule & Gates</h3>
        <div className="space-y-3">
          {milestones.map((milestone) => (
            <Card
              key={milestone.id} 
              className="cursor-pointer"
              onClick={() => setSelectedMilestone(milestone)}
              data-testid={`card-milestone-${milestone.id}`}
            >
              <CardContent className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    {milestone.status === 'complete' ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    ) : milestone.status === 'active' ? (
                      <div className="w-5 h-5 rounded-full bg-blue-500 mr-3" />
                    ) : milestone.status === 'blocked' ? (
                      <Lock className="w-5 h-5 text-red-500 mr-3" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gray-200 mr-3" />
                    )}
                    <span className="font-medium text-gray-900">{milestone.name}</span>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={milestone.status} type="milestone" />
                    {milestone.blockers && milestone.blockers.length > 0 && (
                      <div className="flex items-center mt-1">
                        <Lock className="w-3 h-3 text-red-500 mr-1" />
                        <span className="text-xs text-red-600">Gated</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Target: {new Date(milestone.targetDate).toLocaleDateString()}</span>
                  {milestone.actualDate && (
                    <span className="text-green-600">✓ {new Date(milestone.actualDate).toLocaleDateString()}</span>
                  )}
                </div>

                {milestone.blockers && milestone.blockers.length > 0 && (
                  <div className="bg-red-50 rounded p-2">
                    <p className="text-xs text-red-800 font-medium">Blocked by:</p>
                    {milestone.blockers.map((blocker, i) => (
                      <p key={i} className="text-xs text-red-700">• {blocker}</p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );

    const BudgetScreen = () => (
      <div className="bg-white p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-900">Budget Control</h3>
          <Button variant="ghost" size="sm" data-testid="button-add-budget-line">+ Add Line</Button>
        </div>
        
        <div className="space-y-3">
          {budgetLines.map((line) => (
            <Card key={line.id}>
              <CardContent className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{line.scope}</h4>
                    <div className="flex items-center mt-1">
                      {line.bidCount < 3 && !line.vendorId && (
                        <div className="flex items-center mr-3">
                          <AlertTriangle className="w-3 h-3 text-red-500 mr-1" />
                          <span className="text-xs text-red-600">{line.bidCount}/3 bids</span>
                        </div>
                      )}
                      {!line.coiValid && line.vendorId && (
                        <div className="flex items-center mr-3">
                          <Shield className="w-3 h-3 text-red-500 mr-1" />
                          <span className="text-xs text-red-600">COI expired</span>
                        </div>
                      )}
                      {line.paymentBlocked && (
                        <div className="flex items-center">
                          <Lock className="w-3 h-3 text-red-500 mr-1" />
                          <span className="text-xs text-red-600">Payment blocked</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${parseFloat(line.contractAmount).toLocaleString()}</p>
                  </div>
                </div>
                
                <Progress value={line.percentComplete} className="mb-2 h-2" />

                {line.paymentBlocked && (
                  <Button 
                    disabled 
                    className="w-full"
                    variant="secondary"
                    data-testid={`button-payment-blocked-${line.id}`}
                  >
                    Payment Blocked - {line.bidCount < 3 ? 'Need 3 bids' : 'COI required'}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );

    if (selectedMilestone) {
      const canComplete = !selectedMilestone.blockers || selectedMilestone.blockers.length === 0;

      return (
        <div className="bg-white min-h-screen">
          <div className="bg-blue-500 text-white px-4 py-4">
            <Button 
              variant="ghost"
              onClick={() => setSelectedMilestone(null)}
              className="mb-2 text-blue-100 hover:text-white"
              data-testid="button-back-to-schedule"
            >
              ← Back to Schedule
            </Button>
            <h1 className="text-xl font-bold">{selectedMilestone.name}</h1>
            <p className="text-blue-100">{property.address}</p>
          </div>
          
          <div className="p-4 space-y-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Milestone Status</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <StatusBadge status={selectedMilestone.status} type="milestone" />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Target Date</span>
                    <span>{new Date(selectedMilestone.targetDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {selectedMilestone.blockers && selectedMilestone.blockers.length > 0 && (
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-red-800 mb-3">
                    <Lock className="w-4 h-4 inline mr-1" />
                    Current Blockers
                  </h3>
                  {selectedMilestone.blockers.map((blocker, idx) => (
                    <div key={idx} className="flex items-center text-sm text-red-700 mb-1">
                      <XCircle className="w-4 h-4 mr-2" />
                      {blocker}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              <Button 
                disabled={!canComplete}
                className="w-full"
                data-testid="button-mark-complete"
              >
                {canComplete ? 'Mark Complete' : 'Complete Blocked'}
              </Button>
              
              <Button variant="secondary" className="w-full" data-testid="button-upload-documentation">
                <Upload className="w-4 h-4 mr-2" />
                Upload Documentation
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white min-h-screen">
        <div className="bg-blue-500 text-white px-4 py-6 rounded-b-3xl">
          <Button 
            variant="ghost"
            onClick={() => setSelectedProperty(null)}
            className="mb-4 text-blue-100 hover:text-white"
            data-testid="button-back-to-projects"
          >
            ← Back
          </Button>
          <h1 className="text-2xl font-bold">{property.address}</h1>
          <p className="text-blue-100">{property.type}</p>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-green-50">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-green-600">Schedule</p>
                  {property.scheduleAdherence < 85 && <AlertTriangle className="w-3 h-3 text-red-500" />}
                </div>
                <p className={`text-lg font-bold ${property.scheduleAdherence < 85 ? 'text-red-600' : 'text-green-800'}`}>
                  {property.scheduleAdherence}%
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-50">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-blue-600">Budget Var</p>
                  {Math.abs(parseFloat(property.budgetVariance)) > 5 && <AlertTriangle className="w-3 h-3 text-red-500" />}
                </div>
                <p className={`text-lg font-bold ${Math.abs(parseFloat(property.budgetVariance)) > 5 ? 'text-red-600' : 'text-blue-800'}`}>
                  {property.budgetVariance}%
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-50">
              <CardContent className="p-3">
                <p className="text-xs text-gray-600 mb-1">Safety</p>
                <p className="text-lg font-bold text-gray-800">{property.safetyIncidents}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-yellow-50">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-yellow-600">Permit SLA</p>
                  {property.permitSLA > 21 && <AlertTriangle className="w-3 h-3 text-red-500" />}
                </div>
                <p className={`text-lg font-bold ${property.permitSLA > 21 ? 'text-red-600' : 'text-yellow-800'}`}>
                  {property.permitSLA}d
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { id: 'schedule', label: 'Schedule' },
              { id: 'budget', label: 'Budget' },
              { id: 'procurement', label: 'Bids' }
            ].map(tab => (
              <Button
                key={tab.id}
                variant={activeScreen === tab.id ? "default" : "ghost"}
                onClick={() => setActiveScreen(tab.id)}
                className="flex-1"
                data-testid={`button-tab-${tab.id}`}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {activeScreen === 'schedule' && <MilestoneScreen />}
          {activeScreen === 'budget' && <BudgetScreen />}
        </div>
      </div>
    );
  };

  const ProjectsView = () => {
    const totalBudget = properties.reduce((sum, p) => sum + parseFloat(p.totalBudget), 0);

    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="bg-white px-4 py-6 rounded-b-3xl shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
              <p className="text-gray-600 mt-1">{properties.length} active properties</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Budget</p>
              <p className="text-xl font-bold text-gray-900" data-testid="text-total-budget">
                ${(totalBudget / 1000000).toFixed(2)}M
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          {properties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    );
  };

  const TabBar = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="flex justify-around py-2">
        {[
          { id: 'projects', icon: FileText, label: 'Projects' },
          { id: 'schedule', icon: Calendar, label: 'Schedule' },
          { id: 'budget', icon: DollarSign, label: 'Budget' },
          { id: 'reports', icon: Camera, label: 'Reports' }
        ].map(tab => (
          <Button
            key={tab.id}
            variant="ghost"
            onClick={() => setActiveView(tab.id)}
            className={`flex flex-col items-center py-2 px-4 ${
              activeView === tab.id ? 'text-blue-500' : 'text-gray-600'
            }`}
            data-testid={`button-tab-${tab.id}`}
          >
            <tab.icon className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">{tab.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );

  if (selectedProperty) {
    return <PropertyDetail property={selectedProperty} />;
  }

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      {activeView === 'projects' && <ProjectsView />}
      
      {activeView === 'schedule' && (
        <div className="bg-gray-50 min-h-screen">
          <div className="bg-white px-4 py-6 rounded-b-3xl shadow-sm">
            <h1 className="text-3xl font-bold text-gray-900">Master Schedule</h1>
            <p className="text-gray-600 mt-1">Critical path & gates</p>
          </div>
          <div className="p-4 space-y-3">
            {properties.map(property => (
              <Card key={property.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold">{property.address}</h3>
                    <div className="text-right">
                      <span className={`text-sm ${property.scheduleAdherence < 85 ? 'text-red-600' : 'text-blue-600'}`}>
                        {property.scheduleAdherence}% on-time
                      </span>
                    </div>
                  </div>
                  <Card className="bg-yellow-50">
                    <CardContent className="p-2">
                      <p className="text-sm font-medium text-yellow-800">Next Milestone</p>
                      <p className="text-xs text-yellow-700">
                        Due: {property.dueDate ? new Date(property.dueDate).toLocaleDateString() : 'TBD'}
                      </p>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="pb-16"></div>
      <TabBar />
    </div>
  );
};

export default ConstructionPMApp;
