
// Shared types for consistency across the application
export type ProjectStatus = 'complete' | 'on-track' | 'at-risk' | 'overdue';
export type MilestoneStatus = 'complete' | 'pending' | 'overdue';

// Utility functions
export const fmtMoney = (n: number) => `$${n.toLocaleString()}`;

// Status color mappings
export const getProjectStatusColor = (status: ProjectStatus) => {
  switch (status) {
    case 'complete': return 'bg-green-500';
    case 'on-track': return 'bg-blue-500';
    case 'at-risk': return 'bg-yellow-500';
    case 'overdue': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

export const getRiskStatusColor = (score: number) => {
  if (score >= 70) return 'text-red-600 bg-red-50 rounded-full px-2 py-0.5';
  if (score >= 40) return 'text-yellow-600 bg-yellow-50 rounded-full px-2 py-0.5';
  return 'text-green-600 bg-green-50 rounded-full px-2 py-0.5';
};
