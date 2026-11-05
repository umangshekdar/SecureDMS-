import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { RoleBadge } from './RoleBadge';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard & Overview',
  '/cases': 'Case Management',
  '/documents': 'Document Repository',
  '/upload': 'Secure Document Upload',
  '/search': 'Smart Semantic Search',
  '/audit-logs': 'Cryptographic Audit Trail',
  '/security': 'Security Operations Center',
  '/analytics': 'Platform Analytics',
  '/users': 'User & Role Access Management',
  '/settings': 'System Settings',
};

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine title based on exact match or prefix
  let title = 'SecureDMS Console';
  for (const [path, pageTitle] of Object.entries(pageTitles)) {
    if (location.pathname === path || location.pathname.startsWith(`${path}/`)) {
      title = pageTitle;
      break;
    }
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition relative focus:outline-none"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
          </button>
        </div>

        <div className="h-6 w-px bg-slate-200" />

        {/* User Info & Role */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs ring-2 ring-slate-100 shadow-2xs">
            {initials}
          </div>

          <div className="hidden md:flex flex-col text-left">
            <span className="text-sm font-semibold text-slate-800 leading-tight">
              {user?.name || 'Authorized User'}
            </span>
            <div className="mt-0.5">
              <RoleBadge role={user?.role || 'investigator'} size="sm" />
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition ml-1 focus:outline-none"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
