
import { useState } from "react";
import { Building2, Plus, Search, Filter, Calendar, DollarSign, Users, MapPin } from "lucide-react";
import { MainLayout } from "../layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";

export default function Projects() {

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

  return (
    <MainLayout>
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        {/* iOS Blue Floating Orbs Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-500/40 to-blue-600/40 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-gradient-to-r from-blue-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-3/4 w-32 h-32 bg-gradient-to-r from-blue-300/25 to-blue-400/25 rounded-full blur-2xl animate-pulse delay-500"></div>
          <div className="absolute bottom-1/4 left-1/2 w-40 h-40 bg-gradient-to-r from-blue-600/35 to-blue-700/35 rounded-full blur-3xl animate-pulse delay-2000"></div>
          <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-gradient-to-r from-blue-200/20 to-blue-300/20 rounded-full blur-2xl animate-pulse delay-3000"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6 py-6 sm:py-10">
          {/* Header with Glass Effect */}
          <header className="mb-8 sm:mb-12">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  Active Projects
                </h1>
                <p className="text-base sm:text-lg text-gray-300">Manage and track all construction projects</p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="px-6 py-2.5 bg-white/15 backdrop-blur-md border border-white/30 rounded-full text-white hover:bg-white/25 transition-all duration-300 flex items-center gap-2 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
                <button className="px-6 py-2.5 bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 hover:from-blue-400 hover:via-blue-500 hover:to-blue-600 text-white rounded-full transition-all duration-300 flex items-center gap-2 shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105 active:scale-95 border border-blue-400/30">
                  <Plus className="w-4 h-4" />
                  New Project
                </button>
              </div>
            </div>
          </header>

          {/* Glass Search Bar */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-300" />
              <input
                type="text"
                placeholder="Search projects by name, address, or manager..."
                className="w-full pl-12 pr-4 py-4 bg-white/15 backdrop-blur-md border border-white/30 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400/50 focus:bg-white/20 transition-all duration-300 shadow-xl hover:shadow-2xl"
              />
            </div>
          </div>

          {/* Glassmorphism Projects Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <div 
                key={project.id} 
                className="group relative bg-white/15 backdrop-blur-xl border border-white/30 rounded-3xl p-6 hover:bg-white/20 hover:border-white/40 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl shadow-xl hover:shadow-blue-500/20"
                style={{
                  animationDelay: `${index * 150}ms`
                }}
              >
                {/* Enhanced Glossy Border Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-blue-600/20 to-blue-700/30 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* iOS Style Inner Highlight */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-t-3xl"></div>
                <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-white/40 via-transparent to-transparent rounded-l-3xl"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-300 group-hover:to-purple-300 group-hover:bg-clip-text transition-all duration-300">
                        {project.name}
                      </h3>
                      <div className="flex items-center text-gray-300 mb-3">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
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
                      <span className="text-gray-300">Progress</span>
                      <span className="font-semibold text-white">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden backdrop-blur-sm shadow-inner border border-white/30">
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
                    <div className="flex items-center text-sm text-gray-300 mb-2">
                      <DollarSign className="w-4 h-4 mr-2 text-green-400" />
                      Budget
                    </div>
                    <div className="text-lg font-bold text-white">
                      <span className="text-green-400">{formatCurrency(project.spentBudget)}</span>
                      <span className="text-gray-400 mx-2">/</span>
                      <span>{formatCurrency(project.totalBudget)}</span>
                    </div>
                  </div>

                  {/* Timeline with Glass Design */}
                  <div className="mb-6">
                    <div className="flex items-center text-sm text-gray-300 mb-2">
                      <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                      Timeline
                    </div>
                    <div className="text-sm text-gray-200">
                      {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Team with Glass Design */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-300">
                        <Users className="w-4 h-4 mr-2 text-purple-400" />
                        Team: {project.team} members
                      </div>
                      <span className="text-white font-semibold">{project.manager}</span>
                    </div>
                  </div>

                  {/* Glass Action Buttons */}
                  <div className="flex space-x-3 mt-6">
                    <button className="flex-1 px-4 py-2.5 bg-white/20 backdrop-blur-md border border-white/40 rounded-xl text-white hover:bg-white/30 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                      View Details
                    </button>
                    <button className="flex-1 px-4 py-2.5 bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 hover:from-blue-400 hover:via-blue-500 hover:to-blue-600 text-white rounded-xl transition-all duration-300 text-sm font-semibold shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105 active:scale-95 border border-blue-400/30 relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-200/60 to-transparent"></div>
                      Manage
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* iOS-Style Glossy Summary Stats */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white/20 backdrop-blur-xl border border-white/40 rounded-2xl p-6 text-center shadow-xl hover:bg-white/25 hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
              <div className="text-3xl font-bold text-white mb-2">{projects.length}</div>
              <div className="text-sm text-gray-300">Total Projects</div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-xl border border-white/40 rounded-2xl p-6 text-center shadow-xl hover:bg-white/25 hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
              <div className="text-3xl font-bold bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 bg-clip-text text-transparent mb-2">
                {formatCurrency(projects.reduce((sum, p) => sum + p.totalBudget, 0))}
              </div>
              <div className="text-sm text-gray-300">Total Budget</div>
            </div>

            <div className="bg-white/20 backdrop-blur-xl border border-white/40 rounded-2xl p-6 text-center shadow-xl hover:bg-white/25 hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
              <div className="text-3xl font-bold bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">
                {Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)}%
              </div>
              <div className="text-sm text-gray-300">Average Progress</div>
            </div>

            <div className="bg-white/20 backdrop-blur-xl border border-white/40 rounded-2xl p-6 text-center shadow-xl hover:bg-white/25 hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
              <div className="text-3xl font-bold bg-gradient-to-b from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent mb-2">
                {projects.reduce((sum, p) => sum + p.team, 0)}
              </div>
              <div className="text-sm text-gray-300">Team Members</div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
