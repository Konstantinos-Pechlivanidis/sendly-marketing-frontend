import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import PageHeader from '../../components/ui/PageHeader';
import GlassInput from '../../components/ui/GlassInput';
import GlassSelectCustom from '../../components/ui/GlassSelectCustom';
import Icon from '../../components/ui/Icon';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { useTemplates, useTemplateCategories, useTrackTemplateUsage } from '../../services/queries';
import { useToastContext } from '../../contexts/ToastContext';
import { normalizeArrayResponse } from '../../utils/apiHelpers';
import SEO from '../../components/SEO';

export default function Templates() {
  const navigate = useNavigate();
  const toast = useToastContext();
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: templatesData, isLoading, error } = useTemplates({
    category: categoryFilter || undefined,
    search: searchQuery || undefined,
  });
  const { data: categoriesData } = useTemplateCategories();
  const trackUsage = useTrackTemplateUsage();

  const templates = normalizeArrayResponse(templatesData, 'templates');
  const categories = normalizeArrayResponse(categoriesData, 'categories');

  const handleUseTemplate = async (template) => {
    try {
      // Track template usage
      if (template.id) {
        await trackUsage.mutateAsync(template.id);
      }
      
      // Navigate to campaign create with template pre-filled
      navigate('/app/campaigns/new', {
        state: {
          template: {
            message: template.message || template.content,
            name: template.name,
          },
        },
      });
    } catch (error) {
      // Error already handled by toast.error above
      // Still navigate even if tracking fails
      navigate('/app/campaigns/new', {
        state: {
          template: {
            message: template.message || template.content,
            name: template.name,
          },
        },
      });
    }
  };

  // Only show full loading state on initial load (no cached data)
  // If we have cached data, show it immediately even if fetching
  const isInitialLoad = isLoading && !templatesData;

  if (isInitialLoad) {
    return <LoadingState size="lg" message="Loading templates..." />;
  }

  return (
    <>
      <SEO
        title="Templates - Sendly SMS Marketing"
        description="Browse and use SMS message templates"
        path="/app/templates"
      />
      <div className="min-h-screen pt-6 pb-16 px-4 sm:px-6 lg:px-10 bg-neutral-bg-base">
        {/* Header */}
        <PageHeader
          title="Templates"
          subtitle="Browse and use pre-built SMS message templates"
        />

        {/* Filters */}
        <GlassCard className="p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Search Templates"
              type="text"
              placeholder="Search by name or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <GlassSelectCustom
              label="Filter by Category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={[
                { value: '', label: 'All Categories' },
                ...categories.map((cat) => ({
                  value: cat.id || cat.name,
                  label: cat.name || cat.id,
                })),
              ]}
            />
          </div>
        </GlassCard>

        {/* Error State */}
        {error && (
          <ErrorState
            title="Error Loading Templates"
            message={error.message || 'Failed to load templates. Please try refreshing the page.'}
            onAction={() => window.location.reload()}
            actionLabel="Refresh Page"
          />
        )}

        {/* Templates Grid */}
        {!error && templates.length === 0 ? (
          <EmptyState
            icon="templates"
            title="No templates found"
            message={searchQuery || categoryFilter
              ? 'Try adjusting your filters'
              : 'No templates available at the moment'}
          />
        ) : !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {templates.map((template) => (
              <GlassCard key={template.id} className="p-6 hover:shadow-glass-light-lg transition-shadow">
                <div className="mb-4">
                  {template.category && (
                    <span className="inline-block px-3 py-1 text-xs rounded-full bg-ice-soft/60 border border-ice-primary/20 text-ice-primary font-medium mb-2">
                      {template.category}
                    </span>
                  )}
                  <h3 className="text-xl font-semibold mb-2 text-neutral-text-primary">{template.name}</h3>
                  <p className="text-sm text-neutral-text-secondary line-clamp-3">
                    {template.message || template.content}
                  </p>
                </div>
                
                {template.useCount !== undefined && (
                  <div className="mb-4">
                    <p className="text-xs text-neutral-text-secondary">
                      Used {template.useCount} time{template.useCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}

                <GlassButton
                  variant="primary"
                  size="md"
                  onClick={() => handleUseTemplate(template)}
                  className="w-full"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Icon name="campaign" size="sm" variant="ice" />
                    Use Template
                  </span>
                </GlassButton>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

