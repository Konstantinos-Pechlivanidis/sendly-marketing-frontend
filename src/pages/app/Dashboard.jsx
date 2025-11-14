import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import Icon from '../../components/ui/Icon';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useDashboard } from '../../services/queries';
import { TOKEN_KEY, STORE_KEY } from '../../utils/constants';
import { useStoreInfo } from '../../hooks/useStoreInfo';
import SEO from '../../components/SEO';

/**
 * Dashboard Page
 * Main dashboard for authenticated users
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const storeInfo = useStoreInfo();
  // Only auto-refetch dashboard when user is on dashboard page
  const { data: dashboardData, isLoading, error } = useDashboard({
    refetchInterval: true, // Enable auto-refetch (30s interval)
  });

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(STORE_KEY);
    navigate('/login', { replace: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg-base">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Dashboard - Sendly SMS Marketing"
        description="Manage your SMS marketing campaigns and grow your Shopify store."
        path="/app/dashboard"
      />
      <div className="min-h-screen pt-8 pb-20 px-4 lg:px-8 bg-neutral-bg-base">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-h1 md:text-4xl font-bold mb-2 text-neutral-text-primary">Dashboard</h1>
              {storeInfo && (
                <p className="text-body text-neutral-text-secondary">
                  Welcome back, {storeInfo.shopName || storeInfo.shopDomain}
                </p>
              )}
            </div>
            <GlassButton variant="ghost" size="md" onClick={handleLogout}>
              <span className="flex items-center gap-2">
                <Icon name="logout" size="sm" variant="ice" />
                Log out
              </span>
            </GlassButton>
          </div>

          {/* Error State */}
          {error && (
            <GlassCard variant="default" className="p-6 mb-6 border border-red-500/30">
              <div className="flex items-start gap-3">
                <Icon name="error" size="md" variant="ice" className="text-red-500 flex-shrink-0" />
                <div>
                  <h3 className="text-h3 font-semibold mb-2 text-red-500">Error Loading Dashboard</h3>
                  <p className="text-body text-neutral-text-secondary">
                    {error.message || 'Failed to load dashboard data. Please try refreshing the page.'}
                  </p>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Dashboard Content */}
          {dashboardData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Credits Balance */}
              <GlassCard variant="ice" className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-ice-soft">
                    <Icon name="sms" size="lg" variant="ice" />
                  </div>
                </div>
                <h3 className="text-h3 font-semibold mb-1 text-neutral-text-primary">SMS Credits</h3>
                <p className="text-3xl font-bold text-ice-primary mb-2">
                  {dashboardData.credits?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-neutral-text-secondary">Available credits</p>
              </GlassCard>

              {/* Total Campaigns */}
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-ice-soft">
                    <Icon name="campaign" size="lg" variant="ice" />
                  </div>
                </div>
                <h3 className="text-h3 font-semibold mb-1 text-neutral-text-primary">Campaigns</h3>
                <p className="text-3xl font-bold text-neutral-text-primary mb-2">
                  {dashboardData.totalCampaigns || 0}
                </p>
                <p className="text-sm text-neutral-text-secondary">Total campaigns</p>
              </GlassCard>

              {/* Total Contacts */}
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-ice-soft">
                    <Icon name="segment" size="lg" variant="ice" />
                  </div>
                </div>
                <h3 className="text-h3 font-semibold mb-1 text-neutral-text-primary">Contacts</h3>
                <p className="text-3xl font-bold text-neutral-text-primary mb-2">
                  {dashboardData.totalContacts?.toLocaleString() || 0}
                </p>
                <p className="text-sm text-neutral-text-secondary">Total contacts</p>
              </GlassCard>

              {/* Messages Sent */}
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-ice-soft">
                    <Icon name="send" size="lg" variant="ice" />
                  </div>
                </div>
                <h3 className="text-h3 font-semibold mb-1 text-neutral-text-primary">Messages Sent</h3>
                <p className="text-3xl font-bold text-neutral-text-primary mb-2">
                  {dashboardData.totalMessagesSent?.toLocaleString() || 0}
                </p>
                <p className="text-sm text-neutral-text-secondary">All time</p>
              </GlassCard>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <GlassCard variant="ice" className="p-6 group hover:scale-[1.02] transition-transform cursor-pointer" onClick={() => navigate('/app/campaigns/new')}>
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-xl bg-ice-soft group-hover:bg-ice-primary/20 transition-colors">
                  <Icon name="campaign" size="xl" variant="ice" />
                </div>
                <div className="flex-1">
                  <h3 className="text-h3 font-semibold mb-1 text-neutral-text-primary">Create Campaign</h3>
                  <p className="text-sm text-neutral-text-secondary">Start a new SMS campaign</p>
                </div>
                <Icon name="arrowRight" size="sm" variant="ice" className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </GlassCard>

            <GlassCard className="p-6 group hover:scale-[1.02] transition-transform cursor-pointer" onClick={() => navigate('/app/contacts')}>
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-xl bg-ice-soft group-hover:bg-ice-primary/20 transition-colors">
                  <Icon name="segment" size="xl" variant="ice" />
                </div>
                <div className="flex-1">
                  <h3 className="text-h3 font-semibold mb-1 text-neutral-text-primary">Manage Contacts</h3>
                  <p className="text-sm text-neutral-text-secondary">View and manage your contacts</p>
                </div>
                <Icon name="arrowRight" size="sm" variant="ice" className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </GlassCard>

            <GlassCard className="p-6 group hover:scale-[1.02] transition-transform cursor-pointer" onClick={() => navigate('/app/automations')}>
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-xl bg-ice-soft group-hover:bg-ice-primary/20 transition-colors">
                  <Icon name="automation" size="xl" variant="ice" />
                </div>
                <div className="flex-1">
                  <h3 className="text-h3 font-semibold mb-1 text-neutral-text-primary">Automations</h3>
                  <p className="text-sm text-neutral-text-secondary">Set up automated workflows</p>
                </div>
                <Icon name="arrowRight" size="sm" variant="ice" className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </>
  );
}

