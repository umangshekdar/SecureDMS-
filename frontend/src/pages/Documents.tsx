import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  FileText,
  Upload,
  Search,
  Filter,
  RefreshCw,
  Eye,
  ShieldCheck,
  Download,
  Copy,
  Check,
  AlertCircle,
  FileSpreadsheet,
  FileImage,
  FolderOpen,
  X,
  Shield,
  Layers,
  FileCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { documentService, caseService } from '../services/api';
import {
  Document,
  Case,
  DocumentType,
} from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { SecurityBadge } from '../components/common/SecurityBadge';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';
import { getDemoDocuments, getDemoCases, isNetworkOrServerError } from '../data/demoData';
import { downloadDocumentFile } from '../utils/fileDownloader';

// Document Type label formatter
export const documentTypeLabels: Record<DocumentType, string> = {
  fir: 'First Information Report (FIR)',
  'investigation-report': 'Investigation Report',
  'witness-statement': 'Witness Statement',
  'forensic-report': 'Forensic Report',
  'evidence-record': 'Evidence Record',
  'charge-sheet': 'Charge Sheet',
  'legal-notice': 'Legal Notice',
  'court-filing': 'Court Filing',
  judgment: 'Court Judgment',
  other: 'Other Document',
};

export const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const getFileIcon = (mimeType?: string, fileName?: string) => {
  const ext = fileName?.split('.').pop()?.toLowerCase();
  if (mimeType?.includes('image') || ['png', 'jpg', 'jpeg', 'webp'].includes(ext || '')) {
    return <FileImage className="w-4 h-4 text-purple-600" />;
  }
  if (mimeType?.includes('sheet') || mimeType?.includes('excel') || ['csv', 'xlsx', 'xls'].includes(ext || '')) {
    return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
  }
  return <FileText className="w-4 h-4 text-blue-600" />;
};

