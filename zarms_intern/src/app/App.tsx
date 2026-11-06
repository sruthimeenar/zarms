import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router';
import { ThemeProvider } from './contexts/ThemeContext';
import { ThemeCustomizer } from './components/ThemeCustomizer';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/pages/HomePage';
import { AboutPage } from './components/pages/AboutPage';
import { ServicesPage } from './components/pages/ServicesPage';
import { ConstructionPage } from './components/pages/ConstructionPage';
import { SoftwarePage } from './components/pages/SoftwarePage';
import { PortfolioPage } from './components/pages/PortfolioPage';
import { ContactPage } from './components/pages/ContactPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PortfolioManagement } from './components/admin/PortfolioManagement';
import { GalleryManagement } from './components/admin/GalleryManagement';
import { EnquiryManagement } from './components/admin/EnquiryManagement';
import { ContactSettings } from './components/admin/ContactSettings';
import { UsersManagement } from './components/admin/UsersManagement';
import { LoginPage } from './components/auth/LoginPage';
import { RegistrationFlow } from './components/auth/RegistrationFlow';
import { ForgotPasswordFlow } from './components/auth/ForgotPasswordFlow';
import { AccessDenied } from './components/auth/AccessDenied';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { useEffect } from 'react';

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return null;
}

function PublicLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPage = location.pathname.slice(1) || 'home';

  const handleNavigate = (page: string) => {
    navigate(`/${page === 'home' ? '' : page}`);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--page-background)' }}>
      <Header currentPage={currentPage} onNavigate={handleNavigate} />
      <main>
        <Routes>
          <Route path="/" element={<HomePage onNavigate={handleNavigate} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage onNavigate={handleNavigate} />} />
          <Route path="/construction" element={<ConstructionPage />} />
          <Route path="/software" element={<SoftwarePage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </main>
      <Footer onNavigate={handleNavigate} />
      <ThemeCustomizer />
    </div>
  );
}

function AdminRoutes() {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract current page from path for active state
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/admin') return 'admin';
    if (path === '/admin/portfolio') return 'admin-portfolio';
    if (path === '/admin/gallery') return 'admin-gallery';
    if (path === '/admin/enquiries') return 'admin-enquiries';
    if (path === '/admin/contact') return 'admin-contact';
    if (path === '/admin/users') return 'admin-users';
    return 'admin';
  };

  const handleNavigate = (page: string) => {
    if (page === 'admin') {
      navigate('/admin');
    } else if (page === 'admin-portfolio') {
      navigate('/admin/portfolio');
    } else if (page === 'admin-gallery') {
      navigate('/admin/gallery');
    } else if (page === 'admin-enquiries') {
      navigate('/admin/enquiries');
    } else if (page === 'admin-contact') {
      navigate('/admin/contact');
    } else if (page === 'admin-users') {
      navigate('/admin/users');
    } else if (page === 'home') {
      navigate('/');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
      <AdminLayout currentPage={getCurrentPage()} onNavigate={handleNavigate}>
        <Routes>
          <Route path="/" element={<AdminDashboard onNavigate={handleNavigate} />} />
          <Route path="/portfolio" element={<PortfolioManagement />} />
          <Route path="/gallery" element={<GalleryManagement />} />
          <Route path="/enquiries" element={<EnquiryManagement />} />
          <Route path="/contact" element={<ContactSettings />} />
          <Route path="/users" element={<UsersManagement />} />
        </Routes>
      </AdminLayout>
    </ProtectedRoute>
  );
}

function AppRoutes() {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate('/admin');
  };

  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
      <Route path="/register" element={<RegistrationFlow />} />
      <Route path="/forgot-password" element={<ForgotPasswordFlow />} />
      <Route path="/access-denied" element={<AccessDenied />} />

      {/* Admin Routes (Protected) */}
      <Route path="/admin/*" element={<AdminRoutes />} />

      {/* Public Routes */}
      <Route path="/*" element={<PublicLayout />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}
