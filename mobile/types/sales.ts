export interface DashboardSummary {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface CategorySales {
  category: string;
  sales: number;
}

export interface RegionSales {
  region: string;
  sales: number;
}

export interface OrderStatusItem {
  status: 'Completed' | 'Pending' | 'Cancelled';
  count: number;
}

export interface OrderStatusData {
  summary: {
    Completed: number;
    Pending: number;
    Cancelled: number;
  };
  list: OrderStatusItem[];
}

export interface Sale {
  id: number;
  customerId: number;
  customer: string;
  customerEmail: string;
  date: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Cancelled';
  region: string;
  itemsCount: number;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  unitsSold: number;
  revenue: number;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  region: string;
  totalOrders: number;
  totalSpending: number;
}

export interface ReportSummaryRow {
  region: string;
  totalOrders: number;
  completedOrders: number;
  totalRevenue: number;
}

export interface FinancialMetrics {
  grossRevenue: number;
  cogs: number;
  grossProfit: number;
  grossMarginPercent: string;
  operatingExpenses: number;
  netOperatingIncome: number;
  netMarginPercent: string;
  collectionsRate: string;
}

export interface OperatingExpense {
  id: number;
  category: string;
  department: string;
  amount: number;
  budgetedAmount: number;
  variance: number;
  quarter: string;
}

export interface ExecutiveReview {
  quarter: string;
  revenueTarget: number;
  actualRevenue: number;
  cogs: number;
  operatingExpenses: number;
  netProfit: number;
  growthRate: string;
  strategicHighlights: string;
  operationalRisks: string;
  auditorSignoff: string;
  auditDate: string;
}

export interface EnterpriseContract {
  id: number;
  contractCode: string;
  clientName: string;
  tier: string;
  dealValue: number;
  terms: string;
  paymentStatus: 'Settled' | 'In Escrow' | 'Invoice Sent' | 'Review Pending';
  settlementDate: string;
  region: string;
}

export interface Report {
  totalRevenue: number;
  totalOrders: number;
  topCategory: string;
  topRegion: string;
  topProduct: string;
  topProductRevenue: number;
  summaryTable: ReportSummaryRow[];
  financialMetrics?: FinancialMetrics;
  operatingExpenses?: OperatingExpense[];
  executiveReviews?: ExecutiveReview[];
  enterpriseContracts?: EnterpriseContract[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  count?: number;
}
