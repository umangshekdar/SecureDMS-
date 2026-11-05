import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  Shield,
  ArrowRight,
  RefreshCw,
  FolderOpen,
  Lock,
  FileCode,
  FileImage,
  Eye,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { documentService, caseService } from '../services/api';
import { Case, DocumentType, SecurityLevel, Document } from '../types';
import { SecurityBadge } from '../components/common/SecurityBadge';
import { formatFileSize } from './Documents';
import {
  getDemoCases,
  addDemoDocument,
  addDemoAuditLog,
  isNetworkOrServerError,
} from '../data/demoData';

const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'txt', 'jpg', 'jpeg', 'png'];
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

const PIPELINE_STEPS = [
  { id: 1, label: 'Uploaded', desc: 'Secure multipart transfer complete' },
  { id: 2, label: 'Security Check', desc: 'Antivirus scan & MIME sanitization' },
  { id: 3, label: 'Hash Generated', desc: 'SHA-256 genesis fingerprint computed' },
  { id: 4, label: 'Text Extraction', desc: 'OCR & optical transcription executed' },
  { id: 5, label: 'AI Processing', desc: 'Neural entity detection & classification' },
  { id: 6, label: 'Metadata Extracted', desc: 'Evidentiary attributes structured' },
  { id: 7, label: 'Indexed', desc: 'Search index & cryptographic ledger updated' },
  { id: 8, label: 'Ready', desc: 'Document sealed and accessible in repository' },
];

