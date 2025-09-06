
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

export default function Analytics() {
  const { user, isLoading } = useAuth();

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10">
          {/* Header */}
          <header className="mb-8 sm:mb-12">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 font-serif">Analytics</h1>
                <p className="text-base sm:text-lg text-gray-600">Advanced insights and performance metrics</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="px-4 py-2 bg-white/70 backdrop-blur-md border border-blue-200/60 rounded-full text-blue-700 flex items-center gap-2 shadow-lg">
                  <Brain className="w-4 h-4" />
                  <span className="text-sm font-medium">AI-Powered</span>
                </div>
                <div className="px-4 py-2 bg-blue-500/80 backdrop-blur-md border border-blue-400/50 rounded-full text-white flex items-center gap-2 shadow-lg">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-medium">Real-time</span>
                </div>
              </div>
            </div>
          </header>

          {/* Quick Stats */}
          <div className="mb-8 sm:mb-12 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white/80 backdrop-blur-xl border border-blue-200/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1 font-serif">Performance Score</p>
                  <p className="text-3xl font-bold text-gray-800">87%</p>
                  <p className="text-xs text-blue-600 mt-1 font-medium">↑ 5% from last month</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-gray-200/40 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1 font-serif">Budget Efficiency</p>
                  <p className="text-3xl font-bold text-gray-800">92%</p>
                  <p className="text-xs text-gray-500 mt-1 font-medium">On target</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center shadow-md">
                  <Target className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-blue-50/60 backdrop-blur-xl border border-blue-300/40 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 mb-1 font-serif">Schedule Adherence</p>
                  <p className="text-3xl font-bold text-blue-800">78%</p>
                  <p className="text-xs text-blue-600 mt-1 font-medium">Needs attention</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-300 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gray-100/70 backdrop-blur-xl border border-gray-300/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700 mb-1 font-serif">Risk Alerts</p>
                  <p className="text-3xl font-bold text-gray-800">3</p>
                  <p className="text-xs text-gray-600 mt-1 font-medium">Requires review</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-700 rounded-xl flex items-center justify-center shadow-md">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Modules */}
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {/* Project Performance */}
            <div className="bg-white/70 backdrop-blur-xl border border-blue-200/40 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6">
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 font-serif">Project Performance</h3>
                </div>
                <p className="text-gray-600 mb-6">Track completion rates, milestone achievements, and overall project health.</p>
                <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
                  View Performance Dashboard
                </button>
              </div>
            </div>

            {/* Financial Analytics */}
            <div className="bg-white/70 backdrop-blur-xl border border-gray-200/40 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6">
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center shadow-md">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 font-serif">Financial Analytics</h3>
                </div>
                <p className="text-gray-600 mb-6">Budget variance analysis, cost forecasting, and financial performance metrics.</p>
                <button className="w-full py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-400 hover:to-gray-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
                  View Financial Reports
                </button>
              </div>
            </div>

            {/* Resource Utilization */}
            <div className="bg-blue-50/60 backdrop-blur-xl border border-blue-300/40 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6">
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-300 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
                    <PieChart className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-blue-800 font-serif">Resource Utilization</h3>
                </div>
                <p className="text-blue-700 mb-6">Labor efficiency, equipment usage, and material consumption analysis.</p>
                <button className="w-full py-3 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-300 hover:to-blue-400 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
                  View Resource Analytics
                </button>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="bg-gray-100/70 backdrop-blur-xl border border-gray-300/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6">
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-700 rounded-xl flex items-center justify-center shadow-md">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 font-serif">Risk Assessment</h3>
                </div>
                <p className="text-gray-700 mb-6">AI-powered risk identification, impact analysis, and mitigation strategies.</p>
                <button className="w-full py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
                  View Risk Dashboard
                </button>
              </div>
            </div>

            {/* Timeline Analytics */}
            <div className="bg-white/70 backdrop-blur-xl border border-blue-200/40 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6">
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                    <LineChart className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 font-serif">Timeline Analytics</h3>
                </div>
                <p className="text-gray-600 mb-6">Schedule variance, critical path analysis, and completion forecasts.</p>
                <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
                  View Timeline Reports
                </button>
              </div>
            </div>

            {/* Custom Reports */}
            <div className="bg-gray-50/80 backdrop-blur-xl border border-gray-300/40 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6">
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center shadow-md">
                    <FileBarChart className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 font-serif">Custom Reports</h3>
                </div>
                <p className="text-gray-600 mb-6">Build custom analytics dashboards and generate tailored reports.</p>
                <button className="w-full py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-400 hover:to-gray-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
                  Create Custom Report
                </button>
              </div>
            </div>
          </div>

          {/* Recent Insights */}
          <section className="mt-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 font-serif">Recent Insights</h2>
            <div className="space-y-4">
              <div className="bg-blue-100/70 backdrop-blur-xl border border-blue-300/50 rounded-2xl shadow-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900 mb-2 font-serif">Budget Optimization Opportunity</h3>
                    <p className="text-sm text-blue-800">AI analysis suggests reallocating 15% of materials budget could improve efficiency by 8%.</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-100/80 backdrop-blur-xl border border-gray-300/60 rounded-2xl shadow-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-700 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2 font-serif">Schedule Risk Detected</h3>
                    <p className="text-sm text-gray-800">Downtown Office project showing 23% delay risk. Consider resource reallocation.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-xl border border-blue-200/40 rounded-2xl shadow-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2 font-serif">Performance Improvement</h3>
                    <p className="text-sm text-gray-800">Overall project efficiency increased by 12% compared to last quarter.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
