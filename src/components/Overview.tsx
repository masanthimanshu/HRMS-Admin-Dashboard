import React from 'react';
import {
  Users,
  Building2,
  CheckCircle,
  MapPin,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  UserPlus,
  Store as StoreIcon,
  Navigation
} from 'lucide-react';
import { Store, User, Attendance } from '../types/hrms';

interface OverviewProps {
  stores: Store[];
  users: User[];
  attendanceLogs: Attendance[];
  onNavigate: (view: string) => void;
  onOpenNewStoreModal: () => void;
  onOpenNewUserModal: () => void;
}

export const Overview: React.FC<OverviewProps> = ({
  stores,
  users,
  attendanceLogs,
  onNavigate,
  onOpenNewStoreModal,
  onOpenNewUserModal,
}) => {
  const activeUsersCount = users.filter((u) => u.isValid).length;
  const compliantCheckIns = attendanceLogs.filter((a) => a.isWithinGeofence).length;
  const complianceRate = attendanceLogs.length > 0
    ? Math.round((compliantCheckIns / attendanceLogs.length) * 100)
    : 100;

  // Store user distribution
  const storeStaffCounts = stores.map((store) => {
    const count = users.filter((u) => u.storeId === store._id).length;
    return {
      store,
      count,
    };
  });

  // Recent 5 attendance logs
  const recentLogs = attendanceLogs.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header section with page title & quick actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Workforce & Store Operations
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time branch attendance, physical facility catalog, and employee onboarding.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenNewStoreModal}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
          >
            <StoreIcon className="w-3.5 h-3.5 text-slate-600" />
            <span>Add Store Branch</span>
          </button>
          <button
            onClick={onOpenNewUserModal}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Onboard Employee</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Workforce */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Workforce</span>
            <Users className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 tabular-nums font-mono">
              {users.length}
            </span>
            <span className="text-xs text-slate-500">
              <span className="font-semibold text-emerald-600 tabular-nums font-mono">{activeUsersCount}</span> verified
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-500 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span>Security Status</span>
            <span className="text-slate-800 font-medium">Bcrypt (15 rounds)</span>
          </div>
        </div>

        {/* Card 2: Physical Store Branches */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Store Branches</span>
            <Building2 className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 tabular-nums font-mono">
              {stores.length}
            </span>
            <span className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700 tabular-nums font-mono">100%</span> Geocoded
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-500 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span>Coordinate Model</span>
            <span className="text-slate-800 font-medium">Lat / Long Unique</span>
          </div>
        </div>

        {/* Card 3: Today's Check-ins */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Check-in Records</span>
            <CheckCircle className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 tabular-nums font-mono">
              {attendanceLogs.length}
            </span>
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Today Active</span>
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-500 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span>Proof Format</span>
            <span className="text-slate-800 font-medium">Photo + GPS Stamp</span>
          </div>
        </div>

        {/* Card 4: Geofence Compliance */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Geofence Compliance</span>
            <MapPin className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 tabular-nums font-mono">
              {complianceRate}%
            </span>
            <span className="text-xs text-slate-500">
              <span className="font-semibold text-slate-800 tabular-nums font-mono">{compliantCheckIns}</span> / {attendanceLogs.length} on-site
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-500 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span>Radius Threshold</span>
            <span className="text-slate-800 font-medium font-mono tabular-nums">150 meters</span>
          </div>
        </div>
      </div>

      {/* High-Contrast Data Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Visualizer (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Weekly Attendance & Punctuality Breakdown
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Staff check-in volume tracked against store operating shifts
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-900"></span>
                <span>On-Time</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-500"></span>
                <span>Within 15m</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-200"></span>
                <span>Unverified</span>
              </div>
            </div>
          </div>

          {/* High-Contrast Comparative Bar Grid */}
          <div className="space-y-3 pt-2">
            {[
              { day: 'Mon', onTime: 18, grace: 2, unverified: 0, total: 20 },
              { day: 'Tue', onTime: 19, grace: 1, unverified: 0, total: 20 },
              { day: 'Wed', onTime: 17, grace: 2, unverified: 1, total: 20 },
              { day: 'Thu', onTime: 20, grace: 0, unverified: 0, total: 20 },
              { day: 'Fri', onTime: 18, grace: 1, unverified: 1, total: 20 },
              { day: 'Sat', onTime: 14, grace: 2, unverified: 0, total: 16 },
              { day: 'Sun', onTime: 12, grace: 1, unverified: 0, total: 13 },
            ].map((d) => (
              <div key={d.day} className="grid grid-cols-12 items-center gap-3 text-xs">
                <span className="col-span-1 font-medium text-slate-700">{d.day}</span>
                <div className="col-span-9 h-6 bg-slate-100 rounded-md overflow-hidden flex">
                  <div
                    style={{ width: `${(d.onTime / d.total) * 100}%` }}
                    className="bg-slate-900 h-full flex items-center justify-center text-[10px] font-mono text-white tabular-nums"
                  >
                    {d.onTime > 4 ? d.onTime : ''}
                  </div>
                  <div
                    style={{ width: `${(d.grace / d.total) * 100}%` }}
                    className="bg-amber-500 h-full flex items-center justify-center text-[10px] font-mono text-white tabular-nums"
                  >
                    {d.grace > 1 ? d.grace : ''}
                  </div>
                  <div
                    style={{ width: `${(d.unverified / d.total) * 100}%` }}
                    className="bg-slate-300 h-full"
                  />
                </div>
                <span className="col-span-2 text-right font-mono tabular-nums text-slate-500">
                  {d.onTime + d.grace}/{d.total}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Average branch arrival time: <strong className="text-slate-800 font-mono">08:24 AM</strong></span>
            <button
              onClick={() => onNavigate('attendance')}
              className="font-medium text-slate-900 hover:text-indigo-600 flex items-center gap-1 transition-colors"
            >
              <span>View full log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Branch Footprint & Staff Allocation (1 Col) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-slate-900">
                Branch Staffing
              </h2>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                {stores.length} locations
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Registered employees allocated across physical store facilities
            </p>

            <div className="space-y-3">
              {storeStaffCounts.map(({ store, count }) => {
                const max = Math.max(...storeStaffCounts.map((s) => s.count), 1);
                const pct = Math.round((count / max) * 100);
                return (
                  <div key={store._id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-800 truncate pr-2">
                        {store.name}
                      </span>
                      <span className="font-mono tabular-nums text-slate-600 font-medium">
                        {count} staff
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.max(pct, 12)}%` }}
                        className="h-full bg-slate-800 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigate('stores')}
              className="w-full py-2 text-xs font-semibold text-slate-800 hover:text-slate-950 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Manage Branch Locations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Check-Ins & Field Geo-Activity */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Live Field Check-In Activity
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Geo-verified punches with latitude, longitude, and store geofence proximity
            </p>
          </div>
          <button
            onClick={() => onNavigate('attendance')}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1 transition-colors"
          >
            <span>Open Attendance Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Employee</th>
                <th className="px-5 py-3 font-medium">Designated Store</th>
                <th className="px-5 py-3 font-medium">GPS Coordinates</th>
                <th className="px-5 py-3 font-medium">Geofence Distance</th>
                <th className="px-5 py-3 font-medium text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentLogs.map((log) => {
                const isWithin = log.isWithinGeofence ?? true;
                const distance = log.distanceMeters ?? 0;
                return (
                  <tr key={log._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      <div>{log.userName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{log.userEmail}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">
                      {log.storeName}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-600 tabular-nums">
                      {log.latitude}, {log.longitude}
                    </td>
                    <td className="px-5 py-3.5 font-mono tabular-nums text-slate-700">
                      {distance}m from store
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {isWithin ? (
                        <span className="text-emerald-700 font-medium">
                          On-Site Verified
                        </span>
                      ) : (
                        <span className="text-amber-700 font-medium">
                          Distance Warning
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Architecture & Backend Protocol Summary (Clean non-technical callout) */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-slate-900">
              Backend Security & Storage Specifications
            </div>
            <div className="text-xs text-slate-600 mt-1 space-x-2">
              <span>Dual-layer header validation via <code className="text-slate-800 font-mono bg-slate-200/70 px-1 py-0.5 rounded">account</code></span>
              <span>·</span>
              <span>15-round salted Bcrypt password hashing</span>
              <span>·</span>
              <span>MongoDB relational Mongoose indexing</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('api-console')}
          className="shrink-0 px-3.5 py-1.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
        >
          View API Docs & Test Routes
        </button>
      </div>
    </div>
  );
};
