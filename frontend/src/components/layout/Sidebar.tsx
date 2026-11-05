import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Upload,
  Search,
  ScrollText,
  Shield,
  BarChart3,
  Users,
  Settings,
  X,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItemConfig {
  label: string;
  to: string;
  icon: React.FC<{ className?: string }>;
  roles?: UserRole[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const currentRole = user?.role || 'investigator';

  const navItems: NavItemConfig[] = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Cases', to: '/cases', icon: Briefcase },
    { label: 'Documents', to: '/documents', icon: FileText },
    {
      label: 'Upload Document',
      to: '/upload',
      icon: Upload,
      roles: ['admin', 'investigator', 'forensic'],
    },
    { label: 'Smart Search', to: '/search', icon: Search },
    { label: 'Audit Trail', to: '/audit-logs', icon: ScrollText },
    {
      label: 'Security Center',
      to: '/security',
      icon: Shield,
      roles: ['admin'],
    },
    {
      label: 'Analytics',
      to: '/analytics',
      icon: BarChart3,
      roles: ['admin'],
    },
    {
      label: 'User Management',
      to: '/users',
      icon: Users,
      roles: ['admin'],
    },
    { label: 'Settings', to: '/settings', icon: Settings },
  ];

  const filteredItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(currentRole as UserRole);
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white ring-2 ring-blue-400/30">
              <Shield className="w-5 h-5 fill-blue-600 stroke-white stroke-2" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1">
                Secure<span className="text-blue-400">DMS</span>
              </span>
              <span className="text-[10px] text-slate-400 block tracking-widest uppercase font-mono">
                GovOps Core
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security badge bar */}
        <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            DEFENSE LEVEL IV
          </span>
          <Lock className="w-3.5 h-3.5 text-slate-500" />
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Main Navigation
          </div>
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Bottom system status banner */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/50">
          <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-slate-300">SHA-256 Ledger</div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Integrity Intact
              </div>
            </div>
            <div className="text-[10px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
              v1.0.4
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
