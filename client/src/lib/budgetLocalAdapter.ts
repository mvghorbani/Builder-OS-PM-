import data from '@/data/P128_18TH_AVE_N.json';

export type TransactionType = 'expense' | 'payment';

export interface BudgetLineLocal {
  projectId: string;
  scope: string;
  category?: string;
  vendor?: string;
  contractAmount: number;
  spentAmount: number;
  payableDate?: string; // ISO
}

export interface TransactionLocal {
  projectId: string;
  date: string; // ISO
  description: string;
  amount: number; // positive number
  type: TransactionType;
  vendor?: string;
}

export interface BudgetDatasetLocal {
  projectId: string;
  projectName: string;
  budgetLines: BudgetLineLocal[];
  transactions: TransactionLocal[];
}

export function getLocalDataset(projectId: string): BudgetDatasetLocal | null {
  const dataset = data as BudgetDatasetLocal;
  if (!dataset || dataset.projectId !== projectId) return null;
  return dataset;
}

export function formatUSD(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);
}

export function formatUSDCompact(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 }).format(n);
}

export function computeOverview(dataset: BudgetDatasetLocal) {
  const totalBudget = dataset.budgetLines.reduce((sum, b) => sum + (Number(b.contractAmount) || 0), 0);

  const spentFromLines = dataset.budgetLines.reduce((sum, b) => sum + (Number(b.spentAmount) || 0), 0);
  const expensesFromTx = dataset.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  // Prefer actual transaction totals if present
  const spent = Math.max(spentFromLines, expensesFromTx);
  const remaining = Math.max(0, totalBudget - spent);
  const variance = spent - totalBudget; // >0 means over budget

  return { totalBudget, spent, remaining, variance };
}

export function buildAlerts(dataset: BudgetDatasetLocal) {
  const now = new Date();
  const upcomingDays = 14;

  const alerts: { level: 'critical' | 'warning' | 'info'; title: string; detail: string; tag?: string }[] = [];

  for (const b of dataset.budgetLines) {
    const spent = Number(b.spentAmount) || 0;
    const contract = Number(b.contractAmount) || 0;
    if (contract > 0 && spent > contract) {
      alerts.push({
        level: 'critical',
        title: 'Budget Exceeded',
        detail: `${b.scope} is ${formatUSD(spent - contract)} over its ${formatUSD(contract)} budget.`,
        tag: 'Critical'
      });
    } else if (contract > 0 && spent / contract >= 0.85) {
      alerts.push({
        level: 'warning',
        title: 'Budget Warning',
        detail: `${b.scope} is ${Math.round((spent / contract) * 100)}% utilized.`,
        tag: 'Warning'
      });
    }

    if (b.payableDate) {
      const due = new Date(b.payableDate);
      const diffDays = Math.ceil((+due - +now) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= upcomingDays) {
        alerts.push({
          level: 'info',
          title: 'Payment Due',
          detail: `${b.scope} payable on ${due.toLocaleDateString()}.`,
          tag: 'Due Soon'
        });
      }
    }
  }

  return alerts.slice(0, 3); // top 3
}

export function recentTransactions(dataset: BudgetDatasetLocal, limit = 3) {
  return [...dataset.transactions]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, limit);
}
