import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ScrollText,
  Download,
  Filter,
  RotateCcw,
  ShieldCheck,
  Activity,
  CheckCircle2,
  XCircle,
  Search,
  Clock,
  Layers,
  Info,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { auditService } from '../services/api';
import type { AuditLog } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Pagination } from '../components/common/Pagination';
import { DEMO_AUDIT_LOGS } from '../data/demoData';

// ──────────────────────────────────────────────────────────────
// Filter option definitions — action values match the backend
// AuditLog model enum exactly so they work for both API calls
// and client-side filtering of demo data.
// ──────────────────────────────────────────────────────────────
const ACTION_OPTIONS: { label: string; value: string }[] = [
  { label: 'All Actions', value: '' },
  { label: 'User Login', value: 'USER_LOGIN' },
  { label: 'User Logout', value: 'USER_LOGOUT' },
  { label: 'Document Uploaded', value: 'DOCUMENT_UPLOADED' },
  { label: 'Document Viewed', value: 'DOCUMENT_VIEWED' },
  { label: 'Document Downloaded', value: 'DOCUMENT_DOWNLOADED' },
  { label: 'Document Updated', value: 'DOCUMENT_UPDATED' },
  { label: 'Document Deleted', value: 'DOCUMENT_DELETED' },
  { label: 'Version Created', value: 'DOCUMENT_VERSION_CREATED' },
  { label: 'Integrity Verified', value: 'INTEGRITY_VERIFIED' },
  { label: 'Integrity Failed', value: 'INTEGRITY_FAILED' },
  { label: 'Case Created', value: 'CASE_CREATED' },
  { label: 'Case Updated', value: 'CASE_UPDATED' },
  { label: 'Case Viewed', value: 'CASE_VIEWED' },
  { label: 'User Created', value: 'USER_CREATED' },
  { label: 'User Updated', value: 'USER_UPDATED' },
  { label: 'Permission Changed', value: 'PERMISSION_CHANGED' },
  { label: 'Search Performed', value: 'SEARCH_PERFORMED' },
  { label: 'AI Analysis Requested', value: 'AI_ANALYSIS_REQUESTED' },
];

const RESOURCE_TYPES: { label: string; value: string }[] = [
  { label: 'All Resources', value: '' },
  { label: 'Document', value: 'document' },
  { label: 'Case', value: 'case' },
  { label: 'User', value: 'user' },
  { label: 'System', value: 'system' },
];

