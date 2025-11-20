import { useState } from 'react';
import GlassCard from './ui/GlassCard';
import GlassModal from './ui/GlassModal';
import Icon from './ui/Icon';
import GradientText from './ui/GradientText';

export default function ContactCaptureFeature() {
  const [lightboxImage, setLightboxImage] = useState(null);

  const openLightbox = (imageSrc, imageAlt) => {
    setLightboxImage({ src: imageSrc, alt: imageAlt });
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  return (
    <section className="py-20 px-4 lg:px-8 bg-surface-dark/30">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-h1 md:text-5xl font-bold mb-4">
            How We <GradientText>Capture Contacts</GradientText>
          </h2>
          <p className="text-lg md:text-xl text-border-subtle max-w-3xl mx-auto leading-relaxed mb-6">
            Seamlessly collect phone numbers directly from your storefront with our beautiful, 
            customizable opt-in banner and modal. No technical setup required—just add it to your theme.
          </p>
          
          {/* Instructions */}
          <GlassCard className="max-w-2xl mx-auto p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-xl bg-ice-accent/20">
                  <Icon name="integration" size="lg" variant="ice" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-h3 font-semibold mb-2 text-primary-light">How to Add the Banner</h3>
                <p className="text-body text-border-subtle mb-3">
                  To use this banner in your Shopify store, follow these steps:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-sm text-border-subtle">
                  <li>Go to your Shopify admin</li>
                  <li>Navigate to <strong className="text-primary-light">Customization</strong></li>
                  <li>Click on <strong className="text-primary-light">Apps</strong></li>
                  <li>Select <strong className="text-primary-light">Add block</strong></li>
                  <li>Choose <strong className="text-ice-accent">SMS Opt-in Banner</strong></li>
                </ol>
                <p className="text-xs text-border-subtle mt-4 italic">
                  💡 Click on the images below to view them in full size
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Image Display Section */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 mb-12">
          {/* Banner Image */}
          <GlassCard className="p-4 sm:p-6 lg:p-8 group hover:scale-[1.01] transition-transform duration-300">
            <div className="relative overflow-hidden rounded-xl bg-surface-dark/50">
              <div className="absolute top-4 left-4 z-10">
                <div className="px-3 py-1.5 rounded-lg bg-ice-accent/20 backdrop-blur-sm border border-ice-accent/30">
                  <span className="text-xs font-semibold text-ice-accent flex items-center gap-1.5">
                    <Icon name="sms" size="xs" variant="ice" />
                    Storefront Banner
                  </span>
                </div>
              </div>
              <div 
                className="relative w-full aspect-[16/10] sm:aspect-[16/9] cursor-pointer group/image"
                onClick={() => openLightbox('/banner/banner.png', 'SMS opt-in banner displayed on storefront')}
              >
                <img
                  src="/banner/banner.png"
                  alt="SMS opt-in banner displayed on storefront"
                  width="1200"
                  height="675"
                  className="w-full h-full object-contain object-center transition-transform duration-300 group-hover/image:scale-105"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/70 via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="px-4 py-2 rounded-lg bg-ice-accent/20 backdrop-blur-sm border border-ice-accent/30">
                    <span className="text-sm font-semibold text-ice-accent flex items-center gap-2">
                      <Icon name="view" size="sm" variant="ice" />
                      Click to enlarge
                    </span>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 z-10">
                <p className="text-sm text-primary-light/90 font-medium leading-relaxed">
                  Beautiful banner that appears on your storefront, inviting customers to join your SMS list
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Modal Image */}
          <GlassCard className="p-4 sm:p-6 lg:p-8 group hover:scale-[1.01] transition-transform duration-300">
            <div className="relative overflow-hidden rounded-xl bg-surface-dark/50">
              <div className="absolute top-4 left-4 z-10">
                <div className="px-3 py-1.5 rounded-lg bg-zoom-fuchsia/20 backdrop-blur-sm border border-zoom-fuchsia/30">
                  <span className="text-xs font-semibold text-zoom-fuchsia flex items-center gap-1.5">
                    <Icon name="integration" size="xs" variant="fuchsia" />
                    Opt-in Modal
                  </span>
                </div>
              </div>
              <div 
                className="relative w-full aspect-[16/10] sm:aspect-[16/9] cursor-pointer group/image"
                onClick={() => openLightbox('/banner/modal.png', 'SMS opt-in modal form')}
              >
                <img
                  src="/banner/modal.png"
                  alt="SMS opt-in modal form"
                  width="1200"
                  height="675"
                  className="w-full h-full object-contain object-center transition-transform duration-300 group-hover/image:scale-105"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/70 via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="px-4 py-2 rounded-lg bg-zoom-fuchsia/20 backdrop-blur-sm border border-zoom-fuchsia/30">
                    <span className="text-sm font-semibold text-zoom-fuchsia flex items-center gap-2">
                      <Icon name="view" size="sm" variant="fuchsia" />
                      Click to enlarge
                    </span>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 z-10">
                <p className="text-sm text-primary-light/90 font-medium leading-relaxed">
                  Professional modal form that collects customer information with full GDPR compliance
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <GlassCard className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-xl bg-ice-accent/20">
                <Icon name="integration" size="lg" variant="ice" />
              </div>
            </div>
            <h3 className="text-h3 font-semibold mb-2">Theme Integration</h3>
            <p className="text-sm text-border-subtle leading-relaxed">
              Seamlessly matches your store's design. Customize colors, fonts, and placement to fit your brand.
            </p>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-xl bg-zoom-fuchsia/20">
                <Icon name="compliance" size="lg" variant="fuchsia" />
              </div>
            </div>
            <h3 className="text-h3 font-semibold mb-2">GDPR Compliant</h3>
            <p className="text-sm text-border-subtle leading-relaxed">
              Built-in consent management, opt-in verification, and easy unsubscribe options. Fully compliant out of the box.
            </p>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-xl bg-ice-accent/20">
                <Icon name="automation" size="lg" variant="ice" />
              </div>
            </div>
            <h3 className="text-h3 font-semibold mb-2">Auto Sync</h3>
            <p className="text-sm text-border-subtle leading-relaxed">
              Contacts automatically sync to your Sendly dashboard. No manual import needed—it just works.
            </p>
          </GlassCard>
        </div>
      </div>

      {/* Lightbox Modal */}
      <GlassModal
        isOpen={!!lightboxImage}
        onClose={closeLightbox}
        size="full"
        showCloseButton={true}
        className="p-4"
      >
        {lightboxImage && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <img
              src={lightboxImage.src}
              alt={lightboxImage.alt}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
              loading="eager"
              decoding="async"
            />
          </div>
        )}
      </GlassModal>
    </section>
  );
}

