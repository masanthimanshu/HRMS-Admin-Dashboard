import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  Navigation,
  Globe,
  Compass
} from 'lucide-react';
import { Store, User, NewStorePayload } from '../types/hrms';

interface StoreManagementProps {
  stores: Store[];
  users: User[];
  onCreateStore: (payload: NewStorePayload) => Promise<{ success: boolean; error?: string }>;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export const StoreManagement: React.FC<StoreManagementProps> = ({
  stores,
  users,
  onCreateStore,
  isModalOpen,
  setIsModalOpen,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  // Quick preset locations for non-technical admins
  const PRESETS = [
    { name: 'Seattle Waterfront', address: '1301 Alaskan Way, Seattle, WA 98101', lat: '47.6062', lng: '-122.3321' },
    { name: 'Denver Tech Hub', address: '1701 Wynkoop St, Denver, CO 80202', lat: '39.7531', lng: '-104.9998' },
    { name: 'Miami Brickell', address: '701 Brickell Ave, Miami, FL 33131', lat: '25.7674', lng: '-80.1906' },
    { name: 'Toronto Downtown', address: '100 King St W, Toronto, ON M5X 1A9', lat: '43.6487', lng: '-79.3817' },
  ];

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    setName(preset.name);
    setAddress(preset.address);
    setLatitude(preset.lat);
    setLongitude(preset.lng);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!name.trim() || !address.trim() || !latitude.trim() || !longitude.trim()) {
      setSubmitError('All fields including latitude and longitude are required.');
      return;
    }

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);
    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      setSubmitError('Latitude must be a valid number between -90 and 90.');
      return;
    }
    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      setSubmitError('Longitude must be a valid number between -180 and 180.');
      return;
    }

    setIsSubmitting(true);
    const res = await onCreateStore({
      name: name.trim(),
      address: address.trim(),
      latitude: latitude.trim(),
      longitude: longitude.trim(),
    });
    setIsSubmitting(false);

    if (res.success) {
      setName('');
      setAddress('');
      setLatitude('');
      setLongitude('');
      setIsModalOpen(false);
    } else {
      setSubmitError(res.error || 'Failed to create store branch.');
    }
  };

  const filteredStores = stores.filter((s) => {
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Store & Facility Branches
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Registered physical retail and facility locations with validated geocoded coordinates.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Register Store Branch</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search stores by branch name or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500 w-full sm:w-auto justify-end">
          <span>
            Total cataloged branches: <strong className="text-slate-900 font-mono tabular-nums">{stores.length}</strong>
          </span>
          <span>·</span>
          <span>
            Endpoint: <code className="font-mono text-slate-700">/account/store/get</code>
          </span>
        </div>
      </div>

      {/* Stores Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredStores.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-sm font-semibold text-slate-800">No Store Branches Found</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? 'No store matched your search query. Try clearing the filter.'
                : 'No store branches have been cataloged yet. Register your first physical store location.'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register Store Branch</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Branch Name</th>
                  <th className="px-5 py-3 font-medium">Physical Address</th>
                  <th className="px-5 py-3 font-medium">Geocode Coordinates</th>
                  <th className="px-5 py-3 font-medium">Assigned Staff</th>
                  <th className="px-5 py-3 font-medium text-right">Store ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStores.map((store) => {
                  const assignedCount = users.filter((u) => u.storeId === store._id).length;
                  return (
                    <tr key={store._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                          <span>{store.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 max-w-xs">
                        <div className="truncate">{store.address}</div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-700 tabular-nums">
                        <a
                          href={`https://maps.google.com/?q=${store.latitude},${store.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-indigo-600 inline-flex items-center gap-1 group transition-colors"
                          title="Open in Google Maps"
                        >
                          <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                          <span>{store.latitude}, {store.longitude}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                        </a>
                      </td>
                      <td className="px-5 py-3.5 font-mono tabular-nums text-slate-800">
                        <span className="font-semibold">{assignedCount}</span> employee{assignedCount === 1 ? '' : 's'}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-slate-400">
                        <button
                          onClick={() => handleCopy(store._id, store._id)}
                          className="inline-flex items-center gap-1 hover:text-slate-800 text-[11px] transition-colors"
                          title="Copy Store Mongo ID"
                        >
                          <span>{store._id.slice(0, 8)}...</span>
                          {copiedId === store._id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
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

      {/* Modal: Register Store Branch */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Register Store Branch
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sends validated payload to <code className="font-mono text-slate-800">POST /account/store/create</code>
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

              {/* Quick Presets */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600">
                  Quick Location Presets (or fill manually)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Store Name */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">
                  Branch Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Downtown Flagship Branch"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">
                  Physical Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 123 Market St, San Francisco, CA"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              {/* Coordinates: Lat and Long */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">
                    Latitude <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 37.7749"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">
                    Longitude <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. -122.4194"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-500 pt-1">
                Note: Backend requires unique <code className="font-mono">name</code>, <code className="font-mono">address</code>, <code className="font-mono">latitude</code>, and <code className="font-mono">longitude</code>.
              </div>

              {/* Actions */}
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
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? 'Registering...' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
