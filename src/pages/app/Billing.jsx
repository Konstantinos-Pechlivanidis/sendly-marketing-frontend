import { useState } from 'react';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import GlassTable, {
  GlassTableHeader,
  GlassTableBody,
  GlassTableRow,
  GlassTableHeaderCell,
  GlassTableCell,
} from '../../components/ui/GlassTable';
import GlassPagination from '../../components/ui/GlassPagination';
import Icon from '../../components/ui/Icon';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
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
      const result = await createPurchase.mutateAsync({ packageId });
      toast.success('Purchase initiated. Redirecting to payment...');
      // In a real app, you'd redirect to Stripe checkout
      if (result.checkoutUrl) {
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

  if (isLoadingBalance || isLoadingPackages) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const isLowBalance = balance < 100;

  return (
    <>
      <SEO
        title="Billing - Sendly SMS Marketing"
        description="Manage your SMS credits and billing"
        path="/app/billing"
      />
      <div className="min-h-screen pt-8 pb-20 px-4 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-h1 md:text-4xl font-bold mb-2">Billing</h1>
            <p className="text-body text-border-subtle">
              Manage your SMS credits and purchase history
            </p>
          </div>

          {/* Current Balance */}
          <GlassCard variant={isLowBalance ? 'dark' : 'ice'} className={`p-6 mb-6 ${isLowBalance ? 'border border-red-500/30' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-border-subtle mb-2">Current Balance</p>
                <p className={`text-4xl font-bold ${isLowBalance ? 'text-red-400' : 'text-ice-accent'}`}>
                  {balance.toLocaleString()} credits
                </p>
                {isLowBalance && (
                  <p className="text-sm text-red-400 mt-2">
                    ⚠️ Low balance. Consider purchasing more credits.
                  </p>
                )}
              </div>
              <div className="p-4 rounded-xl bg-ice-accent/20">
                <Icon name="sms" size="xl" variant="ice" />
              </div>
            </div>
          </GlassCard>

          {/* Credit Usage Chart */}
          <GlassCard className="p-6 mb-6">
            <h3 className="text-h3 font-semibold mb-4">Credit Usage</h3>
            <LineChart
              data={creditUsageData}
              dataKey="credits"
              name="Credits Used"
              stroke="#99B5D7"
            />
          </GlassCard>

          {/* Purchase Packages */}
          <div className="mb-8">
            <h2 className="text-h2 font-bold mb-4">Purchase Credits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <GlassCard
                  key={pkg.id}
                  variant={pkg.mostPopular ? 'ice' : 'default'}
                  className={`p-6 relative ${pkg.mostPopular ? 'border-2 border-zoom-fuchsia' : ''}`}
                >
                  {pkg.mostPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-zoom-fuchsia text-primary-dark">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className="mb-4">
                    <h3 className="text-h3 font-semibold mb-2">{pkg.name}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-primary-light">
                        {pkg.price} {currency}
                      </span>
                      {pkg.originalPrice && (
                        <span className="text-sm text-border-subtle line-through">
                          {pkg.originalPrice} {currency}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-border-subtle mt-2">
                      {pkg.credits} SMS credits
                    </p>
                  </div>
                  {pkg.features && (
                    <ul className="space-y-2 mb-4">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-primary-light">
                          <Icon name="check" size="sm" variant="ice" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                  <GlassButton
                    variant={pkg.mostPopular ? 'primary' : 'ghost'}
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
            <h2 className="text-h2 font-bold mb-4">Purchase History</h2>
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : history.length === 0 ? (
              <GlassCard className="p-12 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-xl bg-ice-accent/20">
                    <Icon name="billing" size="xl" variant="ice" />
                  </div>
                </div>
                <h3 className="text-h3 font-semibold mb-2">No purchase history</h3>
                <p className="text-body text-border-subtle">
                  Your purchase history will appear here
                </p>
              </GlassCard>
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
                            <span className="text-border-subtle text-sm">
                              {transaction.createdAt
                                ? format(new Date(transaction.createdAt), 'MMM d, yyyy')
                                : '-'}
                            </span>
                          </GlassTableCell>
                          <GlassTableCell>
                            <span className="text-primary-light">
                              {transaction.packageName || transaction.package?.name || 'N/A'}
                            </span>
                          </GlassTableCell>
                          <GlassTableCell>
                            <span className="text-primary-light">
                              {transaction.credits || transaction.package?.credits || 0}
                            </span>
                          </GlassTableCell>
                          <GlassTableCell>
                            <span className="text-primary-light">
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
                  <div className="mt-6">
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
      </div>
    </>
  );
}