// ──────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const pageSize = 12;

  // Filter state
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [selectedResourceType, setSelectedResourceType] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Track whether we fell back to demo data
  const [usingFallback, setUsingFallback] = useState<boolean>(false);

  /** Client-side filtering of the demo dataset */
  const applyDemoFiltering = useCallback(() => {
    let filtered = [...DEMO_AUDIT_LOGS];

    if (selectedAction) {
      filtered = filtered.filter((l) => l.action === selectedAction);
    }
    if (selectedResourceType) {
      filtered = filtered.filter(
        (l) => l.resourceType.toLowerCase() === selectedResourceType.toLowerCase()
      );
    }
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.userName.toLowerCase().includes(q) ||
          l.details.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          (l.resourceId && l.resourceId.toLowerCase().includes(q))
      );
    }
    if (dateFilter === 'today') {
      const startOfToday = new Date().setHours(0, 0, 0, 0);
      filtered = filtered.filter((l) => new Date(l.createdAt).getTime() >= startOfToday);
    } else if (dateFilter === '7days') {
      const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
      filtered = filtered.filter((l) => new Date(l.createdAt).getTime() >= cutoff);
    } else if (dateFilter === '30days') {
      const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
      filtered = filtered.filter((l) => new Date(l.createdAt).getTime() >= cutoff);
    }

    const calculatedTotal = filtered.length;
    const calculatedPages = Math.max(1, Math.ceil(calculatedTotal / pageSize));
    const startIdx = (page - 1) * pageSize;
    const paginated = filtered.slice(startIdx, startIdx + pageSize);

    setLogs(paginated);
    setTotalItems(calculatedTotal);
    setTotalPages(calculatedPages);
    setUsingFallback(true);
  }, [selectedAction, selectedResourceType, searchFilter, dateFilter, page, pageSize]);

  /** Fetch logs from the backend, falling back to demo data on failure */
  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await auditService.getAuditLogs({
        page,
        limit: pageSize,
        action: selectedAction || undefined,
        resourceType: selectedResourceType || undefined,
        search: searchFilter.trim() || undefined,
      });

      if (response.success && Array.isArray(response.data) && response.data.length > 0) {
        setLogs(response.data);
        setUsingFallback(false);
        if (response.pagination) {
          setTotalPages(response.pagination.pages || 1);
          setTotalItems(response.pagination.total || response.data.length);
        } else {
          setTotalPages(1);
          setTotalItems(response.data.length);
        }
      } else {
        // Backend returned empty — use demo data
        applyDemoFiltering();
      }
    } catch {
      // Backend unreachable
      applyDemoFiltering();
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, selectedAction, selectedResourceType, searchFilter, applyDemoFiltering]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  // Reset filters
  const handleReset = () => {
    setSelectedAction('');
    setSelectedResourceType('');
    setDateFilter('all');
    setSearchFilter('');
    setPage(1);
    toast.success('Audit filters reset');
  };

  // Top stats — computed only from whatever data we have.
  // Clearly derived from the currently-visible dataset.
  const stats = useMemo(() => {
    const source = usingFallback ? DEMO_AUDIT_LOGS : logs;
    const total = usingFallback ? DEMO_AUDIT_LOGS.length : totalItems;
    const successes = source.filter((l) => l.status === 'success').length;
    const successRate = source.length > 0
      ? ((successes / source.length) * 100).toFixed(1)
      : '100.0';

    const startOfToday = new Date().setHours(0, 0, 0, 0);
    const todayCount = source.filter(
      (l) => new Date(l.createdAt).getTime() >= startOfToday
    ).length;

    return {
      totalEvents: total,
      successRate: `${successRate}%`,
      todayEvents: todayCount,
    };
  }, [logs, totalItems, usingFallback]);

  // ── Badge helpers ──────────────────────────────────────────

  const getActionBadge = (action: string) => {
    const act = action.toUpperCase();
    const label = action.replace(/_/g, ' ');

    type Scheme = { bg: string; text: string; border: string };
    const schemes: Record<string, Scheme> = {
      LOGIN:    { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200' },
      LOGOUT:   { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200' },
      UPLOAD:   { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
      VIEW:     { bg: 'bg-slate-100',  text: 'text-slate-700',   border: 'border-slate-200' },
      DOWNLOAD: { bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200' },
      UPDATE:   { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200' },
      DELETE:   { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200' },
      VERIF:    { bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200' },
      INTEGR:   { bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200' },
      CREATE:   { bg: 'bg-teal-50',    text: 'text-teal-700',    border: 'border-teal-200' },
      SEARCH:   { bg: 'bg-cyan-50',    text: 'text-cyan-700',    border: 'border-cyan-200' },
      AI:       { bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200' },
      PERMISS:  { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200' },
    };

    const match = Object.keys(schemes).find((k) => act.includes(k));
    const s = match ? schemes[match] : { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${s.bg} ${s.text} border ${s.border}`}>
        {label}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const r = role.toLowerCase();
    const colors: Record<string, string> = {
      admin: 'bg-rose-50 text-rose-700 border-rose-200',
      investigator: 'bg-blue-50 text-blue-700 border-blue-200',
      forensic: 'bg-purple-50 text-purple-700 border-purple-200',
      legal: 'bg-amber-50 text-amber-700 border-amber-200',
    };
    const c = colors[r] || 'bg-slate-100 text-slate-700 border-slate-200';
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border capitalize ${c}`}>
        {role}
      </span>
    );
  };

  /** Format relative time for recent events */
  const formatRelativeTime = (dateStr: string): string => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  // ── Render ─────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <ScrollText className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Audit Trail
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Chronological log of user actions, document operations, and system events
          </p>
        </div>

        {/* Export button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => toast('Export feature planned for a future release.', { icon: '📋' })}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Events */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Events
            </span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats.totalEvents}</span>
            <span className="text-xs text-slate-500">logged entries</span>
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Success Rate
            </span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">{stats.successRate}</span>
            <span className="text-xs text-slate-500">of recorded operations</span>
          </div>
        </div>

        {/* Today's Events */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Today's Activity
            </span>
            <span className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats.todayEvents}</span>
            <span className="text-xs text-slate-500">events today</span>
          </div>
        </div>
      </div>

      {/* Demo data notice */}
      {usingFallback && !loading && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 flex items-center gap-2 text-xs text-amber-800">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <span>
            Showing <strong>demonstration data</strong> — the backend API is not currently reachable.
            Records below are from the built-in sample dataset.
          </span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => {
                setSearchFilter(e.target.value);
                setPage(1);
              }}
              placeholder="Search by user, details, or resource ID..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Dropdown filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </div>

            {/* Action Type */}
            <select
              aria-label="Filter by Action"
              value={selectedAction}
              onChange={(e) => {
                setSelectedAction(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {ACTION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Resource Type */}
            <select
              aria-label="Filter by Resource Type"
              value={selectedResourceType}
              onChange={(e) => {
                setSelectedResourceType(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {RESOURCE_TYPES.map((rt) => (
                <option key={rt.value} value={rt.value}>
                  {rt.label}
                </option>
              ))}
            </select>

            {/* Date Range */}
            <select
              aria-label="Filter by Date Range"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value as 'all' | 'today' | '7days' | '30days');
                setPage(1);
              }}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7days">Past 7 Days</option>
              <option value="30days">Past 30 Days</option>
            </select>

            {/* Reset */}
            {(selectedAction || selectedResourceType || dateFilter !== 'all' || searchFilter) && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <LoadingSpinner size="lg" text="Loading audit logs..." />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={ScrollText}
              title="No audit events found"
              description="No audit records match the selected filters."
              actionLabel="Clear Filters"
              onAction={handleReset}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Resource</th>
                  <th className="py-3 px-4">Resource ID</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 min-w-[240px]">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => {
                  const dateObj = new Date(log.createdAt);
                  const formattedDate = dateObj.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                  const formattedTime = dateObj.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false,
                  });

                  return (
                    <tr
                      key={log._id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Timestamp */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                        <div className="font-mono font-medium text-slate-800">{formattedDate}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{formattedTime}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{formatRelativeTime(log.createdAt)}</div>
                      </td>

                      {/* User */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{log.userName}</div>
                        {log.ipAddress && (
                          <div className="font-mono text-[10px] text-slate-400 flex items-center gap-1">
                            IP: {log.ipAddress}
                          </div>
                        )}
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getRoleBadge(log.userRole)}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getActionBadge(log.action)}
                      </td>

                      {/* Resource Type */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px] capitalize">
                          <Layers className="w-3 h-3 text-slate-400" />
                          {log.resourceType}
                        </span>
                      </td>

                      {/* Resource ID */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {log.resourceId ? (
                          <span className="font-mono text-[11px] font-medium text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                            {log.resourceId}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        {log.status === 'success' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Success
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                            <XCircle className="w-3 h-3 text-red-600" />
                            Failed
                          </span>
                        )}
                      </td>

                      {/* Details */}
                      <td className="py-3 px-4 text-slate-600 leading-relaxed text-xs">
                        <p className="line-clamp-2">{log.details}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && logs.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
            totalItems={totalItems}
            pageSize={pageSize}
          />
        )}
      </div>

      {/* Footer disclaimer */}
      <div className="flex items-start gap-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-700">Audit Trail Notice:</span>{' '}
          This audit log records user actions and system events in the database.
          Every document upload, view, download, integrity check, case update, and authentication event
          is captured with a timestamp, user identity, and action details.
          {usingFallback && (
            <span className="text-amber-600 font-medium">
              {' '}The entries shown above are demonstration data for prototype evaluation.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
