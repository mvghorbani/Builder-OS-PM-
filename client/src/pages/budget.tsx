
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/layouts/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useMemo, useState } from "react";
import { getLocalDataset, computeOverview, buildAlerts, recentTransactions, formatUSD, formatUSDCompact } from "@/lib/budgetLocalAdapter";
import { useLocation } from "wouter";
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

  // TEMP: use local dataset for project P128_18TH_AVE_N to power KPIs and lists
  const dataset = useMemo(() => getLocalDataset('P128_18TH_AVE_N'), []);
  const kpis = useMemo(() => dataset ? computeOverview(dataset) : null, [dataset]);
  const alerts = useMemo(() => dataset ? buildAlerts(dataset) : [], [dataset]);
  const tx = useMemo(() => dataset ? recentTransactions(dataset, 3) : [], [dataset]);
  const [, navigate] = useLocation();

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
                    <p className="md:text-3xl text-2xl font-bold text-gray-900 tabular-nums tracking-tight">
                      <span className="md:inline hidden">{kpis ? formatUSD(kpis.totalBudget) : '$2.4M'}</span>
                      <span className="md:hidden inline">{kpis ? formatUSDCompact(kpis.totalBudget) : '$2.4M'}</span>
                    </p>
                    <p className="text-xs text-blue-600 mt-1">{dataset ? dataset.projectName : 'Across all projects'}</p>
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
                    <p className="md:text-3xl text-2xl font-bold text-gray-900 tabular-nums tracking-tight">
                      <span className="md:inline hidden">{kpis ? formatUSD(kpis.spent) : '$1.8M'}</span>
                      <span className="md:hidden inline">{kpis ? formatUSDCompact(kpis.spent) : '$1.8M'}</span>
                    </p>
                    <p className={`text-xs mt-1 flex items-center gap-1 ${kpis && kpis.spent > (kpis.totalBudget || 1) ? 'text-red-600' : 'text-green-600'}`}>
                      <TrendingUp className="w-3 h-3" />
                      {kpis ? `${Math.round((kpis.spent / (kpis.totalBudget || 1)) * 100)}% utilized` : '75% utilized'}
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
                    <p className="md:text-3xl text-2xl font-bold text-gray-900 tabular-nums tracking-tight">
                      <span className="md:inline hidden">{kpis ? formatUSD(kpis.remaining) : '$600K'}</span>
                      <span className="md:hidden inline">{kpis ? formatUSDCompact(kpis.remaining) : '$600K'}</span>
                    </p>
                    <p className="text-xs text-purple-600 mt-1">{kpis ? `${Math.max(0, Math.round((kpis.remaining / (kpis.totalBudget || 1)) * 100))}% available` : '25% available'}</p>
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
                    <p className="md:text-3xl text-2xl font-bold text-gray-900 tabular-nums tracking-tight">
                      <span className="md:inline hidden">{kpis ? formatUSD(kpis.variance) : '-$45K'}</span>
                      <span className="md:hidden inline">{kpis ? formatUSDCompact(kpis.variance) : '-$45K'}</span>
                    </p>
                    <p className={`text-xs mt-1 flex items-center gap-1 ${kpis && kpis.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {kpis && kpis.variance > 0 ? (
                        <>
                          <TrendingDown className="w-3 h-3" />
                          Over budget
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-3 h-3" />
                          Under budget
                        </>
                      )}
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
                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => navigate('/budget/tracking')}>
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
              {alerts.map((a, idx) => (
                <Card key={idx} className={a.level === 'critical' ? 'border border-red-200 bg-red-50' : a.level === 'warning' ? 'border border-yellow-200 bg-yellow-50' : 'border border-blue-200 bg-blue-50'}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {a.level === 'critical' && <AlertTriangle className="w-5 h-5 text-red-600 mt-1" />}
                      {a.level === 'warning' && <TrendingUp className="w-5 h-5 text-yellow-600 mt-1" />}
                      {a.level === 'info' && <DollarSign className="w-5 h-5 text-blue-600 mt-1" />}
                      <div>
                        <h3 className={`font-semibold mb-1 ${a.level === 'critical' ? 'text-red-900' : a.level === 'warning' ? 'text-yellow-900' : 'text-blue-900'}`}>{a.title}</h3>
                        <p className={`text-sm mb-1 ${a.level === 'critical' ? 'text-red-800' : a.level === 'warning' ? 'text-yellow-800' : 'text-blue-800'}`}>{a.detail}</p>
                        {dataset && (
                          <p className="text-xs text-gray-600">Project: {dataset.projectName}</p>
                        )}
                        <div className="flex items-center gap-2">
                          {a.tag && <Badge className={`${a.level === 'critical' ? 'bg-red-600' : a.level === 'warning' ? 'bg-yellow-600' : 'bg-blue-600'} text-white text-xs`}>{a.tag}</Badge>}
                          <span className={`text-xs ${a.level === 'critical' ? 'text-red-700' : a.level === 'warning' ? 'text-yellow-700' : 'text-blue-700'}`}>Review</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {alerts.length === 0 && (
                <Card className="border border-gray-200 bg-white">
                  <CardContent className="p-4 text-sm text-gray-600">No alerts right now.</CardContent>
                </Card>
              )}
            </div>
          </section>

          {/* Recent Transactions */}
          <section className="mt-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Recent Transactions</h2>
            <Card>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {tx.map((t, i) => (
                    <div key={i} className={`p-4 ${i < tx.length - 1 ? 'border-b border-gray-100' : ''} flex items-center justify-between`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${t.type === 'payment' ? 'bg-purple-100' : 'bg-green-100'} rounded-lg flex items-center justify-center`}>
                          {t.type === 'payment' ? <Wallet className="w-5 h-5 text-purple-600" /> : <Receipt className="w-5 h-5 text-green-600" />}
                        </div>
                        <div>
                          <h3 className="font-semibold">{t.description}</h3>
                          <p className="text-sm text-gray-600">{t.vendor || '—'}</p>
                          {dataset && <p className="text-xs text-gray-500">Project: {dataset.projectName}</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${t.type === 'payment' ? 'text-green-600' : 'text-red-600'}`}>{t.type === 'payment' ? `+${formatUSD(t.amount)}` : `-${formatUSD(t.amount)}`}</p>
                        <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