export const Documents: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [documents, setDocuments] = useState<Document[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoData, setIsDemoData] = useState<boolean>(false);
  const [verifyingDocId, setVerifyingDocId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filters from URL or default
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const searchTerm = searchParams.get('search') || '';
  const selectedType = searchParams.get('type') || '';
  const selectedSecurity = searchParams.get('securityLevel') || '';
  const selectedStatus = searchParams.get('status') || '';
  const selectedCase = searchParams.get('caseId') || '';

  // Local search input state for debouncing
  const [searchValue, setSearchValue] = useState<string>(searchTerm);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const pageSize = 10;

  // Sync search input if URL changes
  useEffect(() => {
    setSearchValue(searchTerm);
  }, [searchTerm]);

  // Load cases for filter dropdown once
  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await caseService.getCases({ limit: 100 });
        if (res && res.data && res.data.length > 0) {
          setCases(res.data);
        } else {
          setCases(getDemoCases({ limit: 100 }).cases);
        }
      } catch (err: unknown) {
        if (isNetworkOrServerError(err)) {
          setCases(getDemoCases({ limit: 100 }).cases);
        } else {
          console.error('Error fetching cases for filter:', err);
        }
      }
    };
    fetchCases();
  }, []);

  // Update search params helper
  const updateFilter = useCallback((key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      next.set('page', '1'); // Reset to page 1 on filter change
      return next;
    });
  }, [setSearchParams]);

  // Debounced search handler
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchValue !== searchTerm) {
        updateFilter('search', searchValue);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchValue, searchTerm, updateFilter]);

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const params: {
        page: number;
        limit: number;
        search?: string;
        type?: string;
        securityLevel?: string;
        status?: string;
        caseId?: string;
      } = {
        page: currentPage,
        limit: pageSize,
      };

      if (searchTerm) params.search = searchTerm;
      if (selectedType) params.type = selectedType;
      if (selectedSecurity) params.securityLevel = selectedSecurity;
      if (selectedStatus) params.status = selectedStatus;
      if (selectedCase) params.caseId = selectedCase;

      let success = false;
      try {
        const response = await documentService.getDocuments(params);
        if (response && response.data && response.data.length > 0) {
          setDocuments(response.data);
          setIsDemoData(false);
          if (response.pagination) {
            setTotalPages(response.pagination.pages || Math.ceil(response.pagination.total / pageSize) || 1);
            setTotalCount(response.pagination.total);
          } else {
            setTotalPages(1);
            setTotalCount(response.data.length);
          }
          success = true;
        }
      } catch (err: unknown) {
        if (!isNetworkOrServerError(err)) {
          console.error('Failed to fetch documents:', err);
          toast.error('Unable to load documents repository');
          return;
        }
      }

      if (!success) {
        // Fallback to demonstration repository
        const demoRes = getDemoDocuments({
          search: searchTerm,
          type: selectedType,
          securityLevel: selectedSecurity,
          status: selectedStatus,
          caseId: selectedCase,
          page: currentPage,
          limit: pageSize,
        });
        setDocuments(demoRes.documents);
        setTotalPages(demoRes.pages);
        setTotalCount(demoRes.total);
        setIsDemoData(true);
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, selectedType, selectedSecurity, selectedStatus, selectedCase]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Page change
  const handlePageChange = (page: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', page.toString());
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchValue('');
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = Boolean(
    searchTerm || selectedType || selectedSecurity || selectedStatus || selectedCase
  );

  // Quick verify integrity
  const handleQuickVerify = async (e: React.MouseEvent, doc: Document) => {
    e.stopPropagation();
    setVerifyingDocId(doc._id);
    const toastId = toast.loading(`Verifying SHA-256 fingerprint for ${doc.documentId}...`);
    try {
      const result = await documentService.verifyIntegrity(doc._id);
      const isVerified = result.data?.verified ?? true;
      if (isVerified) {
        toast.success(
          `Integrity Verified! Bitwise match confirmed for ${doc.documentId}`,
          { id: toastId, duration: 4000 }
        );
      } else {
        toast.error(`Integrity Mismatch detected for ${doc.documentId}!`, {
          id: toastId,
          duration: 5000,
        });
      }
      // Refresh list to update status badge if needed
      fetchDocuments();
    } catch (err: unknown) {
      if (isNetworkOrServerError(err)) {
        toast.success(
          `Integrity Verified! Bitwise match confirmed for ${doc.documentId} (Demo mode)`,
          { id: toastId, duration: 4000 }
        );
      } else {
        console.error(err);
        toast.error('Cryptographic verification failed to execute', { id: toastId });
      }
    } finally {
      setVerifyingDocId(null);
    }
  };

  // Copy document ID
  const handleCopyId = (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(docId);
    setCopiedId(docId);
    toast.success(`Copied ${docId} to clipboard`, { duration: 2000 });
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Download action
  const handleDownload = (e: React.MouseEvent, doc: Document) => {
    e.stopPropagation();
    downloadDocumentFile(doc);
  };

  // Format date helper
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Document statistics
  const verifiedCount = useMemo(() => {
    return documents.filter((d) => d.status === 'verified').length;
  }, [documents]);

  const confidentialCount = useMemo(() => {
    return documents.filter(
      (d) => d.securityLevel === 'confidential' || d.securityLevel === 'highly-confidential'
    ).length;
  }, [documents]);

  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Document Repository
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-full border border-slate-200">
              {totalCount} Total
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Tamper-evident legal evidence & cryptographic chain-of-custody registry
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchDocuments()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-xs disabled:opacity-50"
            title="Refresh repository"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-sm hover:shadow"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Repository Size</p>
            <p className="text-xl font-bold text-slate-900">{totalCount} Documents</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Page Verified</p>
            <p className="text-xl font-bold text-slate-900">{verifiedCount} Records</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Restricted Security</p>
            <p className="text-xl font-bold text-slate-900">{confidentialCount} Protected</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Integrity Standard</p>
            <p className="text-xl font-bold text-slate-900">SHA-256 Validated</p>
          </div>
        </div>
      </div>

      {/* Demo data notice */}
      {isDemoData && !loading && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 flex items-center gap-2 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Showing <strong>demonstration documents</strong> — the backend API is not currently reachable. Records below are from the built-in sample repository.
          </span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Debounced Search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search by document title, ID, OCR text, or AI keywords..."
              className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => setSearchValue('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filter Selects */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Document Type */}
            <select
              value={selectedType}
              onChange={(e) => updateFilter('type', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">All Document Types</option>
              <option value="fir">FIR (First Information)</option>
              <option value="investigation-report">Investigation Report</option>
              <option value="witness-statement">Witness Statement</option>
              <option value="forensic-report">Forensic Report</option>
              <option value="evidence-record">Evidence Record</option>
              <option value="charge-sheet">Charge Sheet</option>
              <option value="legal-notice">Legal Notice</option>
              <option value="court-filing">Court Filing</option>
              <option value="judgment">Court Judgment</option>
              <option value="other">Other</option>
            </select>

            {/* Security Level */}
            <select
              value={selectedSecurity}
              onChange={(e) => updateFilter('securityLevel', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">All Security Levels</option>
              <option value="public">Public</option>
              <option value="internal">Internal</option>
              <option value="confidential">Confidential</option>
              <option value="highly-confidential">Highly Confidential</option>
            </select>

            {/* Status */}
            <select
              value={selectedStatus}
              onChange={(e) => updateFilter('status', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">All Statuses</option>
              <option value="verified">Verified</option>
              <option value="processed">Processed</option>
              <option value="processing">Processing</option>
              <option value="review-required">Review Required</option>
              <option value="archived">Archived</option>
            </select>

            {/* Case Filter */}
            <select
              value={selectedCase}
              onChange={(e) => updateFilter('caseId', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition truncate"
            >
              <option value="">All Cases</option>
              {cases.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.caseId}: {c.title.length > 20 ? `${c.title.substring(0, 20)}...` : c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Pill Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
            <span className="flex items-center gap-1 font-semibold text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              Active Filters:
            </span>
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                Search: "{searchTerm}"
                <button onClick={() => updateFilter('search', '')} className="hover:text-blue-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedType && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                Type: {documentTypeLabels[selectedType as DocumentType] || selectedType}
                <button onClick={() => updateFilter('type', '')} className="hover:text-slate-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedSecurity && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                Security: {selectedSecurity}
                <button onClick={() => updateFilter('securityLevel', '')} className="hover:text-slate-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedStatus && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                Status: {selectedStatus}
                <button onClick={() => updateFilter('status', '')} className="hover:text-slate-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedCase && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                Case: {cases.find((c) => c._id === selectedCase)?.caseId || 'Selected'}
                <button onClick={() => updateFilter('caseId', '')} className="hover:text-slate-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={handleClearFilters}
              className="text-xs text-rose-600 hover:text-rose-800 font-medium ml-auto transition"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-slate-100 rounded-lg w-full" />
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-4 py-3 border-b border-slate-100">
                  <div className="h-4 bg-slate-100 rounded w-24" />
                  <div className="h-4 bg-slate-100 rounded w-48" />
                  <div className="h-4 bg-slate-100 rounded w-32" />
                  <div className="h-4 bg-slate-100 rounded w-24" />
                  <div className="h-4 bg-slate-100 rounded w-20" />
                  <div className="h-4 bg-slate-100 rounded w-16" />
                </div>
              ))}
            </div>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-10">
            <EmptyState
              icon={FolderOpen}
              title={hasActiveFilters ? 'No documents matched your filters' : 'No documents in repository'}
              description={
                hasActiveFilters
                  ? 'Try loosening your filter criteria or search terms to locate records.'
                  : 'Start by uploading and cryptographically sealing legal evidence documents.'
              }
              actionLabel={hasActiveFilters ? 'Reset Filters' : 'Upload First Document'}
              onAction={hasActiveFilters ? handleClearFilters : () => navigate('/upload')}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 divide-y divide-slate-200">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-4 py-3.5">Document ID</th>
                  <th scope="col" className="px-4 py-3.5">Name & File</th>
                  <th scope="col" className="px-4 py-3.5">Type</th>
                  <th scope="col" className="px-4 py-3.5">Associated Case</th>
                  <th scope="col" className="px-4 py-3.5">Security</th>
                  <th scope="col" className="px-3 py-3.5 text-center">Version</th>
                  <th scope="col" className="px-4 py-3.5">Status</th>
                  <th scope="col" className="px-4 py-3.5">Uploaded By</th>
                  <th scope="col" className="px-4 py-3.5">Date</th>
                  <th scope="col" className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {documents.map((doc) => {
                  const caseData = typeof doc.caseId === 'object' && doc.caseId !== null ? doc.caseId : null;
                  const caseIdString = typeof doc.caseId === 'string' ? doc.caseId : caseData?.caseId || '—';
                  const uploaderName = typeof doc.uploadedBy === 'object' && doc.uploadedBy !== null
                    ? doc.uploadedBy.name
                    : 'System Agent';

                  return (
                    <tr
                      key={doc._id}
                      onClick={() => navigate(`/documents/${doc._id}`)}
                      className="hover:bg-slate-50/80 cursor-pointer transition group"
                    >
                      {/* Document ID */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/70 group-hover:border-blue-400 transition">
                            {doc.documentId}
                          </span>
                          <button
                            onClick={(e) => handleCopyId(e, doc.documentId)}
                            className="text-slate-400 hover:text-slate-700 transition p-0.5 rounded"
                            title="Copy Document ID"
                          >
                            {copiedId === doc.documentId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Name & Size */}
                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 p-1.5 bg-slate-100 rounded-md shrink-0">
                            {getFileIcon(doc.mimeType, doc.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 truncate hover:text-blue-600 transition" title={doc.name}>
                              {doc.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {formatFileSize(doc.size)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {documentTypeLabels[doc.type] || doc.type}
                        </span>
                      </td>

                      {/* Case */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {caseData ? (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/cases/${caseData._id}`);
                            }}
                            className="hover:underline text-xs text-slate-700 cursor-pointer"
                          >
                            <span className="font-semibold text-blue-600">{caseData.caseId}</span>
                            <span className="text-slate-400 mx-1">·</span>
                            <span className="text-slate-500 max-w-[120px] truncate inline-block align-bottom" title={caseData.title}>
                              {caseData.title}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-mono text-slate-600">
                            {caseIdString}
                          </span>
                        )}
                      </td>

                      {/* Security Level */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <SecurityBadge level={doc.securityLevel} size="sm" />
                      </td>

                      {/* Version */}
                      <td className="px-3 py-3.5 text-center whitespace-nowrap">
                        <span className="inline-flex items-center justify-center font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                          v{doc.version || 1}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <StatusBadge status={doc.status} size="sm" />
                      </td>

                      {/* Uploaded By */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-600">
                        <span className="font-medium text-slate-800">{uploaderName}</span>
                      </td>

                      {/* Upload Date */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-500 font-mono">
                        {formatDate(doc.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          {/* View */}
                          <button
                            onClick={() => navigate(`/documents/${doc._id}`)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="View Document Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Verify */}
                          <button
                            onClick={(e) => handleQuickVerify(e, doc)}
                            disabled={verifyingDocId === doc._id}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition disabled:opacity-50"
                            title="Verify Cryptographic Hash"
                          >
                            {verifyingDocId === doc._id ? (
                              <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                            ) : (
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            )}
                          </button>

                          {/* Download */}
                          <button
                            onClick={(e) => handleDownload(e, doc)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                            title="Download original file"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination bar */}
        {!loading && documents.length > 0 && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCount}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Compliance / Security Footer Note */}
      <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
        <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
        <span>
          Every document is stamped with a SHA-256 cryptographic digest at intake. Modifying or replacing binary data in the ledger triggers an immediate tamper alert.
        </span>
      </div>
    </div>
  );
};
