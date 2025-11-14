import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import GlassSelect from '../../components/ui/GlassSelect';
import GlassInput from '../../components/ui/GlassInput';
import GlassPagination from '../../components/ui/GlassPagination';
import StatusBadge from '../../components/ui/StatusBadge';
import GlassModal from '../../components/ui/GlassModal';
import ImportContactsModal from '../../components/contacts/ImportContactsModal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Icon from '../../components/ui/Icon';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import { useContacts, useContactStats, useDeleteContact } from '../../services/queries';
import { useToastContext } from '../../contexts/ToastContext';
import SEO from '../../components/SEO';
import { format } from 'date-fns';

export default function Contacts() {
  const navigate = useNavigate();
  const toast = useToastContext();
  const [page, setPage] = useState(1);
  const [consentFilter, setConsentFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const pageSize = 20;

  const { data, isLoading, error } = useContacts({
    page,
    pageSize,
    consentStatus: consentFilter || undefined,
    search: searchQuery || undefined,
  });

  const { data: stats } = useContactStats();
  const deleteContact = useDeleteContact();

  const contacts = data?.contacts || data?.items || [];
  const pagination = data?.pagination || {};

  const handleDeleteClick = (id, name) => {
    setDeleteTarget({ id, name });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteContact.mutateAsync(deleteTarget.id);
      toast.success('Contact deleted successfully');
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error?.message || 'Failed to delete contact');
      setDeleteTarget(null);
    }
  };

  const statsCards = [
    {
      label: 'Total',
      value: stats?.total || pagination.total || 0,
      icon: 'segment',
      variant: 'default',
    },
    {
      label: 'Opted In',
      value: stats?.optedIn || contacts.filter((c) => c.consentStatus === 'opted_in').length,
      icon: 'check',
      variant: 'ice',
    },
    {
      label: 'Opted Out',
      value: stats?.optedOut || contacts.filter((c) => c.consentStatus === 'opted_out').length,
      icon: 'error',
      variant: 'default',
    },
  ];

  if (isLoading) {
    return <LoadingState size="lg" message="Loading contacts..." />;
  }

  return (
    <>
      <SEO
        title="Contacts - Sendly SMS Marketing"
        description="Manage your SMS marketing contacts"
        path="/app/contacts"
      />
      <div className="min-h-screen pt-8 pb-20 px-6 lg:px-10 bg-neutral-bg-base">
        {/* Header */}
        <PageHeader
          title="Contacts"
          subtitle="Manage your SMS marketing contact list"
        >
          <div className="flex gap-3 mt-4">
            <GlassButton
              variant="ghost"
              size="lg"
              onClick={() => setIsImportModalOpen(true)}
            >
              <span className="flex items-center gap-2">
                <Icon name="import" size="sm" variant="ice" />
                Import Contacts
              </span>
            </GlassButton>
            <GlassButton
              variant="primary"
              size="lg"
              as={Link}
              to="/app/contacts/new"
              className="group"
            >
              <span className="flex items-center gap-2">
                <Icon name="segment" size="sm" variant="ice" />
                Add Contact
                <Icon name="arrowRight" size="sm" className="group-hover:translate-x-1 transition-transform" />
              </span>
            </GlassButton>
          </div>
        </PageHeader>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {statsCards.map((stat) => (
            <GlassCard key={stat.label} variant={stat.variant} className="p-5 hover:shadow-glass-light-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-ice-soft/80">
                  <Icon name={stat.icon} size="md" variant="ice" />
                </div>
              </div>
              <p className="text-2xl font-bold text-neutral-text-primary mb-1">
                {stat.value.toLocaleString()}
              </p>
              <p className="text-xs font-medium text-neutral-text-secondary uppercase tracking-wider">{stat.label}</p>
            </GlassCard>
          ))}
        </div>

        {/* Filters and Search */}
        <GlassCard className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GlassInput
              label="Search Contacts"
              type="text"
              placeholder="Search by name, phone, or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
            />
            <GlassSelect
              label="Filter by Consent Status"
              value={consentFilter}
              onChange={(e) => {
                setConsentFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'opted_in', label: 'Opted In' },
                { value: 'opted_out', label: 'Opted Out' },
                { value: 'pending', label: 'Pending' },
              ]}
            />
          </div>
        </GlassCard>

        {/* Error State */}
        {error && (
          <ErrorState
            title="Error Loading Contacts"
            message={error.message || 'Failed to load contacts. Please try refreshing the page.'}
            onAction={() => window.location.reload()}
            actionLabel="Refresh Page"
          />
        )}

        {/* Contacts Table */}
        {contacts.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-xl bg-ice-soft/80">
                <Icon name="segment" size="xl" variant="ice" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-neutral-text-primary">No contacts found</h3>
            <p className="text-sm text-neutral-text-secondary mb-6">
              {searchQuery || consentFilter
                ? 'Try adjusting your filters'
                : 'Import contacts or add your first contact to get started'}
            </p>
            {!searchQuery && !consentFilter && (
              <div className="flex gap-4 justify-center">
                <GlassButton variant="ghost" size="lg" onClick={() => setIsImportModalOpen(true)}>
                  Import Contacts
                </GlassButton>
                <GlassButton variant="primary" size="lg" as={Link} to="/app/contacts/new">
                  Add Contact
                </GlassButton>
              </div>
            )}
          </GlassCard>
        ) : (
          <>
            <GlassCard className="p-0 overflow-hidden">
              <GlassTable>
                <GlassTableHeader>
                  <GlassTableRow>
                    <GlassTableHeaderCell>Name</GlassTableHeaderCell>
                    <GlassTableHeaderCell>Phone</GlassTableHeaderCell>
                    <GlassTableHeaderCell>Email</GlassTableHeaderCell>
                    <GlassTableHeaderCell>Tags</GlassTableHeaderCell>
                    <GlassTableHeaderCell>Consent Status</GlassTableHeaderCell>
                    <GlassTableHeaderCell>Actions</GlassTableHeaderCell>
                  </GlassTableRow>
                </GlassTableHeader>
                <GlassTableBody>
                  {contacts.map((contact) => (
                    <GlassTableRow key={contact.id}>
                      <GlassTableCell>
                        <Link
                          to={`/app/contacts/${contact.id}`}
                          className="font-semibold text-ice-primary hover:underline"
                        >
                          {contact.firstName && contact.lastName
                            ? `${contact.firstName} ${contact.lastName}`
                            : contact.name || 'Unnamed Contact'}
                        </Link>
                      </GlassTableCell>
                      <GlassTableCell>
                        <span className="text-neutral-text-primary">{contact.phone || '-'}</span>
                      </GlassTableCell>
                      <GlassTableCell>
                        <span className="text-neutral-text-primary">{contact.email || '-'}</span>
                      </GlassTableCell>
                      <GlassTableCell>
                        <div className="flex flex-wrap gap-1">
                          {contact.tags && contact.tags.length > 0 ? (
                            contact.tags.slice(0, 2).map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 text-xs rounded-full bg-ice-soft/60 border border-ice-primary/20 text-ice-primary font-medium"
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-neutral-text-secondary text-sm">-</span>
                          )}
                          {contact.tags && contact.tags.length > 2 && (
                            <span className="text-neutral-text-secondary text-xs">+{contact.tags.length - 2}</span>
                          )}
                        </div>
                      </GlassTableCell>
                      <GlassTableCell>
                        <StatusBadge status={contact.consentStatus} />
                      </GlassTableCell>
                      <GlassTableCell>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/app/contacts/${contact.id}`)}
                            className="p-2 rounded-lg hover:bg-neutral-surface-secondary transition-colors"
                            aria-label="View contact"
                          >
                            <Icon name="view" size="sm" variant="ice" />
                          </button>
                          <button
                            onClick={() => navigate(`/app/contacts/${contact.id}/edit`)}
                            className="p-2 rounded-lg hover:bg-neutral-surface-secondary transition-colors"
                            aria-label="Edit contact"
                          >
                            <Icon name="edit" size="sm" variant="ice" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(contact.id, contact.name || contact.firstName || 'this contact')}
                            className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                            aria-label="Delete contact"
                          >
                            <Icon name="delete" size="sm" className="text-red-500" />
                          </button>
                        </div>
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

      {/* Import Modal */}
      <ImportContactsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
      
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Contact"
        message={deleteTarget ? `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.` : ''}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive={true}
      />
    </>
  );
}

