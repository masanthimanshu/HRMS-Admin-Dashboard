import {
  Store,
  User,
  Attendance,
  LoginResponse,
  HealthResponse,
  NewStorePayload,
  NewUserPayload,
  AttendanceSimPayload
} from '../types/hrms';
import { INITIAL_STORES, INITIAL_USERS, INITIAL_ATTENDANCE } from '../data/initialData';

const CONFIG_STORAGE_KEY = 'hrms_api_config';
const STORES_STORAGE_KEY = 'hrms_stores_cache';
const USERS_STORAGE_KEY = 'hrms_users_cache';
const ATTENDANCE_STORAGE_KEY = 'hrms_attendance_cache';

export interface StorageConfig {
  baseUrl: string;
  accountId: string;
  authToken: string;
  refreshToken: string;
  useLiveBackend: boolean;
}

const DEFAULT_CONFIG: StorageConfig = {
  baseUrl: 'http://localhost:5500',
  accountId: 'hrms_admin_secret_key',
  authToken: '',
  refreshToken: '',
  useLiveBackend: true,
};

export class HrmsApiService {
  private config: StorageConfig;
  private isConnectedLive: boolean = false;
  private lastHealthStatus: string = 'Checking...';

  constructor() {
    this.config = this.loadConfig();
    this.initLocalData();
  }

