import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';
import { normalizePaginatedResponse } from '../utils/apiHelpers';

// Campaigns
export const useCampaigns = (params = {}) => {
  return useQuery({
    queryKey: ['campaigns', params],
    queryFn: async () => {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/campaigns?${queryString}`);
      // Normalize response to consistent format
      const normalized = normalizePaginatedResponse(response, 'campaigns');
      return {
        campaigns: normalized.items,
        pagination: normalized.pagination,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - list data changes with CRUD operations
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on focus
    refetchOnMount: false, // Use cached data if fresh
    keepPreviousData: true, // Keep previous data while fetching (smooth pagination)
  });
};

export const useCampaign = (id, options = {}) => {
  return useQuery({
    queryKey: ['campaign', id],
    queryFn: () => api.get(`/campaigns/${id}`),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes - detail data changes less frequently
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: options.refetchOnMount !== false ? 'always' : false, // Always refetch when navigating to detail page
    ...options,
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => api.post('/campaigns', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'], exact: false });
    },
  });
};

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/campaigns/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['campaign', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['campaigns', variables.id, 'metrics'] }); // Invalidate metrics
    },
  });
};

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => api.delete(`/campaigns/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }); // Update dashboard stats
    },
  });
};

export const useSendCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => api.post(`/campaigns/${id}/send`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['campaign', id] });
      queryClient.invalidateQueries({ queryKey: ['campaigns', id, 'metrics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }); // Update dashboard stats
      queryClient.invalidateQueries({ queryKey: ['reports'], exact: false }); // Update reports
    },
  });
};

export const useScheduleCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, scheduleType, scheduleAt, recurringDays }) => {
      const scheduleData = {
        scheduleType: scheduleType || 'scheduled',
        scheduleAt: scheduleAt ? new Date(scheduleAt).toISOString() : undefined,
        recurringDays,
      };
      return api.put(`/campaigns/${id}/schedule`, scheduleData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};

// Contacts
export const useContacts = (params = {}) => {
  return useQuery({
    queryKey: ['contacts', params],
    queryFn: async () => {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/contacts?${queryString}`);
      // Normalize response to consistent format
      const normalized = normalizePaginatedResponse(response, 'contacts');
      return {
        contacts: normalized.items,
        pagination: normalized.pagination,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    keepPreviousData: true,
  });
};

export const useContactStats = () => {
  return useQuery({
    queryKey: ['contacts', 'stats'],
    queryFn: () => api.get('/contacts/stats'),
    staleTime: 1 * 60 * 1000, // 1 minute - stats change with imports/updates
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Billing
export const useBillingBalance = () => {
  return useQuery({
    queryKey: ['billing', 'balance'],
    queryFn: () => api.get('/billing/balance'),
    staleTime: 1 * 60 * 1000, // 1 minute - balance changes after purchases
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Refetch when user returns (might have purchased)
  });
};

/**
 * Get public pricing packages (no authentication required)
 * Used for public pricing page
 */
export const usePublicPackages = (currency = 'EUR') => {
  return useQuery({
    queryKey: ['public', 'packages', currency],
    queryFn: () => api.get(`/public/packages?currency=${currency}`),
    retry: (failureCount, error) => {
      // Don't retry on network errors (backend not available)
      if (error?.isNetworkError || error?.status === 0) {
        return false;
      }
      // Retry once for other errors
      return failureCount < 1;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (public data changes rarely)
  });
};

/**
 * Get billing packages (authenticated - requires store context)
 * Used for authenticated users in the app
 */
export const useBillingPackages = () => {
  return useQuery({
    queryKey: ['billing', 'packages'],
    queryFn: () => api.get('/billing/packages'),
    retry: (failureCount, error) => {
      // Don't retry on network errors (backend not available)
      if (error?.isNetworkError || error?.status === 0) {
        return false;
      }
      // Retry once for other errors
      return failureCount < 1;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Campaign Stats
export const useCampaignStats = () => {
  return useQuery({
    queryKey: ['campaigns', 'stats'],
    queryFn: () => api.get('/campaigns/stats/summary'),
    staleTime: 1 * 60 * 1000, // 1 minute - stats change frequently
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useCampaignMetrics = (id, options = {}) => {
  return useQuery({
    queryKey: ['campaigns', id, 'metrics'],
    queryFn: () => api.get(`/campaigns/${id}/metrics`),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds - metrics update frequently for active campaigns
    cacheTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    refetchInterval: options.refetchInterval !== false ? 30 * 1000 : false, // Auto-refetch every 30s for live updates
    refetchIntervalInBackground: false,
    ...options,
  });
};

export const usePrepareCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => api.post(`/campaigns/${id}/prepare`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};

export const useRetryFailedCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => api.post(`/campaigns/${id}/retry-failed`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['campaign', id] });
    },
  });
};

// Dashboard
export const useDashboard = (options = {}) => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await api.get('/dashboard');
      // Backend returns { success: true, data: { credits, totalCampaigns, totalContacts, totalMessagesSent, ... } }
      return response;
    },
    staleTime: 1 * 60 * 1000, // 1 minute - dashboard data changes frequently
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchInterval: options.refetchInterval !== false ? 30 * 1000 : false, // Auto-refetch every 30s (can be disabled)
    refetchIntervalInBackground: false, // Don't refetch in background tabs
    ...options,
  });
};

export const useDashboardOverview = () => {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => api.get('/dashboard/overview'),
  });
};

export const useDashboardQuickStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'quick-stats'],
    queryFn: () => api.get('/dashboard/quick-stats'),
  });
};

// Templates
export const useTemplates = (params = {}) => {
  return useQuery({
    queryKey: ['templates', params],
    queryFn: async () => {
      const queryString = new URLSearchParams(params).toString();
      return api.get(`/templates?${queryString}`);
    },
    staleTime: 15 * 60 * 1000, // 15 minutes - templates rarely change
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    keepPreviousData: true,
  });
};

export const useTemplateCategories = () => {
  return useQuery({
    queryKey: ['templates', 'categories'],
    queryFn: () => api.get('/templates/categories'),
    staleTime: Infinity, // Never stale - categories are static
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const useTemplate = (id) => {
  return useQuery({
    queryKey: ['template', id],
    queryFn: () => api.get(`/templates/${id}`),
    enabled: !!id,
    staleTime: 15 * 60 * 1000, // 15 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const useTrackTemplateUsage = () => {
  return useMutation({
    mutationFn: (id) => api.post(`/templates/${id}/track`),
  });
};

// Contacts - CRUD
export const useCreateContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => api.post('/contacts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['contacts', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }); // Update dashboard stats
    },
  });
};

export const useUpdateContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/contacts/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['contact', variables.id] });
    },
  });
};

export const useDeleteContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => api.delete(`/contacts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['contacts', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }); // Update dashboard stats
    },
  });
};

