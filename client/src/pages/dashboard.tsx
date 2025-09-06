import { Building2, Wallet, Calendar, FileCheck, FilePlus, FileSearch, MessageSquarePlus } from "lucide-react";

export default function Dashboard() {
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
        <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm text-center">
          <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl bg-blue-50">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-xs uppercase tracking-wide text-gray-500">Active Projects</div>
          <div className="mt-1 text-2xl font-bold">{stats.activeProjects}</div>
        </div>

        {/* Total Budget */}
        <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm text-center">
          <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl bg-blue-50">
            <Wallet className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-xs uppercase tracking-wide text-gray-500">Total Budget</div>
          <div className="mt-1 text-2xl font-bold">{stats.totalBudget}</div>
        </div>

        {/* Schedule Health */}
        <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm text-center">
          <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl bg-green-50">
            <Calendar className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-xs uppercase tracking-wide text-gray-500">Schedule Health</div>
          <div className="mt-1 text-2xl font-bold">{stats.scheduleHealth}</div>
        </div>

        {/* Open Permits */}
        <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm text-center">
          <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl bg-yellow-50">
            <FileCheck className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="text-xs uppercase tracking-wide text-gray-500">Open Permits</div>
          <div className="mt-1 text-2xl font-bold">{stats.openPermits}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <button className="group rounded-2xl border border-black/5 bg-white px-4 py-3 text-center hover:shadow">
          <div className="mx-auto mb-1 grid h-8 w-8 place-items-center rounded-lg bg-blue-50">
            <FilePlus className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-sm font-medium">Create RFQ</div>
          <div className="text-[11px] text-gray-500">Get bids for work</div>
        </button>

        <button className="group rounded-2xl border border-black/5 bg-white px-4 py-3 text-center hover:shadow">
          <div className="mx-auto mb-1 grid h-8 w-8 place-items-center rounded-lg bg-blue-50">
            <FileSearch className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-sm font-medium">View Reports</div>
          <div className="text-[11px] text-gray-500">Track progress</div>
        </button>

        <button className="group rounded-2xl border border-black/5 bg-white px-4 py-3 text-center hover:shadow">
          <div className="mx-auto mb-1 grid h-8 w-8 place-items-center rounded-lg bg-blue-50">
            <MessageSquarePlus className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-sm font-medium">New Discussion</div>
          <div className="text-[11px] text-gray-500">Start conversation</div>
        </button>
      </div>
    </div>
  );
}
