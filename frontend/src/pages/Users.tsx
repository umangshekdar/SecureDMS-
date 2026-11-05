import React, { useState, useEffect, useCallback } from 'react';
import {
  Users as UsersIcon,
  UserPlus,
  Search,
  Filter,
  Edit2,
  Building,
  RotateCcw,
  X,
  Check,
  Power,
  Key,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '../services/api';
import { User, UserRole } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Pagination } from '../components/common/Pagination';
import { StatusBadge } from '../components/common/StatusBadge';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

// Demonstration users for offline & instant interactivity
const DEMO_USERS: User[] = [
  {
    _id: 'usr-001',
    name: 'Inspector Vikram Rao',
    email: 'vikram.rao@cbi.gov.in',
    role: 'investigator',
    department: 'Economic Offences Wing (EOW)',
    status: 'active',
    lastLogin: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-10T08:00:00Z',
  },
  {
    _id: 'usr-002',
    name: 'Dr. Neha Sharma',
    email: 'neha.sharma@cfsl.gov.in',
    role: 'forensic',
    department: 'Digital Forensic Examiner Directorate',
    status: 'active',
    lastLogin: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    createdAt: '2026-01-12T09:30:00Z',
    updatedAt: '2026-01-12T09:30:00Z',
  },
  {
    _id: 'usr-003',
    name: 'Adv. Ananya Iyer',
    email: 'ananya.iyer@prosecution.gov.in',
    role: 'legal',
    department: 'High Court Prosecution Cell',
    status: 'active',
    lastLogin: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    createdAt: '2026-01-15T10:15:00Z',
    updatedAt: '2026-01-15T10:15:00Z',
  },
  {
    _id: 'usr-004',
    name: 'Harish Mehta (Admin)',
    email: 'harish.mehta@dms.gov.in',
    role: 'admin',
    department: 'National Cyber Security Coordination',
    status: 'active',
    lastLogin: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    _id: 'usr-005',
    name: 'Sub-Inspector Rohit Varma',
    email: 'rohit.varma@police.gov.in',
    role: 'investigator',
    department: 'Cyber Crime Investigation Cell',
    status: 'inactive',
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    createdAt: '2026-02-01T11:00:00Z',
    updatedAt: '2026-02-01T11:00:00Z',
  },
];

