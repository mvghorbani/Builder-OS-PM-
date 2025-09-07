import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Plus, Eye, Calendar, DollarSign, BarChart3 } from "lucide-react";

export default function GlassDemo() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="min-h-screen airy-space">
      {/* Floating background elements for depth */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-blue-100/40 to-purple-100/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-gradient-to-r from-pink-100/30 to-blue-100/30 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-gradient-to-r from-gray-50/25 to-blue-50/25 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
            Glass Morphism Demo
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Showcase of enhanced glass morphism effects with proper depth, blur, and transparency
          </p>
        </div>

        {/* Main Glass Panel */}
        <div className="glass-panel p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Enhanced Glass Panel</h2>
            <Badge className="bg-blue-500/20 text-blue-700 border-blue-200/50">Primary</Badge>
          </div>
          <p className="text-gray-700 mb-4">
            This is the main glass panel with enhanced depth, proper blur effects, and sophisticated styling.
            Notice the improved clarity, depth perception, and subtle prismatic reflections.
          </p>
          
          {/* Glass Input Demo */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <Input 
                className="glass-input pl-10" 
                placeholder="Search with glass input effect..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-3">
              <Button className="glass-button flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Glass Button
              </Button>
              <Button className="glass-button flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            </div>
          </div>
        </div>

        {/* Glass Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <Badge className="bg-green-500/20 text-green-700 border-green-200/50">Active</Badge>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Analytics Overview</h3>
            <p className="text-gray-600 text-sm mb-4">Real-time data visualization with glass morphism styling.</p>
            <Button className="glass-button w-full">
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8 text-purple-600" />
              <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-200/50">Pending</Badge>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Schedule Management</h3>
            <p className="text-gray-600 text-sm mb-4">Project timeline and milestone tracking interface.</p>
            <Button className="glass-button w-full">
              <Calendar className="w-4 h-4 mr-2" />
              Open Calendar
            </Button>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-green-600" />
              <Badge className="bg-blue-500/20 text-blue-700 border-blue-200/50">Updated</Badge>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Budget Tracking</h3>
            <p className="text-gray-600 text-sm mb-4">Financial overview with enhanced glass styling.</p>
            <Button className="glass-button w-full">
              <DollarSign className="w-4 h-4 mr-2" />
              View Budget
            </Button>
          </div>
        </div>

        {/* Nested Glass Effects Demo */}
        <div className="glass-panel p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Nested Glass Effects</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Layered Transparency</h3>
              <p className="text-gray-600 mb-4">
                Glass cards nested within glass panels demonstrate proper depth layering and transparency stacking.
              </p>
              <div className="glass-input p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  Even deeper nesting maintains clarity and visual hierarchy.
                </p>
              </div>
            </div>
            
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Interactive Elements</h3>
              <div className="space-y-3">
                <Input className="glass-input" placeholder="Nested glass input..." />
                <Button className="glass-button w-full">Nested Glass Button</Button>
                <div className="flex gap-2">
                  <Badge className="bg-red-500/20 text-red-700 border-red-200/50">Error</Badge>
                  <Badge className="bg-green-500/20 text-green-700 border-green-200/50">Success</Badge>
                  <Badge className="bg-blue-500/20 text-blue-700 border-blue-200/50">Info</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Glass Effect */}
        <div className="glass-card p-6 mt-8 text-center">
          <p className="text-gray-600">
            Enhanced glass morphism with improved depth, clarity, and visual hierarchy
          </p>
        </div>
      </div>
    </div>
  );
}