import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  Eye,
  Calendar,
  Users as UsersIcon,
  FileText,
  AlertCircle,
  X,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { caseService } from '../services/api';
import { Case, CasePriority, CaseStatus, CaseType } from '../types';
import { useAuth } from '../hooks/useAuth';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { Pagination } from '../components/common/Pagination';
import { SearchInput } from '../components/common/SearchInput';
import { getDemoCases, addDemoCase, isNetworkOrServerError } from '../data/demoData';

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
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${config}`}
    >
      {priority}
    </span>
  );
};

export const Cases: React.FC = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const canCreateCase = hasRole(['admin', 'investigator']);

  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoData, setIsDemoData] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Create Case Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    caseType: CaseType;
    priority: CasePriority;
  }>({
    title: '',
    description: '',
    caseType: 'cybercrime',
    priority: 'medium',
  });

  // Debounce search query 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to page 1 on new search
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchCases = useCallback(async () => {
    try {
      setLoading(true);
      const params: {
        page: number;
        limit: number;
        search?: string;
        status?: string;
        priority?: string;
        type?: string;
      } = {
        page,
        limit: pageSize,
      };

      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (selectedPriority !== 'all') params.priority = selectedPriority;
      if (selectedType !== 'all') params.type = selectedType;

      const response = await caseService.getCases(params);
      if (response && response.success && Array.isArray(response.data) && response.data.length > 0) {
        setCases(response.data);
        setIsDemoData(false);
        if (response.pagination) {
          setTotalPages(response.pagination.pages || 1);
          setTotalItems(response.pagination.total || response.data.length);
        } else {
          setTotalPages(1);
          setTotalItems(response.data.length);
        }
      } else {
        // If live API returns empty, use demo dataset
        const demoRes = getDemoCases({
          search: debouncedSearch,
          status: selectedStatus,
          priority: selectedPriority,
          type: selectedType,
          page,
          limit: pageSize,
        });
        setCases(demoRes.cases);
        setTotalItems(demoRes.total);
        setTotalPages(demoRes.pages);
        setIsDemoData(true);
      }
    } catch (error: unknown) {
      if (isNetworkOrServerError(error)) {
        // Backend is offline — smoothly fallback to demonstration dataset
        const demoRes = getDemoCases({
          search: debouncedSearch,
          status: selectedStatus,
          priority: selectedPriority,
          type: selectedType,
          page,
          limit: pageSize,
        });
        setCases(demoRes.cases);
        setTotalItems(demoRes.total);
        setTotalPages(demoRes.pages);
        setIsDemoData(true);
      } else {
        // Genuine application or permission error from live server
        const err = error as Error;
        toast.error(err.message || 'Error communicating with case service');
      }
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, selectedStatus, selectedPriority, selectedType]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setSelectedStatus('all');
    setSelectedPriority('all');
    setSelectedType('all');
    setPage(1);
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Case Title is required');
      return;
    }

    try {
      setSubmitting(true);
      const payload: Partial<Case> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        caseType: formData.caseType,
        priority: formData.priority,
        status: 'open',
      };

      const res = await caseService.createCase(payload);
      if (res.success) {
        toast.success('Case record created successfully');
        setIsModalOpen(false);
        setFormData({
          title: '',
          description: '',
          caseType: 'cybercrime',
          priority: 'medium',
        });
        fetchCases();
      } else {
        toast.error(res.message || 'Failed to create case');
      }
    } catch (error: unknown) {
      if (isNetworkOrServerError(error)) {
        // Offline demo mode — simulate creation in memory
        const newDemoCase: Case = {
          _id: `case-demo-${Date.now()}`,
          caseId: `CASE-2026-${Math.floor(10000 + Math.random() * 90000)}`,
          title: formData.title.trim(),
          description: formData.description.trim(),
          caseType: formData.caseType,
          priority: formData.priority,
          status: 'open',
          assignedUsers: [],
          createdBy: 'Officer (Demo)',
          documentCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        addDemoCase(newDemoCase);
        setCases((prev) => [newDemoCase, ...prev]);
        setTotalItems((prev) => prev + 1);
        setIsDemoData(true);
        setIsModalOpen(false);
        setFormData({
          title: '',
          description: '',
          caseType: 'cybercrime',
          priority: 'medium',
        });
        toast.success('Case created in demonstration mode');
      } else {
        const err = error as Error;
        toast.error(err.message || 'Failed to create case record');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const hasActiveFilters =
    debouncedSearch.trim() !== '' ||
    selectedStatus !== 'all' ||
    selectedPriority !== 'all' ||
    selectedType !== 'all';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Case Management</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-full border border-slate-200">
              {totalItems} {totalItems === 1 ? 'Record' : 'Records'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Maintain evidentiary integrity, track legal dockets, and oversee document custody chains.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchCases()}
            disabled={loading}
            className="p-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition shadow-xs disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {canCreateCase && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Case</span>
            </button>
          )}
        </div>
      </div>

      {/* Demo data notice */}
      {isDemoData && !loading && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 flex items-center gap-2 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Showing <strong>demonstration cases</strong> — the backend API is not currently reachable. Records below are from the built-in sample dataset.
          </span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="md:col-span-4">
            <SearchInput
              value={searchQuery}
              onChange={(val) => setSearchQuery(val)}
              placeholder="Search by case title or ID..."
              className="w-full"
            />
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <label htmlFor="filter-status" className="sr-only">Filter by Status</label>
            <select
              id="filter-status"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="all">All Statuses</option>
              {CASE_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="md:col-span-2">
            <label htmlFor="filter-priority" className="sr-only">Filter by Priority</label>
            <select
              id="filter-priority"
              value={selectedPriority}
              onChange={(e) => {
                setSelectedPriority(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="all">All Priorities</option>
              {CASE_PRIORITIES.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="md:col-span-3">
            <label htmlFor="filter-type" className="sr-only">Filter by Case Type</label>
            <select
              id="filter-type"
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="all">All Case Types</option>
              {CASE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          <div className="md:col-span-1 flex justify-end">
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="w-full inline-flex items-center justify-center p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs font-medium transition"
                title="Clear all filters"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium text-slate-500">Loading cases dossier...</p>
              </div>
            </div>
          </div>
        ) : cases.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={FolderOpen}
              title={hasActiveFilters ? 'No matching cases found' : 'No cases recorded yet'}
              description={
                hasActiveFilters
                  ? 'Try adjusting your search criteria or resetting the applied filters.'
                  : 'Get started by creating your first legal case record to begin managing secured documents.'
              }
              actionLabel={hasActiveFilters ? 'Clear Filters' : canCreateCase ? 'Create First Case' : undefined}
              onAction={hasActiveFilters ? handleResetFilters : canCreateCase ? () => setIsModalOpen(true) : undefined}
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th scope="col" className="py-3.5 px-4">Case ID</th>
                    <th scope="col" className="py-3.5 px-4">Title</th>
                    <th scope="col" className="py-3.5 px-4">Type</th>
                    <th scope="col" className="py-3.5 px-4">Priority</th>
                    <th scope="col" className="py-3.5 px-4">Status</th>
                    <th scope="col" className="py-3.5 px-4 text-center">Assigned</th>
                    <th scope="col" className="py-3.5 px-4 text-center">Documents</th>
                    <th scope="col" className="py-3.5 px-4">Created Date</th>
                    <th scope="col" className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {cases.map((c) => {
                    const assignedCount = Array.isArray(c.assignedUsers) ? c.assignedUsers.length : 0;
                    const docCount = c.documentCount !== undefined ? c.documentCount : 0;
                    const formattedDate = c.createdAt
                      ? new Date(c.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : '—';

                    return (
                      <tr
                        key={c._id}
                        onClick={() => navigate(`/cases/${c._id}`)}
                        className="hover:bg-slate-50/80 cursor-pointer transition group"
                      >
                        <td className="py-3.5 px-4 font-mono font-medium text-blue-700 whitespace-nowrap">
                          {c.caseId || c._id.substring(0, 8)}
                        </td>
                        <td className="py-3.5 px-4 max-w-xs truncate font-medium text-slate-900 group-hover:text-blue-600 transition">
                          {c.title}
                          {c.description && (
                            <span className="block text-xs text-slate-400 font-normal truncate">
                              {c.description}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap capitalize">
                          {c.caseType}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <PriorityBadge priority={c.priority} />
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <StatusBadge status={c.status} size="sm" />
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md text-xs font-medium">
                            <UsersIcon className="w-3.5 h-3.5 text-slate-500" />
                            {assignedCount}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md text-xs font-medium">
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                            {docCount}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-xs">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {formattedDate}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/cases/${c._id}`);
                            }}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-semibold px-2.5 py-1.5 rounded-md hover:bg-blue-50 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
              totalItems={totalItems}
              pageSize={pageSize}
            />
          </>
        )}
      </div>

      {/* Create Case Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
              onClick={() => !submitting && setIsModalOpen(false)}
            />

            <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-slate-200">
              <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-400" />
                  <h3 className="text-base font-semibold">Initiate New Case Record</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="text-slate-400 hover:text-white transition p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCase}>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Case Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Operation CyberTrace - Financial Audit 2026"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Case Type <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.caseType}
                        onChange={(e) =>
                          setFormData({ ...formData, caseType: e.target.value as CaseType })
                        }
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      >
                        {CASE_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Priority Level <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) =>
                          setFormData({ ...formData, priority: e.target.value as CasePriority })
                        }
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      >
                        {CASE_PRIORITIES.map((priority) => (
                          <option key={priority.value} value={priority.value}>
                            {priority.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Case Description / Background
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Brief overview of the legal matter, scope of investigation, and involved entities..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  <div className="rounded-lg bg-blue-50/70 border border-blue-200 p-3 flex items-start gap-2 text-xs text-blue-800">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Creating a case establishes an immutable root docket. All subsequent uploaded evidence files and audit trails will be linked to this case record.
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-200">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-xs disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <span>Create Docket</span>
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
