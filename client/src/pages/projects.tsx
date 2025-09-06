
import { useState } from "react";
import { Building2, Plus, Search, Filter, Calendar, DollarSign, Users, MapPin } from "lucide-react";
import { MainLayout } from "../layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";

export default function Projects() {
  const [activeView, setActiveView] = useState('projects');

  // Real project data
  const projects = [
    {
      id: '1',
      name: '717 S Palmway Development',
      address: '717 S Palmway',
      status: 'active',
      progress: 65,
      totalBudget: 2400000,
      spentBudget: 1560000,
      startDate: '2024-01-15',
      endDate: '2024-12-31',
      manager: 'MV Ghorbani',
      team: 12
    },
    {
      id: '2',
      name: '284 Lytton Project',
      address: '284 Lytton',
      status: 'active',
      progress: 45,
      totalBudget: 3200000,
      spentBudget: 1440000,
      startDate: '2024-02-01',
      endDate: '2025-01-31',
      manager: 'MV Ghorbani',
      team: 18
    },
    {
      id: '3',
      name: '128 18th Ave Construction',
      address: '128 18th Ave',
      status: 'active',
      progress: 80,
      totalBudget: 1800000,
      spentBudget: 1440000,
      startDate: '2024-03-01',
      endDate: '2024-10-31',
      manager: 'MV Ghorbani',
      team: 8
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <MainLayout activeView={activeView} onViewChange={setActiveView}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10">
          {/* Header */}
          <header className="mb-8 sm:mb-12">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Active Projects</h1>
                <p className="text-base sm:text-lg text-gray-600">Manage and track all construction projects</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" className="flex items-center gap-1">
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </div>
            </div>
          </header>

          {/* Search and Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search projects by name, address, or manager..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="bg-white hover:shadow-lg transition-all duration-300 border border-gray-100">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                        {project.name}
                      </CardTitle>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {project.address}
                      </div>
                    </div>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <DollarSign className="w-4 h-4 mr-1" />
                      Budget
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(project.spentBudget)} / {formatCurrency(project.totalBudget)}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      Timeline
                    </div>
                    <div className="text-sm text-gray-900">
                      {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Team */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-1" />
                        Team: {project.team} members
                      </div>
                      <span className="text-gray-900 font-medium">{project.manager}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                    <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                      Manage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 mb-1">Total Projects</p>
                    <p className="text-3xl font-bold text-blue-900">{projects.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 mb-1">Total Budget</p>
                    <p className="text-3xl font-bold text-green-900">
                      {formatCurrency(projects.reduce((sum, p) => sum + p.totalBudget, 0))}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 mb-1">Avg Progress</p>
                    <p className="text-3xl font-bold text-purple-900">
                      {Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 mb-1">Team Size</p>
                    <p className="text-3xl font-bold text-orange-900">
                      {projects.reduce((sum, p) => sum + p.team, 0)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