export const useContact = (id, options = {}) => {
  return useQuery({
    queryKey: ['contact', id],
    queryFn: () => api.get(`/contacts/${id}`),
    enabled: !!id && id !== 'new' && (options.enabled !== false),
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: options.refetchOnMount !== false ? 'always' : false,
    ...options,
  });
};

export const useImportContacts = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (formData) => {
      // Use axios for consistency with other API calls
      // Axios automatically handles FormData and adds auth token via interceptor
      return api.post('/contacts/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['contacts', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }); // Update dashboard stats
    },
  });
};

export const useBirthdayContacts = (params = {}) => {
  return useQuery({
    queryKey: ['contacts', 'birthdays', params],
    queryFn: async () => {
      const queryString = new URLSearchParams(params).toString();
      return api.get(`/contacts/birthdays?${queryString}`);
    },
    staleTime: 1 * 60 * 1000, // 1 minute - birthdays change daily
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

// Billing
export const useCreatePurchase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => api.post('/billing/purchase', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing', 'balance'] }); // Update balance
      queryClient.invalidateQueries({ queryKey: ['billing', 'history'], exact: false }); // Update history
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }); // Update dashboard credits
    },
  });
};

export const useBillingHistory = (params = {}) => {
  return useQuery({
    queryKey: ['billing', 'history', params],
    queryFn: async () => {
      const queryString = new URLSearchParams(params).toString();
      return api.get(`/billing/history?${queryString}`);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - history changes with purchases
    cacheTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    keepPreviousData: true,
  });
};

export const useBillingHistoryStripe = (params = {}) => {
  return useQuery({
    queryKey: ['billing', 'billing-history', params],
    queryFn: async () => {
      const queryString = new URLSearchParams(params).toString();
      return api.get(`/billing/billing-history?${queryString}`);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    keepPreviousData: true,
  });
};

// Settings
export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get('/settings'),
    staleTime: 15 * 60 * 1000, // 15 minutes - settings change only when user updates
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const useAccountInfo = () => {
  return useQuery({
    queryKey: ['settings', 'account'],
    queryFn: () => api.get('/settings/account'),
    staleTime: 30 * 60 * 1000, // 30 minutes - account info rarely changes
    cacheTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const useUpdateSenderNumber = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => api.put('/settings/sender', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};

// Discounts
export const useDiscounts = () => {
  return useQuery({
    queryKey: ['discounts'],
    queryFn: () => api.get('/discounts'),
    staleTime: 10 * 60 * 1000, // 10 minutes - discounts change occasionally
    cacheTime: 20 * 60 * 1000, // 20 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const useDiscount = (id) => {
  return useQuery({
    queryKey: ['discount', id],
    queryFn: () => api.get(`/discounts/${id}`),
    enabled: !!id,
  });
};

export const useValidateDiscount = () => {
  return useMutation({
    mutationFn: (discountId) => {
      // Backend has two endpoints:
      // 1. POST /shopify/discounts/validate (expects discountId in body)
      // 2. GET /discounts/validate/:code (expects code in URL)
      // We'll use POST /shopify/discounts/validate as it's the standard endpoint
      return api.post('/shopify/discounts/validate', { discountId });
    },
  });
};

// Audiences
export const useAudiences = () => {
  return useQuery({
    queryKey: ['audiences'],
    queryFn: () => api.get('/audiences'),
    staleTime: 10 * 60 * 1000, // 10 minutes - audiences change occasionally
    cacheTime: 20 * 60 * 1000, // 20 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const useAudienceDetails = (id, params = {}) => {
  return useQuery({
    queryKey: ['audience', id, 'details', params],
    queryFn: async () => {
      const queryString = new URLSearchParams(params).toString();
      return api.get(`/audiences/${id}/details?${queryString}`);
    },
    enabled: !!id,
  });
};

export const useValidateAudience = () => {
  return useMutation({
    mutationFn: (audienceId) => api.post('/audiences/validate', { audienceId }),
  });
};

// Automations
export const useAutomations = () => {
  return useQuery({
    queryKey: ['automations'],
    queryFn: () => api.get('/automations'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    keepPreviousData: true,
  });
};

export const useAutomationStats = () => {
  return useQuery({
    queryKey: ['automations', 'stats'],
    queryFn: () => api.get('/automations/stats'),
    staleTime: 1 * 60 * 1000, // 1 minute - stats change frequently
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useCreateAutomation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => api.post('/automations', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'], exact: false });
    },
  });
};

export const useUpdateAutomation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/automations/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'], exact: false });
    },
  });
};

export const useSystemDefaults = () => {
  return useQuery({
    queryKey: ['automations', 'defaults'],
    queryFn: () => api.get('/automations/defaults'),
    staleTime: Infinity, // Never stale - system defaults are static
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const useSyncSystemDefaults = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => api.post('/automations/sync'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'], exact: false });
    },
  });
};

// Reports
export const useReportsOverview = (params = {}) => {
  return useQuery({
    queryKey: ['reports', 'overview', params],
    queryFn: async () => {
      const queryString = new URLSearchParams(params).toString();
      return api.get(`/reports/overview?${queryString}`);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - reports are expensive to compute
    cacheTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    keepPreviousData: true,
  });
};

export const useReportsKPIs = (params = {}) => {
  return useQuery({
    queryKey: ['reports', 'kpis', params],
    queryFn: async () => {
      const queryString = new URLSearchParams(params).toString();
      return api.get(`/reports/kpis?${queryString}`);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    keepPreviousData: true,
  });
};

export const useCampaignReports = (params = {}) => {
  return useQuery({
    queryKey: ['reports', 'campaigns', params],
    queryFn: async () => {
      const queryString = new URLSearchParams(params).toString();
      return api.get(`/reports/campaigns?${queryString}`);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    keepPreviousData: true,
  });
};

export const useCampaignReport = (id) => {
  return useQuery({
    queryKey: ['reports', 'campaigns', id],
    queryFn: () => api.get(`/reports/campaigns/${id}`),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const useAutomationReports = (params = {}) => {
  return useQuery({
    queryKey: ['reports', 'automations', params],
    queryFn: async () => {
      const queryString = new URLSearchParams(params).toString();
      return api.get(`/reports/automations?${queryString}`);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    keepPreviousData: true,
  });
};

export const useMessagingReports = (params = {}) => {
  return useQuery({
    queryKey: ['reports', 'messaging', params],
    queryFn: async () => {
      const queryString = new URLSearchParams(params).toString();
      return api.get(`/reports/messaging?${queryString}`);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    keepPreviousData: true,
  });
};

export const useCreditsReports = (params = {}) => {
  return useQuery({
    queryKey: ['reports', 'credits', params],
    queryFn: async () => {
      const queryString = new URLSearchParams(params).toString();
      return api.get(`/reports/credits?${queryString}`);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    keepPreviousData: true,
  });
};

export const useContactsReports = (params = {}) => {
  return useQuery({
    queryKey: ['reports', 'contacts', params],
    queryFn: async () => {
      const queryString = new URLSearchParams(params).toString();
      return api.get(`/reports/contacts?${queryString}`);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    keepPreviousData: true,
  });
};

export const useExportData = () => {
  return useMutation({
    mutationFn: (params) => {
      const queryString = new URLSearchParams(params).toString();
      return api.get(`/reports/export?${queryString}`);
    },
  });
};

// Tracking
export const useCampaignDeliveryStatus = (id, options = {}) => {
  return useQuery({
    queryKey: ['tracking', 'campaign', id],
    queryFn: () => api.get(`/tracking/campaign/${id}`),
    enabled: !!id,
    staleTime: 0, // Always stale - tracking data is real-time
    cacheTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true, // Refetch when user returns
    refetchInterval: options.refetchInterval !== false ? 30 * 1000 : false, // Refetch every 30 seconds for live updates
    refetchIntervalInBackground: false, // Don't refetch in background tabs
    ...options,
  });
};

export const useMittoMessageStatus = (messageId) => {
  return useQuery({
    queryKey: ['tracking', 'mitto', messageId],
    queryFn: () => api.get(`/tracking/mitto/${messageId}`),
    enabled: !!messageId,
  });
};

export const useBulkUpdateDeliveryStatus = () => {
  return useMutation({
    mutationFn: (data) => api.post('/tracking/bulk-update', data),
  });
};

