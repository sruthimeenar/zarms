import { useEffect, useState } from 'react';
import { FolderOpen, Image, Phone, PlusCircle, Settings, Hand } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { getPortfolioItems } from '../../../data/portfolio';
import { getGalleryItems } from '../../../data/gallery';
import { getContactSettings } from '../../../data/contact';
import { ContactSettings, GalleryItem, PortfolioItem } from '../../../data/types';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [contactSettings, setContactSettings] = useState<ContactSettings>({
    address: '',
    constructionPhone: '',
    constructionEmail: '',
    softwarePhone: '',
    softwareEmail: '',
    whatsappNumber: '',
    enquiryEmails: [],
    socialLinks: [],
    businessHours: [],
  });

  useEffect(() => {
    let active = true;
    Promise.all([getPortfolioItems(), getGalleryItems(), getContactSettings()])
      .then(([portfolio, gallery, contact]) => {
        if (!active) return;
        setPortfolioItems(portfolio);
        setGalleryItems(gallery);
        setContactSettings(contact);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const constructionPortfolio = portfolioItems.filter((item) => item.serviceType === 'Construction Services');
  const softwarePortfolio = portfolioItems.filter((item) => item.serviceType === 'Software Solutions');
  const constructionGallery = galleryItems.filter((item) => item.serviceType === 'Construction Services');
  const softwareGallery = galleryItems.filter((item) => item.serviceType === 'Software Solutions');

  const stats = [
    {
      label: 'Total Portfolio Items',
      value: portfolioItems.length,
      icon: FolderOpen,
      color: 'var(--brand-primary)',
      subStats: [
        { label: 'Construction', value: constructionPortfolio.length },
        { label: 'Software', value: softwarePortfolio.length },
      ],
    },
    {
      label: 'Total Gallery Items',
      value: galleryItems.length,
      icon: Image,
      color: 'var(--brand-accent)',
      subStats: [
        { label: 'Construction', value: constructionGallery.length },
        { label: 'Software', value: softwareGallery.length },
      ],
    },
    {
      label: 'Contact Settings',
      value: 'Configured',
      icon: Phone,
      color: 'var(--success)',
      subStats: [
        { label: 'Social Links', value: contactSettings.socialLinks.length },
        { label: 'Business Hours', value: contactSettings.businessHours.length },
      ],
    },
  ];

  const quickActions = [
    {
      label: 'Add Portfolio Item',
      description: 'Create a new portfolio entry',
      icon: FolderOpen,
      page: 'admin-portfolio',
      color: 'var(--brand-primary)',
    },
    {
      label: 'Add Gallery Item',
      description: 'Upload a new gallery image',
      icon: Image,
      page: 'admin-gallery',
      color: 'var(--brand-accent)',
    },
    {
      label: 'Edit Contact Details',
      description: 'Update contact information',
      icon: Phone,
      page: 'admin-contact',
      color: 'var(--success)',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="p-6 rounded-lg" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <div className="flex items-center gap-3 mb-3">
          <Hand className="w-7 h-7" style={{ color: '#ffffff' }} />
          <h1 className="text-2xl font-bold" style={{ color: '#ffffff' }}>
            Welcome Back!
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
          Monitor and manage your website content from one place
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colors = ['#1e3a8a', '#d97706', '#1e3a8a'];
          const bgColors = ['#eff6ff', '#fff7ed', '#eff6ff'];
          return (
            <div
              key={index}
              className="p-5 rounded-lg"
              style={{
                background: '#ffffff',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0'
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: '#64748b' }}>
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold" style={{ color: '#0f172a' }}>
                    {stat.value}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg" style={{ background: bgColors[index] }}>
                  <Icon className="w-5 h-5" style={{ color: colors[index] }} />
                </div>
              </div>
              {stat.subStats && (
                <div className="flex gap-4 pt-3 mt-3 border-t" style={{ borderColor: '#f1f5f9' }}>
                  {stat.subStats.map((sub, i) => (
                    <div key={i}>
                      <p className="text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>
                        {sub.label}
                      </p>
                      <p className="text-base font-semibold" style={{ color: '#334155' }}>
                        {sub.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold mb-4" style={{ color: '#0f172a' }}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            const colors = ['#1e3a8a', '#d97706', '#1e3a8a'];
            return (
              <button
                key={index}
                onClick={() => onNavigate(action.page)}
                className="p-5 rounded-lg text-left transition-shadow hover:shadow-md cursor-pointer"
                style={{
                  background: '#ffffff',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-lg" style={{ background: index === 1 ? '#fff7ed' : '#eff6ff' }}>
                    <Icon className="w-5 h-5" style={{ color: colors[index] }} />
                  </div>
                  <h3 className="font-semibold text-sm" style={{ color: '#0f172a' }}>
                    {action.label}
                  </h3>
                </div>
                <p className="text-xs" style={{ color: '#64748b' }}>
                  {action.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Distribution - Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Portfolio Pie Chart */}
        <div
          className="p-5 rounded-lg"
          style={{
            background: '#ffffff',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
          }}
        >
          <h2 className="text-lg font-bold mb-4" style={{ color: '#0f172a' }}>
            Portfolio Distribution
          </h2>
          {portfolioItems.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Construction Services', value: constructionPortfolio.length, color: '#1e3a8a' },
                      { name: 'Software Solutions', value: softwarePortfolio.length, color: '#d97706' },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#1e3a8a" />
                    <Cell fill="#d97706" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: '#1e3a8a' }}></div>
                    <span className="text-sm" style={{ color: '#374151' }}>Construction Services</span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: '#1e3a8a' }}>
                    {constructionPortfolio.length} items
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: '#d97706' }}></div>
                    <span className="text-sm" style={{ color: '#374151' }}>Software Solutions</span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: '#d97706' }}>
                    {softwarePortfolio.length} items
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64" style={{ color: '#9ca3af' }}>
              <p className="text-sm">No portfolio data available</p>
            </div>
          )}
        </div>

        {/* Gallery Pie Chart */}
        <div
          className="p-5 rounded-lg"
          style={{
            background: '#ffffff',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
          }}
        >
          <h2 className="text-lg font-bold mb-4" style={{ color: '#0f172a' }}>
            Gallery Distribution
          </h2>
          {galleryItems.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Construction Gallery', value: constructionGallery.length, color: '#1e3a8a' },
                      { name: 'Software Gallery', value: softwareGallery.length, color: '#d97706' },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#1e3a8a" />
                    <Cell fill="#d97706" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: '#1e3a8a' }}></div>
                    <span className="text-sm" style={{ color: '#374151' }}>Construction Gallery</span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: '#1e3a8a' }}>
                    {constructionGallery.length} images
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: '#d97706' }}></div>
                    <span className="text-sm" style={{ color: '#374151' }}>Software Gallery</span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: '#d97706' }}>
                    {softwareGallery.length} images
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64" style={{ color: '#9ca3af' }}>
              <p className="text-sm">No gallery data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