  public getConfig(): StorageConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<StorageConfig>): void {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(this.config));
  }

  private loadConfig(): StorageConfig {
    try {
      const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch {
      // fallback
    }
    return DEFAULT_CONFIG;
  }

  private initLocalData(): void {
    if (!localStorage.getItem(STORES_STORAGE_KEY)) {
      localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(INITIAL_STORES));
    }
    if (!localStorage.getItem(USERS_STORAGE_KEY)) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(ATTENDANCE_STORAGE_KEY)) {
      localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(INITIAL_ATTENDANCE));
    }
  }

  // Calculate distance between two lat/lng coordinates in meters (Haversine formula)
  public calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // metres
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  }

  // 1. Health Check: GET /health
  public async checkHealth(): Promise<{ success: boolean; data?: HealthResponse; error?: string; latencyMs?: number }> {
    const start = performance.now();
    const url = `${this.config.baseUrl}/health`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const latencyMs = Math.round(performance.now() - start);
      if (res.ok) {
        const data = await res.json();
        this.isConnectedLive = true;
        this.lastHealthStatus = 'Connected';
        return { success: true, data, latencyMs };
      }
      this.isConnectedLive = false;
      this.lastHealthStatus = `HTTP ${res.status}`;
      return { success: false, error: `Server responded with HTTP ${res.status}`, latencyMs };
    } catch (err: unknown) {
      const latencyMs = Math.round(performance.now() - start);
      this.isConnectedLive = false;
      const msg = err instanceof Error ? err.message : 'Network failure';
      this.lastHealthStatus = 'Offline (Local Sync Active)';
      return { success: false, error: msg, latencyMs };
    }
  }

  // 2. Stores: GET /account/store/get
  public async getStores(): Promise<{ success: boolean; stores: Store[]; source: 'live' | 'local'; error?: string }> {
    if (this.config.useLiveBackend) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(`${this.config.baseUrl}/account/store/get`, {
          method: 'GET',
          headers: {
            account: this.config.accountId,
          },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const raw = await res.json();
          const list: Store[] = Array.isArray(raw) ? raw : (raw.stores || raw.data || []);
          this.isConnectedLive = true;
          // Sync to cache
          localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(list));
          return { success: true, stores: list, source: 'live' };
        }
      } catch {
        // Fallback to local
      }
    }

    const local = JSON.parse(localStorage.getItem(STORES_STORAGE_KEY) || '[]');
    return { success: true, stores: local, source: 'local' };
  }

  // 3. Store: POST /account/store/create
  public async createStore(payload: NewStorePayload): Promise<{ success: boolean; store?: Store; error?: string; details?: unknown }> {
    const newStoreItem: Store = {
      _id: 'store_' + Math.random().toString(36).substring(2, 11),
      name: payload.name,
      address: payload.address,
      latitude: payload.latitude,
      longitude: payload.longitude,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (this.config.useLiveBackend) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(`${this.config.baseUrl}/account/store/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            account: this.config.accountId,
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const liveStore = await res.json();
          const resolvedStore = liveStore.store || liveStore.data || liveStore || newStoreItem;
          // Update local cache
          const local = JSON.parse(localStorage.getItem(STORES_STORAGE_KEY) || '[]');
          localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify([resolvedStore, ...local]));
          return { success: true, store: resolvedStore };
        } else {
          const errData = await res.json().catch(() => ({}));
          return {
            success: false,
            error: errData.message || `Store creation failed (HTTP ${res.status})`,
            details: errData,
          };
        }
      } catch (err: unknown) {
        // When live fails or is offline, save locally
        const local = JSON.parse(localStorage.getItem(STORES_STORAGE_KEY) || '[]');
        localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify([newStoreItem, ...local]));
        return {
          success: true,
          store: newStoreItem,
          error: 'Live endpoint unreachable; stored in local synchronization state.',
        };
      }
    }

    // Pure local
    const local = JSON.parse(localStorage.getItem(STORES_STORAGE_KEY) || '[]');
    localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify([newStoreItem, ...local]));
    return { success: true, store: newStoreItem };
  }

  // 4. Employee Auth Register: POST /account/auth/create
  public async createUser(payload: NewUserPayload): Promise<{ success: boolean; user?: User; error?: string; details?: unknown }> {
    const newUserItem: User = {
      _id: 'user_' + Math.random().toString(36).substring(2, 11),
      name: payload.name,
      email: payload.email,
      storeId: payload.storeId,
      isValid: true,
      role: 'Staff Associate',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (this.config.useLiveBackend) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(`${this.config.baseUrl}/account/auth/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            account: this.config.accountId,
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const liveUser = await res.json();
          const resolvedUser = liveUser.user || liveUser.data || liveUser || newUserItem;
          const local = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([resolvedUser, ...local]));
          return { success: true, user: resolvedUser };
        } else {
          const errData = await res.json().catch(() => ({}));
          return {
            success: false,
            error: errData.message || `User registration failed (HTTP ${res.status})`,
            details: errData,
          };
        }
      } catch {
        // Fallback to local
        const local = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([newUserItem, ...local]));
        return {
          success: true,
          user: newUserItem,
          error: 'Live endpoint unreachable; saved to local state.',
        };
      }
    }

    const local = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([newUserItem, ...local]));
    return { success: true, user: newUserItem };
  }

  // 5. Auth Login: POST /account/auth/login
  public async login(email: string, password: string): Promise<LoginResponse> {
    if (this.config.useLiveBackend) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(`${this.config.baseUrl}/account/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            account: this.config.accountId,
          },
          body: JSON.stringify({ email, password }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data: LoginResponse = await res.json();
          if (data.authToken) {
            this.updateConfig({
              authToken: data.authToken,
              refreshToken: data.refreshToken || '',
            });
          }
          return data;
        } else {
          const errData = await res.json().catch(() => ({}));
          return {
            status: 'Error',
            message: errData.message || `Login failed (HTTP ${res.status})`,
          };
        }
      } catch (err: unknown) {
        // Fallback simulated login
      }
    }

    // Simulated local login for quick validation & offline admin usage
    const users: User[] = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    const matched = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (matched || email === 'admin@pulsehr.com' || email === 'jane@example.com') {
      const mockAuthToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + btoa(JSON.stringify({
        sub: matched?._id || 'admin_user',
        email,
        exp: Math.floor(Date.now() / 1000) + 2 * 24 * 3600,
      })) + '.mockSignatureSecret';

      const mockRefreshToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + btoa(JSON.stringify({
        sub: matched?._id || 'admin_user',
        exp: Math.floor(Date.now() / 1000) + 10 * 24 * 3600,
      })) + '.mockRefreshSecret';

      this.updateConfig({
        authToken: mockAuthToken,
        refreshToken: mockRefreshToken,
      });

      return {
        status: 'Success',
        authToken: mockAuthToken,
        refreshToken: mockRefreshToken,
      };
    }

    return {
      status: 'Error',
      message: 'Invalid email or credentials for registered employee.',
    };
  }

  // 6. Token Refresh: GET /jwt/refresh
  public async refreshToken(): Promise<{ success: boolean; data?: unknown; error?: string }> {
    if (!this.config.authToken || !this.config.refreshToken) {
      return { success: false, error: 'No existing auth or refresh token found. Please log in first.' };
    }

    if (this.config.useLiveBackend) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(`${this.config.baseUrl}/jwt/refresh`, {
          method: 'GET',
          headers: {
            authorization: this.config.authToken,
            refresh: this.config.refreshToken,
          },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data.authToken) {
            this.updateConfig({
              authToken: data.authToken,
              refreshToken: data.refreshToken || this.config.refreshToken,
            });
          }
          return { success: true, data };
        } else {
          return { success: false, error: `Refresh failed: HTTP ${res.status}` };
        }
      } catch (err: unknown) {
        // Fallback
      }
    }

    // Refresh simulated
    const newAuthToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + btoa(JSON.stringify({
      refreshedAt: Date.now(),
      exp: Math.floor(Date.now() / 1000) + 2 * 24 * 3600,
    })) + '.refreshedSignature';

    this.updateConfig({ authToken: newAuthToken });
    return {
      success: true,
      data: {
        status: 'Success',
        authToken: newAuthToken,
        message: 'Tokens renewed successfully (10-day refresh cycle active)',
      },
    };
  }

  // 7. Users list (Local + enrich with Store)
  public getUsers(): User[] {
    return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
  }

  // Toggle user active status (isValid)
  public toggleUserStatus(userId: string): User[] {
    const users: User[] = this.getUsers();
    const updated = users.map((u) => (u._id === userId ? { ...u, isValid: !u.isValid } : u));
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }

  // 8. Attendance records
  public getAttendanceLogs(): Attendance[] {
    const raw: Attendance[] = JSON.parse(localStorage.getItem(ATTENDANCE_STORAGE_KEY) || '[]');
    const stores: Store[] = JSON.parse(localStorage.getItem(STORES_STORAGE_KEY) || '[]');
    const users: User[] = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');

    return raw.map((att) => {
      const user = users.find((u) => u._id === att.userId);
      const store = stores.find((s) => s._id === (att.storeId || user?.storeId));

      let distanceMeters = 0;
      let isWithinGeofence = true;

      if (store && att.latitude && att.longitude) {
        const storeLat = parseFloat(store.latitude);
        const storeLng = parseFloat(store.longitude);
        const attLat = parseFloat(att.latitude);
        const attLng = parseFloat(att.longitude);

        if (!isNaN(storeLat) && !isNaN(storeLng) && !isNaN(attLat) && !isNaN(attLng)) {
          distanceMeters = this.calculateDistance(storeLat, storeLng, attLat, attLng);
          // 150m threshold for geofenced store check-in
          isWithinGeofence = distanceMeters <= 150;
        }
      }

      return {
        ...att,
        userName: user?.name || 'Authorized Staff',
        userEmail: user?.email || 'staff@example.com',
        storeName: store?.name || 'Assigned Branch',
        distanceMeters,
        isWithinGeofence,
      };
    });
  }

  // 9. Simulate Check-in
  public recordAttendance(payload: AttendanceSimPayload): Attendance {
    const users = this.getUsers();
    const user = users.find((u) => u._id === payload.userId);

    const newRecord: Attendance = {
      _id: 'att_' + Math.random().toString(36).substring(2, 11),
      userId: payload.userId,
      storeId: user?.storeId,
      latitude: payload.latitude,
      longitude: payload.longitude,
      imageUrl:
        payload.imageUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const current: Attendance[] = JSON.parse(localStorage.getItem(ATTENDANCE_STORAGE_KEY) || '[]');
    const updated = [newRecord, ...current];
    localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(updated));
    return newRecord;
  }

  // Reset demo data to defaults
  public resetToDefaultSeed(): void {
    localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(INITIAL_STORES));
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(INITIAL_ATTENDANCE));
  }
}

export const hrmsApi = new HrmsApiService();
