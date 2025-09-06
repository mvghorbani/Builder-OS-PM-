import { useState, useMemo } from "react";
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
import axios from "axios";
import { queryClient } from "@/lib/queryClient";

// Set baseURL once for Replit dev proxying
axios.defaults.baseURL = "";

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

  // Data queries with performance optimizations
  const { data: ganttData, isLoading: ganttLoading, error: ganttError } = useQuery<GanttData>({
    queryKey: ['/api/v1/analytics/gantt'],
    queryFn: async () => (await axios.get('/api/v1/analytics/gantt')).data,
    staleTime: 60_000,  // 1 min
    gcTime: 5 * 60_000, // 5 min
    retry: 1,
  });

  const { data: financialData, isLoading: financialLoading } = useQuery<FinancialData>({
    queryKey: ['/api/v1/analytics/financials'],
    queryFn: async () => (await axios.get('/api/v1/analytics/financials')).data,
    staleTime: 60_000,  // 1 min
    gcTime: 5 * 60_000, // 5 min
    retry: 1,
  });

  const { data: aiInsights, isLoading: aiLoading } = useQuery<AIInsights>({
    queryKey: ['/api/v1/analytics/ai-insights'],
    queryFn: async () => (await axios.get('/api/v1/analytics/ai-insights')).data,
    staleTime: 60_000,  // 1 min
    gcTime: 5 * 60_000, // 5 min
    retry: 1,
  });

  // Memoize expensive computation
  const ganttTasks = useMemo(
    () => (ganttData ? convertToGanttTasks(ganttData.projects) : []),
    [ganttData]
  );

  const recommendationMutation = useMutation({
    mutationFn: async ({ projectId, riskFactors }: { projectId: string; riskFactors: string[] }) => {
      const res = await axios.post('/api/v1/analytics/ai-recommendation', { projectId, riskFactors });
      return res.data; // { recommendation: string }
    },
    onSuccess: (data, variables) => {
      // update the ai-insights cache
      queryClient.setQueryData<AIInsights>(['/api/v1/analytics/ai-insights'], (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          riskScores: prev.riskScores.map(p =>
            p.projectId === variables.projectId
              ? { ...p, recommendation: data.recommendation }
              : p
          )
        };
      });
      
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
                      tasks={ganttTasks}
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