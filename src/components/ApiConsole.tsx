import React, { useState } from 'react';
import {
  Terminal,
  Play,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldAlert,
  Send,
  Code2
} from 'lucide-react';
import { hrmsApi } from '../services/api';
import { Store, User } from '../types/hrms';

interface ApiConsoleProps {
  stores: Store[];
  users: User[];
}

export const ApiConsole: React.FC<ApiConsoleProps> = ({ stores, users }) => {
  const config = hrmsApi.getConfig();
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('health');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [executionResult, setExecutionResult] = useState<{
    status: number | string;
    statusText: string;
    latencyMs: number;
    headers: Record<string, string>;
    data: unknown;
    timestamp: string;
  } | null>(null);

  // Form custom overrides
  const [loginEmail, setLoginEmail] = useState('jane@example.com');
  const [loginPassword, setLoginPassword] = useState('SecurePassword123!');
  const [newStoreName, setNewStoreName] = useState('Boston Waterfront Branch');
  const [newStoreAddress, setNewStoreAddress] = useState('100 Northern Ave, Boston, MA 02210');
  const [newStoreLat, setNewStoreLat] = useState('42.3522');
  const [newStoreLng, setNewStoreLng] = useState('-71.0450');

  const [newUserName, setNewUserName] = useState('Elena Rostova');
  const [newUserEmail, setNewUserEmail] = useState('elena.rostova@example.com');
  const [newUserStoreId, setNewUserStoreId] = useState(stores[0]?._id || '651f1f1b2c3d4e5f6a7b8c9d');
  const [newUserPassword, setNewUserPassword] = useState('SecurePassword123!');

  const ENDPOINTS = [
    {
      id: 'health',
      name: 'Server Health Check',
      method: 'GET',
      path: '/health',
      description: 'Verifies the Express 5 server is operational and responding.',
      requiresAccountHeader: false,
      requiresAuth: false,
    },
    {
      id: 'store_get',
      name: 'List All Stores',
      method: 'GET',
      path: '/account/store/get',
      description: 'Retrieves all physical store branches. Requires organizational account validation.',
      requiresAccountHeader: true,
      requiresAuth: false,
    },
    {
      id: 'store_create',
      name: 'Register Store Branch',
      method: 'POST',
      path: '/account/store/create',
      description: 'Registers a new store branch with unique name, address, and coordinates.',
      requiresAccountHeader: true,
      requiresAuth: false,
    },
    {
      id: 'auth_create',
      name: 'Register Employee Account',
      method: 'POST',
      path: '/account/auth/create',
      description: 'Creates user credentials with 15-round bcrypt salt linked to a designated storeId.',
      requiresAccountHeader: true,
      requiresAuth: false,
    },
    {
      id: 'auth_login',
      name: 'Authenticate Employee (Login)',
      method: 'POST',
      path: '/account/auth/login',
      description: 'Authenticates user email and password; generates dual JWT pair (authToken & refreshToken).',
      requiresAccountHeader: true,
      requiresAuth: false,
    },
    {
      id: 'jwt_refresh',
      name: 'Rotate / Refresh JWT Pair',
      method: 'GET',
      path: '/jwt/refresh',
      description: 'Renews short-lived access token using long-lived refresh token header.',
      requiresAccountHeader: false,
      requiresAuth: true,
    },
  ];

  const currentEp = ENDPOINTS.find((e) => e.id === selectedEndpoint) || ENDPOINTS[0];

  const getCurlCommand = () => {
    const url = `${config.baseUrl}${currentEp.path}`;
    const headers: string[] = [];

    if (currentEp.method === 'POST') {
      headers.push('-H "Content-Type: application/json"');
    }
    if (currentEp.requiresAccountHeader) {
      headers.push(`-H "account: ${config.accountId}"`);
    }
    if (currentEp.requiresAuth) {
      headers.push(`-H "authorization: ${config.authToken || '<YOUR_AUTH_TOKEN>'}"`);
      headers.push(`-H "refresh: ${config.refreshToken || '<YOUR_REFRESH_TOKEN>'}"`);
    }

    let bodyStr = '';
    if (selectedEndpoint === 'auth_login') {
      bodyStr = ` -d '{\n  "email": "${loginEmail}",\n  "password": "${loginPassword}"\n}'`;
    } else if (selectedEndpoint === 'store_create') {
      bodyStr = ` -d '{\n  "name": "${newStoreName}",\n  "address": "${newStoreAddress}",\n  "latitude": "${newStoreLat}",\n  "longitude": "${newStoreLng}"\n}'`;
    } else if (selectedEndpoint === 'auth_create') {
      bodyStr = ` -d '{\n  "name": "${newUserName}",\n  "email": "${newUserEmail}",\n  "storeId": "${newUserStoreId}",\n  "password": "${newUserPassword}"\n}'`;
    }

    return `curl -X ${currentEp.method} ${url} \\\n  ${headers.join(' \\\n  ')}${bodyStr ? ' \\\n ' + bodyStr : ''}`;
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(getCurlCommand());
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleExecute = async () => {
    setIsLoading(true);
    const start = performance.now();
    const url = `${config.baseUrl}${currentEp.path}`;

    const headers: Record<string, string> = {};
    if (currentEp.method === 'POST') {
      headers['Content-Type'] = 'application/json';
    }
    if (currentEp.requiresAccountHeader) {
      headers['account'] = config.accountId;
    }
    if (currentEp.requiresAuth) {
      headers['authorization'] = config.authToken || '';
      headers['refresh'] = config.refreshToken || '';
    }

    let body: string | undefined = undefined;
    if (selectedEndpoint === 'auth_login') {
      body = JSON.stringify({ email: loginEmail, password: loginPassword });
    } else if (selectedEndpoint === 'store_create') {
      body = JSON.stringify({
        name: newStoreName,
        address: newStoreAddress,
        latitude: newStoreLat,
        longitude: newStoreLng,
      });
    } else if (selectedEndpoint === 'auth_create') {
      body = JSON.stringify({
        name: newUserName,
        email: newUserEmail,
        storeId: newUserStoreId,
        password: newUserPassword,
      });
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(url, {
        method: currentEp.method,
        headers,
        body,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const latency = Math.round(performance.now() - start);
      const data = await res.json().catch(() => ({ raw: 'Non-JSON response' }));

      // If login succeeded, update auth tokens in config
      if (selectedEndpoint === 'auth_login' && data.authToken) {
        hrmsApi.updateConfig({
          authToken: data.authToken,
          refreshToken: data.refreshToken || '',
        });
      }

      setExecutionResult({
        status: res.status,
        statusText: res.statusText,
        latencyMs: latency,
        headers: { 'content-type': res.headers.get('content-type') || 'application/json' },
        data,
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (err: unknown) {
      const latency = Math.round(performance.now() - start);
      const msg = err instanceof Error ? err.message : 'Connection failed';

      // Provide informative simulated response when offline
      let mockData: unknown = { message: 'Local simulation response' };
      if (selectedEndpoint === 'health') {
        mockData = { message: 'Server running (Local sync active; live host at ' + config.baseUrl + ' offline)' };
      } else if (selectedEndpoint === 'store_get') {
        mockData = { stores };
      } else if (selectedEndpoint === 'auth_login') {
        mockData = {
          status: 'Success',
          authToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.simulated_access_token',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.simulated_refresh_token',
        };
      } else if (selectedEndpoint === 'jwt_refresh') {
        mockData = {
          status: 'Success',
          authToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refreshed_access_token',
        };
      } else if (selectedEndpoint === 'store_create') {
        mockData = {
          status: 'Success',
          store: { name: newStoreName, address: newStoreAddress, latitude: newStoreLat, longitude: newStoreLng },
        };
      } else if (selectedEndpoint === 'auth_create') {
        mockData = {
          status: 'Success',
          user: { name: newUserName, email: newUserEmail, storeId: newUserStoreId },
        };
      }

      setExecutionResult({
        status: 'Offline / Fallback Simulated (200 OK)',
        statusText: `${msg}. Showing schema-valid response.`,
        latencyMs: latency,
        headers: { 'x-mode': 'hrms-local-simulation' },
        data: mockData,
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          API Endpoint Test Console
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Execute and inspect requests against the Express 5 HRMS backend endpoints documented in your README.
        </p>
      </div>

      {/* Grid: Endpoint list on left, Request/Response on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Endpoint selector (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1 mb-2">
            Documented Endpoints
          </div>
          <div className="space-y-1.5">
            {ENDPOINTS.map((ep) => {
              const isSelected = selectedEndpoint === ep.id;
              return (
                <button
                  key={ep.id}
                  onClick={() => {
                    setSelectedEndpoint(ep.id);
                    setExecutionResult(null);
                  }}
                  className={`w-full p-3 rounded-xl border text-left transition-colors ${
                    isSelected
                      ? 'border-slate-900 bg-white shadow-xs'
                      : 'border-slate-200 bg-white/70 hover:bg-white text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        ep.method === 'POST'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 truncate max-w-[140px]">
                      {ep.path}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-900 mt-1">{ep.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                    {ep.description}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-slate-100/70 rounded-xl border border-slate-200 text-xs space-y-1.5 text-slate-600">
            <div className="font-semibold text-slate-800">Connection Target:</div>
            <div className="font-mono text-[11px] text-slate-700 break-all">{config.baseUrl}</div>
            <div className="text-[11px] text-slate-500">
              Account ID: <span className="font-mono text-slate-800">{config.accountId}</span>
            </div>
          </div>
        </div>

        {/* Right: Request parameters & Response inspector (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Active Endpoint Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      currentEp.method === 'POST'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}
                  >
                    {currentEp.method}
                  </span>
                  <span className="font-mono text-sm font-semibold text-slate-900">
                    {currentEp.path}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{currentEp.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCurl}
                  className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors flex items-center gap-1.5"
                  title="Copy curl command"
                >
                  {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCurl ? 'Copied' : 'Copy cURL'}</span>
                </button>

                <button
                  onClick={handleExecute}
                  disabled={isLoading}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-2xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isLoading ? 'Executing...' : 'Run Request'}</span>
                </button>
              </div>
            </div>

            {/* Custom parameters inputs for POST routes */}
            {selectedEndpoint === 'auth_login' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-600">Email Payload</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-600">Password Payload</label>
                  <input
                    type="text"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded focus:outline-none"
                  />
                </div>
              </div>
            )}

            {selectedEndpoint === 'store_create' && (
              <div className="space-y-2.5 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-slate-600">Store Name</label>
                    <input
                      type="text"
                      value={newStoreName}
                      onChange={(e) => setNewStoreName(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-slate-600">Address</label>
                    <input
                      type="text"
                      value={newStoreAddress}
                      onChange={(e) => setNewStoreAddress(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-slate-600">Latitude</label>
                    <input
                      type="text"
                      value={newStoreLat}
                      onChange={(e) => setNewStoreLat(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-slate-600">Longitude</label>
                    <input
                      type="text"
                      value={newStoreLng}
                      onChange={(e) => setNewStoreLng(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedEndpoint === 'auth_create' && (
              <div className="space-y-2.5 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-slate-600">Employee Name</label>
                    <input
                      type="text"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-slate-600">Email</label>
                    <input
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-slate-600">storeId (FK)</label>
                    <select
                      value={newUserStoreId}
                      onChange={(e) => setNewUserStoreId(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded font-mono"
                    >
                      {stores.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name} ({s._id.slice(0, 8)}...)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-slate-600">Password</label>
                    <input
                      type="text"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Generated cURL Display */}
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                cURL CLI Equivalent
              </div>
              <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg text-[11px] font-mono overflow-x-auto leading-relaxed border border-slate-800">
                {getCurlCommand()}
              </pre>
            </div>
          </div>

          {/* Response Inspector */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-semibold text-slate-900">Live Response Inspector</span>
              </div>
              {executionResult && (
                <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
                  <span className="tabular-nums">{executionResult.latencyMs}ms</span>
                  <span>·</span>
                  <span className="tabular-nums">{executionResult.timestamp}</span>
                </div>
              )}
            </div>

            {executionResult ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-medium text-slate-600">Status:</span>
                  <span className="font-mono font-semibold text-slate-900">{executionResult.status}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500">{executionResult.statusText}</span>
                </div>

                <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg text-xs font-mono overflow-x-auto max-h-72 border border-slate-800">
                  {JSON.stringify(executionResult.data, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
                Click &quot;Run Request&quot; above to execute this endpoint against the configured server.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
