import { ReactNode } from 'react';

/**
 * Conditionally render content only if the condition is met
 * Used throughout the website to hide sections when no data exists
 */
export function ConditionalSection({
  condition,
  children
}: {
  condition: boolean;
  children: ReactNode
}) {
  if (!condition) return null;
  return <>{children}</>;
}

/**
 * Check if a string value exists and is not empty
 */
export function hasValue(value: string | undefined | null): boolean {
  return Boolean(value && value.trim().length > 0);
}

/**
 * Check if an array has items
 */
export function hasItems<T>(array: T[] | undefined | null): boolean {
  return Boolean(array && array.length > 0);
}

/**
 * Conditionally render contact info block
 * Hide if phone or email is empty
 */
export function shouldShowContactBlock(phone?: string, email?: string): boolean {
  return hasValue(phone) || hasValue(email);
}

/**
 * Conditionally render social links
 * Only show social links that have URLs
 */
export function getValidSocialLinks(socialLinks: Array<{ platform: string; url: string; icon: string }>) {
  return socialLinks.filter(link => hasValue(link.url));
}
