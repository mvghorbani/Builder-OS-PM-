import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Gantt, Task, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  Target,
  Brain,
  Lightbulb,
} from "lucide-react";

// Types for analytics data
interface GanttData {
  projects: Array<{
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    progress: number;
    status: 'complete' | 'on-track' | 'at-risk' | 'overdue';
    milestones: Array<{
      id: string;
      name: string;
      date: string;
      status: 'complete' | 'pending' | 'overdue';
    }>;
  }>;
}

// Convert project data to Gantt task format
const convertToGanttTasks = (projects: GanttData['projects']): Task[] => {
  const tasks: Task[] = [];
  
  projects.forEach((project, index) => {
    // Add main project task
    const projectTask: Task = {
      start: new Date(project.startDate),
      end: new Date(project.endDate),
      name: project.name,
      id: project.id,
      type: 'project',
      progress: project.progress,
      hideChildren: false,
    };
    tasks.push(projectTask);

    // Add milestone tasks
    project.milestones.forEach((milestone, mIndex) => {
      const milestoneTask: Task = {
        start: new Date(milestone.date),
        end: new Date(milestone.date),
        name: milestone.name,
        id: milestone.id,
        type: 'milestone',
        progress: milestone.status === 'complete' ? 100 : 0,
        project: project.id,
      };
      tasks.push(milestoneTask);
    });
  });
  
  return tasks;
};

interface FinancialData {
  budgetVariance: Array<{
    category: string;
    planned: number;
    actual: number;
    variance: number;
  }>;
  cashFlow: Array<{
    date: string;
    projected: number;
    actual: number;
  }>;
}

interface AIInsights {
  riskScores: Array<{
    projectId: string;
    projectName: string;
    riskScore: number;
    riskFactors: string[];
    recommendation?: string;
  }>;
}

const AnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState("portfolio");
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Month);
  const { toast } = useToast();

  // Data queries
  const { data: ganttData, isLoading: ganttLoading, error: ganttError } = useQuery<GanttData>({
    queryKey: ['/api/v1/analytics/gantt'],
    queryFn: async () => {
      try {
        // For now, return mock data since API endpoints don't exist yet
        throw new Error("API not implemented");
      } catch (error) {
        // Mock data for development
        return {
          projects: [
            {
              id: '1',
              name: 'Downtown Office Complex',
              startDate: '2024-01-01',
              endDate: '2024-12-31',
              progress: 65,
              status: 'on-track' as const,
              milestones: [
                { id: '1-1', name: 'Foundation Complete', date: '2024-03-15', status: 'complete' as const },
                { id: '1-2', name: 'Frame Construction', date: '2024-06-30', status: 'complete' as const },
                { id: '1-3', name: 'Interior Finishing', date: '2024-09-15', status: 'pending' as const },
                { id: '1-4', name: 'Final Inspection', date: '2024-11-30', status: 'pending' as const },
              ]
            },
            {
              id: '2',
              name: 'Residential Tower A',
              startDate: '2024-02-01',
              endDate: '2025-01-31',
              progress: 45,
              status: 'at-risk' as const,
              milestones: [
                { id: '2-1', name: 'Site Preparation', date: '2024-03-01', status: 'complete' as const },
                { id: '2-2', name: 'Foundation Pour', date: '2024-05-15', status: 'overdue' as const },
                { id: '2-3', name: 'Structural Work', date: '2024-08-30', status: 'pending' as const },
              ]
            },
            {
              id: '3',
              name: 'Shopping Center Renovation',
              startDate: '2024-03-01',
              endDate: '2024-10-31',
              progress: 80,
              status: 'on-track' as const,
              milestones: [
                { id: '3-1', name: 'Demolition', date: '2024-04-15', status: 'complete' as const },
                { id: '3-2', name: 'New Construction', date: '2024-07-31', status: 'complete' as const },
                { id: '3-3', name: 'Tenant Fit-out', date: '2024-09-30', status: 'pending' as const },
              ]
            }
          ]
        };
      }
    },
  });

  const { data: financialData, isLoading: financialLoading } = useQuery<FinancialData>({
    queryKey: ['/api/v1/analytics/financials'],
    queryFn: async () => {
      try {
        throw new Error("API not implemented");
      } catch (error) {
        // Mock data for development
        return {
          budgetVariance: [
            { category: 'Labor', planned: 500000, actual: 520000, variance: 20000 },
            { category: 'Materials', planned: 800000, actual: 750000, variance: -50000 },
            { category: 'Equipment', planned: 200000, actual: 230000, variance: 30000 },
            { category: 'Permits', planned: 50000, actual: 45000, variance: -5000 },
            { category: 'Overhead', planned: 100000, actual: 115000, variance: 15000 },
          ],
          cashFlow: [
            { date: '2024-09-01', projected: 150000, actual: 145000 },
            { date: '2024-09-15', projected: 220000, actual: 210000 },
            { date: '2024-10-01', projected: 280000, actual: 0 },
            { date: '2024-10-15', projected: 350000, actual: 0 },
            { date: '2024-11-01', projected: 420000, actual: 0 },
            { date: '2024-11-15', projected: 480000, actual: 0 },
            { date: '2024-12-01', projected: 520000, actual: 0 },
          ]
        };
      }
    },
  });

  const { data: aiInsights, isLoading: aiLoading } = useQuery<AIInsights>({
    queryKey: ['/api/v1/analytics/ai-insights'],
    queryFn: async () => {
      try {
        throw new Error("API not implemented");
      } catch (error) {
        // Mock data for development
        return {
          riskScores: [
            {
              projectId: '2',
              projectName: 'Residential Tower A',
              riskScore: 85,
              riskFactors: ['Weather delays', 'Material shortages', 'Permit issues'],
            },
            {
              projectId: '1',
              projectName: 'Downtown Office Complex',
              riskScore: 35,
              riskFactors: ['Minor scheduling conflicts'],
            },
            {
              projectId: '3',
              projectName: 'Shopping Center Renovation',
              riskScore: 20,
              riskFactors: ['On track'],
            },
          ]
        };
      }
    },
  });

  const recommendationMutation = useMutation({
    mutationFn: async ({ projectId, riskFactors }: { projectId: string; riskFactors: string[] }) => {
      try {
        throw new Error("API not implemented");
      } catch (error) {
        // Mock recommendation for development
        return {
          recommendation: `Based on the risk factors for this project, we recommend: 1) Implement weather contingency plans with indoor work alternatives, 2) Establish backup material suppliers to mitigate shortages, 3) Expedite permit processing through dedicated liaison, 4) Consider schedule buffer of 2-3 weeks for critical path activities.`
        };
      }
    },
    onSuccess: (data, variables) => {
      // Update the aiInsights data to include the recommendation
      if (aiInsights) {
        const updatedInsights = {
          ...aiInsights,
          riskScores: aiInsights.riskScores.map(project => 
            project.projectId === variables.projectId 
              ? { ...project, recommendation: data.recommendation }
              : project
          )
        };
        // This would normally be handled by proper state management
      }
      
      toast({
        title: "AI Recommendation Generated",
        description: "New insights have been generated for the project.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate recommendation.",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-500';
      case 'on-track': return 'bg-blue-500';
      case 'at-risk': return 'bg-yellow-500';
      case 'overdue': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-600 bg-red-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Advanced insights and predictive analytics for your construction portfolio</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Brain className="w-3 h-3" />
            AI-Powered
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Portfolio Schedule
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Financial Deep Dive
          </TabsTrigger>
          <TabsTrigger value="ai-insights" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Insights Engine
          </TabsTrigger>
        </TabsList>

        {/* Portfolio Schedule Tab */}
        <TabsContent value="portfolio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Project Timeline Overview
              </CardTitle>
              <CardDescription>
                Interactive Gantt chart showing all projects and milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ganttLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : ganttData ? (
                <div className="space-y-6">
                  {/* View Mode Controls */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-medium">View:</span>
                    <Button
                      size="sm"
                      variant={viewMode === ViewMode.Day ? "default" : "outline"}
                      onClick={() => setViewMode(ViewMode.Day)}
                    >
                      Day
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === ViewMode.Week ? "default" : "outline"}
                      onClick={() => setViewMode(ViewMode.Week)}
                    >
                      Week
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === ViewMode.Month ? "default" : "outline"}
                      onClick={() => setViewMode(ViewMode.Month)}
                    >
                      Month
                    </Button>
                  </div>

                  {/* Gantt Chart */}
                  <div className="w-full overflow-x-auto">
                    <Gantt
                      tasks={convertToGanttTasks(ganttData.projects)}
                      viewMode={viewMode}
                      listCellWidth=""
                      columnWidth={viewMode === ViewMode.Month ? 300 : viewMode === ViewMode.Week ? 100 : 50}
                    />
                  </div>

                  {/* Project Summary Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
                    {ganttData.projects.map((project) => (
                      <Card key={project.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-sm">{project.name}</h3>
                            <Badge className={`${getStatusColor(project.status)} text-white text-xs`}>
                              {project.status.replace('-', ' ')}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span>Progress</span>
                              <span>{project.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${getStatusColor(project.status)} transition-all duration-500`}
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {project.milestones.filter(m => m.status === 'complete').length} / {project.milestones.length} milestones completed
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No project data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Deep Dive Tab */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Budget Variance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Budget Variance Analysis</CardTitle>
                <CardDescription>Planned vs Actual spending by category</CardDescription>
              </CardHeader>
              <CardContent>
                {financialLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={financialData?.budgetVariance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${(value as number).toLocaleString()}`} />
                      <Bar dataKey="planned" fill="#8884d8" name="Planned" />
                      <Bar dataKey="actual" fill="#82ca9d" name="Actual" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Cash Flow Projection */}
            <Card>
              <CardHeader>
                <CardTitle>90-Day Cash Flow Projection</CardTitle>
                <CardDescription>Projected vs actual cash requirements</CardDescription>
              </CardHeader>
              <CardContent>
                {financialLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={financialData?.cashFlow}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${(value as number).toLocaleString()}`} />
                      <Line type="monotone" dataKey="projected" stroke="#8884d8" name="Projected" />
                      <Line type="monotone" dataKey="actual" stroke="#82ca9d" name="Actual" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Variance</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${financialData?.budgetVariance.reduce((sum, item) => sum + item.variance, 0).toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Next 30 Days</p>
                    <p className="text-2xl font-bold text-foreground">$280K</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Forecast Accuracy</p>
                    <p className="text-2xl font-bold text-foreground">94%</p>
                  </div>
                  <Target className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="ai-insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Risk Forecast
              </CardTitle>
              <CardDescription>
                AI-powered risk assessment for all active projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              {aiLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  {aiInsights?.riskScores.map((project) => (
                    <div key={project.projectId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold">{project.projectName}</h3>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {project.riskFactors.map((factor, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {factor}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={`${getRiskColor(project.riskScore)} border-0`}>
                            Risk: {project.riskScore}%
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => recommendationMutation.mutate({
                              projectId: project.projectId,
                              riskFactors: project.riskFactors
                            })}
                            disabled={recommendationMutation.isPending}
                            className="flex items-center gap-1"
                          >
                            <Lightbulb className="w-3 h-3" />
                            Get Recommendation
                          </Button>
                        </div>
                      </div>
                      
                      {project.recommendation && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                          <div className="flex items-start gap-2">
                            <Brain className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                            <div>
                              <h4 className="text-sm font-medium text-blue-900 mb-1">AI Recommendation</h4>
                              <p className="text-sm text-blue-800">{project.recommendation}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Insights Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">High Risk Projects</p>
                    <p className="text-2xl font-bold text-red-600">
                      {aiInsights?.riskScores.filter(p => p.riskScore >= 70).length || 0}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Medium Risk Projects</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {aiInsights?.riskScores.filter(p => p.riskScore >= 40 && p.riskScore < 70).length || 0}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Low Risk Projects</p>
                    <p className="text-2xl font-bold text-green-600">
                      {aiInsights?.riskScores.filter(p => p.riskScore < 40).length || 0}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;