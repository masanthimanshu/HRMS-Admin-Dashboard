import React, { useState } from 'react';
import {
  Sliders,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  RotateCcw,
  Key,
  Globe,
  Shield,
  Copy,
  Check
} from 'lucide-react';
import { hrmsApi } from '../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onConfigChanged,
}) => {
  const currentConfig = hrmsApi.getConfig();
  const [baseUrl, setBaseUrl] = useState(currentConfig.baseUrl);
  const [accountId, setAccountId] = useState(currentConfig.accountId);
  const [useLiveBackend, setUseLiveBackend] = useState(currentConfig.useLiveBackend);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
  } | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    hrmsApi.updateConfig({
      baseUrl: baseUrl.trim(),
      accountId: accountId.trim(),
      useLiveBackend,
    });
    onConfigChanged();
    onClose();
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    // Temporarily apply current input values for test
    hrmsApi.updateConfig({ baseUrl: baseUrl.trim(), accountId: accountId.trim() });
    const res = await hrmsApi.checkHealth();
    setIsTesting(false);

    if (res.success) {
      setTestResult({
        success: true,
        message: `Live Server Connected (${res.data?.message || 'Server running'})`,
        latencyMs: res.latencyMs,
      });
    } else {
      setTestResult({
        success: false,
        message: res.error || 'Server unreachable on port 5500. Falling back to local state sync.',
        latencyMs: res.latencyMs,
      });
    }
  };

  const handleRefreshToken = async () => {
    setIsTesting(true);
    const res = await hrmsApi.refreshToken();
    setIsTesting(false);
    if (res.success) {
      setTestResult({
        success: true,
        message: 'Tokens renewed via /jwt/refresh rotation flow.',
      });
      onConfigChanged();
    } else {
      setTestResult({
        success: false,
        message: res.error || 'Refresh flow failed.',
      });
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset all stores, users, and attendance logs to initial seed data?')) {
      hrmsApi.resetToDefaultSeed();
      onConfigChanged();
      setTestResult({
        success: true,
        message: 'Database cache restored to default enterprise state.',
      });
    }
  };

  const handleCopyToken = () => {
    if (currentConfig.authToken) {
      navigator.clipboard.writeText(currentConfig.authToken);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-slate-700" />
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Backend Connection & Authorization
              </h3>
              <p className="text-xs text-slate-500">
                Configure your Express 5 HRMS backend URL and security headers.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Test connection feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center justify-between ${
                testResult.success
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border border-amber-200 text-amber-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
              {testResult.latencyMs !== undefined && (
                <span className="font-mono tabular-nums text-slate-500 shrink-0">
                  {testResult.latencyMs}ms
                </span>
              )}
            </div>
          )}

          {/* Base URL */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">
              API Base URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="http://localhost:5500"
                className="w-full px-3 py-2 text-xs font-mono text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors shrink-0 disabled:opacity-50"
              >
                {isTesting ? 'Testing...' : 'Test Health'}
              </button>
            </div>
            <div className="text-[11px] text-slate-400">
              Corresponds to <code className="font-mono">PORT=5500</code> in your backend <code className="font-mono">.env</code>.
            </div>
          </div>

          {/* Account Key Header */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">
              Account Authorization Key (<code className="font-mono">account</code> header)
            </label>
            <input
              type="text"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              placeholder="e.g. your_account_id_here"
              className="w-full px-3 py-2 text-xs font-mono text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            <div className="text-[11px] text-slate-400">
              Sent in the <code className="font-mono">account: &lt;ACCOUNT_ID&gt;</code> request header across all <code className="font-mono">/account/*</code> routes.
            </div>
          </div>

          {/* Active JWT token state */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span>Active JWT Session Pair</span>
              </span>
              <button
                type="button"
                onClick={handleRefreshToken}
                disabled={isTesting}
                className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh JWT</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-slate-600 font-mono text-[11px]">
              <span className="truncate max-w-[280px]">
                {currentConfig.authToken
                  ? `${currentConfig.authToken.slice(0, 28)}...`
                  : 'No active session token'}
              </span>
              {currentConfig.authToken && (
                <button
                  type="button"
                  onClick={handleCopyToken}
                  className="p-1 hover:text-slate-900 text-slate-400"
                  title="Copy Auth Token"
                >
                  {copiedToken ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              )}
            </div>
          </div>

          {/* Reset seed data button */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetData}
              className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Seed Data</span>
            </button>
          </div>
        </div>

        {/* Modal footer */}
        <div className="p-4 bg-slate-50/75 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
