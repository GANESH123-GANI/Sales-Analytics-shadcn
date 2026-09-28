import { API_BASE_URL, APP_CONFIG } from '../constants/config';
import { appStorage } from '../utils/storage';
import { TOKEN_KEY } from '../context/AuthContext';
import {
  ApiResponse,
  CategorySales,
  Customer,
  DashboardSummary,
  MonthlyRevenue,
  OrderStatusData,
  Product,
  RegionSales,
  Report,
  Sale,
} from '../types/sales';

export interface DashboardAllData {
  summary: DashboardSummary;
  monthlyRevenue: MonthlyRevenue[];
  categorySales: CategorySales[];
  regionSales: RegionSales[];
  orderStatus: OrderStatusData;
}

export interface AdminDashboardData {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  adminCount: number;
  normalUserCount: number;
  totalSales: number;
  totalRevenue: number;
  averageOrderValue: number;
  recentUsers: AdminUser[];
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
  salesCount?: number;
  totalRevenue?: number;
}

export interface CreateSaleInput {
  productName: string;
  category: string;
  quantity: number;
  price: number;
  saleDate?: string;
  region?: string;
  customerName?: string;
  status?: 'Completed' | 'Pending' | 'Cancelled';
}

// In-memory cache for ultra-fast UI rendering
const apiCache = new Map<string, { data: any; timestamp: number }>();

export function clearApiCache() {
  apiCache.clear();
}

