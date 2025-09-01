// TypeScript type definitions for Donation/Payment Statistics API
// Based on the backend donation service and models

export interface Donation {
  _id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  paymentMethod: string;
  transactionId: string;
  sessionId: string;
  donor: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  description?: string;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  confirmedAt?: string;
}

export interface DonationStats {
  summary: {
    totalDonations: number;
    totalAmount: number;
    averageDonation: number;
    uniqueDonors: number;
  };
  statusBreakdown: {
    PENDING: number;
    SUCCESS: number;
    FAILED: number;
    CANCELLED: number;
  };
  recentActivity: Array<{
    date: string;
    count: number;
    amount: number;
  }>;
}

export interface DonationQueryParams {
  status?: string;
  startDate?: string;
  endDate?: string;
  disasterId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export type DonationStatsResponse = ApiResponse<DonationStats>;

export type DonationListResponse = ApiResponse<Donation[]>;

export interface PaymentMethodStats {
  method: string;
  count: number;
  totalAmount: number;
  percentage: number;
}

export interface CurrencyStats {
  currency: string;
  count: number;
  totalAmount: number;
  percentage: number;
}

export interface TimeSeriesData {
  date: string;
  donations: number;
  amount: number;
}

export interface PaymentAnalytics {
  paymentMethods: PaymentMethodStats[];
  currencies: CurrencyStats[];
  timeSeries: TimeSeriesData[];
  peakHours: Array<{
    hour: number;
    donations: number;
    amount: number;
  }>;
  geographicDistribution: Array<{
    region: string;
    donations: number;
    amount: number;
  }>;
}
