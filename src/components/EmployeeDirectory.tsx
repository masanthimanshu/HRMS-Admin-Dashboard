import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Building2,
  CheckCircle2,
  XCircle,
  KeyRound,
  Shield,
  Shuffle,
  Mail
} from 'lucide-react';
import { User, Store, NewUserPayload } from '../types/hrms';

interface EmployeeDirectoryProps {
  users: User[];
  stores: Store[];
  onCreateUser: (payload: NewUserPayload) => Promise<{ success: boolean; error?: string }>;
  onToggleUserStatus: (userId: string) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export const EmployeeDirectory: React.FC<EmployeeDirectoryProps> = ({
  users,
  stores,
  onCreateUser,
  onToggleUserStatus,
  isModalOpen,
  setIsModalOpen,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStoreFilter, setSelectedStoreFilter] = useState('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [storeId, setStoreId] = useState(stores[0]?._id || '');
  const [password, setPassword] = useState('SecurePass2026!');

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let res = '';
    for (let i = 0; i < 14; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!name.trim() || !email.trim() || !storeId || !password.trim()) {
      setSubmitError('All fields including Store assignment and Password are required.');
      return;
    }

    if (!email.includes('@')) {
      setSubmitError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setSubmitError('Password should be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    const res = await onCreateUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      storeId,
      password: password.trim(),
    });
    setIsSubmitting(false);

    if (res.success) {
      setName('');
      setEmail('');
      setPassword('SecurePass2026!');
      setIsModalOpen(false);
    } else {
      setSubmitError(res.error || 'Failed to onboard employee.');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStore = selectedStoreFilter === 'ALL' || u.storeId === selectedStoreFilter;
    return matchesSearch && matchesStore;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Workforce Directory
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Onboard organizational personnel, manage store assignments, and audit active credentials.
          </p>
        </div>

        <button
          onClick={() => {
            if (stores.length > 0 && !storeId) {
              setStoreId(stores[0]._id);
            }
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Onboard Employee</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by employee name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-colors"
            />
          </div>

          {/* Store Branch filter */}
          <div className="w-full sm:w-auto">
            <select
              value={selectedStoreFilter}
              onChange={(e) => setSelectedStoreFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="ALL">All Store Branches ({stores.length})</option>
              {stores.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500 w-full sm:w-auto justify-end">
          <span>
            Showing <strong className="text-slate-900 font-mono tabular-nums">{filteredUsers.length}</strong> of{' '}
            <strong className="text-slate-900 font-mono tabular-nums">{users.length}</strong> staff
          </span>
          <span>·</span>
          <span>
            Endpoint: <code className="font-mono text-slate-700">/account/auth/create</code>
          </span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-sm font-semibold text-slate-800">No Employees Found</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || selectedStoreFilter !== 'ALL'
                ? 'No personnel matched your current filter criteria.'
                : 'No employees have been onboarded yet. Create your first employee record.'}
            </p>
            {(!searchQuery && selectedStoreFilter === 'ALL') && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Onboard Employee</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Employee Name</th>
                  <th className="px-5 py-3 font-medium">Email / Credentials</th>
                  <th className="px-5 py-3 font-medium">Assigned Store Branch</th>
                  <th className="px-5 py-3 font-medium">Security & Role</th>
                  <th className="px-5 py-3 font-medium text-right">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => {
                  const assignedStore = stores.find((s) => s._id === user.storeId);
                  return (
                    <tr key={user._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-[11px] shrink-0">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div>{user.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              ID: {user._id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-700">
                        <div className="flex items-center gap-1.5 font-mono">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{user.email}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{assignedStore ? assignedStore.name : 'Unassigned Branch'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        <div>{user.role || 'Staff Member'}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Shield className="w-3 h-3 text-slate-400" />
                          <span>Hashed (15 rounds)</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => onToggleUserStatus(user._id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                            user.isValid
                              ? 'text-emerald-700 hover:bg-emerald-50'
                              : 'text-slate-400 hover:bg-slate-100'
                          }`}
                          title="Click to toggle user validity (isValid)"
                        >
                          {user.isValid ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-slate-400" />
                              <span>Suspended</span>
                            </>
                          )}
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

      {/* Modal: Onboard Employee */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Onboard Organizational Employee
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sends payload to <code className="font-mono text-slate-800">POST /account/auth/create</code>
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {submitError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                  {submitError}
                </div>
              )}

              {/* Name */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">
                  Corporate Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. jane@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              {/* Assigned Store */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">
                  Designated Store Branch <span className="text-rose-500">*</span>
                </label>
                {stores.length === 0 ? (
                  <div className="text-xs text-amber-600 p-2 bg-amber-50 rounded border border-amber-200">
                    No stores exist yet. Please register a store branch first.
                  </div>
                ) : (
                  <select
                    value={storeId}
                    onChange={(e) => setStoreId(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    {stores.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.address})
                      </option>
                    ))}
                  </select>
                )}
                <div className="text-[11px] text-slate-400 font-mono">
                  storeId (FK): {storeId}
                </div>
              </div>

              {/* Password with Generator */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-slate-700">
                    Initial Password <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
                  >
                    <Shuffle className="w-3 h-3" />
                    <span>Generate Secure</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 text-xs font-mono text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <div className="text-[11px] text-slate-400">
                  Password will be hashed with bcrypt 15 rounds before database persistence.
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || stores.length === 0}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? 'Onboarding...' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
