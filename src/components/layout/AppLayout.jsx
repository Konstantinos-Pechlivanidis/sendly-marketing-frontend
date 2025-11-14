import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';
import Icon from '../ui/Icon';
import { TOKEN_KEY, STORE_KEY } from '../../utils/constants';
import { useStoreInfo } from '../../hooks/useStoreInfo';

/**
 * App Layout Component
 * Sidebar navigation for logged-in users
 * Desktop: Fixed sidebar on left
 * Mobile: Hamburger menu overlay
 */
export default function AppLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const storeInfo = useStoreInfo();

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(STORE_KEY);
    navigate('/login', { replace: true });
  };

  const navItems = [
    { path: '/app/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/app/campaigns', label: 'Campaigns', icon: 'campaign' },
    { path: '/app/contacts', label: 'Contacts', icon: 'segment' },
    { path: '/app/automations', label: 'Automations', icon: 'automation' },
    { path: '/app/templates', label: 'Templates', icon: 'template' },
    { path: '/app/reports', label: 'Reports', icon: 'report' },
    { path: '/app/billing', label: 'Billing', icon: 'sms' },
    { path: '/app/settings', label: 'Settings', icon: 'integration' },
  ];

  const isActive = (path) => {
    if (path === '/app/dashboard') {
      return location.pathname === '/app/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-neutral-bg-base flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-40">
        <div className="flex-1 flex flex-col bg-neutral-surface-primary backdrop-blur-[20px] border-r border-neutral-border shadow-glass-light">
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 py-5 border-b border-neutral-border">
            <div className="w-8 h-8 rounded-lg bg-ice-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-h3 font-semibold text-neutral-text-primary">Sendly</span>
          </div>

          {/* Store Info */}
          {storeInfo && (
            <div className="px-6 py-4 border-b border-neutral-border">
              <p className="text-xs text-neutral-text-secondary mb-1">Store</p>
              <p className="text-sm font-medium text-neutral-text-primary truncate">
                {storeInfo.shopName || storeInfo.shopDomain}
              </p>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-ice-soft text-ice-primary border border-ice-primary/30'
                    : 'text-neutral-text-primary hover:bg-neutral-surface-secondary hover:text-ice-primary'
                }`}
              >
                <Icon name={item.icon} size="md" variant={isActive(item.path) ? 'ice' : 'default'} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="px-4 py-4 border-t border-neutral-border">
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start"
            >
              <span className="flex items-center gap-3">
                <Icon name="logout" size="md" variant="ice" />
                <span>Log out</span>
              </span>
            </GlassButton>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg glass border border-neutral-border text-neutral-text-primary focus-ring"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
        aria-expanded={isMobileMenuOpen}
      >
        <div className="w-6 h-6 flex flex-col justify-center gap-1.5">
          <span
            className={`block h-0.5 w-6 bg-current transition-all ${
              isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-current transition-all ${
              isMobileMenuOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-current transition-all ${
              isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
            }`}
          />
        </div>
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-neutral-text-primary/20 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-neutral-surface-primary backdrop-blur-[24px] border-r border-neutral-border shadow-glass-light-lg flex flex-col">
            {/* Logo */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-ice-primary flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="text-h3 font-semibold text-neutral-text-primary">Sendly</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-neutral-surface-secondary transition-colors"
                aria-label="Close menu"
              >
                <Icon name="arrowRight" size="md" className="rotate-180" />
              </button>
            </div>

            {/* Store Info */}
            {storeInfo && (
              <div className="px-6 py-4 border-b border-neutral-border">
                <p className="text-xs text-neutral-text-secondary mb-1">Store</p>
                <p className="text-sm font-medium text-neutral-text-primary truncate">
                  {storeInfo.shopName || storeInfo.shopDomain}
                </p>
              </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-ice-soft text-ice-primary border border-ice-primary/30'
                      : 'text-neutral-text-primary hover:bg-neutral-surface-secondary hover:text-ice-primary'
                  }`}
                >
                  <Icon name={item.icon} size="md" variant={isActive(item.path) ? 'ice' : 'default'} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Logout */}
            <div className="px-4 py-4 border-t border-neutral-border">
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full justify-start"
              >
                <span className="flex items-center gap-3">
                  <Icon name="logout" size="md" variant="ice" />
                  <span>Log out</span>
                </span>
              </GlassButton>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:pl-64 bg-neutral-bg-base">
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}

