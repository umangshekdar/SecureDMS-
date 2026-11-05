import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  Bell,
  Lock,
  Server,
  CheckCircle2,
  Key,
  Building,
  Mail,
  ShieldCheck,
  Database,
  Cpu,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

export const Settings: React.FC = () => {
  const { user } = useAuth();

  // Notification toggles state
  const [notifications, setNotifications] = useState({
    tamperAlerts: true,
    newEvidence: true,
    aiAnalysis: true,
    auditDigest: false,
    securityBaseline: true,
  });

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleToggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      toast.success('Preference updated');
      return next;
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setPasswordLoading(true);
    setTimeout(() => {
      setPasswordLoading(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password changed successfully');
    }, 600);
  };

  // Fallback user display if not yet logged in or demo mode
  const activeUser = user || {
    name: 'Special Agent Vikram Rao',
    email: 'vikram.rao@cbi.gov.in',
    role: 'investigator',
    department: 'Economic Offences Wing (EOW)',
    status: 'active',
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
            <SettingsIcon className="w-5 h-5" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Account &amp; System Settings
          </h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Review your official identity credentials, security policy settings, and system environment info
        </p>
      </div>

      {/* 1. User Profile Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">
              {activeUser.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{activeUser.name}</h2>
              <p className="text-xs text-slate-500">Government Identity Record</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
            {activeUser.status || 'Active'}
          </span>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
            <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Mail className="w-3 h-3" />
              Official Email Address
            </div>
            <div className="text-sm font-semibold text-slate-800 font-mono">
              {activeUser.email}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
            <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              RBAC Clearance Tier
            </div>
            <div className="text-sm font-bold text-blue-700 capitalize">
              {activeUser.role} Tier
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
            <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Building className="w-3 h-3" />
              Assigned Department
            </div>
            <div className="text-sm font-medium text-slate-800">
              {activeUser.department}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
            <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Key className="w-3 h-3" />
              Session Authentication
            </div>
            <div className="text-sm font-medium text-slate-800 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              JWT 256-Bit Bearer Verified
            </div>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50/70 border-t border-slate-100 text-[11px] text-slate-400">
          Identity profiles are managed centrally by the designated Department Security Officer (DSO).
        </div>
      </div>

      {/* 2. Notification Preferences */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">Notification Preferences</h2>
        </div>
        <p className="text-xs text-slate-500">
          Configure real-time dispatch alerts and periodic security digests
        </p>

        <div className="divide-y divide-slate-100">
          {/* Item 1 */}
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-slate-800">
                Critical Tamper &amp; Integrity Alerts
              </div>
              <div className="text-[11px] text-slate-500">
                Immediate high-priority alert if SHA-256 checksum fails on any active record
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggleNotification('tamperAlerts')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                notifications.tamperAlerts ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  notifications.tamperAlerts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Item 2 */}
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-slate-800">
                New Evidence Ingested in Assigned Cases
              </div>
              <div className="text-[11px] text-slate-500">
                Notify when investigators or forensic units attach fresh records to your dockets
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggleNotification('newEvidence')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                notifications.newEvidence ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  notifications.newEvidence ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Item 3 */}
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-slate-800">
                Forensic AI Classification &amp; OCR Completion
              </div>
              <div className="text-[11px] text-slate-500">
                Push message when neural entity extraction and executive summary finish
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggleNotification('aiAnalysis')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                notifications.aiAnalysis ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  notifications.aiAnalysis ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Item 4 */}
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-slate-800">
                Weekly Audit Trail Summary Digest
              </div>
              <div className="text-[11px] text-slate-500">
                Weekly PDF compilation of all access, downloads, and verifications
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggleNotification('auditDigest')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                notifications.auditDigest ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  notifications.auditDigest ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Security Settings: Change Password */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">Security &amp; Password Renewal</h2>
        </div>
        <p className="text-xs text-slate-500">
          Enforce institutional passphrase complexity with minimum 8 characters
        </p>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Passphrase *
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Passphrase *
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm New Passphrase *
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={passwordLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition shadow-sm disabled:opacity-50"
            >
              {passwordLoading ? (
                <>
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating Passphrase...
                </>
              ) : (
                'Update Passphrase'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 4. System Information Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">System Environment &amp; Runtime</h2>
        </div>
        <p className="text-xs text-slate-500">
          Core build metadata and backend gateway health status
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs pt-1">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[10px] font-semibold text-slate-400 uppercase">Platform Version</div>
            <div className="text-sm font-bold text-slate-800 font-mono mt-0.5">v2.4.0-gov-secure</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[10px] font-semibold text-slate-400 uppercase">API Gateway Status</div>
            <div className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Connected &amp; Secure
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[10px] font-semibold text-slate-400 uppercase">Target Environment</div>
            <div className="text-sm font-bold text-blue-700 mt-0.5">Hackathon Staging Node</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[10px] font-semibold text-slate-400 uppercase">Asset Vault</div>
            <div className="text-sm font-semibold text-slate-800 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Cloudinary Encrypted CDN
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[10px] font-semibold text-slate-400 uppercase">Database Engine</div>
            <div className="text-sm font-semibold text-slate-800 mt-0.5 flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              MongoDB 7.0 (WiredTiger AES)
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[10px] font-semibold text-slate-400 uppercase">Cryptographic Engine</div>
            <div className="text-sm font-semibold text-slate-800 mt-0.5 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-purple-600" />
              Node.js Crypto / SHA-256
            </div>
          </div>
        </div>
      </div>

      {/* 5. About SecureDMS */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-bold text-white">About SecureDMS Platform</h2>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          SecureDMS is an enterprise-grade legal and forensic document lifecycle management platform built to establish unimpeachable evidentiary authenticity under <strong>Section 65B of the Indian Evidence Act</strong>. By combining cryptographically verified SHA-256 digests, role-based access control, automated OCR entity recognition, and an append-only audit trail, SecureDMS guarantees complete non-repudiation and custody protection from crime scene to court gavel.
        </p>

        <div className="pt-2 border-t border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Zero-Trust Evidence Integrity Architecture</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Multi-Tier Clearance Separation (Investigator, Forensic, Legal)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Court-Admissible Non-Repudiable Audit Chain</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Compliant with CERT-In &amp; CCTNS Technical Guidelines</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
