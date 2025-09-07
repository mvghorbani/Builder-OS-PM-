import { MainLayout } from "@/layouts/MainLayout";
import { useMemo, useState } from "react";
import { getLocalDataset, formatUSD } from "@/lib/budgetLocalAdapter";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type SortKey = 'category' | 'scope' | 'vendor' | 'contractAmount' | 'spentAmount' | 'utilization' | 'payableDate';

export default function BudgetTrackingPage() {
  const dataset = useMemo(() => getLocalDataset('P128_18TH_AVE_N'), []);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'category', dir: 'asc' });

  const rows = useMemo(() => {
    const lines = dataset?.budgetLines || [];
    const filtered = lines.filter(l => {
      const t = `${l.category || ''} ${l.scope} ${l.vendor || ''}`.toLowerCase();
      return t.includes(q.toLowerCase());
    });
    const withCalc = filtered.map(l => ({
      ...l,
      utilization: (Number(l.spentAmount) || 0) / Math.max(1, Number(l.contractAmount) || 1),
    }));
    const sorted = withCalc.sort((a, b) => {
      const dir = sort.dir === 'asc' ? 1 : -1;
      const ka = (a as any)[sort.key];
      const kb = (b as any)[sort.key];
      if (ka == null && kb != null) return -1 * dir;
      if (kb == null && ka != null) return 1 * dir;
      if (typeof ka === 'number' && typeof kb === 'number') return (ka - kb) * dir;
      const sa = String(ka || '').toLowerCase();
      const sb = String(kb || '').toLowerCase();
      return sa.localeCompare(sb) * dir;
    });
    return sorted;
  }, [dataset, q, sort]);

  const total = useMemo(() => {
    const lines = dataset?.budgetLines || [];
    return {
      contract: lines.reduce((s, l) => s + (Number(l.contractAmount) || 0), 0),
      spent: lines.reduce((s, l) => s + (Number(l.spentAmount) || 0), 0),
    };
  }, [dataset]);

  const setSortKey = (key: SortKey) => {
    setSort(s => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Budget Tracking</h1>
              <p className="text-gray-600">{dataset?.projectName || 'Project'} • {rows.length} lines</p>
            </div>
            <div className="w-full sm:w-80">
              <Input placeholder="Search scope, vendor, category" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </div>

          <div className="overflow-auto rounded-xl border border-gray-200 bg-white">
            <Table>
              <TableHeader className="bg-gray-50 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="min-w-[180px] cursor-pointer" onClick={() => setSortKey('category')}>Category</TableHead>
                  <TableHead className="min-w-[240px] cursor-pointer" onClick={() => setSortKey('scope')}>Scope</TableHead>
                  <TableHead className="min-w-[160px] cursor-pointer" onClick={() => setSortKey('vendor')}>Vendor</TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => setSortKey('contractAmount')}>Budget</TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => setSortKey('spentAmount')}>Spent</TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => setSortKey('utilization')}>Utilization</TableHead>
                  <TableHead className="min-w-[120px] cursor-pointer" onClick={() => setSortKey('payableDate')}>Payable</TableHead>
                  <TableHead className="min-w-[120px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((l, idx) => {
                  const spent = Number(l.spentAmount) || 0;
                  const budget = Number(l.contractAmount) || 0;
                  const util = budget > 0 ? spent / budget : 0;
                  const status = spent > budget ? 'Exceeded' : util >= 0.85 ? 'Warning' : 'OK';
                  return (
                    <TableRow key={idx}>
                      <TableCell className="whitespace-nowrap">{l.category || '-'}</TableCell>
                      <TableCell className="whitespace-nowrap">{l.scope}</TableCell>
                      <TableCell className="whitespace-nowrap">{l.vendor || '-'}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatUSD(budget)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatUSD(spent)}</TableCell>
                      <TableCell className="text-right tabular-nums">{Math.round(util * 100)}%</TableCell>
                      <TableCell className="whitespace-nowrap">{l.payableDate ? new Date(l.payableDate).toLocaleDateString() : '-'}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {status === 'Exceeded' && <Badge className="bg-red-600 text-white">Exceeded</Badge>}
                        {status === 'Warning' && <Badge className="bg-yellow-600 text-white">Warning</Badge>}
                        {status === 'OK' && <Badge variant="secondary">OK</Badge>}
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="bg-gray-50 font-semibold">
                  <TableCell colSpan={3}>Totals</TableCell>
                  <TableCell className="text-right tabular-nums">{formatUSD(total.contract)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatUSD(total.spent)}</TableCell>
                  <TableCell className="text-right tabular-nums">{Math.round((total.spent / Math.max(1, total.contract)) * 100)}%</TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

