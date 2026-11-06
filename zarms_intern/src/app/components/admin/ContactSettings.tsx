import { useState, useEffect, useRef } from 'react';
import { Save, Plus, Trash2, Phone, Mail, MapPin, Clock, Globe, Edit, X, Search } from 'lucide-react';
import { getContactSettings, updateContactSettings } from '../../../data/contact';
import { ContactSettings as ContactSettingsType } from '../../../data/types';
import { validateContactSettings } from '../../../data/validation';
import { SOCIAL_ICON_OPTIONS, getSocialIcon, getIconsByCategory, searchIcons } from '../../../data/socialIcons';
import { Button, Input, Alert, Space, Select, Modal, Dropdown } from 'antd';
const { TextArea } = Input;

export function ContactSettings() {
  const [isEditing, setIsEditing] = useState(false);
  const emptySettings: ContactSettingsType = {
    address: '',
    constructionPhone: '',
    constructionEmail: '',
    softwarePhone: '',
    softwareEmail: '',
    whatsappNumber: '',
    enquiryEmails: [],
    socialLinks: [],
    businessHours: [],
    mapUrl: '',
  };
  const [originalData, setOriginalData] = useState<ContactSettingsType>(emptySettings);
  const [formData, setFormData] = useState<ContactSettingsType>(emptySettings);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [newEnquiryEmail, setNewEnquiryEmail] = useState('');
  const [newSocialIcon, setNewSocialIcon] = useState('facebook');
  const [newSocialUrl, setNewSocialUrl] = useState('');
  const [newBusinessDays, setNewBusinessDays] = useState('');
  const [newBusinessHours, setNewBusinessHours] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [iconSearchQuery, setIconSearchQuery] = useState('');
  const [isIconDropdownOpen, setIsIconDropdownOpen] = useState(false);
  const iconDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    getContactSettings()
      .then((settings) => {
        if (!active) return;
        setOriginalData(settings);
        setFormData(settings);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleEdit = () => {
    setOriginalData(formData);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
    setFormErrors({});
    setNewEnquiryEmail('');
    setNewSocialIcon('facebook');
    setNewSocialUrl('');
    setNewBusinessDays('');
    setNewBusinessHours('');
    setIconSearchQuery('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateContactSettings(formData);

    if (!validation.isValid) {
      const errors: Record<string, string> = {};
      validation.errors.forEach(err => {
        errors[err.field] = err.message;
      });
      setFormErrors(errors);
      return;
    }

    await updateContactSettings(formData);
    setOriginalData(formData);
    setSuccessMessage('Contact settings updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
    setFormErrors({});
    setIsEditing(false);
  };

  const handleAddEnquiryEmail = () => {
    if (newEnquiryEmail.trim()) {
      if (!formData.enquiryEmails.includes(newEnquiryEmail.trim())) {
        setFormData({
          ...formData,
          enquiryEmails: [...formData.enquiryEmails, newEnquiryEmail.trim()],
        });
      }
      setNewEnquiryEmail('');
    }
  };

  const handleRemoveEnquiryEmail = (email: string) => {
    setFormData({
      ...formData,
      enquiryEmails: formData.enquiryEmails.filter((item) => item !== email),
    });
  };

  const handleAddSocialLink = () => {
    if (newSocialIcon.trim() && newSocialUrl.trim()) {
      setFormData({
        ...formData,
        socialLinks: [
          ...formData.socialLinks,
          { platform: newSocialIcon.trim(), url: newSocialUrl.trim(), icon: newSocialIcon.trim() },
        ],
      });
      setNewSocialIcon('facebook');
      setNewSocialUrl('');
      setIconSearchQuery('');
    }
  };

  const handleRemoveSocialLink = (platform: string) => {
    setFormData({
      ...formData,
      socialLinks: formData.socialLinks.filter((item) => item.platform !== platform),
    });
  };

  const handleUpdateSocialUrl = (platform: string, newUrl: string) => {
    setFormData({
      ...formData,
      socialLinks: formData.socialLinks.map((link) =>
        link.platform === platform ? { ...link, url: newUrl } : link
      ),
    });
  };

  const filteredIcons = iconSearchQuery ? searchIcons(iconSearchQuery) : SOCIAL_ICON_OPTIONS;
  const iconsByCategory = getIconsByCategory();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (iconDropdownRef.current && !iconDropdownRef.current.contains(event.target as Node)) {
        setIsIconDropdownOpen(false);
      }
    };

    if (isIconDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isIconDropdownOpen]);

  const handleAddBusinessHour = () => {
    if (newBusinessDays.trim() && newBusinessHours.trim()) {
      setFormData({
        ...formData,
        businessHours: [...formData.businessHours, { days: newBusinessDays.trim(), hours: newBusinessHours.trim() }],
      });
      setNewBusinessDays('');
      setNewBusinessHours('');
    }
  };

  const handleRemoveBusinessHour = (index: number) => {
    setFormData({
      ...formData,
      businessHours: formData.businessHours.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#111827' }}>
            Contact Settings
          </h1>
          <p className="text-sm" style={{ color: '#6b7280' }}>Manage your contact information and business details</p>
        </div>
        {!isEditing && (
          <Button
            type="primary"
            icon={<Edit className="w-4 h-4" />}
            onClick={handleEdit}
            style={{ background: '#1e3a8a' }}
          >
            Edit Settings
          </Button>
        )}
      </div>

      {/* Success Message */}
      {successMessage && (
        <Alert message={successMessage} type="success" showIcon closable />
      )}

      <form onSubmit={handleSubmit}>
        {/* Two Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Left Column */}
          <div className="space-y-5">
            {/* Construction Services Contact */}
            <div className="p-5 rounded-xl border space-y-4" style={{ background: '#ffffff', borderColor: '#e5e7eb' }}>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5" style={{ color: '#1e3a8a' }} />
                <h2 className="text-base font-semibold" style={{ color: '#111827' }}>
                  Construction Services
                </h2>
              </div>

              {!isEditing ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Phone</p>
                    <p className="text-sm" style={{ color: '#111827' }}>
                      {formData.constructionPhone || <span style={{ color: '#9ca3af' }}>Not set</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Email</p>
                    <p className="text-sm" style={{ color: '#111827' }}>
                      {formData.constructionEmail || <span style={{ color: '#9ca3af' }}>Not set</span>}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#374151' }}>Phone Number</label>
                    <Input
                      type="tel"
                      value={formData.constructionPhone}
                      onChange={e => setFormData({ ...formData, constructionPhone: e.target.value })}
                      placeholder="9840344369"
                      status={formErrors.constructionPhone ? 'error' : ''}
                    />
                    {formErrors.constructionPhone && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{formErrors.constructionPhone}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#374151' }}>Email Address</label>
                    <Input
                      type="email"
                      value={formData.constructionEmail}
                      onChange={e => setFormData({ ...formData, constructionEmail: e.target.value })}
                      placeholder="construction@zarmstec.com"
                      status={formErrors.constructionEmail ? 'error' : ''}
                    />
                    {formErrors.constructionEmail && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{formErrors.constructionEmail}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Software Solutions Contact */}
            <div className="p-5 rounded-xl border space-y-4" style={{ background: '#ffffff', borderColor: '#e5e7eb' }}>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5" style={{ color: '#d97706' }} />
                <h2 className="text-base font-semibold" style={{ color: '#111827' }}>
                  Software Solutions
                </h2>
              </div>

              {!isEditing ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Phone</p>
                    <p className="text-sm" style={{ color: '#111827' }}>
                      {formData.softwarePhone || <span style={{ color: '#9ca3af' }}>Not set</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Email</p>
                    <p className="text-sm" style={{ color: '#111827' }}>
                      {formData.softwareEmail || <span style={{ color: '#9ca3af' }}>Not set</span>}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#374151' }}>Phone Number</label>
                    <Input
                      type="tel"
                      value={formData.softwarePhone}
                      onChange={e => setFormData({ ...formData, softwarePhone: e.target.value })}
                      placeholder="9994123797"
                      status={formErrors.softwarePhone ? 'error' : ''}
                    />
                    {formErrors.softwarePhone && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{formErrors.softwarePhone}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#374151' }}>Email Address</label>
                    <Input
                      type="email"
                      value={formData.softwareEmail}
                      onChange={e => setFormData({ ...formData, softwareEmail: e.target.value })}
                      placeholder="software@zarmstec.com"
                      status={formErrors.softwareEmail ? 'error' : ''}
                    />
                    {formErrors.softwareEmail && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{formErrors.softwareEmail}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* WhatsApp & Enquiry Emails */}
            <div className="p-5 rounded-xl border space-y-4" style={{ background: '#ffffff', borderColor: '#e5e7eb' }}>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5" style={{ color: '#10b981' }} />
                <h2 className="text-base font-semibold" style={{ color: '#111827' }}>
                  WhatsApp & Enquiry
                </h2>
              </div>

              {!isEditing ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>WhatsApp Number</p>
                    <p className="text-sm" style={{ color: '#111827' }}>
                      {formData.whatsappNumber || <span style={{ color: '#9ca3af' }}>Not set</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-2" style={{ color: '#6b7280' }}>Enquiry Emails</p>
                    <div className="space-y-1">
                      {formData.enquiryEmails.length > 0 ? (
                        formData.enquiryEmails.map((email, index) => (
                          <div key={index} className="flex items-center gap-2 px-2 py-1.5 rounded" style={{ background: '#f9fafb' }}>
                            <Mail className="w-3 h-3 flex-shrink-0" style={{ color: '#6b7280' }} />
                            <p className="text-xs" style={{ color: '#111827' }}>{email}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm" style={{ color: '#9ca3af' }}>No emails configured</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#374151' }}>WhatsApp Number</label>
                    <Input
                      type="tel"
                      value={formData.whatsappNumber}
                      onChange={e => setFormData({ ...formData, whatsappNumber: e.target.value })}
                      placeholder="919994123797"
                      status={formErrors.whatsappNumber ? 'error' : ''}
                    />
                    {formErrors.whatsappNumber && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{formErrors.whatsappNumber}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: '#374151' }}>Enquiry Emails</label>
                    <div className="space-y-2">
                      {formData.enquiryEmails.map((email) => (
                        <Space.Compact key={email} style={{ width: '100%' }}>
                          <Input
                            type="email"
                            value={email}
                            readOnly
                            style={{ background: '#f9fafb' }}
                          />
                          <Button
                            type="primary"
                            danger
                            icon={<Trash2 className="w-3 h-3" />}
                            onClick={() => handleRemoveEnquiryEmail(email)}
                          />
                        </Space.Compact>
                      ))}
                      <Space.Compact key="add-new-email" style={{ width: '100%' }}>
                        <Input
                          type="email"
                          value={newEnquiryEmail}
                          onChange={e => setNewEnquiryEmail(e.target.value)}
                          placeholder="Add new email"
                        />
                        <Button
                          type="primary"
                          icon={<Plus className="w-3 h-3" />}
                          onClick={handleAddEnquiryEmail}
                          style={{ background: '#1e3a8a' }}
                        >
                          Add
                        </Button>
                      </Space.Compact>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            {/* Address */}
            <div className="p-5 rounded-xl border space-y-4" style={{ background: '#ffffff', borderColor: '#e5e7eb' }}>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" style={{ color: '#1e3a8a' }} />
                <h2 className="text-base font-semibold" style={{ color: '#111827' }}>
                  Business Address
                </h2>
              </div>

              {!isEditing ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Address</p>
                    <p className="text-sm" style={{ color: '#111827' }}>
                      {formData.address || <span style={{ color: '#9ca3af' }}>Not set</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Google Maps</p>
                    {formData.mapUrl ? (
                      <a href={formData.mapUrl} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline break-all" style={{ color: '#1e3a8a' }}>
                        View on Map
                      </a>
                    ) : (
                      <p className="text-sm" style={{ color: '#9ca3af' }}>Not set</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#374151' }}>Registered Address</label>
                    <TextArea
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      rows={3}
                      placeholder="Enter complete address"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#374151' }}>Google Maps URL</label>
                    <Input
                      type="url"
                      value={formData.mapUrl}
                      onChange={e => setFormData({ ...formData, mapUrl: e.target.value })}
                      placeholder="https://maps.google.com/..."
                      status={formErrors.mapUrl ? 'error' : ''}
                    />
                    {formErrors.mapUrl && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{formErrors.mapUrl}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="p-5 rounded-xl border space-y-4" style={{ background: '#ffffff', borderColor: '#e5e7eb' }}>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5" style={{ color: '#1e3a8a' }} />
                <h2 className="text-base font-semibold" style={{ color: '#111827' }}>
                  Social Media
                </h2>
              </div>

              {!isEditing ? (
                <div className="space-y-2">
                  {formData.socialLinks.length > 0 ? (
                    formData.socialLinks.map((link, index) => {
                      const IconComponent = getSocialIcon(link.platform);
                      return (
                        <div key={index} className="flex items-center gap-2 px-3 py-2 rounded" style={{ background: '#f9fafb' }}>
                          <div className="p-1.5 rounded" style={{ background: '#e5e7eb' }}>
                            <IconComponent className="w-4 h-4" style={{ color: '#374151' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium mb-0.5" style={{ color: '#6b7280' }}>
                              {SOCIAL_ICON_OPTIONS.find(opt => opt.id === link.platform)?.name || link.platform}
                            </p>
                            {link.url ? (
                              <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline break-all" style={{ color: '#1e3a8a' }}>
                                {link.url}
                              </a>
                            ) : (
                              <p className="text-xs" style={{ color: '#9ca3af' }}>Not set</p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm" style={{ color: '#9ca3af' }}>No links configured</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {formData.socialLinks.map((link, index) => {
                    const IconComponent = getSocialIcon(link.platform);
                    return (
                      <Space.Compact key={`social-${link.platform}-${index}`} style={{ width: '100%' }}>
                        <div className="flex items-center gap-2 px-2" style={{ background: '#f9fafb', minWidth: '140px' }}>
                          <IconComponent className="w-4 h-4" style={{ color: '#374151' }} />
                          <span className="text-xs font-medium truncate">
                            {SOCIAL_ICON_OPTIONS.find(opt => opt.id === link.platform)?.name || link.platform}
                          </span>
                        </div>
                        <Input
                          type="url"
                          value={link.url}
                          onChange={e => handleUpdateSocialUrl(link.platform, e.target.value)}
                          placeholder="https://..."
                        />
                        <Button
                          type="primary"
                          danger
                          icon={<Trash2 className="w-3 h-3" />}
                          onClick={() => handleRemoveSocialLink(link.platform)}
                        />
                      </Space.Compact>
                    );
                  })}
                  <div className="pt-2 border-t" style={{ borderColor: '#e5e7eb' }}>
                    <div className="space-y-2">
                      {/* Icon Selector with Search */}
                      <div className="relative" ref={iconDropdownRef}>
                        <label className="block text-xs font-medium mb-1" style={{ color: '#374151' }}>
                          Select Platform
                        </label>
                        <div className="relative">
                          <Input
                            value={iconSearchQuery}
                            onChange={e => setIconSearchQuery(e.target.value)}
                            placeholder="Search platforms..."
                            prefix={<Search className="w-4 h-4" style={{ color: '#9ca3af' }} />}
                            onFocus={() => setIsIconDropdownOpen(true)}
                            onClick={() => setIsIconDropdownOpen(!isIconDropdownOpen)}
                          />
                          {isIconDropdownOpen && (
                            <div
                              className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto border rounded-lg shadow-lg"
                              style={{ background: '#ffffff', borderColor: '#e5e7eb' }}
                            >
                              {iconSearchQuery && filteredIcons.length === 0 ? (
                                <div className="p-3 text-center text-sm" style={{ color: '#6b7280' }}>
                                  No platforms found
                                </div>
                              ) : iconSearchQuery ? (
                                filteredIcons.map((option) => {
                                  const IconComponent = option.icon;
                                  return (
                                    <div
                                      key={option.id}
                                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                      onClick={() => {
                                        setNewSocialIcon(option.id);
                                        setIconSearchQuery('');
                                        setIsIconDropdownOpen(false);
                                      }}
                                    >
                                      <IconComponent className="w-4 h-4" style={{ color: '#374151' }} />
                                      <span className="text-sm">{option.name}</span>
                                    </div>
                                  );
                                })
                              ) : (
                                // Show categories when no search
                                Object.entries(iconsByCategory).map(([category, icons]) => (
                                  <div key={category}>
                                    <div className="px-3 py-1 text-xs font-semibold uppercase" style={{ color: '#6b7280', background: '#f9fafb' }}>
                                      {category}
                                    </div>
                                    {icons.map((option) => {
                                      const IconComponent = option.icon;
                                      return (
                                        <div
                                          key={option.id}
                                          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                          onClick={() => {
                                            setNewSocialIcon(option.id);
                                            setIconSearchQuery('');
                                            setIsIconDropdownOpen(false);
                                          }}
                                        >
                                          <IconComponent className="w-4 h-4" style={{ color: '#374151' }} />
                                          <span className="text-sm">{option.name}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Selected Icon Display + URL Input */}
                      <div className="flex gap-2">
                        <div
                          className="flex items-center gap-2 px-3 py-2 rounded border cursor-pointer hover:bg-gray-50"
                          style={{ background: '#f9fafb', borderColor: '#e5e7eb', minWidth: '140px' }}
                          onClick={() => {
                            setIsIconDropdownOpen(true);
                            setIconSearchQuery('');
                          }}
                        >
                          {(() => {
                            const IconComponent = getSocialIcon(newSocialIcon);
                            const platformName = SOCIAL_ICON_OPTIONS.find(opt => opt.id === newSocialIcon)?.name || newSocialIcon;
                            return (
                              <>
                                <IconComponent className="w-4 h-4" style={{ color: '#374151' }} />
                                <span className="text-xs font-medium truncate">
                                  {platformName}
                                </span>
                              </>
                            );
                          })()}
                        </div>
                        <Input
                          type="url"
                          value={newSocialUrl}
                          onChange={e => setNewSocialUrl(e.target.value)}
                          placeholder="https://..."
                          className="flex-1"
                        />
                        <Button
                          type="primary"
                          icon={<Plus className="w-3 h-3" />}
                          onClick={handleAddSocialLink}
                          style={{ background: '#1e3a8a' }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Business Hours */}
            <div className="p-5 rounded-xl border space-y-4" style={{ background: '#ffffff', borderColor: '#e5e7eb' }}>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" style={{ color: '#1e3a8a' }} />
                <h2 className="text-base font-semibold" style={{ color: '#111827' }}>
                  Business Hours
                </h2>
              </div>

              {!isEditing ? (
                <div className="space-y-2">
                  {formData.businessHours.length > 0 ? (
                    formData.businessHours.map((hour, index) => (
                      <div key={index} className="px-3 py-2 rounded" style={{ background: '#f9fafb' }}>
                        <p className="text-xs font-medium" style={{ color: '#111827' }}>{hour.days}</p>
                        <p className="text-xs" style={{ color: '#6b7280' }}>{hour.hours}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm" style={{ color: '#9ca3af' }}>No hours configured</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {formData.businessHours.map((hour, index) => (
                    <Space.Compact key={`${hour.days}-${hour.hours}-${index}`} style={{ width: '100%' }}>
                      <Input
                        value={hour.days}
                        onChange={e => {
                          const newHours = [...formData.businessHours];
                          newHours[index].days = e.target.value;
                          setFormData({ ...formData, businessHours: newHours });
                        }}
                        placeholder="Mon-Fri"
                      />
                      <Input
                        value={hour.hours}
                        onChange={e => {
                          const newHours = [...formData.businessHours];
                          newHours[index].hours = e.target.value;
                          setFormData({ ...formData, businessHours: newHours });
                        }}
                        placeholder="9AM-6PM"
                      />
                      <Button
                        type="primary"
                        danger
                        icon={<Trash2 className="w-3 h-3" />}
                        onClick={() => handleRemoveBusinessHour(index)}
                      />
                    </Space.Compact>
                  ))}
                  <div className="pt-2 border-t" style={{ borderColor: '#e5e7eb' }}>
                    <Space.Compact key="add-new-business-hour" style={{ width: '100%' }}>
                      <Input
                        value={newBusinessDays}
                        onChange={e => setNewBusinessDays(e.target.value)}
                        placeholder="Days"
                      />
                      <Input
                        value={newBusinessHours}
                        onChange={e => setNewBusinessHours(e.target.value)}
                        placeholder="Hours"
                      />
                      <Button
                        type="primary"
                        icon={<Plus className="w-3 h-3" />}
                        onClick={handleAddBusinessHour}
                        style={{ background: '#1e3a8a' }}
                      >
                        Add
                      </Button>
                    </Space.Compact>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Buttons - Only show when editing */}
        {isEditing && (
          <div className="flex gap-3 pt-4 border-t" style={{ borderColor: '#e5e7eb' }}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<Save className="w-4 h-4" />}
              style={{ background: '#1e3a8a' }}
            >
              Save Changes
            </Button>
            <Button
              icon={<X className="w-4 h-4" />}
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
