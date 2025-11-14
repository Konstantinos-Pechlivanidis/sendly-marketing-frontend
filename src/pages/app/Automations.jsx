import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import GlassSelect from '../../components/ui/GlassSelect';
import StatusBadge from '../../components/ui/StatusBadge';
import Icon from '../../components/ui/Icon';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useAutomations, useAutomationStats, useUpdateAutomation, useDeleteCampaign } from '../../services/queries';
import { useToastContext } from '../../contexts/ToastContext';
import { normalizeArrayResponse } from '../../utils/apiHelpers';
import SEO from '../../components/SEO';
import { format } from 'date-fns';

export default function Automations() {
  const navigate = useNavigate();
  const toast = useToastContext();
  const [statusFilter, setStatusFilter] = useState('');

  const { data: automationsData, isLoading, error } = useAutomations();
  const { data: stats } = useAutomationStats();
  const updateAutomation = useUpdateAutomation();
  const deleteAutomation = useDeleteCampaign(); // Reuse delete campaign mutation

  const automations = normalizeArrayResponse(automationsData, 'automations');

  const filteredAutomations = statusFilter
    ? automations.filter((a) => a.status === statusFilter)
    : automations;

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      await updateAutomation.mutateAsync({ id, status: newStatus });
      toast.success(`Automation ${newStatus === 'active' ? 'activated' : 'paused'}`);
    } catch (error) {
      toast.error(error?.message || 'Failed to update automation');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await deleteAutomation.mutateAsync(id);
      toast.success('Automation deleted successfully');
    } catch (error) {
      toast.error(error?.message || 'Failed to delete automation');
    }
  };

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
        title="Automations - Sendly SMS Marketing"
        description="Manage your SMS marketing automations"
        path="/app/automations"
      />
      <div className="min-h-screen pt-8 pb-20 px-4 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-h1 md:text-4xl font-bold mb-2">Automations</h1>
              <p className="text-body text-border-subtle">
                Set up automated SMS workflows for your store
              </p>
            </div>
            <GlassButton
              variant="primary"
              size="lg"
              as={Link}
              to="/app/automations/new"
              className="group"
            >
              <span className="flex items-center gap-2">
                <Icon name="automation" size="sm" variant="ice" />
                Create Automation
                <Icon name="arrowRight" size="sm" className="group-hover:translate-x-1 transition-transform" />
              </span>
            </GlassButton>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <GlassCard variant="ice" className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-ice-accent/20">
                    <Icon name="automation" size="md" variant="ice" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-primary-light mb-1">
                  {stats.total || automations.length}
                </p>
                <p className="text-xs text-border-subtle">Total Automations</p>
              </GlassCard>
              <GlassCard className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-ice-accent/20">
                    <Icon name="send" size="md" variant="ice" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-primary-light mb-1">
                  {stats.messagesSent || 0}
                </p>
                <p className="text-xs text-border-subtle">Messages Sent</p>
              </GlassCard>
              <GlassCard className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-ice-accent/20">
                    <Icon name="check" size="md" variant="ice" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-primary-light mb-1">
                  {stats.successRate ? `${stats.successRate.toFixed(1)}%` : '0%'}
                </p>
                <p className="text-xs text-border-subtle">Success Rate</p>
              </GlassCard>
            </div>
          )}

          {/* Filter */}
          <GlassCard className="p-6 mb-6">
            <GlassSelect
              label="Filter by Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'paused', label: 'Paused' },
                { value: 'draft', label: 'Draft' },
              ]}
            />
          </GlassCard>

          {/* Error State */}
          {error && (
            <GlassCard variant="dark" className="p-6 mb-6 border border-red-500/30">
              <div className="flex items-start gap-3">
                <Icon name="error" size="md" variant="ice" className="text-red-400 flex-shrink-0" />
                <div>
                  <h3 className="text-h3 font-semibold mb-2 text-red-400">Error Loading Automations</h3>
                  <p className="text-body text-border-subtle">
                    {error.message || 'Failed to load automations. Please try refreshing the page.'}
                  </p>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Automations Grid */}
          {filteredAutomations.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-xl bg-ice-accent/20">
                  <Icon name="automation" size="xl" variant="ice" />
                </div>
              </div>
              <h3 className="text-h3 font-semibold mb-2">No automations found</h3>
              <p className="text-body text-border-subtle mb-6">
                {statusFilter
                  ? 'Try adjusting your filters'
                  : 'Create your first automation to get started'}
              </p>
              {!statusFilter && (
                <GlassButton variant="primary" size="lg" as={Link} to="/app/automations/new">
                  Create Automation
                </GlassButton>
              )}
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAutomations.map((automation) => (
                <GlassCard key={automation.id} className="p-6 hover:scale-[1.02] transition-transform">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-h3 font-semibold mb-2">{automation.name}</h3>
                      <StatusBadge status={automation.status} />
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {automation.trigger && (
                      <div>
                        <p className="text-xs text-border-subtle mb-1">Trigger</p>
                        <p className="text-sm text-primary-light">{automation.trigger}</p>
                      </div>
                    )}
                    {automation.message && (
                      <div>
                        <p className="text-xs text-border-subtle mb-1">Message</p>
                        <p className="text-sm text-primary-light line-clamp-2">
                          {automation.message}
                        </p>
                      </div>
                    )}
                    {automation.messagesSent !== undefined && (
                      <div>
                        <p className="text-xs text-border-subtle mb-1">Messages Sent</p>
                        <p className="text-sm text-primary-light">{automation.messagesSent || 0}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-glass-border">
                    <button
                      onClick={() => navigate(`/app/automations/${automation.id}`)}
                      className="flex-1 px-3 py-2 text-sm rounded-lg glass border border-glass-border hover:border-ice-accent transition-colors text-primary-light"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleToggleStatus(automation.id, automation.status)}
                      className="flex-1 px-3 py-2 text-sm rounded-lg glass border border-glass-border hover:border-ice-accent transition-colors text-primary-light"
                    >
                      {automation.status === 'active' ? 'Pause' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(automation.id, automation.name)}
                      className="px-3 py-2 text-sm rounded-lg glass border border-red-500/30 hover:border-red-500 transition-colors text-red-400"
                    >
                      <Icon name="delete" size="sm" />
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

