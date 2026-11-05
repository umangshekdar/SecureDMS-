import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Key,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Database,
  FileCheck,
  Activity,
  RefreshCw,
  UserCheck,
  Server,
  AlertOctagon,
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { analyticsService, auditService } from '../services/api';
import type { AuditLog } from '../types';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

// ──────────────────────────────────────────────────────────────
// Demonstration security events — used when the backend is offline
// ──────────────────────────────────────────────────────────────
const DEMO_SECURITY_LOGS: AuditLog[] = [
  {
    _id: 'sec-01',
    userId: 'usr-1',
    userName: 'Arjun Mehta',
    userRole: 'investigator',
    action: 'INTEGRITY_VERIFIED',
    resourceType: 'document',
    resourceId: 'DOC-2026-FIR-8831',
    details: 'SHA-256 fingerprint verified against original record digest.',
    status: 'success',
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    _id: 'sec-02',
    userId: 'usr-2',
    userName: 'Riya Sharma',
    userRole: 'forensic',
    action: 'INTEGRITY_VERIFIED',
    resourceType: 'document',
    resourceId: 'DOC-2026-FOR-9042',
    details: 'Hardware extraction image SHA-256 integrity check passed.',
    status: 'success',
    createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
  },
  {
    _id: 'sec-03',
    userId: 'usr-admin',
    userName: 'System Administrator',
    userRole: 'admin',
    action: 'USER_LOGIN',
    resourceType: 'user',
    resourceId: 'USR-ADMIN-01',
    details: 'Administrator authenticated via JWT bearer credentials.',
    status: 'success',
    createdAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
  },
  {
    _id: 'sec-04',
    userId: 'usr-admin',
    userName: 'System Administrator',
    userRole: 'admin',
    action: 'PERMISSION_CHANGED',
    resourceType: 'user',
    resourceId: 'USR-LEGAL-88',
    details: 'Updated account access permissions for legal prosecution officer.',
    status: 'success',
    createdAt: new Date(Date.now() - 1000 * 60 * 250).toISOString(),
  },
  {
    _id: 'sec-05',
    userId: 'usr-3',
    userName: 'Kabir Verma',
    userRole: 'legal',
    action: 'USER_LOGIN',
    resourceType: 'user',
    resourceId: 'USR-LEGAL-03',
    details: 'Legal officer session authenticated.',
    status: 'success',
    createdAt: new Date(Date.now() - 1000 * 60 * 320).toISOString(),
  },
  {
    _id: 'sec-06',
    userId: 'usr-2',
    userName: 'Riya Sharma',
    userRole: 'forensic',
    action: 'DOCUMENT_VERSION_CREATED',
    resourceType: 'document',
    resourceId: 'DOC-2026-FOR-9042',
    details: 'Appended version 2 — new revision preserves parent SHA-256 hash.',
    status: 'success',
    createdAt: new Date(Date.now() - 1000 * 60 * 500).toISOString(),
  },
];

