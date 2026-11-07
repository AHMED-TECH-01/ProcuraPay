import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { ProcuraLogo } from '../branding/ProcuraLogo';
import { GlassButton } from './GlassButton';

interface GlassNavigationProps {
  onNavigateLogin: () => void;
  onNavigateSignup: () => void;
  onNavigateDashboard?: () => void;
  isAuthenticated?: boolean;
}

export const GlassNavigation: React.FC<GlassNavigationProps> = ({
  onNavigateLogin,
  onNavigateSignup,
  onNavigateDashboard,
  isAuthenticated = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'py-3 bg-white/80 backdrop-blur-xl border-b border-gray-200/80 shadow-xs'
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="glass-navigation rounded-2xl px-4 sm:px-6 py-2.5 flex items-center justify-between transition-all duration-300">
          {/* Zone 1: Brand Lockup */}
          <div className="flex items-center">
            <ProcuraLogo
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              size="md"
            />
          </div>

          {/* Zone 2: Navigation Links */}
          <div className="hidden md:flex items-center space-x-8 text-xs font-semibold text-gray-600">
            <button
              onClick={() => scrollToSection('product')}
              className="hover:text-[#187B61] transition-colors cursor-pointer py-1"
            >
              Product
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-[#187B61] transition-colors cursor-pointer py-1"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('security')}
              className="hover:text-[#187B61] transition-colors cursor-pointer py-1"
            >
              Security
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="hover:text-[#187B61] transition-colors cursor-pointer py-1"
            >
              About
            </button>
          </div>

          {/* Zone 3: Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <GlassButton
                variant="primary"
                size="sm"
                onClick={onNavigateDashboard}
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Go to Workspace
              </GlassButton>
            ) : (
              <>
                <button
                  onClick={onNavigateLogin}
                  className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:text-[#187B61] transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <GlassButton
                  variant="primary"
                  size="sm"
                  onClick={onNavigateSignup}
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Get Started
                </GlassButton>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 glass-panel rounded-2xl p-4 shadow-xl border border-gray-200 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col space-y-3 text-sm font-medium text-gray-700">
              <button
                onClick={() => scrollToSection('product')}
                className="text-left py-2 px-2 hover:bg-[#187B61]/5 rounded-lg text-gray-800 font-semibold"
              >
                Product
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-left py-2 px-2 hover:bg-[#187B61]/5 rounded-lg text-gray-800 font-semibold"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('security')}
                className="text-left py-2 px-2 hover:bg-[#187B61]/5 rounded-lg text-gray-800 font-semibold"
              >
                Security
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="text-left py-2 px-2 hover:bg-[#187B61]/5 rounded-lg text-gray-800 font-semibold"
              >
                About
              </button>

              <div className="pt-3 border-t border-gray-200/80 flex flex-col space-y-2">
                {isAuthenticated ? (
                  <GlassButton
                    variant="primary"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigateDashboard?.();
                    }}
                  >
                    Go to Workspace
                  </GlassButton>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onNavigateLogin();
                      }}
                      className="w-full text-center py-2.5 text-xs font-semibold text-gray-800 bg-white/70 border border-gray-200 rounded-xl"
                    >
                      Sign In
                    </button>
                    <GlassButton
                      variant="primary"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onNavigateSignup();
                      }}
                    >
                      Get Started
                    </GlassButton>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
