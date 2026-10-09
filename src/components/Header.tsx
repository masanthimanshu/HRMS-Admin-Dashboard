import React from 'react';
import { RefreshCw, Sliders, CheckCircle2, AlertCircle } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenSettings: () => void;
  isBackendConnected: boolean;
  onRefreshData: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenSettings,
  isBackendConnected,
  onRefreshData,
  isRefreshing,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200">
      {/* Zone 1: Brand wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => onNavigate('overview')}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-indigo-600 transition-colors"
        >
          PulseHR
        </button>
      </div>

      {/* Zone 2: 4-5 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
        <button
          onClick={() => onNavigate('overview')}
          className={`whitespace-nowrap shrink-0 transition-colors ${
            currentView === 'overview' ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => onNavigate('stores')}
          className={`whitespace-nowrap shrink-0 transition-colors ${
            currentView === 'stores' ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'
          }`}
        >
          Store Branches
        </button>
        <button
          onClick={() => onNavigate('employees')}
          className={`whitespace-nowrap shrink-0 transition-colors ${
            currentView === 'employees' ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'
          }`}
        >
          Workforce Directory
        </button>
        <button
          onClick={() => onNavigate('attendance')}
          className={`whitespace-nowrap shrink-0 transition-colors ${
            currentView === 'attendance' ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'
          }`}
        >
          Geo-Attendance
        </button>
        <button
          onClick={() => onNavigate('api-console')}
          className={`whitespace-nowrap shrink-0 transition-colors ${
            currentView === 'api-console' ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'
          }`}
        >
          API Endpoints
        </button>
      </nav>

      {/* Zone 3: 1 primary action / system status lockup */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onRefreshData}
          disabled={isRefreshing}
          className="p-1.5 text-slate-500 hover:text-slate-800 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors"
          title="Refresh All Data"
          aria-label="Refresh data"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-slate-800' : ''}`} />
        </button>

        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0"
        >
          {isBackendConnected ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          )}
          <span>{isBackendConnected ? 'API Connected' : 'Local Mode'}</span>
          <Sliders className="w-3 h-3 text-slate-400 ml-0.5" />
        </button>
      </div>
    </header>
  );
};
