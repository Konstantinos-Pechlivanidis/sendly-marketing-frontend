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
import GlassModal from '../../components/ui/GlassModal';
import ImportContactsModal from '../../components/contacts/ImportContactsModal';
import Icon from '../../components/ui/Icon';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
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

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name || 'this contact'}"?`)) return;

    try {
      await deleteContact.mutateAsync(id);
      toast.success('Contact deleted successfully');
    } catch (error) {
      toast.error(error?.message || 'Failed to delete contact');
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Contacts - Sendly SMS Marketing"
        description="Manage your SMS marketing contacts"
        path="/app/contacts"
      />
      <div className="min-h-screen pt-8 pb-20 px-4 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-h1 md:text-4xl font-bold mb-2">Contacts</h1>
              <p className="text-body text-border-subtle">
                Manage your SMS marketing contact list
              </p>
            </div>
            <div className="flex gap-2">
              <GlassButton
                variant="ghost"
                size="lg"
                onClick={() => setIsImportModalOpen(true)}
                className="group"
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
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {statsCards.map((stat) => (
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
            <GlassCard variant="dark" className="p-6 mb-6 border border-red-500/30">
              <div className="flex items-start gap-3">
                <Icon name="error" size="md" variant="ice" className="text-red-400 flex-shrink-0" />
                <div>
                  <h3 className="text-h3 font-semibold mb-2 text-red-400">Error Loading Contacts</h3>
                  <p className="text-body text-border-subtle">
                    {error.message || 'Failed to load contacts. Please try refreshing the page.'}
                  </p>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Contacts Table */}
          {contacts.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-xl bg-ice-accent/20">
                  <Icon name="segment" size="xl" variant="ice" />
                </div>
              </div>
              <h3 className="text-h3 font-semibold mb-2">No contacts found</h3>
              <p className="text-body text-border-subtle mb-6">
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
                            className="font-medium text-ice-accent hover:underline"
                          >
                            {contact.firstName && contact.lastName
                              ? `${contact.firstName} ${contact.lastName}`
                              : contact.name || 'Unnamed Contact'}
                          </Link>
                        </GlassTableCell>
                        <GlassTableCell>
                          <span className="text-primary-light">{contact.phone || '-'}</span>
                        </GlassTableCell>
                        <GlassTableCell>
                          <span className="text-primary-light">{contact.email || '-'}</span>
                        </GlassTableCell>
                        <GlassTableCell>
                          <div className="flex flex-wrap gap-1">
                            {contact.tags && contact.tags.length > 0 ? (
                              contact.tags.slice(0, 2).map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 text-xs rounded bg-glass-white border border-glass-border text-border-subtle"
                                >
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-border-subtle text-sm">-</span>
                            )}
                            {contact.tags && contact.tags.length > 2 && (
                              <span className="text-border-subtle text-xs">+{contact.tags.length - 2}</span>
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
                              className="p-2 rounded-lg hover:bg-glass-white transition-colors"
                              aria-label="View contact"
                            >
                              <Icon name="view" size="sm" variant="ice" />
                            </button>
                            <button
                              onClick={() => navigate(`/app/contacts/${contact.id}/edit`)}
                              className="p-2 rounded-lg hover:bg-glass-white transition-colors"
                              aria-label="Edit contact"
                            >
                              <Icon name="edit" size="sm" variant="ice" />
                            </button>
                            <button
                              onClick={() => handleDelete(contact.id, contact.name || contact.firstName)}
                              className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                              aria-label="Delete contact"
                            >
                              <Icon name="delete" size="sm" className="text-red-400" />
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

      {/* Import Modal */}
      <ImportContactsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </>
  );
}

