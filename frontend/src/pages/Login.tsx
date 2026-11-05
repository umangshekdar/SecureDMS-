import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/api';
import { UserRole } from '../types';

interface DemoAccount {
  role: string;
  roleType: UserRole;
  email: string;
  desc: string;
  badgeColor: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'Admin',
    roleType: 'admin',
    email: 'admin@securedms.demo',
    desc: 'System Configuration & User Management',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
  },
  {
    role: 'Investigator',
    roleType: 'investigator',
    email: 'officer@securedms.demo',
    desc: 'Case Handling & Document Uploads',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    role: 'Forensic Analyst',
    roleType: 'forensic',
    email: 'forensic@securedms.demo',
    desc: 'Integrity Verification & Hash Checks',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  {
    role: 'Legal Counsel',
    roleType: 'legal',
    email: 'legal@securedms.demo',
    desc: 'Chain of Custody & Judicial Review',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
];

const DEMO_PASSWORD = 'Demo@2026';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authService.login({ email, password });
      if (res.success && res.data) {
        login(res.data.token, res.data.user);
        toast.success(`Welcome back, ${res.data.user.name}`);
        navigate(from, { replace: true });
      } else {
        toast.error(res.message || 'Login failed. Please check your credentials.');
      }
    } catch (err: unknown) {
      // Mock fallback if backend is not yet running
      console.warn('Backend not accessible, testing mock fallback credentials:', err);

      const foundDemo = DEMO_ACCOUNTS.find((acc) => acc.email.toLowerCase() === email.toLowerCase());
      const isAcceptedPassword =
        password === DEMO_PASSWORD ||
        password === `${foundDemo?.roleType}123` ||
        password === 'admin123' ||
        password === 'Demo2026';

      if (foundDemo && isAcceptedPassword) {
        const mockUser = {
          _id: 'mock-' + foundDemo.roleType,
          name: `${foundDemo.role} User`,
          email: foundDemo.email,
          role: foundDemo.roleType,
          department: `${foundDemo.role} Division`,
          status: 'active' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const mockToken = 'mock-jwt-token-' + Date.now();
        login(mockToken, mockUser);
        toast.success(`Welcome to SecureDMS (${foundDemo.role})`);
        navigate(from, { replace: true });
      } else {
        toast.error('Invalid email or password. You can click any demo account below.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    toast('Demo credentials applied!', { icon: '⚡' });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-900 selection:bg-blue-500 selection:text-white">
      {/* Left Branding Panel */}
      <div className="lg:w-1/2 bg-gradient-to-br from-slate-950 via-slate-900 to-navy-900 text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
        {/* Subtle decorative grid/glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.12),transparent_50%)] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand header */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono tracking-wider uppercase text-slate-300">
              Government-Grade Defense Architecture
            </span>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center shadow-xl shadow-blue-600/30 ring-1 ring-blue-400/40">
              <Shield className="w-8 h-8 text-white fill-blue-600 stroke-white stroke-2" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Secure<span className="text-blue-400">DMS</span>
              </h1>
              <p className="text-xs font-mono text-slate-400 uppercase tracking-widest mt-0.5">
                Enterprise Cryptographic Vault
              </p>
            </div>
          </div>

          <p className="text-lg font-medium text-blue-300 mb-3 tracking-wide">
            Secure • Intelligent • Traceable • Verifiable
          </p>
          <p className="text-sm sm:text-base text-slate-400 max-w-lg leading-relaxed">
            Intelligent Document Lifecycle Management designed for sensitive criminal records, forensic chains of custody, and multi-agency legal compliance.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="my-10 relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-xs">
            <div className="flex items-center gap-2.5 text-blue-400 mb-1">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                SHA-256 Ledger
              </span>
            </div>
            <p className="text-xs text-slate-400">Immutable hash tracking with zero-trust integrity verification.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-xs">
            <div className="flex items-center gap-2.5 text-emerald-400 mb-1">
              <FileCheck className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                AI Classification
              </span>
            </div>
            <p className="text-xs text-slate-400">Automated legal summarization, OCR, and risk indexing.</p>
          </div>
        </div>

        {/* Security indicators at bottom */}
        <div className="relative z-10 pt-6 border-t border-slate-800/80">
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-4">
            Security Guarantees
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Role-Based Access Control</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Secure Document Storage</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Integrity Verification</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Complete Auditability</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="lg:w-1/2 bg-white flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12">
        <div className="max-w-md w-full mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Sign In
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Access your secure document workspace and case records
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Official Email Address
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@securedms.demo"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => toast('Password reset is managed by System Administrators.')}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Terminal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts Selection */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                Demo Accounts (Hackathon Only)
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                PW: <strong className="text-slate-700">Demo@2026</strong>
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Click any profile below to immediately autofill official demo credentials:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => handleSelectDemo(account.email)}
                  className="text-left p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 transition group focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                      {account.role}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border uppercase ${account.badgeColor}`}
                    >
                      {account.roleType}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 truncate mb-0.5">
                    {account.email}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{account.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
