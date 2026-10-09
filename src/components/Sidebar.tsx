import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Users2,
  MapPin,
  Terminal,
  ShieldCheck,
  UserPlus,
  Store as StoreIcon,
  Activity
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  counts: {
    stores: number;
    employees: number;
    attendanceToday: number;
  };
  onOpenNewStoreModal: () => void;
  onOpenNewUserModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  counts,
  onOpenNewStoreModal,
  onOpenNewUserModal,
}) => {
  const navItems = [
    {
      id: 'overview',
      label: 'Executive Overview',
      icon: LayoutDashboard,
      count: undefined,
    },
    {
      id: 'stores',
      label: 'Store Branches',
      icon: Building2,
      count: counts.stores,
    },
    {
      id: 'employees',
      label: 'Workforce Directory',
      icon: Users2,
      count: counts.employees,
    },
    {
      id: 'attendance',
      label: 'Geo-Attendance Logs',
      icon: MapPin,
      count: counts.attendanceToday,
    },
    {
      id: 'api-console',
      label: 'API Test Console',
      icon: Terminal,
      count: undefined,
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col justify-between min-h-[calc(100vh-53px)]">
      <div className="p-4 space-y-6">
        {/* Navigation list */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase mb-2 px-3">
            Management
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span
                      className={`text-xs tabular-nums font-mono px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Operations */}
        <div className="pt-2 border-t border-slate-100">
          <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase mb-2 px-3">
            Operations
          </div>
          <div className="space-y-1.5">
            <button
              onClick={onOpenNewUserModal}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-md border border-slate-200 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5 text-indigo-500" />
              <span>Onboard Employee</span>
            </button>
            <button
              onClick={onOpenNewStoreModal}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-md border border-slate-200 transition-colors"
            >
              <StoreIcon className="w-3.5 h-3.5 text-indigo-500" />
              <span>Register Store Branch</span>
            </button>
          </div>
        </div>
      </div>

      {/* Security & System Info Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-medium text-slate-800">Dual-Token Security</span>
        </div>
        <div className="text-[11px] text-slate-500 leading-relaxed">
          Access Token: <span className="font-mono tabular-nums text-slate-700">2d</span> · Refresh Token: <span className="font-mono tabular-nums text-slate-700">10d</span>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Express 5 · Mongoose 9</span>
          <Activity className="w-3 h-3 text-slate-400" />
        </div>
      </div>
    </aside>
  );
};
