import { useState } from 'react';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import PageHeader from '../../components/ui/PageHeader';
import GlassTable, {
  GlassTableHeader,
  GlassTableBody,
  GlassTableRow,
  GlassTableHeaderCell,
  GlassTableCell,
} from '../../components/ui/GlassTable';
import GlassPagination from '../../components/ui/GlassPagination';
import Icon from '../../components/ui/Icon';
import LoadingState from '../../components/ui/LoadingState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import { useBillingBalance, useBillingPackages, useBillingHistory, useCreatePurchase } from '../../services/queries';
import { useToastContext } from '../../contexts/ToastContext';
import SEO from '../../components/SEO';
import { format } from 'date-fns';
import LineChart from '../../components/charts/LineChart';

export default function Billing() {
  const toast = useToastContext();
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data: balanceData, isLoading: isLoadingBalance } = useBillingBalance();
  const { data: packagesData, isLoading: isLoadingPackages } = useBillingPackages();
  const { data: historyData, isLoading: isLoadingHistory } = useBillingHistory({
    page,
    pageSize,
  });
  const createPurchase = useCreatePurchase();

  const balance = balanceData?.credits || 0;
  const currency = balanceData?.currency || 'EUR';
  const packages = packagesData?.packages || packagesData || [];
  const history = historyData?.transactions || historyData?.items || [];
  const pagination = historyData?.pagination || {};

  const handlePurchase = async (packageId) => {
    try {
      // Build success and cancel URLs based on current location
      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}/app/billing?success=true`;
      const cancelUrl = `${baseUrl}/app/billing?canceled=true`;
      
      const result = await createPurchase.mutateAsync({ 
        packageId,
        successUrl,
        cancelUrl,
      });
      toast.success('Purchase initiated. Redirecting to payment...');
      // Redirect to Stripe checkout
      if (result.sessionUrl) {
        window.location.href = result.sessionUrl;
      } else if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
    } catch (error) {
      toast.error(error?.message || 'Failed to initiate purchase');
    }
  };

  // Credit usage data for chart
  const creditUsageData = [
    { name: 'Week 1', credits: 100 },
    { name: 'Week 2', credits: 150 },
    { name: 'Week 3', credits: 120 },
    { name: 'Week 4', credits: 180 },
  ];

  // Only show full loading state on initial load (no cached data)
  // If we have cached data, show it immediately even if fetching
  const isInitialLoad = (isLoadingBalance && !balanceData) || (isLoadingPackages && !packagesData);

  if (isInitialLoad) {
    return <LoadingState size="lg" message="Loading billing information..." />;
  }

  const isLowBalance = balance < 100;

  return (
    <>
      <SEO
        title="Billing - Sendly SMS Marketing"
        description="Manage your SMS credits and billing"
        path="/app/billing"
      />
      <div className="min-h-screen pt-8 pb-20 px-6 lg:px-10 bg-neutral-bg-base">
        {/* Header */}
        <PageHeader
          title="Billing"
          subtitle="Manage your SMS credits and purchase history"
        />

        {/* Current Balance */}
        <GlassCard variant={isLowBalance ? 'default' : 'ice'} className={`p-6 mb-8 ${isLowBalance ? 'border-2 border-red-200 bg-red-50/50' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-text-secondary mb-2 uppercase tracking-wider">Current Balance</p>
              <p className={`text-4xl font-bold ${isLowBalance ? 'text-red-500' : 'text-ice-primary'}`}>
                {balance.toLocaleString()} credits
              </p>
              {isLowBalance && (
                <p className="text-sm text-red-500 mt-2 font-medium">
                  ⚠️ Low balance. Consider purchasing more credits.
                </p>
              )}
            </div>
            <div className="p-4 rounded-xl bg-ice-soft/80">
              <Icon name="sms" size="xl" variant="ice" />
            </div>
          </div>
        </GlassCard>

        {/* Credit Usage Chart */}
        <GlassCard className="p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4 text-neutral-text-primary">Credit Usage</h3>
          <LineChart
            data={creditUsageData}
            dataKey="credits"
            name="Credits Used"
            stroke="#4E8FB8"
          />
        </GlassCard>

        {/* Purchase Packages */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-neutral-text-primary">Purchase Credits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <GlassCard
                key={pkg.id}
                variant={pkg.mostPopular ? 'fuchsia' : 'default'}
                className={`p-6 relative hover:shadow-glass-light-lg transition-shadow ${pkg.mostPopular ? 'border-2 border-fuchsia-primary' : ''}`}
              >
                {pkg.mostPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-fuchsia-primary text-white shadow-glow-fuchsia-light">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2 text-neutral-text-primary">{pkg.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-neutral-text-primary">
                      {pkg.price} {currency}
                    </span>
                    {pkg.originalPrice && (
                      <span className="text-sm text-neutral-text-secondary line-through">
                        {pkg.originalPrice} {currency}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-text-secondary mt-2 font-medium">
                    {pkg.credits} SMS credits
                  </p>
                </div>
                {pkg.features && (
                  <ul className="space-y-2 mb-4">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-neutral-text-primary">
                        <Icon name="check" size="sm" variant="ice" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
                <GlassButton
                  variant={pkg.mostPopular ? 'fuchsia' : 'ghost'}
                  size="lg"
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={createPurchase.isPending}
                  className="w-full"
                >
                  {createPurchase.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <LoadingSpinner size="sm" />
                      Processing...
                    </span>
                  ) : (
                    'Purchase'
                  )}
                </GlassButton>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Purchase History */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-neutral-text-primary">Purchase History</h2>
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : history.length === 0 ? (
            <EmptyState
              icon="billing"
              title="No purchase history"
              message="Your purchase history will appear here once you make your first credit purchase."
            />
          ) : (
            <>
              <GlassCard className="p-0 overflow-hidden">
                <GlassTable>
                  <GlassTableHeader>
                    <GlassTableRow>
                      <GlassTableHeaderCell>Date</GlassTableHeaderCell>
                      <GlassTableHeaderCell>Package</GlassTableHeaderCell>
                      <GlassTableHeaderCell>Credits</GlassTableHeaderCell>
                      <GlassTableHeaderCell>Amount</GlassTableHeaderCell>
                      <GlassTableHeaderCell>Status</GlassTableHeaderCell>
                    </GlassTableRow>
                  </GlassTableHeader>
                  <GlassTableBody>
                    {history.map((transaction) => (
                      <GlassTableRow key={transaction.id}>
                        <GlassTableCell>
                          <span className="text-neutral-text-secondary text-sm">
                            {transaction.createdAt
                              ? format(new Date(transaction.createdAt), 'MMM d, yyyy')
                              : '-'}
                          </span>
                        </GlassTableCell>
                        <GlassTableCell>
                          <span className="text-neutral-text-primary font-medium">
                            {transaction.packageName || transaction.package?.name || 'N/A'}
                          </span>
                        </GlassTableCell>
                        <GlassTableCell>
                          <span className="text-neutral-text-primary font-medium">
                            {transaction.credits || transaction.package?.credits || 0}
                          </span>
                        </GlassTableCell>
                        <GlassTableCell>
                          <span className="text-neutral-text-primary font-medium">
                            {transaction.amount || transaction.price || 0} {currency}
                          </span>
                        </GlassTableCell>
                        <GlassTableCell>
                          <StatusBadge status={transaction.status || 'completed'} />
                        </GlassTableCell>
                      </GlassTableRow>
                    ))}
                  </GlassTableBody>
                </GlassTable>
              </GlassCard>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-8">
                  <GlassPagination
                    currentPage={page}
                    totalPages={pagination.totalPages || 1}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