const ROLE_PERMISSIONS = [
  {
    permission: 'Upload & Ingest Case Documents',
    admin: true,
    investigator: true,
    forensic: true,
    legal: false,
  },
  {
    permission: 'Access Highly Confidential Evidence',
    admin: true,
    investigator: true,
    forensic: false,
    legal: false,
  },
  {
    permission: 'Execute Cryptographic Integrity Validations',
    admin: true,
    investigator: true,
    forensic: true,
    legal: false,
  },
  {
    permission: 'AI Document Summarization & Entity Extraction',
    admin: true,
    investigator: true,
    forensic: true,
    legal: true,
  },
  {
    permission: 'Create & Modify Case Dockets',
    admin: true,
    investigator: true,
    forensic: false,
    legal: false,
  },
  {
    permission: 'Export Court Certified Watermarked Evidence',
    admin: true,
    investigator: true,
    forensic: false,
    legal: true,
  },
  {
    permission: 'Manage System Users & Clearance Levels',
    admin: true,
    investigator: false,
    forensic: false,
    legal: false,
  },
  {
    permission: 'Access Full Non-Repudiation Audit Logs',
    admin: true,
    investigator: true,
    forensic: true,
    legal: true,
  },
];

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>(DEMO_USERS);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(DEMO_USERS.length);
  const pageSize = 10;

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState<string>('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Status toggle confirmation
  const [confirmStatusModal, setConfirmStatusModal] = useState<{
    open: boolean;
    user: User | null;
    targetStatus: 'active' | 'inactive';
  }>({
    open: false,
    user: null,
    targetStatus: 'inactive',
  });

  // Form states
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'investigator' as UserRole,
    department: '',
  });

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'investigator' as UserRole,
    department: '',
  });

  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await userService.getUsers({
        page,
        limit: pageSize,
        role: roleFilter || undefined,
        department: deptFilter || undefined,
        search: searchQuery || undefined,
      });

      if (response.success && Array.isArray(response.data) && response.data.length > 0) {
        setUsers(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.pages || 1);
          setTotalItems(response.pagination.total || response.data.length);
        } else {
          setTotalPages(1);
          setTotalItems(response.data.length);
        }
      } else {
        applyDemoFilter();
      }
    } catch (err) {
      console.warn('Backend user API unavailable, using local store:', err);
      applyDemoFilter();
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, roleFilter, deptFilter, searchQuery]);

  const applyDemoFilter = () => {
    let filtered = [...DEMO_USERS];
    if (roleFilter) {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }
    if (deptFilter) {
      filtered = filtered.filter((u) => u.department.toLowerCase().includes(deptFilter.toLowerCase()));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.department.toLowerCase().includes(q)
      );
    }

    const calculatedTotal = filtered.length;
    const calculatedPages = Math.max(1, Math.ceil(calculatedTotal / pageSize));
    const startIdx = (page - 1) * pageSize;

    setUsers(filtered.slice(startIdx, startIdx + pageSize));
    setTotalItems(calculatedTotal);
    setTotalPages(calculatedPages);
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name || !addForm.email || !addForm.password || !addForm.department) {
      toast.error('Please fill in all required fields');
      return;
    }

    setActionLoading(true);
    try {
      const res = await userService.createUser(addForm);
      if (res.success && res.data) {
        toast.success(`User ${addForm.name} created successfully`);
        setUsers((prev) => [res.data, ...prev]);
      } else {
        // Fallback local create
        const newUser: User = {
          _id: `usr-${Date.now()}`,
          name: addForm.name,
          email: addForm.email,
          role: addForm.role,
          department: addForm.department,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        DEMO_USERS.unshift(newUser);
        setUsers((prev) => [newUser, ...prev]);
        toast.success(`User ${addForm.name} enrolled in local directory`);
      }
      setIsAddModalOpen(false);
      setAddForm({
        name: '',
        email: '',
        password: '',
        role: 'investigator',
        department: '',
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setActionLoading(false);
    }
  };

  // Open edit modal
  const openEditModal = (u: User) => {
    setSelectedUser(u);
    setEditForm({
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department,
    });
    setIsEditModalOpen(true);
  };

  // Handle Edit Submit
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      const res = await userService.updateUser(selectedUser._id, editForm);
      if (res.success && res.data) {
        toast.success('User updated successfully');
        setUsers((prev) => prev.map((u) => (u._id === selectedUser._id ? res.data : u)));
      } else {
        const updated = { ...selectedUser, ...editForm, updatedAt: new Date().toISOString() };
        setUsers((prev) => prev.map((u) => (u._id === selectedUser._id ? updated : u)));
        toast.success('User profile updated');
      }
      setIsEditModalOpen(false);
      setSelectedUser(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle active/inactive status
  const handleToggleStatus = async () => {
    const { user, targetStatus } = confirmStatusModal;
    if (!user) return;

    setActionLoading(true);
    try {
      const res = await userService.updateUserStatus(user._id, targetStatus);
      if (res.success) {
        toast.success(`User set to ${targetStatus}`);
      } else {
        toast.success(`User status updated to ${targetStatus}`);
      }
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, status: targetStatus } : u))
      );
      setConfirmStatusModal({ open: false, user: null, targetStatus: 'inactive' });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const styles: Record<UserRole, string> = {
      admin: 'bg-rose-50 text-rose-700 border-rose-200',
      investigator: 'bg-blue-50 text-blue-700 border-blue-200',
      forensic: 'bg-purple-50 text-purple-700 border-purple-200',
      legal: 'bg-amber-50 text-amber-700 border-amber-200',
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${
          styles[role] || 'bg-slate-100 text-slate-700 border-slate-200'
        }`}
      >
        {role}
      </span>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <UsersIcon className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              User &amp; Access Management
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Provision verified law-enforcement personnel, assign security clearance, and enforce RBAC policies
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email, or department..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter:</span>
            </div>

            <select
              aria-label="Filter by Role"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="investigator">Investigator</option>
              <option value="forensic">Forensic</option>
              <option value="legal">Legal</option>
            </select>

            {(searchQuery || roleFilter || deptFilter) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('');
                  setDeptFilter('');
                  setPage(1);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <LoadingSpinner size="lg" text="Loading authorized personnel..." />
          </div>
        ) : users.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={UsersIcon}
              title="No users found"
              description="No personnel records match your specified search criteria."
              actionLabel="Add New User"
              onAction={() => setIsAddModalOpen(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Name &amp; Identity</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role Clearance</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4">Last Login</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const lastLoginStr = u.lastLogin
                    ? new Date(u.lastLogin).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Never';

                  return (
                    <tr key={u._id} className="hover:bg-slate-50/70 transition group">
                      {/* Name */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{u.name}</div>
                        <div className="font-mono text-[10px] text-slate-400">ID: {u._id}</div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-600">
                        {u.email}
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getRoleBadge(u.role)}
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate max-w-xs">{u.department}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <StatusBadge status={u.status} size="sm" />
                      </td>

                      {/* Last Login */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {lastLoginStr}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(u)}
                            title="Edit user details"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmStatusModal({
                                open: true,
                                user: u,
                                targetStatus: u.status === 'active' ? 'inactive' : 'active',
                              })
                            }
                            title={u.status === 'active' ? 'Disable Account' : 'Enable Account'}
                            className={`p-1.5 rounded-lg transition ${
                              u.status === 'active'
                                ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            <Power className="w-4 h-4" />
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

        {/* Pagination */}
        {!loading && users.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
            totalItems={totalItems}
            pageSize={pageSize}
          />
        )}
      </div>

      {/* Role Permissions Matrix Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
              <Key className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900">
              Role-Based Access Control (RBAC) Permissions Matrix
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Institutional privilege separation matrix enforced across API endpoints and client views
          </p>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">System Operation / Permission</th>
                <th className="py-3 px-4 text-center bg-rose-50/50 text-rose-800">Admin</th>
                <th className="py-3 px-4 text-center bg-blue-50/50 text-blue-800">Investigator</th>
                <th className="py-3 px-4 text-center bg-purple-50/50 text-purple-800">Forensic</th>
                <th className="py-3 px-4 text-center bg-amber-50/50 text-amber-800">Legal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ROLE_PERMISSIONS.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition">
                  <td className="py-3 px-4 font-medium text-slate-800">{row.permission}</td>

                  {/* Admin */}
                  <td className="py-3 px-4 text-center bg-rose-50/20">
                    {row.admin ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-400">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>

                  {/* Investigator */}
                  <td className="py-3 px-4 text-center bg-blue-50/20">
                    {row.investigator ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-400">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>

                  {/* Forensic */}
                  <td className="py-3 px-4 text-center bg-purple-50/20">
                    {row.forensic ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-400">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>

                  {/* Legal */}
                  <td className="py-3 px-4 text-center bg-amber-50/20">
                    {row.legal ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-400">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Provision New Personnel Account</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name &amp; Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special Agent Rajesh Nair"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Government Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@agency.gov.in"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Temporary Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters with special symbol"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assigned Role *
                  </label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="investigator">Investigator</option>
                    <option value="forensic">Forensic Examiner</option>
                    <option value="legal">Legal Counsel</option>
                    <option value="admin">System Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department / Wing *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cyber Crime Unit"
                    value={addForm.department}
                    onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition shadow-sm disabled:opacity-50"
                >
                  {actionLoading ? 'Provisioning...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Edit Personnel Profile</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name &amp; Title
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Email
                </label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="investigator">Investigator</option>
                    <option value="forensic">Forensic Examiner</option>
                    <option value="legal">Legal Counsel</option>
                    <option value="admin">System Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition shadow-sm disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Status Change */}
      <ConfirmDialog
        isOpen={confirmStatusModal.open}
        title={`${confirmStatusModal.targetStatus === 'active' ? 'Enable' : 'Disable'} Account Access`}
        message={`Are you sure you want to change status to "${confirmStatusModal.targetStatus}" for ${confirmStatusModal.user?.name}? When disabled, token sessions will be invalidated immediately.`}
        confirmText={confirmStatusModal.targetStatus === 'active' ? 'Enable Account' : 'Disable Account'}
        type={confirmStatusModal.targetStatus === 'active' ? 'info' : 'danger'}
        onConfirm={handleToggleStatus}
        onCancel={() => setConfirmStatusModal({ open: false, user: null, targetStatus: 'inactive' })}
        loading={actionLoading}
      />
    </div>
  );
};

export default Users;
