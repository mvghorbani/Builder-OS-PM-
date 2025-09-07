
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/layouts/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
  Target,
  Calendar,
  DollarSign,
  AlertTriangle,
  FileBarChart,
  LineChart,
  Brain,
  Zap
} from "lucide-react";

// Analytics Data Interfaces
interface ProjectAnalytics {
  id: string;
  name: string;
  status: 'planning' | 'permits' | 'assessment' | 'active' | 'completed' | 'on_hold';
  progress: number;
  totalBudget: number;
  spentBudget: number;
  committedBudget: number;
  budgetVariance: number;
  scheduleAdherence: number;
  scheduleVariance: number;
  safetyIncidents: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  startDate: string;
  endDate: string;
}

interface AnalyticsSummary {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  spentBudget: number;
  averageProgress: number;
  averageScheduleAdherence: number;
  averageBudgetEfficiency: number;
  totalRiskAlerts: number;
  performanceScore: number;
}

export default function Analytics() {
  const { user, isLoading } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  // Sample project data (to be replaced with API call)
  const sampleProjects: ProjectAnalytics[] = [
    {
      id: '1',
      name: '717 S Palmway Development',
      status: 'active',
      progress: 65,
      totalBudget: 2400000,
      spentBudget: 1560000,
      committedBudget: 1800000,
      budgetVariance: -2.5,
      scheduleAdherence: 78,
      scheduleVariance: 5,
      safetyIncidents: 0,
      riskLevel: 'medium',
      startDate: '2024-01-15',
      endDate: '2025-03-31',
    },
    {
      id: '2',
      name: '284 Lytton Commercial',
      status: 'active',
      progress: 85,
      totalBudget: 3200000,
      spentBudget: 2800000,
      committedBudget: 3050000,
      budgetVariance: 3.1,
      scheduleAdherence: 92,
      scheduleVariance: -2,
      safetyIncidents: 1,
      riskLevel: 'low',
      startDate: '2023-11-20',
      endDate: '2024-12-15',
    },
    {
      id: '3',
      name: '128 18th Ave Renovation',
      status: 'completed',
      progress: 100,
      totalBudget: 1800000,
      spentBudget: 1740000,
      committedBudget: 1800000,
      budgetVariance: -3.3,
      scheduleAdherence: 96,
      scheduleVariance: -4,
      safetyIncidents: 0,
      riskLevel: 'low',
      startDate: '2023-08-10',
      endDate: '2024-08-25',
    }
  ];

  // Calculate analytics summary
  const calculateAnalytics = (projects: ProjectAnalytics[]): AnalyticsSummary => {
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalBudget = projects.reduce((sum, p) => sum + p.totalBudget, 0);
    const spentBudget = projects.reduce((sum, p) => sum + p.spentBudget, 0);
    const averageProgress = projects.reduce((sum, p) => sum + p.progress, 0) / projects.length;
    const averageScheduleAdherence = projects.reduce((sum, p) => sum + p.scheduleAdherence, 0) / projects.length;
    const averageBudgetEfficiency = 100 - Math.abs(projects.reduce((sum, p) => sum + p.budgetVariance, 0) / projects.length);
    const totalRiskAlerts = projects.filter(p => ['medium', 'high', 'critical'].includes(p.riskLevel)).length;
    
    // Performance score calculation (weighted average)
    const performanceScore = Math.round(
      (averageProgress * 0.3) +
      (averageScheduleAdherence * 0.35) +
      (averageBudgetEfficiency * 0.25) +
      ((projects.length - totalRiskAlerts) / projects.length * 100 * 0.1)
    );

    return {
      totalProjects: projects.length,
      activeProjects,
      completedProjects,
      totalBudget,
      spentBudget,
      averageProgress: Math.round(averageProgress),
      averageScheduleAdherence: Math.round(averageScheduleAdherence),
      averageBudgetEfficiency: Math.round(averageBudgetEfficiency),
      totalRiskAlerts,
      performanceScore
    };
  };

  // Initialize analytics on component mount
  useEffect(() => {
    const analyticsData = calculateAnalytics(sampleProjects);
    setAnalytics(analyticsData);
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

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

  return (
    <MainLayout>
      <div className="min-h-screen relative" style={{
        background: 'radial-gradient(ellipse at top left, #dbeafe 0%, #f0f9ff 30%, #ffffff 60%, #f8fafc 90%, #e2e8f0 100%)'
      }}>
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10">
          {/* Header */}
          <header className="mb-8 sm:mb-12">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 font-serif">Analytics</h1>
                <p className="text-base sm:text-lg text-gray-600">Advanced insights and performance metrics</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="px-4 py-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-blue-600 flex items-center gap-2 shadow-lg">
                  <Brain className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">AI-Powered</span>
                </div>
                <div className="px-4 py-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-blue-600 flex items-center gap-2 shadow-lg">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Real-time</span>
                </div>
              </div>
            </div>
          </header>

          {/* Quick Stats */}
          {analytics && (
            <div className="mb-8 sm:mb-12 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="relative bg-gradient-to-br from-white/40 via-white/20 to-white/10 backdrop-blur-2xl border border-white/40 rounded-2xl p-6 hover:from-white/50 hover:via-white/30 hover:to-white/20 transition-all duration-300" style={{
                boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 0 rgba(255, 255, 255, 0.2)'
              }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-800 mb-1 font-serif">Performance Score</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.performanceScore}%</p>
                    <p className="text-xs text-blue-600 mt-1 font-medium">
                      {analytics.performanceScore >= 85 ? '↑ Excellent' : analytics.performanceScore >= 70 ? '→ Good' : '↓ Needs improvement'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="relative bg-gradient-to-br from-white/40 via-white/20 to-white/10 backdrop-blur-2xl border border-white/40 rounded-2xl p-6 hover:from-white/50 hover:via-white/30 hover:to-white/20 transition-all duration-300" style={{
                boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 0 rgba(255, 255, 255, 0.2)'
              }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-800 mb-1 font-serif">Budget Efficiency</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.averageBudgetEfficiency}%</p>
                    <p className="text-xs text-blue-600 mt-1 font-medium">
                      {analytics.averageBudgetEfficiency >= 95 ? 'Excellent' : analytics.averageBudgetEfficiency >= 85 ? 'Good' : 'Monitor closely'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="relative bg-gradient-to-br from-white/40 via-white/20 to-white/10 backdrop-blur-2xl border border-white/40 rounded-2xl p-6 hover:from-white/50 hover:via-white/30 hover:to-white/20 transition-all duration-300" style={{
                boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 0 rgba(255, 255, 255, 0.2)'
              }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-800 mb-1 font-serif">Schedule Adherence</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.averageScheduleAdherence}%</p>
                    <p className="text-xs text-blue-600 mt-1 font-medium">
                      {analytics.averageScheduleAdherence >= 90 ? 'On track' : analytics.averageScheduleAdherence >= 75 ? 'Minor delays' : 'Needs attention'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="relative bg-gradient-to-br from-white/40 via-white/20 to-white/10 backdrop-blur-2xl border border-white/40 rounded-2xl p-6 hover:from-white/50 hover:via-white/30 hover:to-white/20 transition-all duration-300" style={{
                boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 0 rgba(255, 255, 255, 0.2)'
              }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-800 mb-1 font-serif">Risk Alerts</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.totalRiskAlerts}</p>
                    <p className="text-xs text-blue-600 mt-1 font-medium">
                      {analytics.totalRiskAlerts === 0 ? 'All clear' : analytics.totalRiskAlerts <= 2 ? 'Monitor' : 'Requires review'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Modules */}
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {/* Project Performance */}
            <div className="relative rounded-2xl p-6 hover:backdrop-brightness-110 transition-all duration-500" style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px) saturate(120%)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 25px 45px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(255, 255, 255, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)'
            }}>
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 font-serif">Project Performance</h3>
                </div>
                <p className="text-gray-800 mb-6">Track completion rates, milestone achievements, and overall project health.</p>
                <button className="w-full py-3 text-blue-600 rounded-xl font-medium transition-all duration-500 hover:backdrop-brightness-105" style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(15px) saturate(110%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                }}>
                  View Performance Dashboard
                </button>
              </div>
            </div>

            {/* Financial Analytics */}
            <div className="relative rounded-2xl p-6 hover:backdrop-brightness-110 transition-all duration-500" style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px) saturate(120%)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 25px 45px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(255, 255, 255, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)'
            }}>
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 font-serif">Financial Analytics</h3>
                </div>
                <p className="text-gray-800 mb-6">Budget variance analysis, cost forecasting, and financial performance metrics.</p>
                <button className="w-full py-3 text-blue-600 rounded-xl font-medium transition-all duration-500 hover:backdrop-brightness-105" style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(15px) saturate(110%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                }}>
                  View Financial Reports
                </button>
              </div>
            </div>

            {/* Resource Utilization */}
            <div className="relative rounded-2xl p-6 hover:backdrop-brightness-110 transition-all duration-500" style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px) saturate(120%)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 25px 45px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(255, 255, 255, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)'
            }}>
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <PieChart className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 font-serif">Resource Utilization</h3>
                </div>
                <p className="text-gray-800 mb-6">Labor efficiency, equipment usage, and material consumption analysis.</p>
                <button className="w-full py-3 text-blue-600 rounded-xl font-medium transition-all duration-500 hover:backdrop-brightness-105" style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(15px) saturate(110%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                }}>
                  View Resource Analytics
                </button>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="relative rounded-2xl p-6 hover:backdrop-brightness-110 transition-all duration-500" style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px) saturate(120%)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 25px 45px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(255, 255, 255, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)'
            }}>
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 font-serif">Risk Assessment</h3>
                </div>
                <p className="text-gray-800 mb-6">AI-powered risk identification, impact analysis, and mitigation strategies.</p>
                <button className="w-full py-3 text-blue-600 rounded-xl font-medium transition-all duration-500 hover:backdrop-brightness-105" style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(15px) saturate(110%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                }}>
                  View Risk Dashboard
                </button>
              </div>
            </div>

            {/* Timeline Analytics */}
            <div className="relative rounded-2xl p-6 hover:backdrop-brightness-110 transition-all duration-500" style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px) saturate(120%)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 25px 45px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(255, 255, 255, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)'
            }}>
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <LineChart className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 font-serif">Timeline Analytics</h3>
                </div>
                <p className="text-gray-800 mb-6">Schedule variance, critical path analysis, and completion forecasts.</p>
                <button className="w-full py-3 text-blue-600 rounded-xl font-medium transition-all duration-500 hover:backdrop-brightness-105" style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(15px) saturate(110%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                }}>
                  View Timeline Reports
                </button>
              </div>
            </div>

            {/* Custom Reports */}
            <div className="relative rounded-2xl p-6 hover:backdrop-brightness-110 transition-all duration-500" style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px) saturate(120%)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 25px 45px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(255, 255, 255, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)'
            }}>
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <FileBarChart className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 font-serif">Custom Reports</h3>
                </div>
                <p className="text-gray-800 mb-6">Build custom analytics dashboards and generate tailored reports.</p>
                <button className="w-full py-3 text-blue-600 rounded-xl font-medium transition-all duration-500 hover:backdrop-brightness-105" style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(15px) saturate(110%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                }}>
                  Create Custom Report
                </button>
              </div>
            </div>
          </div>

          {/* Recent Insights */}
          <section className="mt-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 font-serif">Recent Insights</h2>
            <div className="space-y-4">
              {analytics && (
                <>
                  <div className="relative bg-gradient-to-br from-white/40 via-white/20 to-white/10 backdrop-blur-2xl border border-white/40 rounded-2xl p-6 hover:from-white/50 hover:via-white/30 hover:to-white/20 transition-all duration-300" style={{
                    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 0 rgba(255, 255, 255, 0.2)'
                  }}>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Brain className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-2 font-serif">Budget Analysis</h3>
                        <p className="text-sm text-gray-800">
                          Portfolio of {analytics.totalProjects} projects with {formatCurrency(analytics.totalBudget)} total budget. 
                          Current expenditure efficiency at {analytics.averageBudgetEfficiency}%.
                        </p>
                      </div>
                    </div>
                  </div>

                  {analytics.totalRiskAlerts > 0 && (
                    <div className="relative bg-gradient-to-br from-white/40 via-white/20 to-white/10 backdrop-blur-2xl border border-white/40 rounded-2xl p-6 hover:from-white/50 hover:via-white/30 hover:to-white/20 transition-all duration-300" style={{
                      boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 0 rgba(255, 255, 255, 0.2)'
                    }}>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 mb-2 font-serif">Risk Monitoring</h3>
                          <p className="text-sm text-gray-800">
                            {analytics.totalRiskAlerts} project{analytics.totalRiskAlerts > 1 ? 's' : ''} requiring attention. 
                            Review risk assessment for proactive management.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="relative bg-gradient-to-br from-white/40 via-white/20 to-white/10 backdrop-blur-2xl border border-white/40 rounded-2xl p-6 hover:from-white/50 hover:via-white/30 hover:to-white/20 transition-all duration-300" style={{
                    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 0 rgba(255, 255, 255, 0.2)'
                  }}>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-2 font-serif">Performance Overview</h3>
                        <p className="text-sm text-gray-800">
                          {analytics.activeProjects} active projects with {analytics.averageProgress}% average completion. 
                          Schedule adherence at {analytics.averageScheduleAdherence}%.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
