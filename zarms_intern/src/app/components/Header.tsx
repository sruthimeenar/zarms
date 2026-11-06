import { useState, useEffect } from 'react';
import { Menu, X, Phone, Mail, MessageCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ContactModal } from './ContactModal';
import { getPortfolioItems } from '../../data/portfolio';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Header({ currentPage, onNavigate }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [hasPortfolioItems, setHasPortfolioItems] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let active = true;
    getPortfolioItems()
      .then((items) => {
        if (active) setHasPortfolioItems(items.length > 0);
      })
      .catch(() => {
        if (active) setHasPortfolioItems(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const allNavItems = [
    { label: 'Home', page: 'home' },
    { label: 'About Us', page: 'about' },
    { label: 'Services', page: 'services', hasDropdown: true },
    { label: 'Portfolio', page: 'portfolio' },
    { label: 'Contact Us', page: 'contact' },
  ];

  // Filter out Portfolio if no items exist
  const navItems = hasPortfolioItems
    ? allNavItems
    : allNavItems.filter(item => item.page !== 'portfolio');

  return (
    <>
      <div
        className="hidden md:block py-2 text-sm"
        style={{ background: 'var(--section-bg-dark)', color: 'var(--text-inverse)' }}
      >
        <div className="container mx-auto px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <a
              href="https://wa.me/919994123797"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:opacity-80 transition-opacity cursor-pointer"
              style={{ background: 'rgba(255, 255, 255, 0.1)' }}
              aria-label="WhatsApp"
            >
              <WhatsAppIcon className="w-5 h-5" />
            </a>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="font-semibold">Construction:</span>
              <a href="tel:9840344369" className="flex items-center gap-1 hover:opacity-80 cursor-pointer">
                <Phone className="w-4 h-4" />
                9840344369
              </a>
              <a href="mailto:narbhavi555@gmail.com" className="flex items-center gap-1 hover:opacity-80 cursor-pointer">
                <Mail className="w-4 h-4" />
              </a>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold">Software:</span>
              <a href="tel:9994123797" className="flex items-center gap-1 hover:opacity-80 cursor-pointer">
                <Phone className="w-4 h-4" />
                9994123797
              </a>
              <a href="mailto:rajesh.arms916@gmail.com" className="flex items-center gap-1 hover:opacity-80 cursor-pointer">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <header
        className="sticky top-0 z-40 transition-all duration-300 cursor-pointer"
        style={{
          background: isScrolled ? 'var(--header-bg)' : 'var(--header-bg)',
          boxShadow: isScrolled ? 'var(--shadow-md)' : 'none',
          backdropFilter: isScrolled ? 'blur(10px)' : 'none',
        }}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <button onClick={() => onNavigate('home')} className="cursor-pointer">
              <img src="/images/logo.png" alt="ZARMS Tec" className="h-12 w-auto" />
            </button>

            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map(item => (
                <div key={item.page} className="relative group">
                  <button
                    onClick={() => item.hasDropdown ? setIsServicesOpen(!isServicesOpen) : onNavigate(item.page)}
                    className="flex items-center gap-1 font-medium transition-colors relative py-2 cursor-pointer"
                    style={{ color: currentPage === item.page ? 'var(--brand-primary)' : 'var(--text-secondary)' }}
                  >
                    {item.label}
                    {item.hasDropdown && <ChevronDown className="w-4 h-4" />}
                    {currentPage === item.page && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute bottom-0 left-0 right-0 h-0.5"
                        style={{ background: 'var(--brand-primary)' }}
                      />
                    )}
                  </button>

                  {item.hasDropdown && (
                    <AnimatePresence>
                      {isServicesOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 mt-2 py-2 rounded-lg shadow-lg min-w-64"
                          style={{ background: 'var(--card-background)', border: '1px solid var(--border-color)' }}
                          onMouseLeave={() => setIsServicesOpen(false)}
                        >
                          <button
                            onClick={() => { onNavigate('construction'); setIsServicesOpen(false); }}
                            className="w-full px-4 py-3 text-left hover:bg-opacity-50 transition-colors cursor-pointer"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            <div className="font-medium">Construction Services</div>
                            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Building & civil works</div>
                          </button>
                          <button
                            onClick={() => { onNavigate('software'); setIsServicesOpen(false); }}
                            className="w-full px-4 py-3 text-left hover:bg-opacity-50 transition-colors cursor-pointer"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            <div className="font-medium">Software Solutions</div>
                            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Custom software development</div>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-4">
              <a
                href="https://wa.me/919994123797"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 rounded-lg font-medium transition-transform hover:scale-105 flex items-center gap-2 cursor-pointer"
                style={{ background: 'var(--brand-secondary)', color: 'var(--text-inverse)' }}
              >
                <WhatsAppIcon className="w-5 h-5" />
                WhatsApp Us
              </a>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2"
              style={{ color: 'var(--text-primary)' }}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden border-t"
              style={{ background: 'var(--card-background)', borderColor: 'var(--border-color)' }}
            >
              <div className="container mx-auto px-6 py-4 space-y-2">
                {navItems.map(item => {
                  if (item.hasDropdown) {
                    return (
                      <div key={item.page}>
                        <button
                          onClick={() => setIsServicesOpen(!isServicesOpen)}
                          className="w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-between cursor-pointer"
                          style={{
                            background: currentPage === item.page ? 'var(--section-bg-light)' : 'transparent',
                            color: currentPage === item.page ? 'var(--brand-primary)' : 'var(--text-primary)',
                          }}
                        >
                          {item.label}
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${isServicesOpen ? 'rotate-180' : ''}`}
                          />
                        </button>
                        <AnimatePresence>
                          {isServicesOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pl-4 space-y-1 mt-1">
                                <button
                                  onClick={() => {
                                    onNavigate('construction');
                                    setIsMobileMenuOpen(false);
                                    setIsServicesOpen(false);
                                  }}
                                  className="w-full text-left px-4 py-2 rounded-lg transition-colors cursor-pointer"
                                  style={{
                                    background: currentPage === 'construction' ? 'var(--section-bg-light)' : 'transparent',
                                    color: currentPage === 'construction' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                                  }}
                                >
                                  Construction Services
                                </button>
                                <button
                                  onClick={() => {
                                    onNavigate('software');
                                    setIsMobileMenuOpen(false);
                                    setIsServicesOpen(false);
                                  }}
                                  className="w-full text-left px-4 py-2 rounded-lg transition-colors cursor-pointer"
                                  style={{
                                    background: currentPage === 'software' ? 'var(--section-bg-light)' : 'transparent',
                                    color: currentPage === 'software' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                                  }}
                                >
                                  Software Solutions
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }
                  return (
                    <button
                      key={item.page}
                      onClick={() => {
                        onNavigate(item.page);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg font-medium transition-colors cursor-pointer"
                      style={{
                        background: currentPage === item.page ? 'var(--section-bg-light)' : 'transparent',
                        color: currentPage === item.page ? 'var(--brand-primary)' : 'var(--text-primary)',
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Floating Contact Button */}
      <button
        onClick={() => setIsContactModalOpen(true)}
        className="fixed bottom-6 left-6 z-50 p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
        style={{ background: '#25D366', color: 'white' }}
        aria-label="Contact Us"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
    </>
  );
}
