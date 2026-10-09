import React, { useState } from 'react';
import {
  MapPin,
  Camera,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Plus,
  Search,
  Filter,
  UserCheck,
  Building2,
  Clock,
  Sparkles
} from 'lucide-react';
import { Attendance, User, Store, AttendanceSimPayload } from '../types/hrms';

interface AttendanceTrackerProps {
  attendanceLogs: Attendance[];
  users: User[];
  stores: Store[];
  onRecordAttendance: (payload: AttendanceSimPayload) => void;
}

export const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({
  attendanceLogs,
  users,
  stores,
  onRecordAttendance,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStore, setFilterStore] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'VERIFIED' | 'WARNING'>('ALL');
  const [selectedPhoto, setSelectedPhoto] = useState<Attendance | null>(null);
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);

  // Simulation form state
  const [simUserId, setSimUserId] = useState(users[0]?._id || '');
  const [simPreset, setSimPreset] = useState<'onsite' | 'offsite' | 'custom'>('onsite');
  const [simLat, setSimLat] = useState('37.7750');
  const [simLng, setSimLng] = useState('-122.4190');

  const SAMPLE_PHOTOS = [
    { label: 'Selfie Check-in 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
    { label: 'Selfie Check-in 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
    { label: 'Store Badge Check-in', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
  ];
  const [simPhotoUrl, setSimPhotoUrl] = useState(SAMPLE_PHOTOS[0].url);

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simUserId) return;

    const user = users.find((u) => u._id === simUserId);
    const store = stores.find((s) => s._id === user?.storeId);

    let lat = simLat;
    let lng = simLng;

    if (simPreset === 'onsite' && store) {
      // Small realistic GPS jitter +/- 0.0002 deg (~20m)
      const latJitter = (Math.random() - 0.5) * 0.0004;
      const lngJitter = (Math.random() - 0.5) * 0.0004;
      lat = (parseFloat(store.latitude) + latJitter).toFixed(6);
      lng = (parseFloat(store.longitude) + lngJitter).toFixed(6);
    } else if (simPreset === 'offsite' && store) {
      // 1.5km offset
      lat = (parseFloat(store.latitude) + 0.015).toFixed(6);
      lng = (parseFloat(store.longitude) + 0.015).toFixed(6);
    }

    onRecordAttendance({
      userId: simUserId,
      latitude: lat,
      longitude: lng,
      imageUrl: simPhotoUrl,
    });

    setIsSimModalOpen(false);
  };

  const filteredLogs = attendanceLogs.filter((log) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (log.userName || '').toLowerCase().includes(q) ||
      (log.storeName || '').toLowerCase().includes(q);
    const user = users.find((u) => u._id === log.userId);
    const matchesStore = filterStore === 'ALL' || user?.storeId === filterStore;
    const matchesStatus =
      filterStatus === 'ALL' ||
      (filterStatus === 'VERIFIED' && log.isWithinGeofence) ||
      (filterStatus === 'WARNING' && !log.isWithinGeofence);

    return matchesSearch && matchesStore && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Geo-Tagged Attendance Logs
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time biometric check-ins with store geofence proximity and proof verification.
          </p>
        </div>

        <button
          onClick={() => {
            if (users.length > 0 && !simUserId) setSimUserId(users[0]._id);
            setIsSimModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors shrink-0"
        >
          <Camera className="w-4 h-4" />
          <span>Simulate Mobile Check-In</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search employee or store..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
            />
          </div>

          {/* Store select */}
          <select
            value={filterStore}
            onChange={(e) => setFilterStore(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="ALL">All Store Branches</option>
            {stores.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Geofence Status segmented toggle */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs w-full sm:w-auto">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterStatus === 'ALL' ? 'bg-white text-slate-900 shadow-xs font-medium' : 'text-slate-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('VERIFIED')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterStatus === 'VERIFIED' ? 'bg-white text-emerald-700 shadow-xs font-medium' : 'text-slate-600'
              }`}
            >
              On-Site
            </button>
            <button
              onClick={() => setFilterStatus('WARNING')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterStatus === 'WARNING' ? 'bg-white text-amber-700 shadow-xs font-medium' : 'text-slate-600'
              }`}
            >
              Distance Flagged
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-mono tabular-nums">
          {filteredLogs.length} records found
        </div>
      </div>

      {/* Attendance Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Clock className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-sm font-semibold text-slate-800">No Attendance Records</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No check-ins matched your filters. Test mobile field check-ins with the simulation tool.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Punch Timestamp</th>
                  <th className="px-5 py-3 font-medium">Employee</th>
                  <th className="px-5 py-3 font-medium">Assigned Store</th>
                  <th className="px-5 py-3 font-medium">Punch Coordinates</th>
                  <th className="px-5 py-3 font-medium">Geofence Distance</th>
                  <th className="px-5 py-3 font-medium">Proof Photo</th>
                  <th className="px-5 py-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => {
                  const date = new Date(log.createdAt);
                  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                  const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
                  const isWithin = log.isWithinGeofence ?? true;
                  const distance = log.distanceMeters ?? 0;

                  return (
                    <tr key={log._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-slate-900 tabular-nums">
                        <div className="font-medium">{timeStr}</div>
                        <div className="text-[11px] text-slate-400">{dateStr}</div>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-900">
                        <div>{log.userName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{log.userEmail}</div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-700">
                        {log.storeName}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-700 tabular-nums">
                        <a
                          href={`https://maps.google.com/?q=${log.latitude},${log.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-indigo-600 inline-flex items-center gap-1 group"
                          title="Open coordinate location in maps"
                        >
                          <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                          <span>{log.latitude}, {log.longitude}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                        </a>
                      </td>
                      <td className="px-5 py-3.5 font-mono tabular-nums">
                        <span className={isWithin ? 'text-slate-800' : 'text-amber-700 font-semibold'}>
                          {distance}m from store
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => setSelectedPhoto(log)}
                          className="group relative w-8 h-8 rounded-md overflow-hidden border border-slate-200 bg-slate-100 block hover:ring-2 hover:ring-slate-900 transition-all"
                          title="Click to view full photo proof"
                        >
                          <img
                            src={log.imageUrl}
                            alt="Check-in proof"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {isWithin ? (
                          <span className="text-emerald-700 font-medium inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="text-amber-700 font-medium inline-flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Out of Bounds</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lightbox Modal for Photo Proof */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Biometric Attendance Proof
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Punch ID: {selectedPhoto._id}
                </p>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="aspect-4/3 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={selectedPhoto.imageUrl}
                  alt="Employee check-in photo"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="bg-slate-50 p-3.5 rounded-lg space-y-2 text-xs border border-slate-200/60">
                <div className="flex justify-between">
                  <span className="text-slate-500">Employee:</span>
                  <span className="font-semibold text-slate-800">{selectedPhoto.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Store Facility:</span>
                  <span className="text-slate-800">{selectedPhoto.storeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">GPS Coordinates:</span>
                  <span className="font-mono tabular-nums text-slate-800">
                    {selectedPhoto.latitude}, {selectedPhoto.longitude}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Distance from Branch:</span>
                  <span className="font-mono tabular-nums text-slate-800 font-semibold">
                    {selectedPhoto.distanceMeters ?? 0} meters
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Verification Result:</span>
                  <span className={selectedPhoto.isWithinGeofence ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
                    {selectedPhoto.isWithinGeofence ? 'Within 150m Threshold' : 'Outside Store Geofence'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedPhoto(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Simulate Mobile Field Check-In */}
      {isSimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Simulate Field Employee Check-In
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tests the Attendance Mongoose model (userId, latitude, longitude, imageUrl)
                </p>
              </div>
              <button
                onClick={() => setIsSimModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSimulate} className="p-5 space-y-4">
              {/* Select Employee */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">
                  Select Employee
                </label>
                <select
                  value={simUserId}
                  onChange={(e) => setSimUserId(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  {users.map((u) => {
                    const st = stores.find((s) => s._id === u.storeId);
                    return (
                      <option key={u._id} value={u._id}>
                        {u.name} — Assigned to {st ? st.name : 'Unknown Store'}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Geofence Scenario */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  Geofence Proximity Scenario
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSimPreset('onsite')}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      simPreset === 'onsite'
                        ? 'border-slate-900 bg-slate-50 font-medium text-slate-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-semibold text-slate-900">On-Site (Compliant)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">~15m from assigned store</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSimPreset('offsite')}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      simPreset === 'offsite'
                        ? 'border-slate-900 bg-slate-50 font-medium text-slate-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-semibold text-slate-900">Off-Site (Warning)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">~1.5 km away from branch</div>
                  </button>
                </div>
              </div>

              {/* Sample Photo selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  Selfie / Badge Verification Photo
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {SAMPLE_PHOTOS.map((sp) => (
                    <button
                      key={sp.label}
                      type="button"
                      onClick={() => setSimPhotoUrl(sp.url)}
                      className={`relative aspect-4/3 rounded-lg overflow-hidden border transition-all ${
                        simPhotoUrl === sp.url
                          ? 'ring-2 ring-slate-900 border-transparent'
                          : 'border-slate-200 hover:opacity-80'
                      }`}
                    >
                      <img
                        src={sp.url}
                        alt={sp.label}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsSimModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Submit Simulated Punch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
