
import { useState } from "react";
import { Building2, Plus, Search, Filter, Calendar, DollarSign, Users, MapPin, ChevronDown, TrendingUp, Clock } from "lucide-react";
import { MainLayout } from "../layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

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
      case 'active': return 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30';
      case 'on-hold': return 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30';
      case 'completed': return 'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30';
      default: return 'bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/30';
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

  // Filter projects based on search and filters
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.manager.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    const matchesLocation = locationFilter === "all" || project.address.includes(locationFilter);
    
    return matchesSearch && matchesStatus && matchesLocation;
  });

  // Get unique locations for filter dropdown
  const uniqueLocations = Array.from(new Set(projects.map(p => p.address.split(' ')[0])));

  // Calculate days remaining for projects (more relevant for small business)
  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get project with nearest deadline
  const projectsWithDaysLeft = projects.map(p => ({...p, daysLeft: getDaysRemaining(p.endDate)}));
  const nearestDeadline = Math.min(...projectsWithDaysLeft.map(p => p.daysLeft));
  
  // Calculate profitability (spent vs budget efficiency)
  const avgProfitability = projects.reduce((sum, p) => {
    const efficiency = (p.progress / (p.spentBudget / p.totalBudget)) * 100;
    return sum + (efficiency || 0);
  }, 0) / projects.length;

  return (
    <MainLayout>
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-white">
        {/* Light iOS Blue Floating Orbs Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-100/60 to-blue-200/60 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-gradient-to-r from-blue-50/50 to-blue-100/50 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-3/4 w-32 h-32 bg-gradient-to-r from-gray-100/40 to-blue-50/40 rounded-full blur-2xl animate-pulse delay-500"></div>
          <div className="absolute bottom-1/4 left-1/2 w-40 h-40 bg-gradient-to-r from-blue-200/50 to-blue-300/50 rounded-full blur-3xl animate-pulse delay-2000"></div>
          <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-gradient-to-r from-gray-50/30 to-blue-50/30 rounded-full blur-2xl animate-pulse delay-3000"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6 py-6 sm:py-10">
          {/* Header with Glass Effect */}
          <header className="mb-8 sm:mb-12">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
                  Active Projects
                </h1>
                <p className="text-base sm:text-lg text-gray-600">Manage and track all construction projects</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <button 
                    onClick={() => setFilterOpen(!filterOpen)}
                    className="px-6 py-2.5 bg-white/70 backdrop-blur-md border border-gray-200 rounded-full text-gray-700 hover:bg-white/90 hover:text-gray-900 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                    data-testid="button-filter"
                  >
                    <Filter className="w-4 h-4" />
                    Filter
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${filterOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Filter Dropdown */}
                  {filterOpen && (
                    <div className="absolute top-full mt-2 right-0 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl p-4 shadow-2xl z-50 min-w-[280px]">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                          <select 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 bg-white/80 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                            data-testid="select-status-filter"
                          >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="on-hold">On Hold</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                          <select 
                            value={locationFilter} 
                            onChange={(e) => setLocationFilter(e.target.value)}
                            className="w-full px-3 py-2 bg-white/80 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                            data-testid="select-location-filter"
                          >
                            <option value="all">All Locations</option>
                            {uniqueLocations.map(location => (
                              <option key={location} value={location}>{location}</option>
                            ))}
                          </select>
                        </div>
                        
                        <button 
                          onClick={() => {
                            setStatusFilter("all");
                            setLocationFilter("all");
                            setSearchTerm("");
                          }}
                          className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-300"
                          data-testid="button-clear-filters"
                        >
                          Clear All Filters
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <button className="px-6 py-2.5 bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 hover:from-blue-400 hover:via-blue-500 hover:to-blue-600 text-white rounded-full transition-all duration-300 flex items-center gap-2 shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105 active:scale-95 border border-blue-400/30" data-testid="button-new-project">
                  <Plus className="w-4 h-4" />
                  New Project
                </button>
              </div>
            </div>
          </header>

          {/* Glass Search Bar */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects by name, address, or manager..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/70 backdrop-blur-md border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400/50 focus:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                data-testid="input-search-projects"
              />
            </div>
          </div>

          {/* Filter Results Indicator */}
          {(searchTerm || statusFilter !== "all" || locationFilter !== "all") && (
            <div className="mb-6 px-4 py-2 bg-blue-50/80 backdrop-blur-sm border border-blue-200/60 rounded-lg">
              <span className="text-sm text-blue-700">
                Showing {filteredProjects.length} of {projects.length} projects
                {searchTerm && ` matching "${searchTerm}"`}
                {statusFilter !== "all" && ` with status "${statusFilter}"`}
                {locationFilter !== "all" && ` in "${locationFilter}"`}
              </span>
            </div>
          )}

          {/* Glassmorphism Projects Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project, index) => (
              <div 
                key={project.id} 
                className="group relative bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-6 hover:bg-white/90 hover:border-gray-300/60 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl shadow-xl hover:shadow-blue-500/10"
                style={{
                  animationDelay: `${index * 150}ms`
                }}
                data-testid={`card-project-${project.id}`}
              >
                {/* Enhanced Glossy Border Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-100/40 via-blue-200/30 to-blue-300/40 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* iOS Style Inner Highlight */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-t-3xl"></div>
                <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-white/60 via-transparent to-transparent rounded-l-3xl"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-blue-800 group-hover:bg-clip-text transition-all duration-300">
                        {project.name}
                      </h3>
                      <div className="flex items-center text-gray-600 mb-3">
                        <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                        {project.address}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)} shadow-lg`}>
                      {project.status}
                    </span>
                  </div>
                  {/* Progress with Glass Design */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold text-gray-900">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200/60 rounded-full h-3 overflow-hidden backdrop-blur-sm shadow-inner border border-gray-300/50">
                      <div 
                        className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 h-full rounded-full transition-all duration-700 shadow-lg relative"
                        style={{ width: `${project.progress}%` }}
                      >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-300/60 via-blue-200/40 to-transparent rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* Budget with Glass Design */}
                  <div className="mb-6">
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                      Budget
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      <span className="text-green-600">{formatCurrency(project.spentBudget)}</span>
                      <span className="text-gray-500 mx-2">/</span>
                      <span>{formatCurrency(project.totalBudget)}</span>
                    </div>
                  </div>

                  {/* Timeline with Glass Design */}
                  <div className="mb-6">
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                      Timeline
                    </div>
                    <div className="text-sm text-gray-700">
                      {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Team with Glass Design */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-2 text-purple-600" />
                        Team: {project.team} members
                      </div>
                      <span className="text-gray-900 font-semibold">{project.manager}</span>
                    </div>
                  </div>

                  {/* Glass Action Buttons */}
                  <div className="flex space-x-3 mt-6">
                    <button 
                      onClick={() => alert(`Opening details for ${project.name}`)}
                      className="flex-1 px-4 py-2.5 bg-white/80 backdrop-blur-md border border-gray-300/60 rounded-xl text-gray-700 hover:bg-white/90 hover:text-gray-900 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 relative overflow-hidden"
                      data-testid={`button-view-details-${project.id}`}
                    >
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"></div>
                      View Details
                    </button>
                    <button 
                      onClick={() => alert(`Opening management for ${project.name}`)}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 hover:from-blue-400 hover:via-blue-500 hover:to-blue-600 text-white rounded-xl transition-all duration-300 text-sm font-semibold shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105 active:scale-95 border border-blue-400/30 relative overflow-hidden"
                      data-testid={`button-manage-${project.id}`}
                    >
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-200/60 to-transparent"></div>
                      Manage
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* iOS-Style Glossy Summary Stats - Tailored for Small Business */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl p-6 text-center shadow-xl hover:bg-white/90 hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden" data-testid="stat-total-projects">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"></div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{projects.length}</div>
              <div className="text-sm text-gray-600">Total Projects</div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl p-6 text-center shadow-xl hover:bg-white/90 hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden" data-testid="stat-avg-progress">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"></div>
              <div className="text-3xl font-bold bg-gradient-to-b from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent mb-2">
                {Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)}%
              </div>
              <div className="text-sm text-gray-600">Average Progress</div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl p-6 text-center shadow-xl hover:bg-white/90 hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden" data-testid="stat-nearest-deadline">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"></div>
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-8 h-8 text-orange-600 mr-2" />
                <div className="text-3xl font-bold bg-gradient-to-b from-orange-600 via-orange-700 to-orange-800 bg-clip-text text-transparent">
                  {nearestDeadline}
                </div>
              </div>
              <div className="text-sm text-gray-600">Days to Nearest Deadline</div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl p-6 text-center shadow-xl hover:bg-white/90 hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden" data-testid="stat-efficiency">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"></div>
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-8 h-8 text-emerald-600 mr-2" />
                <div className="text-3xl font-bold bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-800 bg-clip-text text-transparent">
                  {Math.round(avgProfitability)}%
                </div>
              </div>
              <div className="text-sm text-gray-600">Project Efficiency</div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
