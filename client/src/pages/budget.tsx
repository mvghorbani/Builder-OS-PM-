
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/layouts/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  PieChart,
  BarChart3,
  Calculator,
  FileText,
  CreditCard,
  Target,
  Wallet,
  Receipt
} from "lucide-react";

export default function Budget() {
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
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Budget</h1>
                <p className="text-base sm:text-lg text-gray-600">Financial tracking, cost management, and budget analysis</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  Export Report
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <DollarSign className="w-4 h-4 mr-2" />
                  New Budget Line
                </Button>
              </div>
            </div>
          </header>

          {/* Financial Overview */}
          <div className="mb-8 sm:mb-12 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Budget</p>
                    <p className="text-3xl font-bold text-gray-900">$2.4M</p>
                    <p className="text-xs text-blue-600 mt-1">Across all projects</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Spent</p>
                    <p className="text-3xl font-bold text-gray-900">$1.8M</p>
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      75% utilized
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Remaining</p>
                    <p className="text-3xl font-bold text-gray-900">$600K</p>
                    <p className="text-xs text-purple-600 mt-1">25% available</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Variance</p>
                    <p className="text-3xl font-bold text-gray-900">-$45K</p>
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      Over budget
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Budget Management Tools */}
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {/* Budget Tracking */}
            <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Budget Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Real-time budget monitoring with variance analysis and spending patterns.</p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  View Budget Dashboard
                </Button>
              </CardContent>
            </Card>

            {/* Cost Analysis */}
            <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-green-600" />
                  Cost Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Detailed cost breakdown by category, vendor, and project phase.</p>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Analyze Costs
                </Button>
              </CardContent>
            </Card>

            {/* Budget Calculator */}
            <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-purple-600" />
                  Budget Calculator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Create accurate budget estimates with material, labor, and overhead calculations.</p>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Open Calculator
                </Button>
              </CardContent>
            </Card>

            {/* Expense Management */}
            <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-orange-600" />
                  Expense Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Track receipts, approve expenses, and manage payment schedules.</p>
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  Manage Expenses
                </Button>
              </CardContent>
            </Card>

            {/* Cash Flow */}
            <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-red-600" />
                  Cash Flow Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Predict cash flow requirements and optimize payment timing.</p>
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  View Forecast
                </Button>
              </CardContent>
            </Card>

            {/* Financial Reports */}
            <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Financial Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Generate comprehensive financial reports and budget summaries.</p>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Generate Reports
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Budget Alerts */}
          <section className="mt-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Budget Alerts</h2>
            <div className="space-y-4">
              <Card className="border border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-red-900 mb-1">Budget Exceeded</h3>
                      <p className="text-sm text-red-800 mb-2">717 S Palmway Development is $25,000 over budget in the Materials category.</p>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-600 text-white text-xs">Critical</Badge>
                        <span className="text-xs text-red-700">Requires immediate attention</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-yellow-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 mb-1">Budget Warning</h3>
                      <p className="text-sm text-yellow-800 mb-2">284 Lytton Project has used 85% of allocated Labor budget.</p>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-yellow-600 text-white text-xs">Warning</Badge>
                        <span className="text-xs text-yellow-700">Monitor closely</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">Payment Due</h3>
                      <p className="text-sm text-blue-800 mb-2">Contractor payment of $35,000 due for Electrical work on Phase 2.</p>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-600 text-white text-xs">Due Soon</Badge>
                        <span className="text-xs text-blue-700">Due: December 15, 2024</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Recent Transactions */}
          <section className="mt-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Recent Transactions</h2>
            <Card>
              <CardContent className="p-0">
                <div className="space-y-0">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Receipt className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">ABC Construction Materials</h3>
                        <p className="text-sm text-gray-600">Lumber and steel delivery</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">-$8,450</p>
                      <p className="text-xs text-gray-500">Dec 10, 2024</p>
                    </div>
                  </div>

                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Elite Electrical Services</h3>
                        <p className="text-sm text-gray-600">Rough-in completion payment</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">-$12,300</p>
                      <p className="text-xs text-gray-500">Dec 8, 2024</p>
                    </div>
                  </div>

                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Client Payment Received</h3>
                        <p className="text-sm text-gray-600">Progress payment - Phase 1</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">+$45,000</p>
                      <p className="text-xs text-gray-500">Dec 5, 2024</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
