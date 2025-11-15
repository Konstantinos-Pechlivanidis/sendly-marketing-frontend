import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import GlassInput from '../../components/ui/GlassInput';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import Icon from '../../components/ui/Icon';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useContact, useUpdateContact, useDeleteContact, useCreateContact } from '../../services/queries';
import { useToastContext } from '../../contexts/ToastContext';
import SEO from '../../components/SEO';
import { format } from 'date-fns';

export default function ContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToastContext();
  const isNewContact = !id || id === 'new';
  const [isEditing, setIsEditing] = useState(isNewContact);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    tags: [],
  });
  const [errors, setErrors] = useState({});

  const { data: contact, isLoading, error } = useContact(id, { enabled: !isNewContact });
  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();
  const createContact = useCreateContact();

  useEffect(() => {
    if (contact && !isNewContact) {
      setFormData({
        firstName: contact.firstName || '',
        lastName: contact.lastName || '',
        phone: contact.phone || '',
        email: contact.email || '',
        tags: contact.tags || [],
      });
    }
  }, [contact, isNewContact]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      // Basic phone validation (digits, spaces, +, -, parentheses)
      const phoneRegex = /^[\d\s\+\-\(\)]+$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }
    
    if (formData.email && formData.email.trim()) {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      if (isNewContact) {
        const result = await createContact.mutateAsync(formData);
        toast.success('Contact created successfully');
        if (result?.id) {
          navigate(`/app/contacts/${result.id}`, { replace: true });
        }
      } else {
        await updateContact.mutateAsync({ id, ...formData });
        toast.success('Contact updated successfully');
        setIsEditing(false);
      }
    } catch (error) {
      toast.error(error?.message || `Failed to ${isNewContact ? 'create' : 'update'} contact`);
    }
  };

  const handleDelete = async () => {
    if (isNewContact) {
      navigate('/app/contacts');
      return;
    }

    try {
      await deleteContact.mutateAsync(id);
      toast.success('Contact deleted successfully');
      navigate('/app/contacts');
    } catch (error) {
      toast.error(error?.message || 'Failed to delete contact');
    }
  };

  // Only show full loading state on initial load (no cached data)
  // If we have cached data, show it immediately even if fetching
  const isInitialLoad = !isNewContact && isLoading && !contactData;

  if (isInitialLoad) {
    return <LoadingState size="lg" />;
  }

  if (!isNewContact && error && !contact) {
    return (
      <div className="min-h-screen pt-8 pb-20 px-6 lg:px-10 bg-neutral-bg-base">
        <div className="max-w-[1200px] mx-auto">
          <ErrorState
            title="Contact Not Found"
            message={error?.message || 'The contact you are looking for does not exist.'}
            actionLabel="Back to Contacts"
            onAction={() => navigate('/app/contacts')}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={isNewContact ? 'New Contact' : `${contact?.firstName || contact?.name || 'Contact'} - Contact Details`}
        description="View and edit contact details"
        path={isNewContact ? '/app/contacts/new' : `/app/contacts/${id}`}
      />
      <div className="min-h-screen pt-8 pb-20 px-6 lg:px-10 bg-neutral-bg-base">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={() => navigate('/app/contacts')}
              >
                <Icon name="arrowRight" size="sm" className="rotate-180" />
              </GlassButton>
            </div>
            <PageHeader
              title={
                isNewContact 
                  ? 'New Contact'
                  : contact?.firstName && contact?.lastName
                  ? `${contact.firstName} ${contact.lastName}`
                  : contact?.name || 'Unnamed Contact'
              }
              subtitle={
                !isNewContact ? (
                  <div className="flex items-center gap-3 mt-2">
                    <StatusBadge status={contact?.consentStatus} />
                    {contact?.createdAt && (
                      <span className="text-sm text-neutral-text-secondary">
                        Added {format(new Date(contact.createdAt), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                ) : undefined
              }
              action={
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      {!isNewContact && (
                        <GlassButton variant="ghost" size="md" onClick={() => setIsEditing(false)}>
                          Cancel
                        </GlassButton>
                      )}
                      <GlassButton 
                        variant="primary" 
                        size="md" 
                        onClick={handleSave}
                        disabled={createContact.isPending || updateContact.isPending}
                      >
                        {createContact.isPending || updateContact.isPending ? (
                          <span className="flex items-center gap-2">
                            <LoadingSpinner size="sm" />
                            Saving...
                          </span>
                        ) : (
                          isNewContact ? 'Create Contact' : 'Save Changes'
                        )}
                      </GlassButton>
                    </>
                  ) : !isNewContact && (
                    <>
                      <GlassButton
                        variant="ghost"
                        size="md"
                        onClick={() => setIsEditing(true)}
                      >
                        <span className="flex items-center gap-2">
                          <Icon name="edit" size="sm" variant="ice" />
                          Edit
                        </span>
                      </GlassButton>
                      <GlassButton variant="ghost" size="md" onClick={() => setShowDeleteDialog(true)}>
                        <span className="flex items-center gap-2">
                          <Icon name="delete" size="sm" className="text-red-500" />
                          Delete
                        </span>
                      </GlassButton>
                    </>
                  )}
                </div>
              }
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Details */}
              <GlassCard className="p-6">
                <h2 className="text-2xl font-bold mb-4 text-neutral-text-primary">Contact Details</h2>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <GlassInput
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                      <GlassInput
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                    </div>
                    <GlassInput
                      label="Phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                    <GlassInput
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                ) : !isNewContact && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-neutral-text-secondary mb-1">Name</label>
                      <p className="text-neutral-text-primary mt-1">
                        {contact?.firstName && contact?.lastName
                          ? `${contact.firstName} ${contact.lastName}`
                          : contact?.name || 'Unnamed Contact'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-text-secondary mb-1">Phone</label>
                      <p className="text-neutral-text-primary mt-1">{contact?.phone || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-text-secondary mb-1">Email</label>
                      <p className="text-neutral-text-primary mt-1">{contact?.email || '-'}</p>
                    </div>
                    {contact?.tags && contact.tags.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-neutral-text-secondary mb-1">Tags</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {contact.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 text-sm rounded-full bg-ice-soft/60 border border-ice-primary/20 text-ice-primary font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </GlassCard>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info */}
              <GlassCard variant="ice" className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-neutral-text-primary">Quick Info</h3>
                <div className="space-y-3">
                  {!isNewContact && (
                    <>
                      <div>
                        <p className="text-xs font-medium text-neutral-text-secondary mb-1 uppercase tracking-wider">Consent Status</p>
                        <StatusBadge status={contact?.consentStatus} />
                      </div>
                      {contact?.createdAt && (
                        <div>
                          <p className="text-xs font-medium text-neutral-text-secondary mb-1 uppercase tracking-wider">Created</p>
                          <p className="text-sm text-neutral-text-primary">
                            {format(new Date(contact.createdAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      )}
                      {contact?.updatedAt && (
                        <div>
                          <p className="text-xs font-medium text-neutral-text-secondary mb-1 uppercase tracking-wider">Last Updated</p>
                          <p className="text-sm text-neutral-text-primary">
                            {format(new Date(contact.updatedAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
      
      {!isNewContact && (
        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDelete}
          title="Delete Contact"
          message="Are you sure you want to delete this contact? This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          destructive={true}
        />
      )}
    </>
  );
}

