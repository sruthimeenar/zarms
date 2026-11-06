import { ValidationError, FormValidationResult, PortfolioItem, GalleryItem, ContactSettings } from './types';

// Validation helper functions

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{10,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

export const validateURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('www.');
  }
};

export const validateRequired = (value: string | undefined): boolean => {
  return Boolean(value && value.trim().length > 0);
};

export const validateMaxLength = (value: string, maxLength: number): boolean => {
  return value.trim().length <= maxLength;
};

export const validateMinLength = (value: string, minLength: number): boolean => {
  return value.trim().length >= minLength;
};

// Portfolio validation
export const validatePortfolioItem = (item: Partial<PortfolioItem>): FormValidationResult => {
  const errors: ValidationError[] = [];

  if (!validateRequired(item.projectName)) {
    errors.push({ field: 'projectName', message: 'Project name is required' });
  } else if (!validateMaxLength(item.projectName!, 80)) {
    errors.push({ field: 'projectName', message: 'Project name must be 80 characters or less' });
  }

  if (!validateRequired(item.description)) {
    errors.push({ field: 'description', message: 'Description is required' });
  } else if (!validateMaxLength(item.description!, 500)) {
    errors.push({ field: 'description', message: 'Description must be 500 characters or less' });
  }

  if (!item.serviceType) {
    errors.push({ field: 'serviceType', message: 'Service type is required' });
  }

  if (!item.images || item.images.length === 0) {
    errors.push({ field: 'images', message: 'At least one image is required' });
  } else if (item.images.length > 5) {
    errors.push({ field: 'images', message: 'Maximum 5 images allowed' });
  }

  if (!validateRequired(item.icon)) {
    errors.push({ field: 'icon', message: 'Icon is required' });
  }

  if (item.subtitle && !validateMaxLength(item.subtitle, 100)) {
    errors.push({ field: 'subtitle', message: 'Subtitle must be 100 characters or less' });
  }

  if (item.shortSummary && !validateMaxLength(item.shortSummary, 140)) {
    errors.push({ field: 'shortSummary', message: 'Short summary must be 140 characters or less' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Gallery validation
export const validateGalleryItem = (item: Partial<GalleryItem & { images?: string[] }>): FormValidationResult => {
  const errors: ValidationError[] = [];

  if (!item.serviceType) {
    errors.push({ field: 'serviceType', message: 'Service type is required' });
  }

  // Check for either single image or multiple images
  const hasImage = validateRequired(item.image);
  const hasImages = item.images && item.images.length > 0;

  if (!hasImage && !hasImages) {
    errors.push({ field: 'image', message: 'At least one image is required' });
  }

  if (!validateRequired(item.title)) {
    errors.push({ field: 'title', message: 'Title is required' });
  } else if (!validateMaxLength(item.title!, 80)) {
    errors.push({ field: 'title', message: 'Title must be 80 characters or less' });
  }

  if (item.subtitle && !validateMaxLength(item.subtitle, 120)) {
    errors.push({ field: 'subtitle', message: 'Subtitle must be 120 characters or less' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Contact settings validation
export const validateContactSettings = (settings: Partial<ContactSettings>): FormValidationResult => {
  const errors: ValidationError[] = [];

  if (settings.constructionPhone && !validatePhone(settings.constructionPhone)) {
    errors.push({ field: 'constructionPhone', message: 'Invalid construction phone number' });
  }

  if (settings.constructionEmail && !validateEmail(settings.constructionEmail)) {
    errors.push({ field: 'constructionEmail', message: 'Invalid construction email address' });
  }

  if (settings.softwarePhone && !validatePhone(settings.softwarePhone)) {
    errors.push({ field: 'softwarePhone', message: 'Invalid software phone number' });
  }

  if (settings.softwareEmail && !validateEmail(settings.softwareEmail)) {
    errors.push({ field: 'softwareEmail', message: 'Invalid software email address' });
  }

  if (settings.whatsappNumber && !validatePhone(settings.whatsappNumber)) {
    errors.push({ field: 'whatsappNumber', message: 'Invalid WhatsApp number' });
  }

  if (settings.enquiryEmails) {
    settings.enquiryEmails.forEach((email, index) => {
      if (!validateEmail(email)) {
        errors.push({ field: `enquiryEmails[${index}]`, message: `Invalid enquiry email at position ${index + 1}` });
      }
    });
  }

  if (settings.socialLinks) {
    settings.socialLinks.forEach((link, index) => {
      if (link.url && !validateURL(link.url)) {
        errors.push({ field: `socialLinks[${index}]`, message: `Invalid URL for ${link.platform}` });
      }
    });
  }

  if (settings.mapUrl && !validateURL(settings.mapUrl)) {
    errors.push({ field: 'mapUrl', message: 'Invalid map URL' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Image file validation
export const validateImageFile = (file: File): FormValidationResult => {
  const errors: ValidationError[] = [];
  const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    errors.push({ field: 'file', message: 'Only JPG, PNG, and WebP images are allowed' });
  }

  if (file.size > maxSizeInBytes) {
    errors.push({ field: 'file', message: 'Image size must be less than 5MB' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
