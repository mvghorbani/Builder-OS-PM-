
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
  const [activeView, setActiveView] = useState('analytics');

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
    <MainLayout activeView={activeView} onViewChange={setActiveView}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10">
          {/* Header */}
          <header className="mb-8 sm:mb-12">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Analytics</h1>
                <p className="text-base sm:text-lg text-gray-600">Advanced insights and performance metrics</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  AI-Powered
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Real-time
                </Badge>
              </div>
            </div>
          </header>

          {/* Quick Stats */}
          <div className="mb-8 sm:mb-12 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Performance Score</p>
                    <p className="text-3xl font-bold text-gray-900">87%</p>
                    <p className="text-xs text-green-600 mt-1">↑ 5% from last month</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Budget Efficiency</p>
                    <p className="text-3xl font-bold text-gray-900">92%</p>
                    <p className="text-xs text-green-600 mt-1">On target</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Schedule Adherence</p>
                    <p className="text-3xl font-bold text-gray-900">78%</p>
                    <p className="text-xs text-yellow-600 mt-1">Needs attention</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Risk Alerts</p>
                    <p className="text-3xl font-bold text-gray-900">3</p>
                    <p className="text-xs text-red-600 mt-1">Requires review</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Modules */}
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {/* Project Performance */}
            <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Project Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Track completion rates, milestone achievements, and overall project health.</p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  View Performance Dashboard
                </Button>
              </CardContent>
            </Card>

            {/* Financial Analytics */}
            <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Financial Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Budget variance analysis, cost forecasting, and financial performance metrics.</p>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  View Financial Reports
                </Button>
              </CardContent>
            </Card>

            {/* Resource Utilization */}
            <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-purple-600" />
                  Resource Utilization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Labor efficiency, equipment usage, and material consumption analysis.</p>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  View Resource Analytics
                </Button>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">AI-powered risk identification, impact analysis, and mitigation strategies.</p>
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  View Risk Dashboard
                </Button>
              </CardContent>
            </Card>

            {/* Timeline Analytics */}
            <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-orange-600" />
                  Timeline Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Schedule variance, critical path analysis, and completion forecasts.</p>
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  View Timeline Reports
                </Button>
              </CardContent>
            </Card>

            {/* Custom Reports */}
            <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileBarChart className="w-5 h-5 text-indigo-600" />
                  Custom Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Build custom analytics dashboards and generate tailored reports.</p>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Create Custom Report
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Insights */}
          <section className="mt-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Recent Insights</h2>
            <div className="space-y-4">
              <Card className="border border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Brain className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">Budget Optimization Opportunity</h3>
                      <p className="text-sm text-blue-800">AI analysis suggests reallocating 15% of materials budget could improve efficiency by 8%.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 mb-1">Schedule Risk Detected</h3>
                      <p className="text-sm text-yellow-800">Downtown Office project showing 23% delay risk. Consider resource reallocation.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-green-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-green-900 mb-1">Performance Improvement</h3>
                      <p className="text-sm text-green-800">Overall project efficiency increased by 12% compared to last quarter.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
