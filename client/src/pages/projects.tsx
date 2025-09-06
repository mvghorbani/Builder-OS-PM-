import { useState, useEffect, useRef } from "react";
import { Building2, Plus, Search, Filter, Calendar, DollarSign, Users, MapPin, ChevronDown, TrendingUp, Clock, Edit2, X, Check, GripVertical, Type, Palette, Target, BarChart3, User } from "lucide-react";
import { useLocation } from "wouter";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { MainLayout } from "../layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";

export default function Projects() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  // Editing states
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{[key: string]: any}>({});

  // Refs for click outside detection
  const filterRef = useRef<HTMLDivElement>(null);
  const typographyRef = useRef<HTMLDivElement>(null);

  // Typography control states
  const [typographyOpen, setTypographyOpen] = useState(false);
  const [fontFamily, setFontFamily] = useState("EB Garamond");
  const [fontSize, setFontSize] = useState("base");
  const [customLabels, setCustomLabels] = useState({
    progress: "Progress",
    budgetOverview: "Budget Overview",
    committed: "Expenditure",
    totalAllocated: "Budget",
    projectTimeline: "Project Timeline",
    projectLead: "Project Lead",
    startDate: "Start Date",
    endDate: "End Date",
    currentPhase: "Current Phase"
  });

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
      if (typographyRef.current && !typographyRef.current.contains(event.target as Node)) {
        setTypographyOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Apply dynamic styles
  const getTypographyClasses = () => {
    const fontClasses = {
      "EB Garamond": "font-serif",
      "Inter": "font-sans",
      "Roboto": "font-sans",
      "Playfair Display": "font-serif",
      "Open Sans": "font-sans"
    };

    const sizeClasses = {
      "xs": "text-xs",
      "sm": "text-sm", 
      "base": "text-base",
      "lg": "text-lg",
      "xl": "text-xl"
    };

    return `${fontClasses[fontFamily as keyof typeof fontClasses]} ${sizeClasses[fontSize as keyof typeof sizeClasses]}`;
  };

  // Real project data with milestones
  const [projects, setProjects] = useState([
    {
      id: '1',
      name: '717 S Palmway Development',
      address: '717 S Palmway, Lake Worth, FL 33460',
      status: 'active',
      progress: 65,
      totalBudget: 2400000,
      spentBudget: 1560000,
      startDate: '2024-01-15',
      endDate: '2025-03-31',
      manager: 'MV Ghorbani',
      team: 12,
      currentMilestone: 'Framing & Structural Work',
      milestones: [
        { name: 'Foundation & Site Prep', completed: true },
        { name: 'Framing & Structural Work', completed: false, current: true },
        { name: 'Electrical & Plumbing', completed: false },
        { name: 'Interior Finishing', completed: false },
        { name: 'Final Inspection', completed: false }
      ],
      projectedROI: 18,
      budgetVariance: -2.5,
      scheduleVariance: 5
    },
    {
      id: '2',
      name: '284 Lytton Project',
      address: '284 Lytton Avenue, Palo Alto, CA 94301',
      status: 'active',
      progress: 45,
      totalBudget: 3200000,
      spentBudget: 1440000,
      startDate: '2024-02-01',
      endDate: '2025-04-30',
      manager: 'MV Ghorbani',
      team: 18,
      currentMilestone: 'Foundation & Site Prep',
      milestones: [
        { name: 'Foundation & Site Prep', completed: false, current: true },
        { name: 'Framing & Structural Work', completed: false },
        { name: 'Electrical & Plumbing', completed: false },
        { name: 'Interior Finishing', completed: false },
        { name: 'Final Inspection', completed: false }
      ],
      projectedROI: 22,
      budgetVariance: 3.2,
      scheduleVariance: -8
    },
    {
      id: '3',
      name: '128 18th Ave Construction',
      address: '128 18th Avenue, San Francisco, CA 94121',
      status: 'active',
      progress: 80,
      totalBudget: 1800000,
      spentBudget: 1440000,
      startDate: '2024-03-01',
      endDate: '2025-02-28',
      manager: 'MV Ghorbani',
      team: 8,
      currentMilestone: 'Interior Finishing',
      milestones: [
        { name: 'Foundation & Site Prep', completed: true },
        { name: 'Framing & Structural Work', completed: true },
        { name: 'Electrical & Plumbing', completed: true },
        { name: 'Interior Finishing', completed: false, current: true },
        { name: 'Final Inspection', completed: false }
      ],
      projectedROI: 16,
      budgetVariance: 0,
      scheduleVariance: 12
    }
  ]);

  // Update project function
  const updateProject = (id: string, field: string, value: any) => {
    setProjects(prev => prev.map(project => 
      project.id === id ? { ...project, [field]: value } : project
    ));
  };

  // Start editing function
  const startEditing = (projectId: string, field: string, currentValue: any) => {
    setEditingProject(projectId);
    setEditingField(field);
    setEditValues(prev => ({ ...prev, [field]: currentValue }));
  };

  // Save edit function
  const saveEdit = (projectId: string, field: string) => {
    updateProject(projectId, field, editValues[field]);
    setEditingProject(null);
    setEditingField(null);
  };

  // Cancel edit function
  const cancelEdit = () => {
    setEditingProject(null);
    setEditingField(null);
    setEditValues({});
  };

  // Handle drag and drop reordering
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(filteredProjects);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the main projects array to maintain the new order
    const newProjects = [...projects];
    const reorderedProject = newProjects.find(p => p.id === reorderedItem.id);
    if (reorderedProject) {
      // Remove from old position
      const oldIndex = newProjects.findIndex(p => p.id === reorderedItem.id);
      newProjects.splice(oldIndex, 1);

      // Insert at new position (accounting for filtered items)
      const targetProject = items[result.destination.index === 0 ? 0 : result.destination.index - 1];
      const targetIndex = targetProject ? newProjects.findIndex(p => p.id === targetProject.id) : 0;
      const insertIndex = result.destination.index === 0 ? targetIndex : targetIndex + 1;

      newProjects.splice(insertIndex, 0, reorderedProject);
      setProjects(newProjects);
    }
  };

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

  // Helper functions for project status
  const getScheduleStatus = (scheduleVariance: number) => {
    if (scheduleVariance <= 0) return { text: 'On Track', color: 'text-green-600' };
    if (scheduleVariance <= 10) return { text: `${scheduleVariance} Days Delayed`, color: 'text-yellow-600' };
    return { text: `${scheduleVariance} Days Delayed`, color: 'text-red-600' };
  };

  const getBudgetStatus = (budgetVariance: number) => {
    if (Math.abs(budgetVariance) <= 2) return { text: 'On Budget', color: 'text-green-600' };
    if (budgetVariance > 0) return { text: `${budgetVariance.toFixed(1)}% Over Budget`, color: 'text-red-600' };
    return { text: `${Math.abs(budgetVariance).toFixed(1)}% Under Budget`, color: 'text-green-600' };
  };

  const calculateMilestoneProgress = (milestones: any[]) => {
    const completed = milestones.filter(m => m.completed).length;
    return Math.round((completed / milestones.length) * 100);
  };

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
                {/* Typography Control Panel */}
                <div className="relative" ref={typographyRef}>
                  <button 
                    onClick={() => setTypographyOpen(!typographyOpen)}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-400 hover:via-purple-500 hover:to-purple-600 text-white rounded-full transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                    data-testid="button-typography"
                  >
                    <Type className="w-4 h-4" />
                    Typography
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${typographyOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {typographyOpen && (
                    <div className="absolute top-12 right-0 z-50 bg-white/95 backdrop-blur-xl border border-gray-200/80 rounded-2xl shadow-2xl p-6 w-80">
                      <div className="space-y-4">
                        <h3 className="font-bold text-gray-900 mb-4">Typography Controls</h3>

                        {/* Font Family Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
                          <select 
                            value={fontFamily}
                            onChange={(e) => setFontFamily(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                          >
                            <option value="EB Garamond">EB Garamond (Serif)</option>
                            <option value="Inter">Inter (Sans-serif)</option>
                            <option value="Roboto">Roboto (Sans-serif)</option>
                            <option value="Playfair Display">Playfair Display (Serif)</option>
                            <option value="Open Sans">Open Sans (Sans-serif)</option>
                          </select>
                        </div>

                        {/* Font Size Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                          <select 
                            value={fontSize}
                            onChange={(e) => setFontSize(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                          >
                            <option value="xs">Extra Small</option>
                            <option value="sm">Small</option>
                            <option value="base">Base</option>
                            <option value="lg">Large</option>
                            <option value="xl">Extra Large</option>
                          </select>
                        </div>

                        {/* Custom Label Editor */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Custom Labels</label>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {Object.entries(customLabels).map(([key, value]) => (
                              <div key={key} className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 w-20 flex-shrink-0 capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                                </span>
                                <input
                                  type="text"
                                  value={value}
                                  onChange={(e) => setCustomLabels(prev => ({ ...prev, [key]: e.target.value }))}
                                  className="flex-1 p-1 text-xs border border-gray-200 rounded"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative" ref={filterRef}>
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

          {/* Drag-and-Drop Projects Grid */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="projects-grid">
              {(provided) => (
                <div 
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
                >
                  {filteredProjects.map((project, index) => (
                    <Draggable key={project.id} draggableId={project.id} index={index}>
                      {(provided, snapshot) => (
                        <div 
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`group relative bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-6 hover:bg-white/90 hover:border-gray-300/60 transition-all duration-500 shadow-xl hover:shadow-blue-500/10 ${
                            snapshot.isDragging 
                              ? 'rotate-2 scale-105 shadow-2xl border-blue-300/60 bg-white/95' 
                              : 'hover:scale-[1.02] hover:shadow-2xl'
                          }`}
                          style={{
                            animationDelay: `${index * 150}ms`,
                            ...provided.draggableProps.style
                          }}
                          data-testid={`card-project-${project.id}`}
                        >
                          {/* Drag Handle */}
                          <div 
                            {...provided.dragHandleProps}
                            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-grab active:cursor-grabbing z-10"
                          >
                            <div className="p-2 bg-gray-100/80 backdrop-blur-sm rounded-lg hover:bg-gray-200/80 transition-colors duration-200">
                              <GripVertical className="w-4 h-4 text-gray-500" />
                            </div>
                          </div>
                {/* Enhanced Glossy Border Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-100/40 via-blue-200/30 to-blue-300/40 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* iOS Style Inner Highlight */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-t-3xl"></div>
                <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-white/60 via-transparent to-transparent rounded-l-3xl"></div>

                <div className="relative z-10 space-y-4">
                  {/* Header Section */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      {/* Project Title */}
                      <div className="mb-3">
                        {editingProject === project.id && editingField === 'name' ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editValues.name || ''}
                              onChange={(e) => setEditValues(prev => ({ ...prev, name: e.target.value }))}
                              className="text-xl font-bold bg-white/90 border border-blue-300 rounded-lg px-2 py-1 text-gray-900 flex-1"
                              onKeyPress={(e) => e.key === 'Enter' && saveEdit(project.id, 'name')}
                              autoFocus
                            />
                            <button onClick={() => saveEdit(project.id, 'name')} className="text-green-600 hover:text-green-700">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={cancelEdit} className="text-red-600 hover:text-red-700">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <h3 className="text-xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors duration-200"
                              onClick={() => startEditing(project.id, 'name', project.name)}
                          >
                            {project.name}
                          </h3>
                        )}
                      </div>

                      {/* Address */}
                      <div className="flex items-center text-gray-500 text-sm mb-4">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600 hover:underline transition-colors duration-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {project.address}
                        </a>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="ml-4">
                      <button
                        onClick={() => startEditing(project.id, 'status', project.status)}
                        className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-medium hover:bg-green-600 transition-colors duration-200"
                      >
                        active
                      </button>
                    </div>
                  </div>

                  {/* At a Glance Section */}
                  <div className="mb-6">
                    <div className="flex items-center text-gray-700 mb-4">
                      <Target className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="font-medium text-sm">At a Glance</span>
                    </div>
                    <div className="space-y-3">
                      {/* Schedule Status */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Schedule</span>
                        <span className={`text-sm font-medium ${getScheduleStatus(project.scheduleVariance).color}`}>
                          {getScheduleStatus(project.scheduleVariance).text}
                        </span>
                      </div>

                      {/* Budget Status */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Budget</span>
                        <span className={`text-sm font-medium ${getBudgetStatus(project.budgetVariance).color}`}>
                          {getBudgetStatus(project.budgetVariance).text}
                        </span>
                      </div>

                      {/* Projected ROI */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Projected ROI</span>
                        <span className="text-sm font-bold text-gray-900">
                          {project.projectedROI}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Milestone Completion */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-700">Milestone Completion</span>
                      <span className="text-sm font-bold text-gray-900">{calculateMilestoneProgress(project.milestones)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-700"
                        style={{ width: `${calculateMilestoneProgress(project.milestones)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Financials Section */}
                  <div className="mb-6">
                    <div className="flex items-center text-gray-700 mb-4">
                      <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                      <span className="font-medium text-sm">Financials</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Funds Deployed</span>
                        <span className="text-sm font-semibold text-gray-900">{formatCurrency(project.spentBudget)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Budget</span>
                        <span className="text-sm font-semibold text-gray-900">{formatCurrency(project.totalBudget)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Section */}
                  <div className="mb-6">
                    <div className="flex items-center text-gray-700 mb-4">
                      <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="font-medium text-sm">Timeline</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">Start Date</div>
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(project.startDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">Target Completion</div>
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(project.endDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Project Lead Section */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-700">
                        <User className="w-4 h-4 mr-2 text-purple-500" />
                        <span className="font-medium text-sm">Project Lead</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{project.manager}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <button 
                      onClick={() => alert(`Opening details for ${project.name}`)}
                      className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 text-sm font-medium"
                      data-testid={`button-view-details-${project.id}`}
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => alert(`Opening management for ${project.name}`)}
                      className="flex-1 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                      data-testid={`button-manage-${project.id}`}
                    >
                      Manage
                    </button>
                  </div>
                </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* iOS-Style Glossy Summary Stats - Tailored for Small Business */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl p-6 text-center shadow-xl hover:bg-white/90 hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden" data-testid="stat-total-projects">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"></div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{projects.length}</div>
              <div className="text-sm text-gray-600">Total Projects</div>
            </div>

            <button 
              onClick={() => setLocation('/analytics')}
              className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl p-6 text-center shadow-xl hover:bg-white/90 hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden w-full"
              data-testid="stat-avg-progress"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"></div>
              <div className="text-3xl font-bold bg-gradient-to-b from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent mb-2">
                {Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)}%
              </div>
              <div className="text-sm text-gray-600">Average Progress</div>
            </button>

            <button 
              onClick={() => setLocation('/schedule')}
              className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl p-6 text-center shadow-xl hover:bg-white/90 hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden w-full"
              data-testid="stat-nearest-deadline"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"></div>
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-8 h-8 text-orange-600 mr-2" />
                <div className="text-3xl font-bold bg-gradient-to-b from-orange-600 via-orange-700 to-orange-800 bg-clip-text text-transparent">
                  {nearestDeadline}
                </div>
              </div>
              <div className="text-sm text-gray-600">Days to Nearest Deadline</div>
            </button>

            <button 
              onClick={() => setLocation('/analytics')}
              className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl p-6 text-center shadow-xl hover:bg-white/90 hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden w-full"
              data-testid="stat-efficiency"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"></div>
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-8 h-8 text-emerald-600 mr-2" />
                <div className="text-3xl font-bold bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-800 bg-clip-text text-transparent">
                  {Math.round(avgProfitability)}%
                </div>
              </div>
              <div className="text-sm text-gray-600">Project Efficiency</div>
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}