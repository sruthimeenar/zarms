// Core data types for ZARMS Tec Admin Dashboard

export type ServiceType = 'Construction Services' | 'Software Solutions';
export type ProjectStatus = 'Ongoing' | 'Completed';

export interface PortfolioItem {
  id: string;
  serviceType: ServiceType;
  projectName: string;
  description: string;
  images: string[];
  icon: string;
  subtitle?: string;
  shortSummary?: string;
  status?: ProjectStatus;
  projectLocation?: string;
  featured?: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GalleryItem {
  id: string;
  serviceType: ServiceType;
  image: string;
  title: string;
  subtitle?: string;
  sortOrder?: number;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface BusinessHour {
  days: string;
  hours: string;
}

export interface ContactSettings {
  address: string;
  constructionPhone: string;
  constructionEmail: string;
  softwarePhone: string;
  softwareEmail: string;
  whatsappNumber: string;
  enquiryEmails: string[];
  socialLinks: SocialLink[];
  businessHours: BusinessHour[];
  mapUrl?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

// Validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
