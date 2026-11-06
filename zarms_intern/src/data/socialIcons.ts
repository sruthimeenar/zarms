/**
 * Social Media Icons Library
 * Only using icons that are confirmed to exist in lucide-react v0.487.0
 */

import {
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Twitter,
  Github,
  Mail,
  Phone,
  Link,
  Globe,
  MessageCircle,
} from 'lucide-react';

export interface SocialIconOption {
  id: string;
  name: string;
  icon: any;
  category: 'social' | 'professional' | 'communication' | 'other';
}

export const SOCIAL_ICON_OPTIONS: SocialIconOption[] = [
  // Social Media Platforms
  { id: 'facebook', name: 'Facebook', icon: Facebook, category: 'social' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, category: 'social' },
  { id: 'twitter', name: 'Twitter', icon: Twitter, category: 'social' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, category: 'social' },

  // Professional Networks
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, category: 'professional' },
  { id: 'github', name: 'GitHub', icon: Github, category: 'professional' },

  // Communication Platforms
  { id: 'email', name: 'Email', icon: Mail, category: 'communication' },
  { id: 'phone', name: 'Phone', icon: Phone, category: 'communication' },
  { id: 'message', name: 'Message', icon: MessageCircle, category: 'communication' },

  // General/Other
  { id: 'website', name: 'Website', icon: Globe, category: 'other' },
  { id: 'link', name: 'Other Link', icon: Link, category: 'other' },
];

/**
 * Get icon component by platform ID
 */
export function getSocialIcon(platformId: string): any {
  const option = SOCIAL_ICON_OPTIONS.find(opt => opt.id === platformId);
  return option?.icon || Link;
}

/**
 * Get icon options grouped by category
 */
export function getIconsByCategory(): Record<string, SocialIconOption[]> {
  const grouped: Record<string, SocialIconOption[]> = {
    social: [],
    professional: [],
    communication: [],
    other: [],
  };

  SOCIAL_ICON_OPTIONS.forEach(option => {
    grouped[option.category].push(option);
  });

  return grouped;
}

/**
 * Search icons by name
 */
export function searchIcons(query: string): SocialIconOption[] {
  const lowerQuery = query.toLowerCase();
  return SOCIAL_ICON_OPTIONS.filter(option =>
    option.name.toLowerCase().includes(lowerQuery) ||
    option.id.toLowerCase().includes(lowerQuery)
  );
}
