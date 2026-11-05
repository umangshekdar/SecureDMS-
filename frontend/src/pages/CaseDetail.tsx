import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  Edit3,
  Calendar,
  Clock,
  User as UserIcon,
  Users as UsersIcon,
  FileText,
  Shield,
  Clock4,
  ExternalLink,
  Plus,
  RefreshCw,
  Activity,
  X,
  AlertCircle,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { caseService, documentService, auditService } from '../services/api';
import {
  Case,
  Document as DocumentType,
  AuditLog,
  CasePriority,
  CaseStatus,
  CaseType,
  User,
} from '../types';
import { useAuth } from '../hooks/useAuth';
import { StatusBadge } from '../components/common/StatusBadge';
import { SecurityBadge } from '../components/common/SecurityBadge';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { getDemoCase, getDemoDocuments, isNetworkOrServerError } from '../data/demoData';

const CASE_TYPES: { value: CaseType; label: string }[] = [
  { value: 'financial', label: 'Financial' },
  { value: 'criminal', label: 'Criminal' },
  { value: 'civil', label: 'Civil' },
  { value: 'cybercrime', label: 'Cybercrime' },
  { value: 'forensic', label: 'Forensic' },
  { value: 'administrative', label: 'Administrative' },
  { value: 'other', label: 'Other' },
];

const CASE_STATUSES: { value: CaseStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'active', label: 'Active' },
  { value: 'under-review', label: 'Under Review' },
  { value: 'closed', label: 'Closed' },
  { value: 'archived', label: 'Archived' },
];

