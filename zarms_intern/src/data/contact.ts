import { ContactSettings } from './types';
import { apiRequest } from './apiClient';

type ContactApiResponse = {
  contactSettings: {
    constructionPhone: string;
    constructionEmail: string;
    softwarePhone: string;
    softwareEmail: string;
    whatsappNumber: string;
    address: string;
    mapsUrl?: string;
  };
  socialLinks: Array<{ platform: string; url: string }>;
  businessHours: Array<{ day: string; hours: string }>;
  enquiryEmails: string[];
};

function mapContact(data: ContactApiResponse): ContactSettings {
  // Handle null/undefined data safely
  if (!data) {
    return {
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
  }

  const settings = data.contactSettings || {};

  return {
    address: settings.address || '',
    constructionPhone: settings.constructionPhone || '',
    constructionEmail: settings.constructionEmail || '',
    softwarePhone: settings.softwarePhone || '',
    softwareEmail: settings.softwareEmail || '',
    whatsappNumber: settings.whatsappNumber || '',
    enquiryEmails: data.enquiryEmails || [],
    socialLinks: (data.socialLinks || []).map((link) => ({
      platform: link.platform || '',
      url: link.url || '',
      icon: link.platform || '',
    })),
    businessHours: (data.businessHours || []).map((hour) => ({
      days: hour.day || '',
      hours: hour.hours || '',
    })),
    mapUrl: settings.mapsUrl || '',
  };
}

export async function getContactSettings(): Promise<ContactSettings> {
  try {
    const data = await apiRequest<ContactApiResponse>('api/contact-settings/get');
    return mapContact(data);
  } catch (error) {
    // Log the error but return default settings instead of throwing
    console.warn('Backend contact settings unavailable, using defaults:', error);
    return {
      address: '30/1, Medawalkkam 2nd Street, Kilpauk, Chennai-10',
      constructionPhone: '9840344369',
      constructionEmail: 'narbhavi555@gmail.com',
      softwarePhone: '9994123797',
      softwareEmail: 'rajesh.arms916@gmail.com',
      whatsappNumber: '',
      enquiryEmails: [],
      socialLinks: [],
      businessHours: [],
      mapUrl: '',
    };
  }
}

export async function updateContactSettings(updates: Partial<ContactSettings>): Promise<void> {
  await apiRequest('api/contact-settings/update', {
    method: 'PUT',
    body: JSON.stringify({
      constructionPhone: updates.constructionPhone,
      constructionEmail: updates.constructionEmail,
      softwarePhone: updates.softwarePhone,
      softwareEmail: updates.softwareEmail,
      whatsappNumber: updates.whatsappNumber,
      address: updates.address,
      mapsUrl: updates.mapUrl,
    }),
  });

  if (updates.socialLinks) {
    await apiRequest('api/contact-settings/update-social-links', {
      method: 'POST',
      body: JSON.stringify({
        socialLinks: updates.socialLinks.map((link) => ({
          platform: link.platform,
          url: link.url,
          isActive: true,
        })),
      }),
    });
  }

  if (updates.businessHours) {
    await apiRequest('api/contact-settings/update-business-hours', {
      method: 'POST',
      body: JSON.stringify({
        businessHours: updates.businessHours.map((hour) => ({
          day: hour.days,
          hours: hour.hours,
        })),
      }),
    });
  }

  if (updates.enquiryEmails) {
    await apiRequest('api/contact-settings/update-enquiry-emails', {
      method: 'POST',
      body: JSON.stringify({
        enquiryEmails: updates.enquiryEmails.map((email) => ({ email, isActive: true })),
      }),
    });
  }
}

export async function submitEnquiry(payload: {
  name: string;
  email: string;
  phone: string;
  serviceType: 'construction' | 'software';
  subject?: string;
  message: string;
  company?: string;
}): Promise<void> {
  const composedMessage = payload.subject
    ? `Subject: ${payload.subject}\n\n${payload.message}`
    : payload.message;

  await apiRequest('api/enquiries/create', {
    method: 'POST',
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      company: payload.company || null,
      service: payload.serviceType,
      message: composedMessage,
    }),
  });
}
