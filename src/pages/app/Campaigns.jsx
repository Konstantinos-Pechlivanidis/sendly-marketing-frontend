import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import GlassTable, {
  GlassTableHeader,
  GlassTableBody,
  GlassTableRow,
  GlassTableHeaderCell,
  GlassTableCell,
} from '../../components/ui/GlassTable';
import GlassSelect from '../../components/ui/GlassSelect';
import GlassInput from '../../components/ui/GlassInput';
import GlassPagination from '../../components/ui/GlassPagination';
import StatusBadge from '../../components/ui/StatusBadge';
import Icon from '../../components/ui/Icon';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useCampaigns, useDeleteCampaign, useSendCampaign, useScheduleCampaign } from '../../services/queries';
import { useToastContext } from '../../contexts/ToastContext';
import SEO from '../../components/SEO';
import { format } from 'date-fns';

export default function Campaigns() {
  const navigate = useNavigate();
  const toast = useToastContext();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const pageSize = 20;

  const { data, isLoading, error } = useCampaigns({
    page,
    pageSize,
    status: statusFilter || undefined,
    search: searchQuery || undefined,
  });

  const deleteCampaign = useDeleteCampaign();
  const sendCampaign = useSendCampaign();
  const scheduleCampaign = useScheduleCampaign();

  const campaigns = data?.campaigns || [];
  const pagination = data?.pagination || {};

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await deleteCampaign.mutateAsync(id);
      toast.success('Campaign deleted successfully');
    } catch (error) {
      toast.error(error?.message || 'Failed to delete campaign');
    }
  };

  const handleSend = async (id) => {
    try {
      await sendCampaign.mutateAsync(id);
      toast.success('Campaign queued for sending');
    } catch (error) {
      toast.error(error?.message || 'Failed to send campaign');
    }
  };

  const stats = [
    {
      label: 'Total',
      value: pagination.total || 0,
      icon: 'campaign',
      variant: 'default',
    },
    {
      label: 'Active',
      value: campaigns.filter((c) => c.status === 'active').length,
      icon: 'send',
      variant: 'ice',
    },
    {
      label: 'Scheduled',
      value: campaigns.filter((c) => c.status === 'scheduled').length,
      icon: 'schedule',
      variant: 'ice',
    },
    {
      label: 'Completed',
      value: campaigns.filter((c) => c.status === 'completed').length,
      icon: 'check',
      variant: 'default',
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Campaigns - Sendly SMS Marketing"
        description="Manage your SMS marketing campaigns"
        path="/app/campaigns"
      />
      <div className="min-h-screen pt-8 pb-20 px-4 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-h1 md:text-4xl font-bold mb-2">Campaigns</h1>
              <p className="text-body text-border-subtle">
                Create and manage your SMS marketing campaigns
              </p>
            </div>
            <GlassButton
              variant="primary"
              size="lg"
              as={Link}
              to="/app/campaigns/new"
              className="group"
            >
              <span className="flex items-center gap-2">
                <Icon name="campaign" size="sm" variant="ice" />
                Create Campaign
                <Icon name="arrowRight" size="sm" className="group-hover:translate-x-1 transition-transform" />
              </span>
            </GlassButton>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <GlassCard key={stat.label} variant={stat.variant} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-ice-accent/20">
                    <Icon name={stat.icon} size="md" variant="ice" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-primary-light mb-1">
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-xs text-border-subtle">{stat.label}</p>
              </GlassCard>
            ))}
          </div>

          {/* Filters and Search */}
          <GlassCard className="p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GlassInput
                label="Search Campaigns"
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
              />
              <GlassSelect
                label="Filter by Status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'scheduled', label: 'Scheduled' },
                  { value: 'active', label: 'Active' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
              />
            </div>
          </GlassCard>

          {/* Error State */}
          {error && (
            <GlassCard variant="dark" className="p-6 mb-6 border border-red-500/30">
              <div className="flex items-start gap-3">
                <Icon name="error" size="md" variant="ice" className="text-red-400 flex-shrink-0" />
                <div>
                  <h3 className="text-h3 font-semibold mb-2 text-red-400">Error Loading Campaigns</h3>
                  <p className="text-body text-border-subtle">
                    {error.message || 'Failed to load campaigns. Please try refreshing the page.'}
                  </p>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Campaigns Table */}
          {campaigns.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-xl bg-ice-accent/20">
                  <Icon name="campaign" size="xl" variant="ice" />
                </div>
              </div>
              <h3 className="text-h3 font-semibold mb-2">No campaigns found</h3>
              <p className="text-body text-border-subtle mb-6">
                {searchQuery || statusFilter
                  ? 'Try adjusting your filters'
                  : 'Create your first SMS campaign to get started'}
              </p>
              {!searchQuery && !statusFilter && (
                <GlassButton variant="primary" size="lg" as={Link} to="/app/campaigns/new">
                  Create Campaign
                </GlassButton>
              )}
            </GlassCard>
          ) : (
            <>
              <GlassCard className="p-0 overflow-hidden">
                <GlassTable>
                  <GlassTableHeader>
                    <GlassTableRow>
                      <GlassTableHeaderCell>Name</GlassTableHeaderCell>
                      <GlassTableHeaderCell>Status</GlassTableHeaderCell>
                      <GlassTableHeaderCell>Recipients</GlassTableHeaderCell>
                      <GlassTableHeaderCell>Created</GlassTableHeaderCell>
                      <GlassTableHeaderCell>Actions</GlassTableHeaderCell>
                    </GlassTableRow>
                  </GlassTableHeader>
                  <GlassTableBody>
                    {campaigns.map((campaign) => (
                      <GlassTableRow key={campaign.id}>
                        <GlassTableCell>
                          <div>
                            <Link
                              to={`/app/campaigns/${campaign.id}`}
                              className="font-medium text-ice-accent hover:underline"
                            >
                              {campaign.name}
                            </Link>
                            {campaign.message && (
                              <p className="text-xs text-border-subtle mt-1 truncate max-w-md">
                                {campaign.message}
                              </p>
                            )}
                          </div>
                        </GlassTableCell>
                        <GlassTableCell>
                          <StatusBadge status={campaign.status} />
                        </GlassTableCell>
                        <GlassTableCell>
                          <span className="text-primary-light">
                            {campaign.recipientCount || campaign.totalRecipients || 0}
                          </span>
                        </GlassTableCell>
                        <GlassTableCell>
                          <span className="text-border-subtle text-sm">
                            {campaign.createdAt
                              ? format(new Date(campaign.createdAt), 'MMM d, yyyy')
                              : '-'}
                          </span>
                        </GlassTableCell>
                        <GlassTableCell>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/app/campaigns/${campaign.id}`)}
                              className="p-2 rounded-lg hover:bg-glass-white transition-colors"
                              aria-label="View campaign"
                            >
                              <Icon name="view" size="sm" variant="ice" />
                            </button>
                            {campaign.status === 'draft' && (
                              <button
                                onClick={() => handleSend(campaign.id)}
                                className="p-2 rounded-lg hover:bg-glass-white transition-colors"
                                aria-label="Send campaign"
                              >
                                <Icon name="send" size="sm" variant="ice" />
                              </button>
                            )}
                            {campaign.status === 'draft' && (
                              <button
                                onClick={() => navigate(`/app/campaigns/${campaign.id}/edit`)}
                                className="p-2 rounded-lg hover:bg-glass-white transition-colors"
                                aria-label="Edit campaign"
                              >
                                <Icon name="edit" size="sm" variant="ice" />
                              </button>
                            )}
                            {(campaign.status === 'draft' || campaign.status === 'cancelled') && (
                              <button
                                onClick={() => handleDelete(campaign.id, campaign.name)}
                                className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                                aria-label="Delete campaign"
                              >
                                <Icon name="delete" size="sm" className="text-red-400" />
                              </button>
                            )}
                          </div>
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
    </>
  );
}