const CASE_PRIORITIES: { value: CasePriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const PriorityBadge: React.FC<{ priority: CasePriority }> = ({ priority }) => {
  const config = {
    low: 'bg-slate-100 text-slate-700 border-slate-300',
    medium: 'bg-blue-50 text-blue-700 border-blue-200',
    high: 'bg-amber-50 text-amber-700 border-amber-200',
    critical: 'bg-rose-50 text-rose-700 border-rose-200',
  }[priority] || 'bg-slate-100 text-slate-700 border-slate-300';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${config}`}
    >
      {priority}
    </span>
  );
};

export const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const canEdit = hasRole(['admin', 'investigator']);

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoData, setIsDemoData] = useState<boolean>(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<{
    title: string;
    description: string;
    caseType: CaseType;
    priority: CasePriority;
    status: CaseStatus;
  }>({
    title: '',
    description: '',
    caseType: 'cybercrime',
    priority: 'medium',
    status: 'open',
  });

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch Case
      let fetchedCase: Case | null = null;
      let usingDemo = false;
      try {
        const caseRes = await caseService.getCase(id);
        if (caseRes && caseRes.success && caseRes.data) {
          fetchedCase = caseRes.data;
          setIsDemoData(false);
        }
      } catch (err: unknown) {
        if (isNetworkOrServerError(err)) {
          fetchedCase = getDemoCase(id);
          usingDemo = true;
          setIsDemoData(true);
        } else {
          throw err;
        }
      }

      // If backend returned empty or not found, check demo fallback
      if (!fetchedCase) {
        fetchedCase = getDemoCase(id);
        if (fetchedCase) {
          usingDemo = true;
          setIsDemoData(true);
        }
      }

      if (!fetchedCase) {
        throw new Error('Case record not found');
      }

      setCaseData(fetchedCase);
      setEditForm({
        title: fetchedCase.title,
        description: fetchedCase.description || '',
        caseType: fetchedCase.caseType,
        priority: fetchedCase.priority,
        status: fetchedCase.status,
      });

      // 2. Fetch Documents for this case
      if (usingDemo) {
        const demoDocs = getDemoDocuments({ caseId: fetchedCase._id }).documents;
        const demoDocsByCode = getDemoDocuments({ caseId: fetchedCase.caseId }).documents;
        const allDocs = [...demoDocs];
        for (const d of demoDocsByCode) {
          if (!allDocs.some((x) => x._id === d._id)) {
            allDocs.push(d);
          }
        }
        setDocuments(allDocs);
      } else {
        try {
          const docRes = await documentService.getDocuments({
            caseId: fetchedCase._id || id,
            limit: 100,
          });
          if (docRes && docRes.success) {
            setDocuments(docRes.data || []);
          }
        } catch (docErr) {
          if (isNetworkOrServerError(docErr)) {
            const demoDocs = getDemoDocuments({ caseId: fetchedCase._id }).documents;
            const demoDocsByCode = getDemoDocuments({ caseId: fetchedCase.caseId }).documents;
            const allDocs = [...demoDocs];
            for (const d of demoDocsByCode) {
              if (!allDocs.some((x) => x._id === d._id)) {
                allDocs.push(d);
              }
            }
            setDocuments(allDocs);
          } else {
            setDocuments([]);
          }
        }
      }

      // 3. Fetch Audit Logs for this case
      try {
        const auditRes = await auditService.getAuditLogs({
          resourceType: 'case',
          limit: 20,
        });
        if (auditRes && auditRes.success) {
          // Filter audit logs specifically referencing this case id or title
          const relevantLogs = (auditRes.data || []).filter(
            (log) =>
              log.resourceId === fetchedCase!._id ||
              log.resourceId === fetchedCase!.caseId ||
              log.details?.includes(fetchedCase!.caseId) ||
              log.details?.includes(fetchedCase!.title)
          );
          setAuditLogs(relevantLogs.length > 0 ? relevantLogs : (auditRes.data || []).slice(0, 5));
        }
      } catch {
        // Audit logs fetch failure shouldn't block case display
        setAuditLogs([]);
      }
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || 'Failed to fetch case data');
      toast.error(errorObj.message || 'Failed to fetch case data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseData || !id) return;

    if (!editForm.title.trim()) {
      toast.error('Case Title is required');
      return;
    }

    try {
      setUpdating(true);
      const res = await caseService.updateCase(caseData._id || id, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        caseType: editForm.caseType,
        priority: editForm.priority,
        status: editForm.status,
      });

      if (res.success) {
        toast.success('Case docket updated successfully');
        setIsEditModalOpen(false);
        fetchData();
      } else {
        toast.error(res.message || 'Failed to update case');
      }
    } catch (err: unknown) {
      if (isNetworkOrServerError(err)) {
        setCaseData((prev) =>
          prev
            ? {
                ...prev,
                title: editForm.title.trim(),
                description: editForm.description.trim(),
                caseType: editForm.caseType,
                priority: editForm.priority,
                status: editForm.status,
                updatedAt: new Date().toISOString(),
              }
            : null
        );
        setIsDemoData(true);
        setIsEditModalOpen(false);
        toast.success('Case updated in demonstration mode');
      } else {
        const errorObj = err as Error;
        toast.error(errorObj.message || 'Failed to update case');
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" text="Retrieving verified case docket..." />
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            to="/cases"
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 transition shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h2 className="text-xl font-bold text-slate-900">Case Not Available</h2>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-900">Unable to load case record</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
            {error || 'The requested case docket could not be retrieved from the database.'}
          </p>
          <button
            onClick={() => navigate('/cases')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Cases</span>
          </button>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalDocs = documents.length;
  const verifiedDocs = documents.filter((d) => d.status === 'verified').length;
  const pendingReviewDocs = documents.filter(
    (d) => d.status === 'review-required' || d.status === 'processing'
  ).length;

  // Format creator info
  const creatorName =
    typeof caseData.createdBy === 'object' && caseData.createdBy !== null
      ? (caseData.createdBy as User).name
      : typeof caseData.createdBy === 'string'
      ? caseData.createdBy
      : 'System Investigator';

  const creatorEmail =
    typeof caseData.createdBy === 'object' && caseData.createdBy !== null
      ? (caseData.createdBy as User).email
      : '';

  // Assigned Users
  const assignedUsersList = Array.isArray(caseData.assignedUsers) ? caseData.assignedUsers : [];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/cases')}
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 transition shadow-xs"
            title="Back to Cases"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                {caseData.caseId || caseData._id.substring(0, 8)}
              </span>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {caseData.title}
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>Created {new Date(caseData.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span className="capitalize">Type: {caseData.caseType}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition shadow-xs"
            title="Refresh docket"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {canEdit && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold transition shadow-xs"
            >
              <Edit3 className="w-4 h-4 text-slate-500" />
              <span>Edit Docket</span>
            </button>
          )}
          <Link
            to={`/upload?caseId=${caseData._id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Attach Document</span>
          </Link>
        </div>
      </div>

      {/* Demo data notice */}
      {isDemoData && !loading && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 flex items-center gap-2 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Showing <strong>demonstration case record</strong> — the backend API is not currently reachable. Data is sourced from the built-in demo dataset.
          </span>
        </div>
      )}

      {/* Case Header Badges Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Status:</span>
            <StatusBadge status={caseData.status} />
          </div>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Priority:</span>
            <PriorityBadge priority={caseData.priority} />
          </div>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Category:</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 capitalize">
              {caseData.caseType}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Registered: {new Date(caseData.createdAt).toLocaleDateString()}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Last Updated: {new Date(caseData.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Metrics / Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Evidence Files
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalDocs}</p>
            <p className="text-xs text-slate-500 mt-1">Bound to this case docket</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cryptographically Verified
            </p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{verifiedDocs}</p>
            <p className="text-xs text-slate-500 mt-1">SHA-256 integrity intact</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Verification
            </p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{pendingReviewDocs}</p>
            <p className="text-xs text-slate-500 mt-1">Awaiting audit or processing</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock4 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Overview & Assigned Users on Left, Timeline on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                Case Docket Overview
              </h2>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Description & Evidentiary Scope
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/60 p-4 rounded-lg border border-slate-100">
                {caseData.description || 'No detailed narrative provided for this case record.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="border border-slate-100 rounded-lg p-3 bg-slate-50/40">
                <span className="text-xs text-slate-400 block font-medium">Originating Officer / Creator</span>
                <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 mt-1">
                  <UserIcon className="w-4 h-4 text-blue-600" />
                  {creatorName}
                </span>
                {creatorEmail && <span className="text-xs text-slate-500">{creatorEmail}</span>}
              </div>

              <div className="border border-slate-100 rounded-lg p-3 bg-slate-50/40">
                <span className="text-xs text-slate-400 block font-medium">Record Classification</span>
                <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 mt-1 capitalize">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  {caseData.caseType} docket
                </span>
                <span className="text-xs text-slate-500">Tier: Official Government Investigation</span>
              </div>
            </div>
          </div>

          {/* Assigned Personnel Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UsersIcon className="w-4 h-4 text-blue-600" />
                Assigned Personnel & Investigators ({assignedUsersList.length})
              </h2>
            </div>

            {assignedUsersList.length === 0 ? (
              <p className="text-sm text-slate-500 italic py-2">
                No individual investigators have been assigned to this case yet. The case remains accessible by authorized officers in department.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {assignedUsersList.map((assigned, idx) => {
                  const isUserObj = typeof assigned === 'object' && assigned !== null;
                  const name = isUserObj ? (assigned as User).name : `Agent ID: ${assigned}`;
                  const role = isUserObj ? (assigned as User).role : 'Investigator';
                  const email = isUserObj ? (assigned as User).email : '';

                  return (
                    <div
                      key={isUserObj ? (assigned as User)._id : idx}
                      className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50/50"
                    >
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center uppercase">
                        {name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 truncate">{name}</p>
                        <p className="text-xs text-slate-500 capitalize">{role} {email && `• ${email}`}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Activity Timeline */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4 h-full">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                Audit Trail
              </h2>
              <span className="text-xs text-slate-500 font-medium">Secured</span>
            </div>

            {auditLogs.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p>No recent audit events captured for this docket.</p>
              </div>
            ) : (
              <div className="relative pl-4 space-y-6 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {auditLogs.map((log) => (
                  <div key={log._id} className="relative flex items-start gap-2.5 text-xs">
                    <div className="absolute -left-4 mt-0.5 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-slate-800">
                          {log.action.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-0.5">{log.details}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        By: <span className="font-medium text-slate-600">{log.userName}</span> (
                        {log.userRole})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Case Attached Documents Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-600" />
              Attached Evidence & Documents ({documents.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Files verified under chain of custody for this case record
            </p>
          </div>
          <Link
            to={`/upload?caseId=${caseData._id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload New File</span>
          </Link>
        </div>

        {documents.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={FileText}
              title="No documents linked to this case"
              description="Upload files to attach evidence, charge sheets, witness statements, or forensic reports to this case."
              actionLabel="Upload First Document"
              onAction={() => navigate(`/upload?caseId=${caseData._id}`)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th scope="col" className="py-3 px-4">Doc ID</th>
                  <th scope="col" className="py-3 px-4">Document Title</th>
                  <th scope="col" className="py-3 px-4">Category</th>
                  <th scope="col" className="py-3 px-4">Security Level</th>
                  <th scope="col" className="py-3 px-4">Status</th>
                  <th scope="col" className="py-3 px-4">Uploaded</th>
                  <th scope="col" className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {documents.map((doc) => {
                  const uploadDate = doc.createdAt
                    ? new Date(doc.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : '—';

                  return (
                    <tr
                      key={doc._id}
                      onClick={() => navigate(`/documents/${doc._id}`)}
                      className="hover:bg-slate-50/80 cursor-pointer transition group"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-blue-700 text-xs whitespace-nowrap">
                        {doc.documentId || doc._id.substring(0, 8)}
                      </td>
                      <td className="py-3 px-4 max-w-xs font-medium text-slate-900 group-hover:text-blue-600 transition truncate">
                        {doc.name}
                        {doc.aiClassification && (
                          <span className="block text-[11px] text-slate-400 font-normal">
                            AI Confidence: {Math.round(doc.aiClassification.confidence * 100)}%
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 capitalize text-xs whitespace-nowrap">
                        {doc.type.replace(/-/g, ' ')}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <SecurityBadge level={doc.securityLevel} size="sm" />
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge status={doc.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-xs whitespace-nowrap">
                        {uploadDate}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/documents/${doc._id}`);
                          }}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-semibold px-2 py-1 rounded hover:bg-blue-50 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Case Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
              onClick={() => !updating && setIsEditModalOpen(false)}
            />

            <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-slate-200">
              <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-blue-400" />
                  <h3 className="text-base font-semibold">Modify Case Docket</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={updating}
                  className="text-slate-400 hover:text-white transition p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateCase}>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Case Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Status
                      </label>
                      <select
                        value={editForm.status}
                        onChange={(e) =>
                          setEditForm({ ...editForm, status: e.target.value as CaseStatus })
                        }
                        className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {CASE_STATUSES.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Priority
                      </label>
                      <select
                        value={editForm.priority}
                        onChange={(e) =>
                          setEditForm({ ...editForm, priority: e.target.value as CasePriority })
                        }
                        className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {CASE_PRIORITIES.map((priority) => (
                          <option key={priority.value} value={priority.value}>
                            {priority.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Type
                      </label>
                      <select
                        value={editForm.caseType}
                        onChange={(e) =>
                          setEditForm({ ...editForm, caseType: e.target.value as CaseType })
                        }
                        className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {CASE_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Description & Scope
                    </label>
                    <textarea
                      rows={4}
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-200">
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-xs disabled:opacity-50"
                  >
                    {updating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
