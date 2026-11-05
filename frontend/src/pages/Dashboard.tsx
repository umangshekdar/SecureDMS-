import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Cpu,
  History,
  FileCheck2,
  Server,
  FolderOpen,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  PlusCircle,
  Upload,
  Search as SearchIcon,
  Shield,
  Activity,
  ArrowUpRight,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts';
import toast from 'react-hot-toast';
import { analyticsService } from '../services/api';
import { Analytics, AuditLog } from '../types';
import { useAuth } from '../hooks/useAuth';
import { StatusBadge } from '../components/common/StatusBadge';

// Palette definitions for charts & badges
const TYPE_COLORS = ['#2563eb', '#0284c7', '#0d9488', '#16a34a', '#8b5cf6', '#d97706'];
const SECURITY_COLORS: Record<string, string> = {
  Public: '#10b981',
  Internal: '#3b82f6',
  Confidential: '#f59e0b',
  'Highly Confidential': '#ef4444',
  public: '#10b981',
  internal: '#3b82f6',
  confidential: '#f59e0b',
  'highly-confidential': '#ef4444',
};
const STATUS_COLORS: Record<string, string> = {
  Processing: '#6366f1',
  Processed: '#06b6d4',
  Verified: '#10b981',
  'Review Required': '#f59e0b',
  processing: '#6366f1',
  processed: '#06b6d4',
  verified: '#10b981',
  'review-required': '#f59e0b',
};

// Demo/Fallback Data when backend API is offline or initial state
const DEMO_ANALYTICS: Analytics = {
  totalCases: 28,
  totalDocuments: 342,
  documentsProcessed: 326,
  integrityVerified: 318,
  pendingReview: 16,
  recentActivity: [
    {
      _id: 'act-001',
      userId: 'usr-1',
      userName: 'Special Agent Vikram Rao',
      userRole: 'investigator',
      action: 'INTEGRITY_VERIFIED',
      resourceType: 'Document',
      resourceId: 'DOC-8831-FIR',
      details: 'Automated cryptographic verification succeeded for FIR Record #8831',
      status: 'success',
      createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    },
    {
      _id: 'act-002',
      userId: 'usr-2',
      userName: 'Dr. Neha Sharma',
      userRole: 'forensic',
      action: 'AI_ANALYSIS_REQUESTED',
      resourceType: 'Document',
      resourceId: 'DOC-9042-EVID',
      details: 'Extracted 14 forensic entities & summarized chain-of-custody PDF',
      status: 'success',
      createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    },
    {
      _id: 'act-003',
      userId: 'usr-3',
      userName: 'Adv. Rajesh Mehta',
      userRole: 'legal',
      action: 'DOCUMENT_VERSION_CREATED',
      resourceType: 'Document',
      resourceId: 'DOC-7410-COURT',
      details: 'Pushed Version 3 with amended affidavit evidence attachment',
      status: 'success',
      createdAt: new Date(Date.now() - 1000 * 60 * 85).toISOString(),
    },
    {
      _id: 'act-004',
      userId: 'usr-4',
      userName: 'SysAdmin Rajesh',
      userRole: 'admin',
      action: 'CASE_CREATED',
      resourceType: 'Case',
      resourceId: 'CAS-2026-094',
      details: 'Initiated High Priority cyber-forensics case CAS-2026-094',
      status: 'success',
      createdAt: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
    },
    {
      _id: 'act-005',
      userId: 'usr-5',
      userName: 'Agent Priya Sen',
      userRole: 'investigator',
      action: 'DOCUMENT_UPLOADED',
      resourceType: 'Document',
      resourceId: 'DOC-9102-WITN',
      details: 'Witness statement record uploaded with SHA-256 seal verification',
      status: 'success',
      createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    },
  ],
  documentsByType: [
    { type: 'FIR Records', count: 94 },
    { type: 'Forensic Reports', count: 82 },
    { type: 'Evidence Records', count: 68 },
    { type: 'Witness Statements', count: 47 },
    { type: 'Court Filings', count: 32 },
    { type: 'Other Filings', count: 19 },
  ],
  documentsByCase: [
    { caseId: 'CAS-101', title: 'Cyber Financial Fraud #101', count: 42 },
    { caseId: 'CAS-104', title: 'Data Exfiltration Inquiry', count: 36 },
    { caseId: 'CAS-109', title: 'Digital Evidence Integrity', count: 29 },
  ],
  documentsBySecurityLevel: [
    { level: 'Public', count: 38 },
    { level: 'Internal', count: 142 },
    { level: 'Confidential', count: 114 },
    { level: 'Highly Confidential', count: 48 },
  ],
  documentsByStatus: [
    { status: 'Verified', count: 242 },
    { status: 'Processed', count: 68 },
    { status: 'Processing', count: 16 },
    { status: 'Review Required', count: 16 },
  ],
  uploadActivity: [
    { date: 'Mon', count: 24 },
    { date: 'Tue', count: 38 },
    { date: 'Wed', count: 45 },
    { date: 'Thu', count: 30 },
    { date: 'Fri', count: 52 },
    { date: 'Sat', count: 18 },
    { date: 'Sun', count: 22 },
  ],
};

