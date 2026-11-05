import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search as SearchIcon,
  Filter,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FolderOpen,
  Calendar,
  RotateCcw,
  Tag,
  AlertCircle,
  Hash,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { searchService, caseService } from '../services/api';
import type { Document as SecureDoc, Case, DocumentType, SecurityLevel } from '../types';
import { SecurityBadge } from '../components/common/SecurityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { DEMO_DOCUMENTS, getDemoCases } from '../data/demoData';

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'fir', label: 'First Information Report (FIR)' },
  { value: 'investigation-report', label: 'Investigation Report' },
  { value: 'witness-statement', label: 'Witness Statement' },
  { value: 'forensic-report', label: 'Forensic Report' },
  { value: 'evidence-record', label: 'Evidence Record' },
  { value: 'charge-sheet', label: 'Charge Sheet' },
  { value: 'legal-notice', label: 'Legal Notice' },
  { value: 'court-filing', label: 'Court Filing' },
  { value: 'judgment', label: 'Judgment' },
  { value: 'other', label: 'Other Document' },
];

const SECURITY_LEVELS: { value: SecurityLevel; label: string }[] = [
  { value: 'public', label: 'Public' },
  { value: 'internal', label: 'Internal' },
  { value: 'confidential', label: 'Confidential' },
  { value: 'highly-confidential', label: 'Highly Confidential' },
];

/**
 * Filter documents across all fields: title/name, document ID, _id, OCR text,
 * AI summary, classification type, entities, keywords, and case associations.
 */
function filterDemoResults(
  query: string,
  caseId?: string,
  docType?: string,
  securityLevel?: string
): SecureDoc[] {
  const q = query.trim().toLowerCase();
  return (DEMO_DOCUMENTS as unknown as SecureDoc[]).filter((doc) => {
    // 1. Text Query Match
    const matchesQuery =
      !q ||
      doc.name.toLowerCase().includes(q) ||
      doc.documentId.toLowerCase().includes(q) ||
      doc._id.toLowerCase().includes(q) ||
      (doc.ocrText && doc.ocrText.toLowerCase().includes(q)) ||
      (doc.aiSummary && doc.aiSummary.toLowerCase().includes(q)) ||
      (doc.aiClassification?.type &&
        doc.aiClassification.type.toLowerCase().includes(q)) ||
      (doc.aiClassification?.keywords &&
        doc.aiClassification.keywords.some((kw) => kw.toLowerCase().includes(q))) ||
      (doc.aiClassification?.entities &&
        doc.aiClassification.entities.some(
          (ent) => ent.label.toLowerCase().includes(q) || ent.value.toLowerCase().includes(q)
        ));

    // 2. Case Match
    let matchesCase = true;
    if (caseId && caseId !== 'all') {
      const targetCaseId = caseId.toLowerCase();
      if (typeof doc.caseId === 'string') {
        matchesCase = doc.caseId.toLowerCase() === targetCaseId;
      } else if (doc.caseId && typeof doc.caseId === 'object') {
        const c = doc.caseId as Case;
        matchesCase =
          c._id?.toLowerCase() === targetCaseId ||
          c.caseId?.toLowerCase() === targetCaseId;
      } else {
        matchesCase = false;
      }
    }

    // 3. Document Type Match
    const matchesType = !docType || docType === 'all' || doc.type === docType;

    // 4. Security Level Match
    const matchesSec =
      !securityLevel || securityLevel === 'all' || doc.securityLevel === securityLevel;

    return matchesQuery && matchesCase && matchesType && matchesSec;
  });
}

// ──────────────────────────────────────────────────────────────
// Search Page Component
// ──────────────────────────────────────────────────────────────