export const Security: React.FC = () => {
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole('admin');

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemoData, setIsDemoData] = useState<boolean>(false);

  // Security telemetry
  const [metrics, setMetrics] = useState({
    documentsVerified: 0,
    totalDocuments: 0,
    failedChecks: 0,
    restrictedDocuments: 0,
    totalAuditLogs: 0,
  });

  const [recentEvents, setRecentEvents] = useState<AuditLog[]>([]);

  const fetchSecurityData = useCallback(async () => {
    setError(null);
    try {
      const [analyticsRes, auditRes] = await Promise.allSettled([
        analyticsService.getAnalytics(),
        auditService.getAuditLogs({ limit: 20 }),
      ]);

      let hasLiveData = false;

      // Parse analytics if available
      if (analyticsRes.status === 'fulfilled' && analyticsRes.value?.success && analyticsRes.value.data) {
        const d = analyticsRes.value.data;
        const confidentialCount =
          d.documentsBySecurityLevel?.reduce((acc: number, curr: { level: string; count: number }) => {
            if (curr.level === 'confidential' || curr.level === 'highly-confidential') {
              return acc + curr.count;
            }
            return acc;
          }, 0) || 0;

        setMetrics({
          documentsVerified: d.integrityVerified || 0,
          totalDocuments: d.totalDocuments || 0,
          failedChecks: 0, // Live backend records failed verification as AuditLog
          restrictedDocuments: confidentialCount,
          totalAuditLogs: d.recentActivity?.length || 0,
        });
        hasLiveData = true;
      }

      // Parse audit logs for security-relevant actions
      if (auditRes.status === 'fulfilled' && auditRes.value?.success && Array.isArray(auditRes.value.data)) {
        const securityActions = [
          'USER_LOGIN',
          'USER_LOGOUT',
          'USER_CREATED',
          'USER_UPDATED',
          'PERMISSION_CHANGED',
          'INTEGRITY_VERIFIED',
          'INTEGRITY_FAILED',
        ];

        const secEvents = auditRes.value.data.filter((l) => securityActions.includes(l.action));
        const failedLogs = auditRes.value.data.filter((l) => l.action === 'INTEGRITY_FAILED' || l.status === 'failure');

        setRecentEvents(secEvents.slice(0, 8));
        setMetrics((prev) => ({
          ...prev,
          failedChecks: failedLogs.length,
        }));
        hasLiveData = true;
      }

      if (!hasLiveData) {
        // Fallback to demo metrics when offline
        setIsDemoData(true);
        setMetrics({
          documentsVerified: 9,
          totalDocuments: 9,
          failedChecks: 0,
          restrictedDocuments: 6,
          totalAuditLogs: 18,
        });
        setRecentEvents(DEMO_SECURITY_LOGS);
      } else {
        setIsDemoData(false);
      }
    } catch (err) {
      console.warn('Backend unavailable, using fallback security metrics:', err);
      setIsDemoData(true);
      setMetrics({
        documentsVerified: 9,
        totalDocuments: 9,
        failedChecks: 0,
        restrictedDocuments: 6,
        totalAuditLogs: 18,
      });
      setRecentEvents(DEMO_SECURITY_LOGS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSecurityData();
  }, [fetchSecurityData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSecurityData();
    toast.success('Security diagnostics refreshed');
  };

  // RBAC Permission Matrix data
  const rbacMatrix = [
    { permission: 'View Dashboard & Cases', admin: true, investigator: true, forensic: true, legal: true },
    { permission: 'Create New Investigation Case', admin: true, investigator: true, forensic: false, legal: false },
    { permission: 'Upload Evidentiary Documents', admin: true, investigator: true, forensic: true, legal: false },
    { permission: 'Execute SHA-256 Hash Verification', admin: true, investigator: true, forensic: true, legal: true },
    { permission: 'Create Document Versions', admin: true, investigator: true, forensic: true, legal: false },
    { permission: 'Access Audit Trail Ledger', admin: true, investigator: true, forensic: true, legal: true },
    { permission: 'View Security Center & Analytics', admin: true, investigator: false, forensic: false, legal: false },
    { permission: 'Manage Users & Role Assignments', admin: true, investigator: false, forensic: false, legal: false },
  ];

  // Verified status cards
  const coreSecurityModules = [
    {
      title: 'Authentication & Session',
      tech: 'JWT Bearer Tokens',
      status: 'Implemented',
      statusType: 'success' as const,
      description: 'Stateless JSON Web Tokens signed with server secret, verified per request via auth middleware.',
      detail: '24-hour expiration with automatic 401 redirect',
      icon: Key,
    },
    {
      title: 'Role-Based Access Control',
      tech: 'RBAC Middleware',
      status: 'Implemented',
      statusType: 'success' as const,
      description: 'Strict role checking (Admin, Investigator, Forensic, Legal) enforced on backend routes and client layout.',
      detail: 'Protected via authorize(...) middleware',
      icon: UserCheck,
    },
    {
      title: 'Document Hash Verification',
      tech: 'SHA-256 Digest',
      status: 'Implemented',
      statusType: 'success' as const,
      description: 'Deterministic 256-bit cryptographic digest calculated on document upload and verified on demand.',
      detail: 'Computed from raw buffer via Node.js crypto / subtle',
      icon: FileCheck,
    },
    {
      title: 'Audit Logging Engine',
      tech: 'Structured Event Trail',
      status: 'Implemented',
      statusType: 'success' as const,
      description: 'Chronological recording of user actions, resource targets, IP addresses, and timestamps in database.',
      detail: 'Integrated with logAuditEvent middleware',
      icon: Activity,
    },
    {
      title: 'File Storage Security',
      tech: 'Cloudinary / Local Buffer',
      status: 'Configured',
      statusType: 'warning' as const,
      description: 'Multi-part form upload handler with MIME validation and 50MB file size ceiling.',
      detail: 'Production deployment requires private S3 / self-hosted vault',
      icon: Database,
    },
    {
      title: 'API Hardening',
      tech: 'Helmet + Rate Limiting',
      status: 'Implemented',
      statusType: 'success' as const,
      description: 'HTTP security headers via Helmet and IP-based rate limiting (100 requests / 15 minutes).',
      detail: 'Configured in backend Express server',
      icon: Server,
    },
  ];

  // RBAC Role Enforcement Check: Non-admins cannot access Security Center
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="bg-white rounded-2xl border border-rose-200 shadow-sm p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto ring-8 ring-rose-50/50">
            <AlertOctagon className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Access Restricted: Administrator Only</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            The Security Center contains sensitive system diagnostic controls and audit metrics. Your current role (
            <span className="font-semibold text-slate-800 capitalize">{user?.role || 'Guest'}</span>) is not authorized to view this resource under institutional RBAC policy.
          </p>
          <div className="pt-4">
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <Lock className="w-3.5 h-3.5" />
              Enforced by backend middleware: authorize('admin')
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" text="Loading security diagnostics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <EmptyState
          icon={AlertTriangle}
          title="Security Diagnostic Error"
          description={error}
          actionLabel="Retry Diagnostics"
          onAction={handleRefresh}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Security Center
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Status of authentication, role-based access control, document integrity, and audit logging
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isDemoData && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Demonstration Diagnostics
            </span>
          )}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Diagnostics
          </button>
        </div>
      </div>

      {/* Mandatory Prototype Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <strong className="font-semibold block text-amber-950 mb-0.5">
            Demonstration Prototype Disclaimer
          </strong>
          SecureDMS is a demonstration prototype. Production deployment requires formal security assessment, infrastructure hardening and institutional validation.
        </div>
      </div>

      {/* Active Session Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Current Administrator Session</h2>
              <p className="text-xs text-slate-500">Active authenticated identity</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Session Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">User</span>
            <span className="font-semibold text-slate-800 text-sm">{user?.name || 'Administrator'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">Email</span>
            <span className="font-mono text-slate-700">{user?.email || 'admin@securedms.demo'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">Assigned Role</span>
            <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-semibold uppercase text-[10px]">
              {user?.role || 'admin'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">Token Scheme</span>
            <span className="font-mono text-slate-700">JWT Bearer (HS256)</span>
          </div>
        </div>
      </div>

      {/* Security Status Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Documents Verified */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Documents Verified
            </span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {metrics.documentsVerified}
            </span>
            <span className="text-xs text-slate-500">
              of {metrics.totalDocuments} total
            </span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            SHA-256 fingerprint verified
          </div>
        </div>

        {/* Failed Integrity Checks */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Failed Checks
            </span>
            <span className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <ShieldAlert className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold ${metrics.failedChecks > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {metrics.failedChecks}
            </span>
            <span className="text-xs text-slate-500">breach events</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {metrics.failedChecks === 0 ? 'No hash mismatches detected' : 'Requires security review'}
          </div>
        </div>

        {/* Restricted Documents */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Restricted Records
            </span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Lock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {metrics.restrictedDocuments}
            </span>
            <span className="text-xs text-slate-500">classified files</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-700 font-medium">
            Confidential &amp; Highly Confidential
          </div>
        </div>

        {/* Audit Log Entries */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Audit Events Recorded
            </span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {metrics.totalAuditLogs}
            </span>
            <span className="text-xs text-slate-500">audit trail entries</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Stored in MongoDB ledger
          </div>
        </div>
      </div>

      {/* Security Architecture Modules */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">Security Architecture Implementation Status</h2>
          <p className="text-xs text-slate-500">Current status of security controls based on genuine codebase implementation</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coreSecurityModules.map((mod, i) => {
            const Icon = mod.icon;
            const isSuccess = mod.statusType === 'success';

            return (
              <div
                key={i}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
                      <Icon className="w-5 h-5" />
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        isSuccess
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {isSuccess ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                      {mod.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">
                    {mod.title}
                  </h3>
                  <div className="text-xs font-mono text-blue-700 font-medium mt-0.5">
                    {mod.tech}
                  </div>

                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
                  {mod.detail}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Role-Based Access Control (RBAC) Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Role-Based Access Control (RBAC) Matrix</h2>
              <p className="text-xs text-slate-500">Permissions enforced across system roles via backend authorize(...) middleware</p>
            </div>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
              4 Roles Defined
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">System Operation / Permission</th>
                <th className="py-3 px-4 text-center">Admin</th>
                <th className="py-3 px-4 text-center">Investigator</th>
                <th className="py-3 px-4 text-center">Forensic Officer</th>
                <th className="py-3 px-4 text-center">Legal Counsel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rbacMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-medium text-slate-800 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    {row.permission}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.admin ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 mx-auto font-bold">
                        ✓
                      </span>
                    ) : (
                      <span className="text-slate-300 font-bold">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.investigator ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 mx-auto font-bold">
                        ✓
                      </span>
                    ) : (
                      <span className="text-slate-300 font-bold">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.forensic ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 mx-auto font-bold">
                        ✓
                      </span>
                    ) : (
                      <span className="text-slate-300 font-bold">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.legal ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 mx-auto font-bold">
                        ✓
                      </span>
                    ) : (
                      <span className="text-slate-300 font-bold">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Security-Relevant Audit Events Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Security-Relevant Events</h2>
            <p className="text-xs text-slate-500">Security-critical log events (authentication, permission changes, and hash validations)</p>
          </div>
          <span className="text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
            {recentEvents.length} events
          </span>
        </div>

        {recentEvents.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Activity}
              title="No security events recorded"
              description="No security-relevant actions have been logged yet."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Target Resource</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentEvents.map((evt) => {
                  const isFail = evt.status === 'failure' || evt.action === 'INTEGRITY_FAILED';
                  const dateObj = new Date(evt.createdAt);

                  return (
                    <tr key={evt._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {evt.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{evt.userName}</div>
                        <div className="text-[10px] text-slate-400 capitalize">{evt.userRole}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-600">
                        {evt.resourceId || evt.resourceType}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isFail ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Failed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Success
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-sm truncate text-xs">
                        {evt.details}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                        {dateObj.toLocaleTimeString('en-US', { hour12: false })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Feature Classification: Implemented vs Configured vs Planned */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Security Capabilities Status</h2>
          <p className="text-xs text-slate-500">
            Categorization distinguishing implemented features, configured integrations, and planned roadmap items
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Implemented in Codebase */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-3">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Implemented in Codebase
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>SHA-256 document hashing &amp; verification</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>JWT bearer session authentication</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Role-Based Access Control (4 roles)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Audit logging on key operations</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Document version lineage tracking</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Helmet headers &amp; rate limiting</span>
              </li>
            </ul>
          </div>

          {/* 2. Configured / Unverified in Production */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
              <Clock className="w-4 h-4 text-amber-600" />
              Configured / Unverified
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">•</span>
                <span>Cloudinary storage (configured with demo keys)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">•</span>
                <span>Production TLS termination (requires reverse proxy / SSL)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">•</span>
                <span>MongoDB replica set for audit durability</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">•</span>
                <span>Remote document hash fetch from public CDN</span>
              </li>
            </ul>
          </div>

          {/* 3. Planned for Future Release */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
              <Layers className="w-4 h-4 text-blue-600" />
              Planned for Future Release
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-1.5">
                <span className="text-blue-500 font-bold">→</span>
                <span>Hardware Security Module (HSM) key storage</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-blue-500 font-bold">→</span>
                <span>FIDO2 / WebAuthn biometric 2FA</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-blue-500 font-bold">→</span>
                <span>National e-Courts &amp; CCTNS interoperability</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-blue-500 font-bold">→</span>
                <span>X.509 digital certificate signatures</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-blue-500 font-bold">→</span>
                <span>Automated PII redaction scanner</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;
