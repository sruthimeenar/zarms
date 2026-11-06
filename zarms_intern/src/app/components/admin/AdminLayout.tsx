import { useState, ReactNode } from 'react';
import { Menu, X, LayoutDashboard, Image, FolderOpen, Phone, LogOut, User, ChevronRight, Inbox, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getCurrentSession, logout } from '../../../data/authService';
import { useNavigate } from 'react-router';

interface AdminLayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function AdminLayout({ children, currentPage, onNavigate }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const navigate = useNavigate();
  const session = getCurrentSession();
  const adminUser = session.user;

  const menuItems = [
    { id: 'admin', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin-portfolio', label: 'Portfolio', icon: FolderOpen },
    { id: 'admin-gallery', label: 'Gallery', icon: Image },
    { id: 'admin-enquiries', label: 'Enquiries', icon: Inbox },
    { id: 'admin-contact', label: 'Contact', icon: Phone },
    { id: 'admin-users', label: 'Users', icon: Users },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex fixed left-0 top-0 h-full flex-col transition-all duration-300 z-40 ${
          sidebarOpen ? 'w-56' : 'w-16'
        }`}
        style={{
          background: '#ffffff',
          borderRight: '1px solid #e2e8f0'
        }}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-center px-3 border-b" style={{ borderColor: '#e5e7eb' }}>
          <button onClick={() => onNavigate('home')} className="cursor-pointer">
            <img src="/images/logo.png" alt="ZARMS Tec" className={`${sidebarOpen ? 'h-10' : 'h-8'} w-auto transition-all duration-300`} />
          </button>
        </div>

        {/* Sidebar Menu */}
        <nav className="flex-1 p-3 space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all ${
                  sidebarOpen ? '' : 'justify-center'
                }`}
                style={{
                  background: isActive ? '#eff6ff' : 'transparent',
                  color: isActive ? '#1e3a8a' : '#6b7280',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer - Logout Button */}
        <div className="p-3 border-t" style={{ borderColor: '#e5e7eb' }}>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors hover:bg-red-50 ${
              sidebarOpen ? '' : 'justify-center'
            }`}
            style={{ color: '#dc2626' }}
            title="Logout"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-64 z-50"
              style={{ background: '#ffffff' }}
            >
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="h-16 flex items-center justify-between px-4 border-b" style={{ borderColor: '#e5e7eb' }}>
                  <button onClick={() => onNavigate('home')} className="cursor-pointer">
                    <img src="/images/logo.png" alt="ZARMS Tec" className="h-10 w-auto" />
                  </button>
                  <button onClick={() => setMobileMenuOpen(false)} style={{ color: '#6b7280' }}>
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Mobile Menu */}
                <nav className="flex-1 p-3 space-y-1">
                  {menuItems.map(item => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onNavigate(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all cursor-pointer"
                        style={{
                          background: isActive ? '#eff6ff' : 'transparent',
                          color: isActive ? '#1e3a8a' : '#6b7280',
                          fontWeight: isActive ? 600 : 400,
                        }}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>

                {/* Mobile Footer - Logout */}
                <div className="p-3 border-t" style={{ borderColor: '#e5e7eb' }}>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors hover:bg-red-50 cursor-pointer"
                    style={{ color: '#dc2626' }}
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div
        className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-56' : 'lg:ml-16'}`}
      >
        {/* Top Bar */}
        <header
          className="sticky top-0 z-30 h-16 px-4 lg:px-6 flex items-center justify-between"
          style={{
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0'
          }}
        >
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            style={{ color: '#374151' }}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo (Mobile Only) */}
          <div className="lg:hidden">
            <button onClick={() => onNavigate('home')} className="cursor-pointer">
              <img src="/images/logo.png" alt="ZARMS Tec" className="h-8 w-auto" />
            </button>
          </div>

          {/* Collapse Button & Page Title (Desktop) */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg transition-colors hover:bg-gray-100 cursor-pointer"
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <ChevronRight
                className={`w-5 h-5 transition-transform ${sidebarOpen ? '' : 'rotate-180'}`}
                style={{ color: '#6b7280' }}
              />
            </button>
            <h1 className="text-lg font-semibold" style={{ color: '#111827' }}>
              {menuItems.find(item => item.id === currentPage)?.label || 'Dashboard'}
            </h1>
          </div>

          {/* Right Side - Profile */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdown(!profileDropdown)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-gray-50 cursor-pointer"
            >
              <div className="hidden md:block text-right">
                <div className="text-sm font-medium" style={{ color: '#111827' }}>
                  {adminUser?.name}
                </div>
                <div className="text-xs capitalize" style={{ color: '#6b7280' }}>
                  {adminUser?.role}
                </div>
              </div>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: '#1e3a8a', color: '#ffffff' }}
              >
                <User className="w-5 h-5" />
              </div>
            </button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {profileDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg overflow-hidden"
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <div className="p-4 border-b" style={{ borderColor: '#e5e7eb' }}>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ background: '#1e3a8a', color: '#ffffff' }}
                      >
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-medium" style={{ color: '#111827' }}>
                          {adminUser?.name}
                        </div>
                        <div className="text-sm" style={{ color: '#6b7280' }}>
                          {adminUser?.email}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setProfileDropdown(false);
                        onNavigate('home');
                      }}
                      className="w-full px-3 py-2 rounded-lg text-left transition-colors hover:bg-gray-50 cursor-pointer"
                      style={{ color: '#374151' }}
                    >
                      <span className="text-sm font-medium">View Website</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
