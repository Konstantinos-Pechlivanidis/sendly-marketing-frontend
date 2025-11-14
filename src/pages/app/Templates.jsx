import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import GlassInput from '../../components/ui/GlassInput';
import GlassSelect from '../../components/ui/GlassSelect';
import Icon from '../../components/ui/Icon';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useTemplates, useTemplateCategories, useTrackTemplateUsage } from '../../services/queries';
import { useToastContext } from '../../contexts/ToastContext';
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
        title="Templates - Sendly SMS Marketing"
        description="Browse and use SMS message templates"
        path="/app/templates"
      />
      <div className="min-h-screen pt-8 pb-20 px-4 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-h1 md:text-4xl font-bold mb-2">Templates</h1>
            <p className="text-body text-border-subtle">
              Browse and use pre-built SMS message templates
            </p>
          </div>

          {/* Filters */}
          <GlassCard className="p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GlassInput
                label="Search Templates"
                type="text"
                placeholder="Search by name or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <GlassSelect
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
            <GlassCard variant="dark" className="p-6 mb-6 border border-red-500/30">
              <div className="flex items-start gap-3">
                <Icon name="error" size="md" variant="ice" className="text-red-400 flex-shrink-0" />
                <div>
                  <h3 className="text-h3 font-semibold mb-2 text-red-400">Error Loading Templates</h3>
                  <p className="text-body text-border-subtle">
                    {error.message || 'Failed to load templates. Please try refreshing the page.'}
                  </p>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Templates Grid */}
          {templates.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-xl bg-ice-accent/20">
                  <Icon name="templates" size="xl" variant="ice" />
                </div>
              </div>
              <h3 className="text-h3 font-semibold mb-2">No templates found</h3>
              <p className="text-body text-border-subtle">
                {searchQuery || categoryFilter
                  ? 'Try adjusting your filters'
                  : 'No templates available at the moment'}
              </p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <GlassCard key={template.id} className="p-6 hover:scale-[1.02] transition-transform">
                  <div className="mb-4">
                    {template.category && (
                      <span className="inline-block px-3 py-1 text-xs rounded-lg bg-ice-accent/20 text-ice-accent mb-2">
                        {template.category}
                      </span>
                    )}
                    <h3 className="text-h3 font-semibold mb-2">{template.name}</h3>
                    <p className="text-sm text-border-subtle line-clamp-3">
                      {template.message || template.content}
                    </p>
                  </div>
                  
                  {template.useCount !== undefined && (
                    <div className="mb-4">
                      <p className="text-xs text-border-subtle">
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
      </div>
    </>
  );
}

