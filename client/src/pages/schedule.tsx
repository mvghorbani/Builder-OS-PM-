import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/layouts/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  BarChart3,
  LineChart,
  Target,
  FileText,
  Zap,
  TrendingUp,
  MapPin,
  Activity
} from "lucide-react";

export default function Schedule() {
  const { user, isLoading } = useAuth();
  const [activeView, setActiveView] = useState('schedule');

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
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Schedule</h1>
                <p className="text-base sm:text-lg text-gray-600">Project timelines, milestones, and resource planning</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Live Updates
                </Badge>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Calendar className="w-4 h-4 mr-2" />
                  New Schedule
                </Button>
              </div>
            </div>
          </header>

          {/* Schedule Overview */}
          <div className="mb-8 sm:mb-12 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Active Milestones</p>
                    <p className="text-3xl font-bold text-gray-900">24</p>
                    <p className="text-xs text-blue-600 mt-1">Across 8 projects</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">On Schedule</p>
                    <p className="text-3xl font-bold text-gray-900">18</p>
                    <p className="text-xs text-green-600 mt-1">75% success rate</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">At Risk</p>
                    <p className="text-3xl font-bold text-gray-900">4</p>
                    <p className="text-xs text-yellow-600 mt-1">Requires attention</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Overdue</p>
                    <p className="text-3xl font-bold text-gray-900">2</p>
                    <p className="text-xs text-red-600 mt-1">Immediate action</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Schedule Tools */}
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {/* Gantt Chart */}
            <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Gantt Chart
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Visual project timeline with dependencies, critical path, and resource allocation.</p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Open Gantt View
                </Button>
              </CardContent>
            </Card>

            {/* Calendar View */}
            <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  Calendar View
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Monthly and weekly calendar with milestones, deadlines, and team schedules.</p>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  View Calendar
                </Button>
              </CardContent>
            </Card>

            {/* Critical Path */}
            <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Critical Path Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Identify critical tasks that impact project completion dates.</p>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Analyze Critical Path
                </Button>
              </CardContent>
            </Card>

            {/* Resource Planning */}
            <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-600" />
                  Resource Planning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Manage team assignments, equipment allocation, and workforce scheduling.</p>
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  Plan Resources
                </Button>
              </CardContent>
            </Card>

            {/* Milestone Tracking */}
            <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-red-600" />
                  Milestone Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Track project milestones, completion status, and delivery schedules.</p>
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  View Milestones
                </Button>
              </CardContent>
            </Card>

            {/* Schedule Reports */}
            <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Schedule Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Generate detailed schedule reports and performance analytics.</p>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Generate Reports
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Deadlines */}
          <section className="mt-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Upcoming Deadlines</h2>
            <div className="space-y-4">
              <Card className="border border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-red-900 mb-1">Foundation Inspection</h3>
                        <p className="text-sm text-red-800 mb-2">Downtown Office Renovation</p>
                        <div className="flex items-center gap-2 text-xs text-red-700">
                          <MapPin className="w-3 h-3" />
                          Due: Tomorrow, 2:00 PM
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-red-600 text-white">Overdue</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-yellow-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-yellow-900 mb-1">Electrical Rough-in Complete</h3>
                        <p className="text-sm text-yellow-800 mb-2">Harbor View Apartments</p>
                        <div className="flex items-center gap-2 text-xs text-yellow-700">
                          <MapPin className="w-3 h-3" />
                          Due: Dec 15, 2024
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-yellow-600 text-white">This Week</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Activity className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-blue-900 mb-1">Drywall Installation Start</h3>
                        <p className="text-sm text-blue-800 mb-2">Residential Complex Phase 2</p>
                        <div className="flex items-center gap-2 text-xs text-blue-700">
                          <MapPin className="w-3 h-3" />
                          Scheduled: Dec 20, 2024
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-blue-600 text-white">Upcoming</Badge>
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