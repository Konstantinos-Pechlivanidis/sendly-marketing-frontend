import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import GlassInput from '../../components/ui/GlassInput';
import GlassTextarea from '../../components/ui/GlassTextarea';
import GlassSelect from '../../components/ui/GlassSelect';
import IPhonePreviewWithDiscount from '../../components/iphone/IPhonePreviewWithDiscount';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { 
  useCreateCampaign, 
  useUpdateCampaign, 
  useSendCampaign,
  useCampaign,
  useAudiences,
  useDiscounts,
  useSettings,
} from '../../services/queries';
import { useToastContext } from '../../contexts/ToastContext';
import { countSMSCharacters } from '../../utils/smsParser';
import { normalizeArrayResponse } from '../../utils/apiHelpers';
import { format } from 'date-fns';
import SEO from '../../components/SEO';

export default function CampaignCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();
  const sendCampaign = useSendCampaign();
  const { data: existingCampaign, isLoading: isLoadingCampaign } = useCampaign(id);
  const { data: audiencesData } = useAudiences();
  const { data: discountsData } = useDiscounts();
  const { data: settingsData } = useSettings();
  const toast = useToastContext();
  
  // Check for template from Templates page
  const templateFromState = location.state?.template;
  
  const [formData, setFormData] = useState({
    name: templateFromState?.name || '',
    message: templateFromState?.message || '',
    audience: 'all',
    scheduleType: 'immediate',
    scheduleAt: '',
    discountId: null,
    senderId: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isScheduled, setIsScheduled] = useState(false);

  // Load existing campaign data if editing
  useEffect(() => {
    if (isEditMode && existingCampaign) {
      setFormData({
        name: existingCampaign.name || '',
        message: existingCampaign.message || '',
        audience: existingCampaign.audience || 'all',
        scheduleType: existingCampaign.scheduleType || 'immediate',
        scheduleAt: existingCampaign.scheduleAt || '',
        discountId: existingCampaign.discountId || null,
        senderId: existingCampaign.senderId || '',
      });
      setIsScheduled(existingCampaign.scheduleType === 'scheduled');
    }
  }, [isEditMode, existingCampaign]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleScheduleToggle = () => {
    setIsScheduled(!isScheduled);
    if (!isScheduled) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      setFormData((prev) => ({
        ...prev,
        scheduleType: 'scheduled',
        scheduleAt: tomorrow.toISOString(),
      }));
    } else {
      setFormData((prev) => ({ 
        ...prev, 
        scheduleType: 'immediate',
        scheduleAt: '' 
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Campaign name is required';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    } else if (formData.message.trim().length > 1600) {
      newErrors.message = 'Message is too long (max 1600 characters)';
    }
    
    if (isScheduled && !formData.scheduleAt) {
      newErrors.scheduleAt = 'Scheduled date and time is required';
    } else if (formData.scheduleAt) {
      const scheduleDate = new Date(formData.scheduleAt);
      if (scheduleDate <= new Date()) {
        newErrors.scheduleAt = 'Schedule date must be in the future';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = async () => {
    if (!validate()) return;
    
    try {
      const campaignData = {
        name: formData.name.trim(),
        message: formData.message.trim(),
        audience: formData.audience,
        scheduleType: 'immediate',
        discountId: formData.discountId || null,
        senderId: formData.senderId || undefined,
      };
      
      let result;
      if (isEditMode) {
        result = await updateCampaign.mutateAsync({ id, ...campaignData });
      } else {
        result = await createCampaign.mutateAsync(campaignData);
      }
      
      if (result?.id) {
        toast.success(`Campaign ${isEditMode ? 'updated' : 'saved'} as draft successfully`);
        navigate('/app/campaigns');
      }
    } catch (error) {
      toast.error(error?.message || `Failed to ${isEditMode ? 'update' : 'save'} campaign draft. Please try again.`);
    }
  };

  const handleSend = async () => {
    if (!validate()) return;
    
    try {
      const campaignData = {
        name: formData.name.trim(),
        message: formData.message.trim(),
        audience: formData.audience,
        scheduleType: isScheduled ? 'scheduled' : 'immediate',
        discountId: formData.discountId || null,
        senderId: formData.senderId || undefined,
      };
      
      if (isScheduled && formData.scheduleAt) {
        campaignData.scheduleAt = new Date(formData.scheduleAt).toISOString();
      }
      
      let result;
      if (isEditMode) {
        result = await updateCampaign.mutateAsync({ id, ...campaignData });
      } else {
        result = await createCampaign.mutateAsync(campaignData);
      }
      
      if (!isScheduled && result?.id) {
        try {
          await sendCampaign.mutateAsync(result.id);
          toast.success('Campaign created and queued for sending!');
        } catch (sendError) {
          toast.warning('Campaign created but failed to send. You can send it manually from the campaigns list.');
          // Error already handled by toast.warning above
        }
      } else if (isScheduled) {
        toast.success('Campaign scheduled successfully!');
      }
      
      if (result?.id) {
        setTimeout(() => navigate('/app/campaigns'), 1500);
      }
    } catch (error) {
      toast.error(error?.message || 'Failed to create campaign. Please check your inputs and try again.');
    }
  };

  // Prepare audience options
  const audienceOptions = useMemo(() => {
    const options = [
      { value: 'all', label: 'All Contacts' },
    ];
    
    if (audiencesData) {
      const audiences = normalizeArrayResponse(audiencesData, 'audiences');
      audiences.forEach((audience) => {
        options.push({
          value: audience.id || audience.name,
          label: audience.name || audience.id,
        });
      });
    }
    
    return options;
  }, [audiencesData]);

  // Prepare discount options
  const discountOptions = useMemo(() => {
    const options = [
      { value: '', label: 'No Discount Code' },
    ];
    
    if (discountsData) {
      const discounts = normalizeArrayResponse(discountsData, 'discounts');
      discounts.forEach((discount) => {
        options.push({
          value: discount.id,
          label: `${discount.code || discount.name}${discount.value ? ` (${discount.value}${discount.type === 'percentage' ? '%' : ''})` : ''}`,
        });
      });
    }
    
    return options;
  }, [discountsData]);

  // Calculate SMS info
  const smsInfo = useMemo(() => {
    return countSMSCharacters(formData.message);
  }, [formData.message]);

  // Get selected discount code for preview
  const selectedDiscount = useMemo(() => {
    if (!formData.discountId || !discountsData) return 'DISCOUNT20';
    const discounts = Array.isArray(discountsData) ? discountsData : discountsData.discounts || [];
    const discount = discounts.find((d) => d.id === formData.discountId);
    return discount?.code || 'DISCOUNT20';
  }, [formData.discountId, discountsData]);

  if (isEditMode && isLoadingCampaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <SEO
        title={isEditMode ? 'Edit Campaign' : 'Create Campaign - Sendly SMS Marketing'}
        description="Create a new SMS campaign and preview it in real-time"
        path={isEditMode ? `/app/campaigns/${id}/edit` : '/app/campaigns/new'}
      />
      <div className="min-h-screen pt-8 pb-20 px-4 lg:px-8 bg-bg-dark">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-8">
            <h1 className="text-h1 md:text-4xl font-bold mb-2">
              {isEditMode ? 'Edit Campaign' : 'Create Campaign'}
            </h1>
            <p className="text-body text-border-subtle">
              {isEditMode 
                ? 'Update your SMS campaign and preview it in real-time'
                : 'Create a new SMS campaign and preview it in real-time'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Campaign Form */}
            <div>
              <GlassCard>
                <div className="space-y-6">
                  <GlassInput
                    label="Campaign Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    placeholder="Summer Sale Campaign"
                    required
                  />

                  <GlassSelect
                    label="Audience / Segment"
                    name="audience"
                    value={formData.audience}
                    onChange={handleChange}
                    options={audienceOptions}
                  />

                  {settingsData?.senderId && (
                    <GlassSelect
                      label="Sender ID"
                      name="senderId"
                      value={formData.senderId}
                      onChange={handleChange}
                      options={[
                        { value: '', label: 'Default' },
                        { value: settingsData.senderId, label: settingsData.senderId },
                      ]}
                    />
                  )}

                  <GlassTextarea
                    label="Message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    error={errors.message}
                    rows={8}
                    placeholder="Type your SMS message here... Use {{first_name}} for personalization and {{discount_code}} for discount codes."
                    required
                  />

                  <div>
                    <label className="text-sm font-medium text-primary-light mb-2 block">
                      SMS Info
                    </label>
                    <div className="p-3 rounded-lg bg-glass-white border border-glass-border">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-border-subtle">
                          {smsInfo.characters} characters
                        </span>
                        <span className={`font-semibold ${smsInfo.parts > 1 ? 'text-zoom-fuchsia' : 'text-ice-accent'}`}>
                          {smsInfo.parts} SMS part{smsInfo.parts > 1 ? 's' : ''}
                        </span>
                      </div>
                      {smsInfo.parts > 1 && (
                        <p className="text-xs text-zoom-fuchsia mt-2">
                          This message will be split into {smsInfo.parts} parts
                        </p>
                      )}
                    </div>
                  </div>

                  {discountOptions.length > 1 && (
                    <GlassSelect
                      label="Discount Code (Optional)"
                      name="discountId"
                      value={formData.discountId || ''}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          discountId: e.target.value || null,
                        }));
                      }}
                      options={discountOptions}
                    />
                  )}

                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isScheduled}
                        onChange={handleScheduleToggle}
                        className="w-5 h-5 rounded border-glass-border bg-glass-white text-ice-accent focus:ring-ice-accent focus:ring-2"
                      />
                      <span className="text-sm font-medium text-primary-light">
                        Schedule for later
                      </span>
                    </label>
                    
                    {isScheduled && (
                      <div className="mt-4">
                        <GlassInput
                          label="Scheduled Date & Time"
                          name="scheduleAt"
                          type="datetime-local"
                          value={formData.scheduleAt ? new Date(formData.scheduleAt).toISOString().slice(0, 16) : ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value) {
                              const date = new Date(value);
                              setFormData((prev) => ({
                                ...prev,
                                scheduleAt: date.toISOString(),
                              }));
                            } else {
                              setFormData((prev) => ({
                                ...prev,
                                scheduleAt: '',
                              }));
                            }
                          }}
                          error={errors.scheduleAt}
                        />
                        {formData.scheduleAt && (
                          <p className="mt-2 text-sm text-ice-accent flex items-center gap-2">
                            <span>🕐</span>
                            <span>
                              Scheduled for {format(new Date(formData.scheduleAt), 'PPp')}
                            </span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 pt-4">
                    <GlassButton
                      variant="ghost"
                      size="lg"
                      onClick={handleSaveDraft}
                      disabled={createCampaign.isPending || updateCampaign.isPending || sendCampaign.isPending}
                      className="flex-1"
                    >
                      {createCampaign.isPending || updateCampaign.isPending ? (
                        <span className="flex items-center gap-2">
                          <LoadingSpinner size="sm" />
                          Saving...
                        </span>
                      ) : (
                        'Save Draft'
                      )}
                    </GlassButton>
                    <GlassButton
                      variant="primary"
                      size="lg"
                      onClick={handleSend}
                      disabled={createCampaign.isPending || updateCampaign.isPending || sendCampaign.isPending}
                      className="flex-1"
                    >
                      {createCampaign.isPending || updateCampaign.isPending || sendCampaign.isPending ? (
                        <span className="flex items-center gap-2">
                          <LoadingSpinner size="sm" />
                          {isScheduled ? 'Scheduling...' : 'Sending...'}
                        </span>
                      ) : (
                        isScheduled ? 'Schedule' : 'Send Now'
                      )}
                    </GlassButton>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* iPhone Preview */}
            <div className="lg:sticky lg:top-8">
              <GlassCard variant="dark" className="p-4">
                <div className="mb-4">
                  <h3 className="text-h3 font-semibold mb-2">Live Preview</h3>
                  <p className="text-sm text-border-subtle">
                    See how your message will appear on a mobile device
                  </p>
                </div>
                <IPhonePreviewWithDiscount
                  message={formData.message || 'Type your message to see preview...'}
                  discountCode={selectedDiscount}
                  firstName="Sarah"
                />
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
