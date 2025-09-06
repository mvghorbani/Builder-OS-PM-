
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/layouts/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import {
  Users,
  Star,
  MapPin,
  Phone,
  Mail,
  FileText,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  Building,
  Wrench,
  Truck
} from "lucide-react";

export default function Vendors() {
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
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10">
          {/* Header */}
          <header className="mb-8 sm:mb-12">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Vendors</h1>
                <p className="text-base sm:text-lg text-gray-600">Contractor and supplier management</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  Import Vendors
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Users className="w-4 h-4 mr-2" />
                  Add Vendor
                </Button>
              </div>
            </div>
          </header>

          {/* Vendor Overview */}
          <div className="mb-8 sm:mb-12 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Vendors</p>
                    <p className="text-3xl font-bold text-gray-900">47</p>
                    <p className="text-xs text-blue-600 mt-1">Active contractors</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Certified</p>
                    <p className="text-3xl font-bold text-gray-900">42</p>
                    <p className="text-xs text-green-600 mt-1">89% compliance</p>
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
                    <p className="text-sm text-gray-600 mb-1">Average Rating</p>
                    <p className="text-3xl font-bold text-gray-900">4.6</p>
                    <p className="text-xs text-yellow-600 mt-1">★★★★★</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pending Issues</p>
                    <p className="text-3xl font-bold text-gray-900">3</p>
                    <p className="text-xs text-red-600 mt-1">Requires attention</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vendor Management Tools */}
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {/* Vendor Directory */}
            <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  Vendor Directory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Complete vendor database with contact info, certifications, and performance history.</p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Browse Vendors
                </Button>
              </CardContent>
            </Card>

            {/* Performance Tracking */}
            <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-green-600" />
                  Performance Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Rate and review vendor performance, track quality metrics and delivery times.</p>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  View Performance
                </Button>
              </CardContent>
            </Card>

            {/* Compliance Management */}
            <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  Compliance Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Track insurance, licenses, certifications, and compliance requirements.</p>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Check Compliance
                </Button>
              </CardContent>
            </Card>

            {/* Contract Management */}
            <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-600" />
                  Contract Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Manage contracts, agreements, and vendor documentation.</p>
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  Manage Contracts
                </Button>
              </CardContent>
            </Card>

            {/* Vendor Communication */}
            <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-red-600" />
                  Communication Hub
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Centralized communication platform for vendor coordination and updates.</p>
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  Open Messages
                </Button>
              </CardContent>
            </Card>

            {/* Payment Tracking */}
            <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  Payment Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Track vendor payments, invoices, and payment schedules.</p>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  View Payments
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Featured Vendors */}
          <section className="mt-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Top Performing Vendors</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border border-gray-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Wrench className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Elite Construction Co.</h3>
                        <p className="text-sm text-gray-600">General Contractor</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Certified</Badge>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>4.9/5.0 (127 reviews)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>San Francisco Bay Area</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>23 completed projects</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                      View Profile
                    </Button>
                    <Button size="sm" variant="outline" className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Truck className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Premier Materials Supply</h3>
                        <p className="text-sm text-gray-600">Material Supplier</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Certified</Badge>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>4.7/5.0 (89 reviews)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>San Jose, CA</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>98% on-time delivery</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                      View Profile
                    </Button>
                    <Button size="sm" variant="outline" className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Wrench className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Apex Electrical Services</h3>
                        <p className="text-sm text-gray-600">Electrical Contractor</p>
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>4.5/5.0 (64 reviews)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>Oakland, CA</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-yellow-500" />
                      <span>License renewal pending</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
                      View Profile
                    </Button>
                    <Button size="sm" variant="outline" className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                    </Button>
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
