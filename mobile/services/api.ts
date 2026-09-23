import { API_BASE_URL, APP_CONFIG } from '../constants/config';
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

// In-memory cache for ultra-fast instant UI rendering
const apiCache = new Map<string, { data: any; timestamp: number }>();

/**
 * Clear cached responses (e.g. on manual pull-to-refresh)
 */
export function clearApiCache() {
  apiCache.clear();
}

/**
 * Generic fetch wrapper with timeout, caching, and standard error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  bypassCache: boolean = false
): Promise<T> {
  const cacheKey = endpoint;
  const now = Date.now();
  const cached = apiCache.get(cacheKey);

  // Return cached result immediately if valid
  if (!bypassCache && cached && now - cached.timestamp < (APP_CONFIG.cacheTtlMs || 20000)) {
    return cached.data as T;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), APP_CONFIG.apiTimeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData?.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // use status text fallback
      }
      throw new Error(errorMessage);
    }

    const json: ApiResponse<T> = await response.json();

    if (json.success === false) {
      throw new Error(json.error || 'Request failed on server.');
    }

    // Cache successful response
    apiCache.set(cacheKey, { data: json.data, timestamp: Date.now() });

    return json.data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(
        `Request timed out after ${Math.round(APP_CONFIG.apiTimeoutMs / 1000)}s.\nPlease verify backend is running at ${API_BASE_URL}`
      );
    }
    const msg = (error.message || '').toLowerCase();
    if (
      msg.includes('network request failed') ||
      msg.includes('failed to fetch') ||
      msg.includes('load failed') ||
      msg.includes('fetch failed') ||
      msg.includes('econnrefused')
    ) {
      throw new Error(
        `Unable to connect to backend server at ${API_BASE_URL}.\nEnsure the Express server is running ('npm start' in backend/) and your device is on the same network.`
      );
    }
    throw error;
  }
}

/**
 * 0. High-performance combined dashboard load (Single round-trip)
 */
export async function getDashboardAll(bypassCache: boolean = false): Promise<DashboardAllData> {
  try {
    return await apiRequest<DashboardAllData>('/dashboard/all', {}, bypassCache);
  } catch {
    // Graceful fallback to concurrent individual endpoints
    const [summary, monthlyRevenue, categorySales, regionSales, orderStatus] = await Promise.all([
      getDashboardSummary(bypassCache),
      getMonthlyRevenue(bypassCache),
      getCategorySales(bypassCache),
      getRegionSales(bypassCache),
      getOrderStatus(bypassCache),
    ]);
    return { summary, monthlyRevenue, categorySales, regionSales, orderStatus };
  }
}

/**
 * 1. Dashboard Summary KPI Metrics
 */
export async function getDashboardSummary(bypassCache = false): Promise<DashboardSummary> {
  return apiRequest<DashboardSummary>('/dashboard/summary', {}, bypassCache);
}

/**
 * 2. Monthly Revenue for Line Chart
 */
export async function getMonthlyRevenue(bypassCache = false): Promise<MonthlyRevenue[]> {
  return apiRequest<MonthlyRevenue[]>('/dashboard/monthly-revenue', {}, bypassCache);
}

/**
 * 3. Sales by Category for Bar Chart
 */
export async function getCategorySales(bypassCache = false): Promise<CategorySales[]> {
  return apiRequest<CategorySales[]>('/dashboard/category-sales', {}, bypassCache);
}

/**
 * 4. Sales by Region for Bar Chart
 */
export async function getRegionSales(bypassCache = false): Promise<RegionSales[]> {
  return apiRequest<RegionSales[]>('/dashboard/region-sales', {}, bypassCache);
}

/**
 * 5. Order Status Breakdown for Donut Chart
 */
export async function getOrderStatus(bypassCache = false): Promise<OrderStatusData> {
  return apiRequest<OrderStatusData>('/dashboard/order-status', {}, bypassCache);
}

/**
 * 6. Sales List with Search and Filter
 */
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

/**
 * 7. Products List with Search
 */
export async function getProducts(
  params?: { search?: string },
  bypassCache = false
): Promise<Product[]> {
  const queryParams = new URLSearchParams();
  if (params?.search && params.search.trim()) {
    queryParams.append('search', params.search.trim());
  }
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return apiRequest<Product[]>(`/products${queryString}`, {}, bypassCache);
}

/**
 * 8. Customers List with Search
 */
export async function getCustomers(
  params?: { search?: string },
  bypassCache = false
): Promise<Customer[]> {
  const queryParams = new URLSearchParams();
  if (params?.search && params.search.trim()) {
    queryParams.append('search', params.search.trim());
  }
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return apiRequest<Customer[]>(`/customers${queryString}`, {}, bypassCache);
}

/**
 * 9. Executive Reports and Summary Table
 */
export async function getReports(bypassCache = false): Promise<Report> {
  return apiRequest<Report>('/reports', {}, bypassCache);
}
