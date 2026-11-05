import React from 'react';
import { CaseStatus, DocumentStatus } from '../../types';

interface StatusBadgeProps {
  status: CaseStatus | DocumentStatus | 'active' | 'inactive' | 'suspended' | string;
  size?: 'sm' | 'md';
}

const statusColorMap: Record<string, { bg: string; text: string; dot: string; label?: string }> = {
  // Case statuses
  open: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Open' },
  active: { bg: 'bg-blue-50 text-blue-700 border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Active' },
  'under-review': { bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Under Review' },
  closed: { bg: 'bg-slate-100 text-slate-700 border-slate-300', text: 'text-slate-700', dot: 'bg-slate-400', label: 'Closed' },
  archived: { bg: 'bg-purple-50 text-purple-700 border-purple-200', text: 'text-purple-700', dot: 'bg-purple-400', label: 'Archived' },
  
  // Document statuses
  processing: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', text: 'text-indigo-700', dot: 'bg-indigo-500', label: 'Processing' },
  processed: { bg: 'bg-cyan-50 text-cyan-700 border-cyan-200', text: 'text-cyan-700', dot: 'bg-cyan-500', label: 'Processed' },
  verified: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Verified' },
  'review-required': { bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Review Req.' },
  
  // User statuses
  inactive: { bg: 'bg-slate-100 text-slate-600 border-slate-200', text: 'text-slate-600', dot: 'bg-slate-400', label: 'Inactive' },
  suspended: { bg: 'bg-rose-50 text-rose-700 border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500', label: 'Suspended' },
  
  // Generic audit/outcome statuses
  success: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Success' },
  failure: { bg: 'bg-rose-50 text-rose-700 border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500', label: 'Failed' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalizedKey = status.toLowerCase();
  const config = statusColorMap[normalizedKey] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    text: 'text-slate-700',
    dot: 'bg-slate-400',
    label: status,
  };

  const label = config.label || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {label}
    </span>
  );
};
