import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import GlassBadge from '../components/ui/GlassBadge';
import GradientText from '../components/ui/GradientText';
import Icon from '../components/ui/Icon';
import ContactCaptureFeature from '../components/ContactCaptureFeature';
import SEO from '../components/SEO';

export default function ShopifyApp() {
  const extensionFeatures = [
    {
      icon: 'integration',
      title: 'Embedded Admin Dashboard',
      description: 'Access Sendly directly from your Shopify admin. No need to switch between apps—manage everything in one place.',
      highlight: 'Native Shopify experience',
    },
    {
      icon: 'sms',
      title: 'Storefront Opt-in Banner',
      description: 'Beautiful, customizable SMS opt-in forms that integrate seamlessly with your store theme. Collect phone numbers directly from your storefront.',
      highlight: 'Theme integration',
    },
    {
      icon: 'automation',
      title: 'Automated Welcome Messages',
      description: 'Automatically send welcome SMS when customers opt-in. Set up order confirmations, shipping updates, and birthday offers—all automated.',
      highlight: 'Zero manual work',
    },
    {
      icon: 'campaign',
      title: 'Discount Code Integration',
      description: 'Create and distribute discount codes through SMS campaigns. Track redemption rates and boost conversions with targeted offers.',
      highlight: 'Boost sales',
    },
    {
      icon: 'segment',
      title: 'Customer Data Sync',
      description: 'Automatic synchronization with your Shopify customer database. Real-time updates ensure your SMS lists are always current.',
      highlight: 'Always in sync',
    },
    {
      icon: 'analytics',
      title: 'Performance Tracking',
      description: 'Monitor SMS delivery rates, open rates, and conversion metrics. See exactly how your SMS marketing is performing.',
      highlight: 'Data-driven insights',
    },
  ];

  const benefits = [
    {
      number: '98%',
      label: 'Open Rate',
      description: 'SMS messages are read within minutes, compared to 20% for email',
    },
    {
      number: '10x',
      label: 'Better ROI',
      description: 'SMS marketing delivers 10x better ROI than email campaigns',
    },
    {
      number: '3 min',
      label: 'Average Read Time',
      description: 'Customers read SMS messages in under 3 minutes',
    },
    {
      number: '45%',
      label: 'Conversion Rate',
      description: 'SMS campaigns convert at 45% higher rates than email',
    },
  ];

  const quickStart = [
    {
      step: '1',
      title: 'Open Your Dashboard',
      description: 'Click the button above to access your full Sendly dashboard in a new browser tab.',
    },
    {
      step: '2',
      title: 'Add Opt-in to Your Store',
      description: 'Place the SMS opt-in banner anywhere on your storefront. Customize colors, text, and placement to match your brand.',
    },
    {
      step: '3',
      title: 'Start Collecting Contacts',
      description: 'Customers opt-in directly from your store. Phone numbers sync automatically to your Sendly dashboard.',
    },
    {
      step: '4',
      title: 'Send & Automate',
      description: 'Create campaigns, set up automations, and watch your sales grow. All from your Sendly dashboard.',
    },
  ];

  return (
    <>
      <SEO
        title="Shopify SMS Marketing Extension - Sendly"
        description="Transform your Shopify store with SMS marketing. Embedded dashboard, storefront opt-in, automated messages, and discount integration. Free 14-day trial."
        path="/shopify-app"
      />
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative pt-36 pb-24 px-4 lg:px-8 overflow-hidden">
          {/* Background gradient with blobs */}
          <div className="absolute inset-0 bg-gradient-to-b from-bg-dark via-surface-dark to-bg-dark">
            <div className="absolute top-20 right-20 w-96 h-96 bg-ice-accent/10 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-zoom-fuchsia/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          </div>

          <div className="relative max-w-[1200px] mx-auto">
            <div className="text-center mb-16">
              <GlassBadge variant="ice" className="mb-6 inline-flex items-center gap-2">
                <Icon name="integration" size="sm" variant="ice" />
                <span>Shopify Extension</span>
              </GlassBadge>
              
              <h1 className="text-hero md:text-7xl font-bold mb-6 leading-tight">
                <span className="block mb-2">Welcome to</span>
                <GradientText>Sendly SMS Marketing</GradientText>
              </h1>
              
              <p className="text-xl md:text-2xl text-border-subtle max-w-3xl mx-auto mb-8 leading-relaxed">
                Your Shopify extension is <strong className="text-primary-light">installed and ready</strong>!
                <span className="text-ice-accent"> Access your full dashboard</span> to start creating campaigns,{' '}
                <span className="text-zoom-fuchsia">manage contacts</span>, and{' '}
                <span className="text-ice-accent">set up automations</span>.
              </p>

              <div className="flex justify-center items-center">
                <GlassButton
                  onClick={() => {
                    window.open('https://sendly-marketing-frontend.onrender.com', '_blank', 'noopener,noreferrer');
                  }}
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Icon name="arrow-right" size="sm" className="mr-2" />
                  Open Sendly Dashboard in New Tab
                </GlassButton>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4 lg:px-8">
          <div className="max-w-[1200px] mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <GlassCard key={index} className="text-center p-6">
                  <div className="text-4xl md:text-5xl font-bold text-ice-accent mb-2">
                    {benefit.number}
                  </div>
                  <div className="text-lg font-semibold text-primary-light mb-2">
                    {benefit.label}
                  </div>
                  <div className="text-sm text-border-subtle">
                    {benefit.description}
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-4 lg:px-8">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Everything You Need to <GradientText>Succeed</GradientText>
              </h2>
              <p className="text-xl text-border-subtle max-w-2xl mx-auto">
                Powerful features designed specifically for Shopify stores. No compromises, no limitations.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {extensionFeatures.map((feature, index) => (
                <GlassCard key={index} className="p-6 hover:scale-[1.02] transition-transform duration-300">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-ice-accent/10 flex items-center justify-center">
                        <Icon name={feature.icon} size="lg" variant="ice" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-primary-light mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-border-subtle mb-3">
                        {feature.description}
                      </p>
                      <GlassBadge variant="ice" size="sm">
                        {feature.highlight}
                      </GlassBadge>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* How We Capture Contacts Section */}
        <ContactCaptureFeature />

        {/* Quick Start Section */}
        <section className="py-24 px-4 lg:px-8 bg-surface-dark/50">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Get Started <GradientText>Right Away</GradientText>
              </h2>
              <p className="text-xl text-border-subtle max-w-2xl mx-auto">
                Your extension is installed. Now it's time to unlock the full power of SMS marketing.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickStart.map((step, index) => (
                <GlassCard key={index} className="p-6 relative">
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-ice-accent to-zoom-fuchsia flex items-center justify-center text-white font-bold text-lg shadow-glow-ice-light">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-primary-light mb-3 mt-4">
                    {step.title}
                  </h3>
                  <p className="text-border-subtle">
                    {step.description}
                  </p>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 lg:px-8">
          <div className="max-w-[1200px] mx-auto">
            <GlassCard className="p-12 text-center bg-gradient-to-br from-surface-dark to-surface-dark/50 border-ice-accent/20">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Ready to <GradientText>Grow Your Store</GradientText>?
              </h2>
              <p className="text-xl text-border-subtle mb-8 max-w-2xl mx-auto">
                Join thousands of Shopify merchants who are using SMS marketing to drive sales, 
                recover abandoned carts, and build stronger customer relationships.
              </p>
              <div className="flex justify-center">
                <GlassButton
                  onClick={() => {
                    window.open('https://sendly-marketing-frontend.onrender.com', '_blank', 'noopener,noreferrer');
                  }}
                  variant="primary"
                  size="lg"
                >
                  <Icon name="arrow-right" size="sm" className="mr-2" />
                  Open Sendly Dashboard in New Tab
                </GlassButton>
              </div>
              <p className="text-sm text-border-subtle mt-6">
                Access your full dashboard to manage campaigns, contacts, and automations
              </p>
            </GlassCard>
          </div>
        </section>
      </div>
    </>
  );
}

