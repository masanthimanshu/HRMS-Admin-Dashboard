import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Overview } from './components/Overview';
import { StoreManagement } from './components/StoreManagement';
import { EmployeeDirectory } from './components/EmployeeDirectory';
import { AttendanceTracker } from './components/AttendanceTracker';
import { ApiConsole } from './components/ApiConsole';
import { SettingsModal } from './components/SettingsModal';
import { hrmsApi } from './services/api';
import { Store, User, Attendance, NewStorePayload, NewUserPayload, AttendanceSimPayload } from './types/hrms';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('overview');
  const [stores, setStores] = useState<Store[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<Attendance[]>([]);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isNewStoreModalOpen, setIsNewStoreModalOpen] = useState<boolean>(false);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // 1. Health check to determine live connection
      const health = await hrmsApi.checkHealth();
      setIsBackendConnected(health.success);

      // 2. Stores list
      const storeRes = await hrmsApi.getStores();
      setStores(storeRes.stores);

      // 3. Users list
      const userList = hrmsApi.getUsers();
      setUsers(userList);

      // 4. Attendance logs
      const logs = hrmsApi.getAttendanceLogs();
      setAttendanceLogs(logs);
    } catch {
      // graceful fallback
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Create store handler
  const handleCreateStore = async (payload: NewStorePayload) => {
    const res = await hrmsApi.createStore(payload);
    if (res.success) {
      await loadData();
    }
    return res;
  };

  // Create user handler
  const handleCreateUser = async (payload: NewUserPayload) => {
    const res = await hrmsApi.createUser(payload);
    if (res.success) {
      await loadData();
    }
    return res;
  };

  // Toggle user status
  const handleToggleUserStatus = (userId: string) => {
    const updated = hrmsApi.toggleUserStatus(userId);
    setUsers(updated);
  };

  // Record Attendance
  const handleRecordAttendance = (payload: AttendanceSimPayload) => {
    hrmsApi.recordAttendance(payload);
    const updatedLogs = hrmsApi.getAttendanceLogs();
    setAttendanceLogs(updatedLogs);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Bar (Strict 3-Zone Contract) */}
      <Header
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isBackendConnected={isBackendConnected}
        onRefreshData={loadData}
        isRefreshing={isRefreshing}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          counts={{
            stores: stores.length,
            employees: users.length,
            attendanceToday: attendanceLogs.length,
          }}
          onOpenNewStoreModal={() => setIsNewStoreModalOpen(true)}
          onOpenNewUserModal={() => setIsNewUserModalOpen(true)}
        />

        {/* Dynamic Viewport View */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {currentView === 'overview' && (
            <Overview
              stores={stores}
              users={users}
              attendanceLogs={attendanceLogs}
              onNavigate={setCurrentView}
              onOpenNewStoreModal={() => setIsNewStoreModalOpen(true)}
              onOpenNewUserModal={() => setIsNewUserModalOpen(true)}
            />
          )}

          {currentView === 'stores' && (
            <StoreManagement
              stores={stores}
              users={users}
              onCreateStore={handleCreateStore}
              isModalOpen={isNewStoreModalOpen}
              setIsModalOpen={setIsNewStoreModalOpen}
            />
          )}

          {currentView === 'employees' && (
            <EmployeeDirectory
              users={users}
              stores={stores}
              onCreateUser={handleCreateUser}
              onToggleUserStatus={handleToggleUserStatus}
              isModalOpen={isNewUserModalOpen}
              setIsModalOpen={setIsNewUserModalOpen}
            />
          )}

          {currentView === 'attendance' && (
            <AttendanceTracker
              attendanceLogs={attendanceLogs}
              users={users}
              stores={stores}
              onRecordAttendance={handleRecordAttendance}
            />
          )}

          {currentView === 'api-console' && (
            <ApiConsole stores={stores} users={users} />
          )}
        </main>
      </div>

      {/* Settings & Backend Config Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigChanged={loadData}
      />
    </div>
  );
}