const CONCEPT_PILLARS = [
  {
    tag: 'SECURE',
    title: 'Role-Based Access',
    desc: 'Fine-grained RBAC controls across Admin, Investigator, Forensic, Legal tiers.',
    icon: Shield,
    color: 'from-blue-600 to-indigo-700',
    iconColor: 'text-blue-600 bg-blue-50 border-blue-200',
    badge: 'AES-256 + RBAC',
  },
  {
    tag: 'INTELLIGENT',
    title: 'AI-Assisted Processing',
    desc: 'Automated entity extraction, categorization, and executive legal summarization.',
    icon: Cpu,
    color: 'from-cyan-600 to-blue-700',
    iconColor: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    badge: 'Gemini & OCR Engine',
  },
  {
    tag: 'TRACEABLE',
    title: 'Audit & Version History',
    desc: 'Immutable append-only chronological chain recording every access and revision.',
    icon: History,
    color: 'from-purple-600 to-indigo-800',
    iconColor: 'text-purple-600 bg-purple-50 border-purple-200',
    badge: 'Immutable Log',
  },
  {
    tag: 'VERIFIABLE',
    title: 'SHA-256 Integrity',
    desc: 'Tamper-proof cryptographic hashes sealed at ingest with real-time audit verification.',
    icon: FileCheck2,
    color: 'from-emerald-600 to-teal-800',
    iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    badge: 'Crypto-Sealed',
  },
  {
    tag: 'SCALABLE',
    title: 'API & Cloud Architecture',
    desc: 'Distributed microservices architecture engineered for high-concurrency national scale.',
    icon: Server,
    color: 'from-slate-700 to-slate-900',
    iconColor: 'text-slate-700 bg-slate-100 border-slate-300',
    badge: 'High Availability',
  },
];

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<Analytics>(DEMO_ANALYTICS);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoData, setIsDemoData] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const response = await analyticsService.getAnalytics();
      if (response && response.data) {
        setAnalytics(response.data);
        setIsDemoData(false);
        if (isManualRefresh) {
          toast.success('Dashboard metrics refreshed');
        }
      } else {
        // Fallback to demo
        setAnalytics(DEMO_ANALYTICS);
        setIsDemoData(true);
      }
    } catch {
      // In development or when mock backend server is offline, fallback gracefully
      setAnalytics(DEMO_ANALYTICS);
      setIsDemoData(true);
      if (isManualRefresh) {
        toast('Using demonstration data (API offline)', { icon: 'ℹ️' });
      }
    } finally {
      setLoading(false);
      if (isManualRefresh) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatActionName = (action: string) => {
    return action
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome & System Status Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 md:p-8 text-white shadow-lg border border-slate-700">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 bottom-0 -mb-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-medium text-slate-300">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>SECURED CLUSTER: NODE 01-PROD</span>
              <span className="text-slate-500">|</span>
              <span className="text-emerald-400 font-semibold tracking-wide">FIPS 140-2 READY</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Welcome back, {user?.name || 'Authorized Officer'}
              <span className="text-xs md:text-sm font-medium px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 capitalize">
                {user?.role || 'Investigator'}
              </span>
            </h1>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Secure Document Management & Cryptographic Chain-of-Custody System. All digital evidence and court filings are SHA-256 signed with active audit trail.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-600/80 shadow-xs transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-400' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Sync Telemetry'}</span>
            </button>
            <button
              onClick={() => navigate('/upload')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium shadow-md shadow-blue-600/20 transition-all active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Record</span>
            </button>
          </div>
        </div>

        {/* System Sub-Bar */}
        <div className="mt-6 pt-5 border-t border-slate-700/70 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-blue-400" />
            <span>Encryption: <strong className="text-white">AES-GCM-256</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Integrity Engine: <strong className="text-white">Active (SHA-256)</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Forensic Parser: <strong className="text-white">Online</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Data Mode: <strong className={isDemoData ? 'text-amber-300' : 'text-emerald-300'}>
              {isDemoData ? 'Demonstration Dataset' : 'Production Live Feed'}
            </strong></span>
          </div>
        </div>
      </div>

      {/* 5 Concept Cards Row */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            Architectural Guarantees & Core Pillars
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {CONCEPT_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.tag}
                className="group relative bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {pillar.tag}
                    </span>
                    <div className={`p-2 rounded-lg border ${pillar.iconColor} group-hover:scale-105 transition-transform`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 leading-snug">{pillar.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{pillar.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-medium text-slate-400">{pillar.badge}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* KPI Cards Row (6 cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs animate-pulse space-y-2">
              <div className="h-3 w-16 bg-slate-200 rounded" />
              <div className="h-7 w-20 bg-slate-300 rounded" />
              <div className="h-2 w-12 bg-slate-100 rounded" />
            </div>
          ))
        ) : (
          <>
            <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Total Cases</span>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <FolderOpen className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-2">{analytics.totalCases}</p>
              <span className="inline-flex items-center text-[10px] text-emerald-600 font-medium mt-1">
                Active investigations
              </span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Documents</span>
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-2">{analytics.totalDocuments}</p>
              <span className="inline-flex items-center text-[10px] text-indigo-600 font-medium mt-1">
                Encrypted repository
              </span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Processed</span>
                <div className="p-2 bg-cyan-50 text-cyan-600 rounded-lg">
                  <Cpu className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-2">{analytics.documentsProcessed}</p>
              <span className="inline-flex items-center text-[10px] text-cyan-600 font-medium mt-1">
                OCR & parsed
              </span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Integrity 100%</span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-emerald-600 mt-2">{analytics.integrityVerified}</p>
              <span className="inline-flex items-center text-[10px] text-emerald-600 font-medium mt-1">
                Hashes validated
              </span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Review Req.</span>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-amber-600 mt-2">{analytics.pendingReview}</p>
              <span className="inline-flex items-center text-[10px] text-amber-600 font-medium mt-1">
                Action required
              </span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Audit Events</span>
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-2">
                {analytics.recentActivity?.length || 0}
              </p>
              <span className="inline-flex items-center text-[10px] text-purple-600 font-medium mt-1">
                Logged in cycle
              </span>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Operational Quick Actions</h2>
            <p className="text-xs text-slate-500">Standard workflows for document intake, forensics, and investigation</p>
          </div>
          <span className="text-xs text-slate-400">Authenticated user actions</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => navigate('/cases')}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition-all group"
          >
            <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700 group-hover:scale-105 transition-transform">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700 block">Create Case</span>
              <span className="text-[11px] text-slate-500">Initiate new investigation folder</span>
            </div>
          </button>

          <button
            onClick={() => navigate('/upload')}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-left transition-all group"
          >
            <div className="p-2.5 rounded-lg bg-indigo-100 text-indigo-700 group-hover:scale-105 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 block">Upload Document</span>
              <span className="text-[11px] text-slate-500">Auto-hash & AI classify files</span>
            </div>
          </button>

          <button
            onClick={() => navigate('/search')}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/40 text-left transition-all group"
          >
            <div className="p-2.5 rounded-lg bg-cyan-100 text-cyan-700 group-hover:scale-105 transition-transform">
              <SearchIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-cyan-700 block">Search Repository</span>
              <span className="text-[11px] text-slate-500">Full-text & metadata OCR query</span>
            </div>
          </button>

          <button
            onClick={() => navigate('/security')}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 text-left transition-all group"
          >
            <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 block">Verify Integrity</span>
              <span className="text-[11px] text-slate-500">Validate cryptographic hashes</span>
            </div>
          </button>
        </div>
      </div>

      {/* Analytics & Charts Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Cryptographic & Operational Analytics
            </h2>
            <p className="text-xs text-slate-500">Live breakdown of documents, clearance levels, and pipeline throughput</p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-600">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Prototype / Demonstration Data</span>
          </div>
        </div>

        {/* 4 Recharts in 2x2 Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Chart 1: Documents by Type (BarChart) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Documents by Type</h3>
                <p className="text-xs text-slate-500">Categorical distribution across active cases</p>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                Bar Chart
              </span>
            </div>

            <div className="h-64 w-full">
              {loading ? (
                <div className="h-full flex items-center justify-center bg-slate-50 rounded-lg animate-pulse">
                  <span className="text-xs text-slate-400">Loading chart data...</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics.documentsByType || []}
                    margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="type"
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                    />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="count" name="Documents" radius={[4, 4, 0, 0]}>
                      {(analytics.documentsByType || []).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Top Category: <strong>{analytics.documentsByType?.[0]?.type || 'N/A'}</strong></span>
              <span>Total Categories: {analytics.documentsByType?.length || 0}</span>
            </div>
          </div>

          {/* Chart 2: Documents by Security Level (PieChart) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Clearance & Security Levels</h3>
                <p className="text-xs text-slate-500">Classification distribution under RBAC policy</p>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                Pie Chart
              </span>
            </div>

            <div className="h-64 w-full">
              {loading ? (
                <div className="h-full flex items-center justify-center bg-slate-50 rounded-lg animate-pulse">
                  <span className="text-xs text-slate-400">Loading chart data...</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.documentsBySecurityLevel || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      nameKey="level"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {(analytics.documentsBySecurityLevel || []).map((entry, index) => (
                        <Cell
                          key={`sec-cell-${index}`}
                          fill={SECURITY_COLORS[entry.level] || TYPE_COLORS[index % TYPE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                      formatter={(val) => <span className="text-slate-600 capitalize">{val}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>FIPS Clearance Strictness</span>
              <span className="text-rose-600 font-semibold">Strict Role Gatekeeping</span>
            </div>
          </div>

          {/* Chart 3: Upload Activity Over Time (AreaChart) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Ingest Activity Over Time</h3>
                <p className="text-xs text-slate-500">Document uploads & evidence ingestion velocity</p>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                Area Chart
              </span>
            </div>

            <div className="h-64 w-full">
              {loading ? (
                <div className="h-full flex items-center justify-center bg-slate-50 rounded-lg animate-pulse">
                  <span className="text-xs text-slate-400">Loading chart data...</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={analytics.uploadActivity || []}
                    margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="uploadColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#uploadColor)"
                      name="Uploads"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Throughput: Active ingestion pipelines</span>
              <span className="text-blue-600 font-semibold">Peak: Friday Surge</span>
            </div>
          </div>

          {/* Chart 4: Document Status Distribution (Donut Chart) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Document Processing Status</h3>
                <p className="text-xs text-slate-500">Lifecycle verification & pending review counts</p>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                Donut Chart
              </span>
            </div>

            <div className="h-64 w-full">
              {loading ? (
                <div className="h-full flex items-center justify-center bg-slate-50 rounded-lg animate-pulse">
                  <span className="text-xs text-slate-400">Loading chart data...</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.documentsByStatus || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="status"
                    >
                      {(analytics.documentsByStatus || []).map((entry, index) => (
                        <Cell
                          key={`status-cell-${index}`}
                          fill={STATUS_COLORS[entry.status] || TYPE_COLORS[index % TYPE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                      formatter={(val) => <span className="text-slate-600 capitalize">{val}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Overall Integrity Score</span>
              <span className="text-emerald-600 font-bold">99.4% Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table (Last 5 Audit Log Entries) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              Cryptographic Audit Log (Recent Activity)
            </h2>
            <p className="text-xs text-slate-500">
              Immutable chain-of-custody recordings showing recent tamper-evident actions
            </p>
          </div>
          <button
            onClick={() => navigate('/audit-logs')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
          >
            <span>View Full Audit Vault</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Officer / User</th>
                <th className="py-3 px-4">Target Resource</th>
                <th className="py-3 px-4">Audit Details</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-3 px-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                    <td className="py-3 px-4"><div className="h-4 w-28 bg-slate-200 rounded" /></td>
                    <td className="py-3 px-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                    <td className="py-3 px-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                    <td className="py-3 px-4"><div className="h-4 w-48 bg-slate-200 rounded" /></td>
                    <td className="py-3 px-4 text-right"><div className="h-4 w-12 bg-slate-200 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : (analytics.recentActivity && analytics.recentActivity.length > 0) ? (
                analytics.recentActivity.slice(0, 5).map((log: AuditLog) => (
                  <tr key={log._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-800">
                        {formatActionName(log.action)}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-700">{log.userName}</span>
                        <span className="text-[10px] text-slate-400 capitalize">({log.userRole})</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {log.resourceId || log.resourceType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <StatusBadge status={log.status || 'success'} size="sm" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No recent audit activity recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 px-4">
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            Audit records are append-only and cryptographically sequenced.
          </span>
          <button
            onClick={() => navigate('/audit-logs')}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            <span>Audit log vault</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
