import { useParams, useNavigate, Link } from 'react-router-dom';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import StatusBadge from '../../components/ui/StatusBadge';
import Icon from '../../components/ui/Icon';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  useCampaign,
  useDeleteCampaign,
  useSendCampaign,
  useScheduleCampaign,
  useCampaignMetrics,
} from '../../services/queries';
import { useToastContext } from '../../contexts/ToastContext';
import SEO from '../../components/SEO';
import { format } from 'date-fns';

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToastContext();

  const { data: campaign, isLoading, error } = useCampaign(id);
  const { data: metrics } = useCampaignMetrics(id);
  const deleteCampaign = useDeleteCampaign();
  const sendCampaign = useSendCampaign();
  const scheduleCampaign = useScheduleCampaign();

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${campaign?.name}"?`)) return;

    try {
      await deleteCampaign.mutateAsync(id);
      toast.success('Campaign deleted successfully');
      navigate('/app/campaigns');
    } catch (error) {
      toast.error(error?.message || 'Failed to delete campaign');
    }
  };

  const handleSend = async () => {
    try {
      await sendCampaign.mutateAsync(id);
      toast.success('Campaign queued for sending');
    } catch (error) {
      toast.error(error?.message || 'Failed to send campaign');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen pt-8 pb-20 px-4 lg:px-8">
        <div className="max-w-[1200px] mx-auto">
          <GlassCard variant="dark" className="p-6 border border-red-500/30">
            <div className="flex items-start gap-3">
              <Icon name="error" size="md" variant="ice" className="text-red-400 flex-shrink-0" />
              <div>
                <h3 className="text-h3 font-semibold mb-2 text-red-400">Campaign Not Found</h3>
                <p className="text-body text-border-subtle mb-4">
                  {error?.message || 'The campaign you are looking for does not exist.'}
                </p>
                <GlassButton variant="primary" onClick={() => navigate('/app/campaigns')}>
                  Back to Campaigns
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  const canEdit = campaign.status === 'draft' || campaign.status === 'scheduled';
  const canDelete = campaign.status === 'draft' || campaign.status === 'cancelled';
  const canSend = campaign.status === 'draft' || campaign.status === 'scheduled';

  return (
    <>
      <SEO
        title={`${campaign.name} - Campaign Details`}
        description="View campaign details and metrics"
        path={`/app/campaigns/${id}`}
      />
      <div className="min-h-screen pt-8 pb-20 px-4 lg:px-8">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/app/campaigns')}
                >
                  <Icon name="arrowRight" size="sm" className="rotate-180" />
                </GlassButton>
                <h1 className="text-h1 md:text-4xl font-bold">{campaign.name}</h1>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <StatusBadge status={campaign.status} />
                {campaign.createdAt && (
                  <span className="text-sm text-border-subtle">
                    Created {format(new Date(campaign.createdAt), 'MMM d, yyyy')}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {canSend && (
                <GlassButton variant="primary" size="md" onClick={handleSend}>
                  <span className="flex items-center gap-2">
                    <Icon name="send" size="sm" variant="ice" />
                    Send Now
                  </span>
                </GlassButton>
              )}
              {canEdit && (
                <GlassButton
                  variant="ghost"
                  size="md"
                  as={Link}
                  to={`/app/campaigns/${id}/edit`}
                >
                  <span className="flex items-center gap-2">
                    <Icon name="edit" size="sm" variant="ice" />
                    Edit
                  </span>
                </GlassButton>
              )}
              {canDelete && (
                <GlassButton variant="ghost" size="md" onClick={handleDelete}>
                  <span className="flex items-center gap-2">
                    <Icon name="delete" size="sm" className="text-red-400" />
                    Delete
                  </span>
                </GlassButton>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Campaign Details */}
              <GlassCard className="p-6">
                <h2 className="text-h2 font-bold mb-4">Campaign Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-border-subtle">Message</label>
                    <p className="text-primary-light mt-1 whitespace-pre-wrap">{campaign.message}</p>
                  </div>
                  {campaign.audience && (
                    <div>
                      <label className="text-sm font-medium text-border-subtle">Audience</label>
                      <p className="text-primary-light mt-1">{campaign.audience}</p>
                    </div>
                  )}
                  {campaign.scheduleAt && (
                    <div>
                      <label className="text-sm font-medium text-border-subtle">Scheduled For</label>
                      <p className="text-primary-light mt-1">
                        {format(new Date(campaign.scheduleAt), 'PPp')}
                      </p>
                    </div>
                  )}
                </div>
              </GlassCard>

              {/* Metrics */}
              {metrics && (
                <GlassCard className="p-6">
                  <h2 className="text-h2 font-bold mb-4">Performance Metrics</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-border-subtle mb-1">Sent</p>
                      <p className="text-2xl font-bold text-primary-light">
                        {metrics.sent || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-border-subtle mb-1">Delivered</p>
                      <p className="text-2xl font-bold text-ice-accent">
                        {metrics.delivered || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-border-subtle mb-1">Failed</p>
                      <p className="text-2xl font-bold text-red-400">
                        {metrics.failed || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-border-subtle mb-1">Delivery Rate</p>
                      <p className="text-2xl font-bold text-ice-accent">
                        {metrics.deliveryRate ? `${metrics.deliveryRate.toFixed(1)}%` : '0%'}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info */}
              <GlassCard variant="ice" className="p-6">
                <h3 className="text-h3 font-semibold mb-4">Quick Info</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-border-subtle mb-1">Recipients</p>
                    <p className="text-lg font-semibold text-primary-light">
                      {campaign.recipientCount || campaign.totalRecipients || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-border-subtle mb-1">Status</p>
                    <StatusBadge status={campaign.status} />
                  </div>
                  {campaign.createdAt && (
                    <div>
                      <p className="text-xs text-border-subtle mb-1">Created</p>
                      <p className="text-sm text-primary-light">
                        {format(new Date(campaign.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

