import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, Lock } from 'lucide-react';
import { SecurityLevel } from '../../types';

interface SecurityBadgeProps {
  level: SecurityLevel | string;
  size?: 'sm' | 'md';
}

const levelConfig: Record<string, { label: string; bg: string; text: string; icon: React.FC<{ className?: string }> }> = {
  public: {
    label: 'Public',
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    text: 'text-emerald-700',
    icon: ShieldCheck,
  },
  internal: {
    label: 'Internal',
    bg: 'bg-blue-50 text-blue-800 border-blue-200',
    text: 'text-blue-700',
    icon: Shield,
  },
  confidential: {
    label: 'Confidential',
    bg: 'bg-amber-50 text-amber-800 border-amber-200',
    text: 'text-amber-700',
    icon: Lock,
  },
  'highly-confidential': {
    label: 'Highly Confidential',
    bg: 'bg-rose-50 text-rose-800 border-rose-200',
    text: 'text-rose-700',
    icon: ShieldAlert,
  },
};

export const SecurityBadge: React.FC<SecurityBadgeProps> = ({ level, size = 'md' }) => {
  const normalized = level.toLowerCase();
  const config = levelConfig[normalized] || {
    label: level,
    bg: 'bg-slate-100 text-slate-800 border-slate-200',
    text: 'text-slate-600',
    icon: Shield,
  };

  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-md border shadow-2xs tracking-wide uppercase ${
        config.bg
      } ${size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'}`}
    >
      <IconComponent className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {config.label}
    </span>
  );
};
