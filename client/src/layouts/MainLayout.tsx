import { ReactNode } from "react";
import { 
  Home, 
  BarChart3, 
  Calendar, 
  DollarSign, 
  Users, 
  FileText, 
  Folder 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MainLayoutProps {
  children: ReactNode;
  activeView: string;
  onViewChange: (view: string) => void;
}

export function MainLayout({ children, activeView, onViewChange }: MainLayoutProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'vendors', label: 'Vendors', icon: Users },
    { id: 'permits', label: 'Permits', icon: FileText },
    { id: 'documents', label: 'Documents', icon: Folder },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900">BuilderOS PM</h1>
          <p className="text-sm text-gray-500 mt-1">Project Management</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeView === item.id ? 'default' : 'ghost'}
                className="w-full justify-start h-10 rounded-lg"
                onClick={() => onViewChange(item.id)}
                data-testid={`button-nav-${item.id}`}
              >
                <IconComponent className="w-4 h-4 mr-3" />
                <span className="font-medium">{item.label}</span>
              </Button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">© 2025 BuilderOS PM</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}