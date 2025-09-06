import { Building2, Wallet, Calendar, FileCheck, FilePlus, FileSearch, MessageSquarePlus, FileText, Upload, FileQuestion } from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  // Example data - replace with real data fetching
  const stats = {
    activeProjects: 12,
    totalBudget: "$2.4M",
    scheduleHealth: "93%",
    openPermits: 8
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500">Project overview and quick actions</p>
      </header>

      {/* Stat Cards Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Projects */}
        <button 
          onClick={() => setLocation('/projects')}
          className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm text-center hover:shadow-lg hover:bg-gray-50 transition-all duration-300"
        >
          <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl bg-blue-50">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-xs uppercase tracking-wide text-gray-500">Active Projects</div>
          <div className="mt-1 text-2xl font-bold">{stats.activeProjects}</div>
        </button>

        {/* Total Budget */}
        <button 
          onClick={() => setLocation('/budget')}
          className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm text-center hover:shadow-lg hover:bg-gray-50 transition-all duration-300"
        >
          <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl bg-blue-50">
            <Wallet className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-xs uppercase tracking-wide text-gray-500">Total Budget</div>
          <div className="mt-1 text-2xl font-bold">{stats.totalBudget}</div>
        </button>

        {/* Schedule Health */}
        <button 
          onClick={() => setLocation('/analytics')}
          className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm text-center hover:shadow-lg hover:bg-gray-50 transition-all duration-300"
        >
          <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl bg-green-50">
            <Calendar className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-xs uppercase tracking-wide text-gray-500">Schedule Health</div>
          <div className="mt-1 text-2xl font-bold">{stats.scheduleHealth}</div>
        </button>

        {/* Open Permits */}
        <button 
          onClick={() => setLocation('/permits')}
          className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm text-center hover:shadow-lg hover:bg-gray-50 transition-all duration-300"
        >
          <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl bg-yellow-50">
            <FileCheck className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="text-xs uppercase tracking-wide text-gray-500">Open Permits</div>
          <div className="mt-1 text-2xl font-bold">{stats.openPermits}</div>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <button 
          onClick={() => setLocation('/analytics')}
          className="group rounded-2xl border border-black/5 bg-white px-4 py-3 text-center hover:shadow-lg hover:bg-gray-50 transition-all duration-300"
        >
          <div className="mx-auto mb-1 grid h-8 w-8 place-items-center rounded-lg bg-blue-50">
            <FileText className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-sm font-medium">Daily Log</div>
          <div className="text-[11px] text-gray-500">Record site activity</div>
        </button>

        <button 
          onClick={() => setLocation('/documents')}
          className="group rounded-2xl border border-black/5 bg-white px-4 py-3 text-center hover:shadow-lg hover:bg-gray-50 transition-all duration-300"
        >
          <div className="mx-auto mb-1 grid h-8 w-8 place-items-center rounded-lg bg-blue-50">
            <Upload className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-sm font-medium">Upload Document</div>
          <div className="text-[11px] text-gray-500">Add project files</div>
        </button>

        <button 
          onClick={() => setLocation('/vendors')}
          className="group rounded-2xl border border-black/5 bg-white px-4 py-3 text-center hover:shadow-lg hover:bg-gray-50 transition-all duration-300"
        >
          <div className="mx-auto mb-1 grid h-8 w-8 place-items-center rounded-lg bg-blue-50">
            <FilePlus className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-sm font-medium">Create RFQ</div>
          <div className="text-[11px] text-gray-500">Get bids for work</div>
        </button>
      </div>

      {/* Additional Quick Actions Row */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <button 
          onClick={() => setLocation('/vendors')}
          className="group rounded-2xl border border-black/5 bg-white px-4 py-3 text-center hover:shadow-lg hover:bg-gray-50 transition-all duration-300"
        >
          <div className="mx-auto mb-1 grid h-8 w-8 place-items-center rounded-lg bg-orange-50">
            <FileQuestion className="h-4 w-4 text-orange-600" />
          </div>
          <div className="text-sm font-medium">Submit RFI</div>
          <div className="text-[11px] text-gray-500">Request information</div>
        </button>

        <button 
          onClick={() => setLocation('/analytics')}
          className="group rounded-2xl border border-black/5 bg-white px-4 py-3 text-center hover:shadow-lg hover:bg-gray-50 transition-all duration-300"
        >
          <div className="mx-auto mb-1 grid h-8 w-8 place-items-center rounded-lg bg-green-50">
            <FileSearch className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-sm font-medium">View Reports</div>
          <div className="text-[11px] text-gray-500">Track progress</div>
        </button>

        <button className="group rounded-2xl border border-black/5 bg-white px-4 py-3 text-center hover:shadow-lg hover:bg-gray-50 transition-all duration-300">
          <div className="mx-auto mb-1 grid h-8 w-8 place-items-center rounded-lg bg-purple-50">
            <MessageSquarePlus className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-sm font-medium">New Discussion</div>
          <div className="text-[11px] text-gray-500">Start conversation</div>
        </button>
      </div>
    </div>
  );
}