/**
 * Generic fetch wrapper with token injection, timeout, caching, and standard error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  bypassCache: boolean = false
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const cacheKey = endpoint;
  const now = Date.now();
  const cached = apiCache.get(cacheKey);

  // Return cached result immediately if valid for GET requests
  if (method === 'GET' && !bypassCache && cached && now - cached.timestamp < (APP_CONFIG.cacheTtlMs || 10000)) {
    return cached.data as T;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), APP_CONFIG.apiTimeoutMs || 5000);

  // Retrieve auth token
  const token = await appStorage.getItem(TOKEN_KEY);

  const authHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (token) {
    authHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...authHeaders,
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error(`Expected JSON from server but received ${contentType}`);
    }

    const json = await response.json();

    if (!response.ok || json.success === false) {
      if (typeof window !== 'undefined' && (json.accountStatus === 'inactive' || json.accountStatus === 'deleted')) {
        window.dispatchEvent(new CustomEvent('account-suspended', { detail: { reason: json.message } }));
      }
      throw new Error(json.message || json.error || `HTTP error ${response.status}: ${response.statusText}`);
    }

    // Cache successful GET responses
    if (method === 'GET') {
      apiCache.set(cacheKey, { data: json.data !== undefined ? json.data : json, timestamp: Date.now() });
    } else {
      // Clear cache on mutations (POST, PUT, DELETE)
      clearApiCache();
    }

    return (json.data !== undefined ? json.data : json) as T;
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check server connectivity.');
    }
    throw error;
  }
}

// ─── User Dashboard & Analytics (Isolated by authenticated user) ──────────────

export async function getDashboardAll(bypassCache = false): Promise<DashboardAllData> {
  return apiRequest<DashboardAllData>('/dashboard/all', {}, bypassCache);
}

export async function getDashboardSummary(bypassCache = false): Promise<DashboardSummary> {
  return apiRequest<DashboardSummary>('/dashboard/summary', {}, bypassCache);
}

export async function getMonthlyRevenue(bypassCache = false): Promise<MonthlyRevenue[]> {
  return apiRequest<MonthlyRevenue[]>('/dashboard/monthly-revenue', {}, bypassCache);
}

export async function getCategorySales(bypassCache = false): Promise<CategorySales[]> {
  return apiRequest<CategorySales[]>('/dashboard/category-sales', {}, bypassCache);
}

export async function getRegionSales(bypassCache = false): Promise<RegionSales[]> {
  return apiRequest<RegionSales[]>('/dashboard/region-sales', {}, bypassCache);
}

export async function getOrderStatus(bypassCache = false): Promise<OrderStatusData> {
  return apiRequest<OrderStatusData>('/dashboard/order-status', {}, bypassCache);
}

export async function getReports(bypassCache = false): Promise<Report> {
  return apiRequest<Report>('/reports', {}, bypassCache);
}

// ─── User Sales CRUD ─────────────────────────────────────────────────────────

export async function getSales(
  params?: { search?: string; status?: string },
  bypassCache = false
): Promise<Sale[]> {
  const queryParams = new URLSearchParams();
  if (params?.search && params.search.trim()) {
    queryParams.append('search', params.search.trim());
  }
  if (params?.status && params.status !== 'All') {
    queryParams.append('status', params.status);
  }
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return apiRequest<Sale[]>(`/sales${queryString}`, {}, bypassCache);
}

export async function getSaleById(id: number | string): Promise<Sale> {
  return apiRequest<Sale>(`/sales/${id}`);
}

export async function createSale(data: CreateSaleInput): Promise<Sale> {
  return apiRequest<Sale>('/sales', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSale(id: number | string, data: Partial<CreateSaleInput>): Promise<any> {
  return apiRequest(`/sales/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteSale(id: number | string): Promise<{ success: boolean; message: string }> {
  return apiRequest(`/sales/${id}`, {
    method: 'DELETE',
  });
}

// ─── Products & Customers Reference ──────────────────────────────────────────

export async function getProducts(params?: { search?: string }, bypassCache = false): Promise<Product[]> {
  const q = params?.search ? `?search=${encodeURIComponent(params.search)}` : '';
  return apiRequest<Product[]>(`/products${q}`, {}, bypassCache);
}

export async function getCustomers(params?: { search?: string }, bypassCache = false): Promise<Customer[]> {
  const q = params?.search ? `?search=${encodeURIComponent(params.search)}` : '';
  return apiRequest<Customer[]>(`/customers${q}`, {}, bypassCache);
}

export async function createCustomer(data: {
  name: string;
  email: string;
  phone?: string;
  region?: string;
}): Promise<Customer> {
  return apiRequest<Customer>('/customers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCustomer(
  id: number | string,
  data: { name?: string; email?: string; phone?: string; region?: string }
): Promise<Customer> {
  return apiRequest<Customer>(`/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCustomer(id: number | string): Promise<{ success: boolean; message: string }> {
  return apiRequest(`/customers/${id}`, {
    method: 'DELETE',
  });
}

// ─── User Profile ────────────────────────────────────────────────────────────

export async function getUserProfile(): Promise<any> {
  return apiRequest('/users/me');
}

export async function updateUserProfile(data: { name: string; currentPassword?: string; newPassword?: string }): Promise<any> {
  return apiRequest('/users/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ─── Admin Management Endpoints (Strictly role = admin) ──────────────────────

export async function getAdminDashboard(bypassCache = false): Promise<AdminDashboardData> {
  return apiRequest<AdminDashboardData>('/admin/dashboard', {}, bypassCache);
}

export async function getAdminUsers(
  params?: { search?: string; role?: string; status?: string },
  bypassCache = false
): Promise<AdminUser[]> {
  const queryParams = new URLSearchParams();
  if (params?.search && params.search.trim()) {
    queryParams.append('search', params.search.trim());
  }
  if (params?.role && params.role !== 'All') {
    queryParams.append('role', params.role);
  }
  if (params?.status && params.status !== 'All') {
    queryParams.append('status', params.status);
  }
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return apiRequest<AdminUser[]>(`/admin/users${queryString}`, {}, bypassCache);
}

export async function getAdminUser(id: number | string): Promise<AdminUser> {
  return apiRequest<AdminUser>(`/admin/users/${id}`);
}

export async function updateAdminUserStatus(
  id: number | string,
  status: 'active' | 'inactive'
): Promise<{ success: boolean; message: string }> {
  return apiRequest(`/admin/users/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export async function getAdminUserSales(id: number | string): Promise<Sale[]> {
  return apiRequest<Sale[]>(`/admin/users/${id}/sales`);
}

export async function getAdminUserAnalytics(id: number | string): Promise<any> {
  return apiRequest(`/admin/users/${id}/analytics`);
}

/**
 * DELETE /api/users/me
 * Permanently deletes the current authenticated user's account and all their sales.
 */
export async function deleteUserAccount(): Promise<{ success: boolean; message: string }> {
  return apiRequest('/users/me', {
    method: 'DELETE',
  });
}

/**
 * DELETE /api/admin/users/:id
 * Administrator deletes a specific user account.
 */
export async function adminDeleteUser(id: number | string): Promise<{ success: boolean; message: string }> {
  return apiRequest(`/admin/users/${id}`, {
    method: 'DELETE',
  });
}