export const Search: React.FC = () => {
  const navigate = useNavigate();
  const [, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedSecurityLevel, setSelectedSecurityLevel] = useState<string>('');

  const [cases, setCases] = useState<Case[]>([]);
  const [results, setResults] = useState<SecureDoc[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [searchDurationMs, setSearchDurationMs] = useState<number | null>(null);
  const [usingFallback, setUsingFallback] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available cases for the filter dropdown
  useEffect(() => {
    let isMounted = true;
    const fetchCases = async () => {
      try {
        const res = await caseService.getCases({ limit: 50 });
        if (isMounted && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setCases(res.data);
        } else if (isMounted) {
          setCases(getDemoCases({ limit: 50 }).cases);
        }
      } catch {
        // Backend not available — cases filter will use demo data
        if (isMounted) {
          setCases(getDemoCases({ limit: 50 }).cases);
        }
        console.warn('Could not load cases list from backend, using demo cases.');
      }
    };
    fetchCases();
    return () => {
      isMounted = false;
    };
  }, []);

  // Primary search execution logic
  const executeSearch = useCallback(
    async (
      query: string,
      caseId?: string,
      docType?: string,
      securityLevel?: string
    ) => {
      const trimmedQuery = query.trim();
      if (!trimmedQuery && !caseId && !docType && !securityLevel) {
        setResults([]);
        setHasSearched(false);
        setSearchDurationMs(null);
        setUsingFallback(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      setUsingFallback(false);
      const startTime = performance.now();

      try {
        // Send query parameters matching the backend controller:
        //   q      → text query
        //   case   → case ObjectId or caseId string
        //   type   → document type enum
        //   level  → security level enum
        const response = await searchService.searchDocuments({
          q: trimmedQuery,
          ...(caseId ? { case: caseId } : {}),
          ...(docType ? { type: docType } : {}),
          ...(securityLevel ? { level: securityLevel } : {}),
        });

        const duration = Math.round(performance.now() - startTime);
        setSearchDurationMs(duration);

        if (response.success && Array.isArray(response.data) && response.data.length > 0) {
          setResults(response.data as unknown as SecureDoc[]);
        } else {
          // Backend returned 0 items — fall back to local demo data
          const filtered = filterDemoResults(trimmedQuery, caseId, docType, securityLevel);
          setResults(filtered);
          if (filtered.length > 0) setUsingFallback(true);
        }
      } catch {
        // Backend unreachable — use offline demo data
        const duration = Math.round(performance.now() - startTime);
        setSearchDurationMs(duration);

        const filtered = filterDemoResults(trimmedQuery, caseId, docType, securityLevel);
        setResults(filtered);
        setUsingFallback(true);
      } finally {
        setLoading(false);
        setHasSearched(true);
      }
    },
    []
  );

  // Debounced auto-search when query or filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 1 || selectedCase || selectedType || selectedSecurityLevel) {
        startTransition(() => {
          executeSearch(searchQuery, selectedCase, selectedType, selectedSecurityLevel);
        });
      } else if (!searchQuery.trim() && !selectedCase && !selectedType && !selectedSecurityLevel) {
        setResults([]);
        setHasSearched(false);
        setSearchDurationMs(null);
        setUsingFallback(false);
        setError(null);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCase, selectedType, selectedSecurityLevel, executeSearch]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchQuery, selectedCase, selectedType, selectedSecurityLevel);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCase('');
    setSelectedType('');
    setSelectedSecurityLevel('');
    setResults([]);
    setHasSearched(false);
    setSearchDurationMs(null);
    setUsingFallback(false);
    setError(null);
    toast.success('Search filters reset');
  };

  const handleQuickSuggestion = (term: string) => {
    setSearchQuery(term);
    executeSearch(term, selectedCase, selectedType, selectedSecurityLevel);
  };

  /** Format file size to a readable string */
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <SearchIcon className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Document Search
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Search documents by name, document ID, case reference, type, and extracted text
          </p>
        </div>

        {hasSearched && (
          <div className="flex items-center gap-3 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <span>
              Found <strong className="text-slate-800">{results.length}</strong> matching records
            </span>
            {searchDurationMs !== null && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="flex items-center gap-1 font-mono text-emerald-600">
                  <Clock className="w-3.5 h-3.5" />
                  {searchDurationMs}ms
                </span>
              </>
            )}
            {usingFallback && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-amber-600 font-medium">Demonstration Data</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Main Search Panel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <form onSubmit={handleManualSearch} className="space-y-4">
          {/* Large search input */}
          <div className="relative flex items-center">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <SearchIcon className="w-5 h-5 text-blue-600" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by document name, ID, case reference, legal section, keywords..."
              className="w-full pl-12 pr-28 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-base text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-inner"
            />
            <div className="absolute inset-y-0 right-1.5 flex items-center pr-1.5">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Searching…
                  </span>
                ) : (
                  <>
                    <SearchIcon className="w-4 h-4" />
                    Search
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
              <Filter className="w-3.5 h-3.5" />
              Filters
            </div>

            {/* Case Filter */}
            <div className="min-w-[180px] flex-1 sm:flex-initial">
              <select
                aria-label="Filter by Case"
                value={selectedCase}
                onChange={(e) => setSelectedCase(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Active Cases</option>
                {cases.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.caseId} — {c.title.length > 28 ? `${c.title.slice(0, 28)}...` : c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Document Type Filter */}
            <div className="min-w-[180px] flex-1 sm:flex-initial">
              <select
                aria-label="Filter by Document Type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Document Types</option>
                {DOCUMENT_TYPES.map((dt) => (
                  <option key={dt.value} value={dt.value}>
                    {dt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Security Level Filter */}
            <div className="min-w-[170px] flex-1 sm:flex-initial">
              <select
                aria-label="Filter by Security Level"
                value={selectedSecurityLevel}
                onChange={(e) => setSelectedSecurityLevel(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Security Levels</option>
                {SECURITY_LEVELS.map((sl) => (
                  <option key={sl.value} value={sl.value}>
                    {sl.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            {(searchQuery || selectedCase || selectedType || selectedSecurityLevel) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                <RotateCcw className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Quick suggestion tags */}
        {!hasSearched && (
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400">Try searching:</span>
            {[
              'FIR',
              'Forensic',
              'Witness Statement',
              'Chargesheet',
              'SHA-256',
            ].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleQuickSuggestion(tag)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-full hover:bg-blue-50 hover:text-blue-700 transition"
              >
                <Tag className="w-3 h-3 text-slate-400" />
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-800">Search Error</h3>
            <p className="text-sm text-red-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Results or States */}
      {loading ? (
        <div className="py-20 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
          <LoadingSpinner size="lg" text="Searching documents..." />
        </div>
      ) : !hasSearched && results.length === 0 ? (
        /* Initial State — no search performed yet */
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 ring-8 ring-blue-50/50">
            <SearchIcon className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Enter a search term to find documents</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
            Search across document names, IDs, extracted text, AI summaries, and case references in the repository.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => handleQuickSuggestion('FIR')}
              className="px-3.5 py-2 text-xs font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 transition"
            >
              First Information Reports
            </button>
            <button
              onClick={() => handleQuickSuggestion('Forensic')}
              className="px-3.5 py-2 text-xs font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 transition"
            >
              Forensic Reports
            </button>
            <button
              onClick={() => handleQuickSuggestion('Witness')}
              className="px-3.5 py-2 text-xs font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 transition"
            >
              Witness Statements
            </button>
          </div>

          {/* Capabilities Note */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-2xl mx-auto">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <FileText className="w-4 h-4 text-blue-600 mb-1" />
              <p className="text-xs font-semibold text-slate-800">Name & ID</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Match by document name, document ID, or case reference</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <Sparkles className="w-4 h-4 text-purple-600 mb-1" />
              <p className="text-xs font-semibold text-slate-800">Extracted Text</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Search OCR-extracted text and AI-generated summaries</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <Hash className="w-4 h-4 text-emerald-600 mb-1" />
              <p className="text-xs font-semibold text-slate-800">Keywords</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Match AI-classified keywords and entity references</p>
            </div>
          </div>
        </div>
      ) : hasSearched && results.length === 0 ? (
        /* Empty Results State */
        <EmptyState
          icon={SearchIcon}
          title="No documents match your search"
          description="No documents were found matching your criteria. Try adjusting your query or resetting the filters."
          actionLabel="Reset Search Filters"
          onAction={handleResetFilters}
        />
      ) : (
        /* Search Results */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Displaying <strong>{results.length}</strong> matching document records
            </span>
            <span>Sorted by last updated</span>
          </div>

          {/* Fallback data notice */}
          {usingFallback && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 flex items-center gap-2 text-xs text-amber-800">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span>
                Showing <strong>demonstration data</strong> — the backend API is not currently reachable.
                Results below are from the built-in sample dataset.
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {results.map((doc) => {
              const caseDisplay =
                typeof doc.caseId === 'object' && doc.caseId !== null
                  ? `${(doc.caseId as Case).caseId} — ${(doc.caseId as Case).title}`
                  : `Case ${doc.caseId || 'Unassigned'}`;

              const uploadedByName =
                typeof doc.uploadedBy === 'object' && doc.uploadedBy !== null
                  ? doc.uploadedBy.name
                  : 'System';

              return (
                <div
                  key={doc._id}
                  onClick={() => navigate(`/documents/${doc._id}`)}
                  className="group bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:border-blue-400 hover:shadow-md transition cursor-pointer relative"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Left main info */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {doc.documentId}
                        </span>
                        <SecurityBadge level={doc.securityLevel} size="sm" />
                        <StatusBadge status={doc.status} size="sm" />
                        <span className="text-xs text-slate-500 capitalize bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                          {doc.type.replace(/-/g, ' ')}
                        </span>
                      </div>

                      <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        {doc.name}
                      </h2>

                      {/* Associated Case */}
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-700">{caseDisplay}</span>
                      </div>

                      {/* AI Summary / OCR preview snippet */}
                      {(doc.aiSummary || doc.ocrText) && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                          <div className="flex items-center gap-1 font-semibold text-blue-700 text-[11px] mb-1">
                            <Sparkles className="w-3 h-3" />
                            {doc.aiSummary ? 'AI Summary' : 'Extracted Text'}:
                          </div>
                          <p className="line-clamp-2 text-slate-600">
                            {doc.aiSummary || doc.ocrText}
                          </p>
                        </div>
                      )}

                      {/* Extracted entities if available */}
                      {doc.aiClassification?.entities && doc.aiClassification.entities.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {doc.aiClassification.entities.slice(0, 3).map((ent, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100"
                            >
                              <strong className="font-semibold text-blue-900">{ent.label}:</strong>{' '}
                              {ent.value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right side metadata */}
                    <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 text-xs text-slate-500 gap-2 flex-shrink-0">
                      {/* Integrity badge */}
                      {doc.status === 'verified' ? (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 text-[11px] font-medium">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          SHA-256 Verified
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded border border-amber-200 text-[11px] font-medium">
                          <AlertCircle className="w-3 h-3 text-amber-500" />
                          {doc.status === 'review-required' ? 'Review Required' : doc.status}
                        </div>
                      )}

                      {/* File size */}
                      <span className="text-[11px] text-slate-500">{formatSize(doc.size)}</span>

                      {/* Upload Date */}
                      <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {new Date(doc.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>

                      {/* Uploaded By */}
                      <span className="text-[11px] text-slate-500">
                        By: <span className="text-slate-700 font-medium">{uploadedByName}</span>
                      </span>

                      {/* View Link button */}
                      <span className="mt-auto hidden md:inline-flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                        Open Document
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Note */}
      <div className="text-center text-[11px] text-slate-400 pt-2">
        Search uses keyword matching across document names, IDs, extracted text, AI summaries, and classification keywords.
      </div>
    </div>
  );
};

export default Search;
