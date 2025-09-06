
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/layouts/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import {
  FileCheck,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Calendar,
  MapPin,
  Building,
  Search,
  Download,
  Upload,
  Shield
} from "lucide-react";

export default function Permits() {
  const { user, isLoading } = useAuth();
  const [activeView, setActiveView] = useState('permits');

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
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Permits & Compliance</h1>
                <p className="text-base sm:text-lg text-gray-600">Manage permits, inspections, and regulatory compliance</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" className="flex items-center gap-1">
                  <Search className="w-4 h-4" />
                  Permit Lookup
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <FileCheck className="w-4 h-4 mr-2" />
                  New Permit
                </Button>
              </div>
            </div>
          </header>

          {/* Permit Overview */}
          <div className="mb-8 sm:mb-12 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Permits</p>
                    <p className="text-3xl font-bold text-gray-900">32</p>
                    <p className="text-xs text-blue-600 mt-1">Active applications</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileCheck className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Approved</p>
                    <p className="text-3xl font-bold text-gray-900">18</p>
                    <p className="text-xs text-green-600 mt-1">Ready to proceed</p>
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
                    <p className="text-sm text-gray-600 mb-1">Under Review</p>
                    <p className="text-3xl font-bold text-gray-900">11</p>
                    <p className="text-xs text-yellow-600 mt-1">Processing</p>
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
                    <p className="text-sm text-gray-600 mb-1">Issues</p>
                    <p className="text-3xl font-bold text-gray-900">3</p>
                    <p className="text-xs text-red-600 mt-1">Requires attention</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Permit Management Tools */}
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {/* Permit Applications */}
            <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-blue-600" />
                  Permit Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Submit and track permit applications across all jurisdictions.</p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Manage Applications
                </Button>
              </CardContent>
            </Card>

            {/* Inspection Scheduling */}
            <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  Inspection Scheduling
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Schedule and track inspections with automated reminders.</p>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Schedule Inspections
                </Button>
              </CardContent>
            </Card>

            {/* Compliance Tracking */}
            <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  Compliance Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Monitor regulatory compliance and requirement changes.</p>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Track Compliance
                </Button>
              </CardContent>
            </Card>

            {/* Document Management */}
            <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-orange-600" />
                  Document Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Organize and manage all permit-related documentation.</p>
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  Manage Documents
                </Button>
              </CardContent>
            </Card>

            {/* Permit Search */}
            <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-red-600" />
                  Permit Lookup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Search and verify permit status across jurisdictions.</p>
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  Search Permits
                </Button>
              </CardContent>
            </Card>

            {/* Compliance Reports */}
            <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-indigo-600" />
                  Compliance Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Generate compliance reports and permit summaries.</p>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Generate Reports
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Active Permits */}
          <section className="mt-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Recent Permit Activity</h2>
            <div className="space-y-4">
              <Card className="border border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-green-900 mb-1">Building Permit #B-2024-1456</h3>
                        <p className="text-sm text-green-800 mb-2">717 S Palmway Development - Structural modifications approved</p>
                        <div className="flex items-center gap-4 text-xs text-green-700">
                          <div className="flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            San Francisco Building Dept.
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Approved: Dec 10, 2024
                          </div>
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-green-600 text-white">Approved</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-yellow-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-yellow-900 mb-1">Electrical Permit #E-2024-3789</h3>
                        <p className="text-sm text-yellow-800 mb-2">284 Lytton Project - Electrical system upgrade</p>
                        <div className="flex items-center gap-4 text-xs text-yellow-700">
                          <div className="flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            Oakland Building Dept.
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Submitted: Dec 5, 2024
                          </div>
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-yellow-600 text-white">Under Review</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-red-900 mb-1">Plumbing Permit #P-2024-2134</h3>
                        <p className="text-sm text-red-800 mb-2">128 18th Ave Construction - Additional documentation required</p>
                        <div className="flex items-center gap-4 text-xs text-red-700">
                          <div className="flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            San Jose Building Dept.
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Response Due: Dec 18, 2024
                          </div>
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-red-600 text-white">Action Required</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Upcoming Inspections */}
          <section className="mt-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Upcoming Inspections</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">Foundation Inspection</h3>
                      <p className="text-sm text-blue-800 mb-2">Downtown Office Renovation</p>
                      <div className="space-y-1 text-xs text-blue-700">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          December 15, 2024 at 10:00 AM
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          123 Market Street, San Francisco
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-green-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-green-900 mb-1">Electrical Rough-in</h3>
                      <p className="text-sm text-green-800 mb-2">284 Lytton Project</p>
                      <div className="space-y-1 text-xs text-green-700">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          December 18, 2024 at 2:00 PM
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          284 Lytton Ave, Palo Alto
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-purple-200 bg-purple-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-purple-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-purple-900 mb-1">Framing Inspection</h3>
                      <p className="text-sm text-purple-800 mb-2">128 18th Ave Construction</p>
                      <div className="space-y-1 text-xs text-purple-700">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          December 20, 2024 at 9:00 AM
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          789 Residential Way, San Jose
                        </div>
                      </div>
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