export const Upload: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form State
  const [file, setFile] = useState<File | null>(null);
  const [clientHash, setClientHash] = useState<string>('');
  const [calculatingHash, setCalculatingHash] = useState<boolean>(false);
  const [cases, setCases] = useState<Case[]>([]);
  const [loadingCases, setLoadingCases] = useState<boolean>(true);

  // Form inputs
  const initialCaseId = searchParams.get('caseId') || '';
  const [selectedCaseId, setSelectedCaseId] = useState<string>(initialCaseId);
  const [docName, setDocName] = useState<string>('');
  const [docType, setDocType] = useState<DocumentType>('fir');
  const [securityLevel, setSecurityLevel] = useState<SecurityLevel>('internal');
  const [description, setDescription] = useState<string>('');

  // Drag state
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Upload & Pipeline State
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [uploadSuccessDoc, setUploadSuccessDoc] = useState<Document | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Load cases for dropdown
  useEffect(() => {
    const fetchCases = async () => {
      setLoadingCases(true);
      try {
        const res = await caseService.getCases({ limit: 100 });
        if (res && res.data && res.data.length > 0) {
          setCases(res.data);
          if (!selectedCaseId) {
            setSelectedCaseId(res.data[0]._id);
          }
        } else {
          const fallbackCases = getDemoCases({ limit: 100 }).cases;
          setCases(fallbackCases);
          if (!selectedCaseId && fallbackCases.length > 0) {
            setSelectedCaseId(fallbackCases[0]._id);
          }
        }
      } catch {
        const fallbackCases = getDemoCases({ limit: 100 }).cases;
        setCases(fallbackCases);
        if (!selectedCaseId && fallbackCases.length > 0) {
          setSelectedCaseId(fallbackCases[0]._id);
        }
      } finally {
        setLoadingCases(false);
      }
    };
    fetchCases();
  }, []);

  // Compute Client-Side SHA-256 for instantaneous cryptographic verification
  const computeClientHash = useCallback(async (selectedFile: File) => {
    setCalculatingHash(true);
    setClientHash('');
    try {
      const buffer = await selectedFile.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      setClientHash(hashHex);
    } catch (err) {
      console.warn('Could not compute client-side hash:', err);
    } finally {
      setCalculatingHash(false);
    }
  }, []);

  // Validate and assign file
  const handleFileSelection = (selectedFile: File) => {
    const ext = selectedFile.name.split('.').pop()?.toLowerCase() || '';

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      toast.error(`Invalid file format (.${ext}). Accepted: PDF, DOCX, TXT, JPG, PNG`);
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`File size exceeds 50MB limit (${formatFileSize(selectedFile.size)})`);
      return;
    }

    setFile(selectedFile);
    setUploadError(null);

    // Auto-populate document name if empty
    if (!docName) {
      const nameWithoutExt = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || selectedFile.name;
      setDocName(nameWithoutExt);
    }

    // Compute client-side SHA-256
    computeClientHash(selectedFile);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setClientHash('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Form submit handler with 8-step pipeline
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error('Please select an evidentiary document file');
      return;
    }

    if (!selectedCaseId) {
      toast.error('Please associate this document with a case');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccessDoc(null);
    setCurrentStep(1); // Step 1: Uploaded

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('caseId', selectedCaseId);
      formData.append('name', docName || file.name);
      formData.append('type', docType);
      formData.append('securityLevel', securityLevel);

      const metadataPayload = {
        notes: description,
        clientPrecomputedHash: clientHash,
        ingestionChannel: 'SecureDMS Web Portal',
        originalFileName: file.name,
      };
      formData.append('metadata', JSON.stringify(metadataPayload));

      // Trigger animated progression across steps 2-4
      const step2Timer = setTimeout(() => setCurrentStep(2), 300);
      const step3Timer = setTimeout(() => setCurrentStep(3), 600);
      const step4Timer = setTimeout(() => setCurrentStep(4), 900);

      // Perform real API call
      const response = await documentService.uploadDocument(formData);

      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
      clearTimeout(step4Timer);

      // Animate remaining steps smoothly
      setCurrentStep(5);
      await new Promise((res) => setTimeout(res, 250));
      setCurrentStep(6);
      await new Promise((res) => setTimeout(res, 250));
      setCurrentStep(7);
      await new Promise((res) => setTimeout(res, 200));
      setCurrentStep(8); // Completed

      if (response && response.data) {
        setUploadSuccessDoc(response.data);
        toast.success('Document notarized and sealed successfully!', {
          icon: '🛡️',
          duration: 5000,
        });
      }
    } catch (err: unknown) {
      if (isNetworkOrServerError(err)) {
        // Smoothly animate steps to completion in demo mode
        setCurrentStep(5);
        await new Promise((res) => setTimeout(res, 250));
        setCurrentStep(6);
        await new Promise((res) => setTimeout(res, 250));
        setCurrentStep(7);
        await new Promise((res) => setTimeout(res, 200));
        setCurrentStep(8);

        const newDocId = `doc-demo-${Date.now()}`;
        const newFormattedDocId = `DOC-2026-UPL-${Math.floor(1000 + Math.random() * 9000)}`;
        const assignedCase = cases.find((c) => c._id === selectedCaseId) || cases[0];
        const computedHash =
          clientHash ||
          `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`;

        const newDoc: Document = {
          _id: newDocId,
          documentId: newFormattedDocId,
          caseId: assignedCase || 'CASE-2026-EOW-081',
          name: docName
            ? docName.includes('.')
              ? docName
              : `${docName}.${file.name.split('.').pop() || 'pdf'}`
            : file.name,
          type: docType,
          securityLevel,
          fileUrl: URL.createObjectURL(file),
          mimeType: file.type || 'application/pdf',
          size: file.size,
          sha256Hash: computedHash,
          version: 1,
          status: 'verified',
          uploadedBy: {
            _id: 'usr-current',
            name: 'Authorized Ingestion Officer',
            email: 'officer@securedms.demo',
            role: 'investigator',
            department: 'Digital Forensic Unit',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          ocrText: `Transcript recorded for ${file.name}. Ingestion channel: SecureDMS Portal. Cryptographic bitstream validated.`,
          aiSummary:
            description ||
            `Official ${docType} exhibit ingested and verified with SHA-256 fingerprint ${computedHash.slice(0, 16)}...`,
          aiClassification: {
            type: docType,
            confidence: 0.98,
            entities: [
              { label: 'Ingestion Mode', value: 'Direct Multipart Stream' },
              { label: 'Security Clearance', value: securityLevel.toUpperCase() },
            ],
            keywords: [docType, 'SHA-256', 'Verified Evidence'],
          },
          metadata: {
            clientPrecomputedHash: computedHash,
            originalFileName: file.name,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        addDemoDocument(newDoc);
        addDemoAuditLog({
          action: 'DOCUMENT_UPLOADED',
          resourceType: 'document',
          resourceId: newDoc.documentId,
          details: `Uploaded ${newDoc.name} (${formatFileSize(newDoc.size)}) with SHA-256 seal: ${computedHash.slice(0, 16)}...`,
          userName: 'Authorized Ingestion Officer',
          userRole: 'investigator',
          status: 'success',
        });

        setUploadSuccessDoc(newDoc);
        toast.success('Document notarized and sealed successfully! (Demo mode)', {
          icon: '🛡️',
          duration: 5000,
        });
      } else {
        console.error('Upload pipeline failed:', err);
        const message = err instanceof Error ? err.message : 'Ingestion pipeline aborted';
        setUploadError(message);
        toast.error('Document ingestion failed');
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Reset to upload another
  const handleResetForm = () => {
    setFile(null);
    setDocName('');
    setDescription('');
    setClientHash('');
    setCurrentStep(0);
    setUploadSuccessDoc(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileBadgeIcon = (fileName?: string) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    if (['png', 'jpg', 'jpeg'].includes(ext || '')) return <FileImage className="w-8 h-8 text-purple-600" />;
    if (ext === 'txt') return <FileCode className="w-8 h-8 text-emerald-600" />;
    return <FileText className="w-8 h-8 text-blue-600" />;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Secure Document Ingestion
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full border border-blue-200">
              Chain-of-Custody Portal
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Upload sensitive legal evidence with client-side SHA-256 fingerprinting & AI classification
          </p>
        </div>

        <Link
          to="/documents"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-xs self-start sm:self-auto"
        >
          <FolderOpen className="w-4 h-4 text-slate-500" />
          <span>View Repository</span>
        </Link>
      </div>

      {/* SUCCESS STATE */}
      {uploadSuccessDoc && (
        <div className="bg-white rounded-2xl border border-emerald-200 p-8 shadow-md space-y-6 animate-fadeIn">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl shrink-0">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1 flex-1">
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded uppercase tracking-wider">
                CRYPTOGRAPHICALLY SEALED
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                Document Ingested & Notarized Successfully
              </h2>
              <p className="text-sm text-slate-600">
                The file has been permanently stamped with a SHA-256 digest, OCR extracted, and added to the evidentiary registry.
              </p>
            </div>
          </div>

          {/* Details Summary Card */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3 font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 pb-2 border-b border-slate-200">
              <span className="text-slate-400">DOCUMENT IDENTIFIER:</span>
              <span className="font-bold text-blue-700">{uploadSuccessDoc.documentId}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 pb-2 border-b border-slate-200">
              <span className="text-slate-400">DOCUMENT TITLE:</span>
              <span className="text-slate-800 font-sans font-medium">{uploadSuccessDoc.name}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 pb-2 border-b border-slate-200">
              <span className="text-slate-400">RECORDED SHA-256 HASH:</span>
              <span className="text-emerald-700 break-all select-all font-semibold">
                {uploadSuccessDoc.sha256Hash}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-slate-400">SECURITY CLASSIFICATION:</span>
              <span className="uppercase text-slate-800 font-sans font-semibold">
                {uploadSuccessDoc.securityLevel}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <button
              onClick={handleResetForm}
              className="w-full sm:w-auto px-5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Upload Another Document
            </button>
            <Link
              to={`/documents/${uploadSuccessDoc._id}`}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition shadow-sm flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              <span>Inspect Document Dossier</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* PROCESSING PIPELINE CARD (ANIMATING WHILE UPLOADING) */}
      {isUploading && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-500/20 text-blue-400 rounded-full flex items-center gap-1.5 w-fit">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Forensic Ingestion Pipeline Active
              </span>
              <h2 className="text-lg font-bold text-white">
                Sealing Document Into Cryptographic Ledger...
              </h2>
            </div>
            <span className="text-xs font-mono text-emerald-400">
              Step {currentStep} of {PIPELINE_STEPS.length}
            </span>
          </div>

          {/* Stepped Timeline */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {PIPELINE_STEPS.map((step) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;

              return (
                <div
                  key={step.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isCompleted
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                      : isCurrent
                      ? 'bg-blue-950/60 border-blue-500/60 text-blue-200 ring-1 ring-blue-500'
                      : 'bg-black/30 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {isCompleted ? (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : isCurrent ? (
                      <RefreshCw className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-slate-700 text-[10px] flex items-center justify-center text-slate-500 font-mono">
                        {step.id}
                      </span>
                    )}
                    <span className="text-xs font-bold truncate">{step.label}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MAIN UPLOAD FORM */}
      {!uploadSuccessDoc && !isUploading && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* DRAG & DROP ZONE */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
            className={`relative bg-white rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition cursor-pointer ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50 scale-[1.005]'
                : file
                ? 'border-slate-300 bg-slate-50/40'
                : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.jpg,.jpeg,.png"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {!file ? (
              <div className="space-y-4 pointer-events-none">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">
                    Drop your legal file here, or{' '}
                    <span className="text-blue-600 underline">browse files</span>
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Supported formats: PDF, DOCX, TXT, JPG, PNG (Maximum file size: 50MB)
                  </p>
                </div>

                <div className="flex items-center justify-center gap-4 pt-2 text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-blue-600" /> AES-256 Ingestion
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" /> Client-Side Fingerprinting
                  </span>
                </div>
              </div>
            ) : (
              /* FILE SELECTED PREVIEW CARD */
              <div
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-left"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="p-3 bg-slate-100 rounded-xl shrink-0">
                    {getFileBadgeIcon(file.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-900 truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatFileSize(file.size)} · Type: {file.type || 'Document Binary'}
                    </p>
                    {calculatingHash ? (
                      <p className="text-[11px] text-blue-600 font-mono animate-pulse mt-1 flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Calculating source SHA-256...
                      </p>
                    ) : clientHash ? (
                      <p className="text-[11px] text-emerald-700 font-mono mt-1 break-all">
                        Genesis Digest: {clientHash.substring(0, 24)}...
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                  >
                    Replace File
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* METADATA FORM FIELDS */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-600" />
              Document Classification & Metadata
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Associated Case Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Associated Legal Case *
                </label>
                <select
                  required
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  disabled={loadingCases}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="">-- Select Case Reference --</option>
                  {cases.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.caseId} — {c.title}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">
                  Documents are indexed directly into the custody chain of this case.
                </p>
              </div>

              {/* Document Type Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Document Type *
                </label>
                <select
                  required
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as DocumentType)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="fir">First Information Report (FIR)</option>
                  <option value="investigation-report">Investigation Report</option>
                  <option value="witness-statement">Witness Statement</option>
                  <option value="forensic-report">Forensic Report</option>
                  <option value="evidence-record">Evidence Record</option>
                  <option value="charge-sheet">Charge Sheet</option>
                  <option value="legal-notice">Legal Notice</option>
                  <option value="court-filing">Court Filing</option>
                  <option value="judgment">Court Judgment</option>
                  <option value="other">Other Document</option>
                </select>
                <p className="text-[11px] text-slate-400">
                  Selects AI categorization prompt and automated entity extraction rules.
                </p>
              </div>

              {/* Document Title / Name */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Document Display Title *
                </label>
                <input
                  type="text"
                  required
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. Crime Scene Forensic Analysis Report #04"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              {/* Security Level Selector (Visual Radio Cards) */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Security Clearance Level *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    {
                      id: 'public',
                      title: 'Public',
                      desc: 'Open records accessible by all public parties',
                    },
                    {
                      id: 'internal',
                      title: 'Internal',
                      desc: 'Standard case officers & departmental staff',
                    },
                    {
                      id: 'confidential',
                      title: 'Confidential',
                      desc: 'Restricted forensic examiners & lead counsels',
                    },
                    {
                      id: 'highly-confidential',
                      title: 'Highly Confidential',
                      desc: 'Judges, statutory leads & senior prosecutors',
                    },
                  ].map((lvl) => {
                    const isSelected = securityLevel === lvl.id;
                    return (
                      <div
                        key={lvl.id}
                        onClick={() => setSecurityLevel(lvl.id as SecurityLevel)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <SecurityBadge level={lvl.id as SecurityLevel} size="sm" />
                            <div
                              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                              }`}
                            >
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug">{lvl.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ingestion Notes / Description */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Evidentiary Notes / Chain-of-Custody Ingestion Context
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Record source of acquisition, seizing officer badge number, preliminary observations, or handling instructions..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            {/* Error banner if upload failed */}
            {uploadError && (
              <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <p className="font-bold">Ingestion Failure:</p>
                  <p>{uploadError}</p>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>SHA-256 fingerprint will be recorded immediately into audit ledger.</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => navigate('/documents')}
                  className="w-full sm:w-auto px-5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!file || !selectedCaseId || isUploading}
                  className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition shadow-sm hover:shadow disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Seal & Ingest Document</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
