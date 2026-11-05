import React from 'react';
import { UserRole } from '../../types';

interface RoleBadgeProps {
  role: UserRole | string;
  size?: 'sm' | 'md';
}

const roleStyles: Record<string, { bg: string; text: string; label: string }> = {
  admin: {
    bg: 'bg-rose-100 text-rose-800 border-rose-200',
    text: 'text-rose-800',
    label: 'Administrator',
  },
  investigator: {
    bg: 'bg-blue-100 text-blue-800 border-blue-200',
    text: 'text-blue-800',
    label: 'Lead Investigator',
  },
  forensic: {
    bg: 'bg-purple-100 text-purple-800 border-purple-200',
    text: 'text-purple-800',
    label: 'Forensic Analyst',
  },
  legal: {
    bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    text: 'text-emerald-800',
    label: 'Legal Counsel',
  },
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'md' }) => {
  const normalized = role?.toLowerCase() || '';
  const config = roleStyles[normalized] || {
    bg: 'bg-slate-100 text-slate-800 border-slate-200',
    text: 'text-slate-800',
    label: role,
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-md border tracking-wider uppercase ${
        config.bg
      } ${size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs'}`}
    >
      {config.label}
    </span>
  );
};
