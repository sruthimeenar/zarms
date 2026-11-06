import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Theme {
  // Brand Colors
  brandPrimary: string;
  brandSecondary: string;
  brandAccent: string;
  brandHighlight: string;
  iconBgPrimary: string;
  iconBgSecondary: string;

  // Backgrounds
  pageBackground: string;
  sectionBgLight: string;
  sectionBgDark: string;
  cardBackground: string;
  glassBg: string;
  footerBg: string;
  headerBg: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  // UI
  borderColor: string;
  dividerColor: string;
  inputBg: string;
  inputBorder: string;
  hoverOverlay: string;
  iconColor: string;
  badgeBg: string;
  badgeText: string;

  // Status
  success: string;
  warning: string;
  error: string;
  info: string;

  // Gradients
  heroGradientStart: string;
  heroGradientEnd: string;
  btnGradientStart: string;
  btnGradientEnd: string;
  accentGlow: string;
  overlayTint: string;

  // Typography
  fontHeading: string;
  fontBody: string;
  fontSizeBase: string;
  headingScale: string;
  lineHeight: string;
  letterSpacing: string;
  headingWeight: string;
  bodyWeight: string;

  // Layout
  radiusSm: string;
  radiusMd: string;
  radiusLg: string;
  radiusXl: string;
  radiusButton: string;
  radiusCard: string;
  radiusInput: string;
  containerWidth: string;
  sectionPaddingY: string;
  sectionPaddingX: string;
  gridGap: string;
  cardSpacing: string;
  navbarHeight: string;
  heroHeight: string;

  // Effects
  shadowSm: string;
  shadowMd: string;
  shadowLg: string;
  shadowXl: string;
  glowIntensity: string;
  blurStrength: string;

  // Animation
  animationSpeed: string;
  hoverIntensity: string;
  scrollIntensity: string;
  parallaxStrength: string;

  // Hero Banner Settings
  heroRotationInterval: string;
  heroTransitionDuration: string;
  heroAutoRotate: boolean;
  heroManualControls: boolean;
  heroOverlayOpacity: string;
  heroContentMaxWidth: string;
  heroMobileHeight: string;
  heroEnableCategoryTransitions: boolean;
  heroReducedMotion: boolean;
}

export const defaultTheme: Theme = {
  brandPrimary: '#1e3a8a',
  brandSecondary: '#0891b2',
  brandAccent: '#d97706',
  brandHighlight: '#06b6d4',
  iconBgPrimary: '#1e3a8a',
  iconBgSecondary: '#d97706',
  pageBackground: '#ffffff',
  sectionBgLight: '#f9fafb',
  sectionBgDark: '#1f2937',
  cardBackground: '#ffffff',
  glassBg: 'rgba(255, 255, 255, 0.8)',
  footerBg: '#111827',
  headerBg: 'rgba(255, 255, 255, 0.95)',
  textPrimary: '#111827',
  textSecondary: '#4b5563',
  textMuted: '#9ca3af',
  textInverse: '#ffffff',
  borderColor: '#e5e7eb',
  dividerColor: '#d1d5db',
  inputBg: '#f9fafb',
  inputBorder: '#d1d5db',
  hoverOverlay: 'rgba(0, 0, 0, 0.05)',
  iconColor: '#6b7280',
  badgeBg: '#dbeafe',
  badgeText: '#1e40af',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  heroGradientStart: '#1e3a8a',
  heroGradientEnd: '#0891b2',
  btnGradientStart: '#0891b2',
  btnGradientEnd: '#06b6d4',
  accentGlow: '#d97706',
  overlayTint: 'rgba(30, 58, 138, 0.9)',
  fontHeading: "'Inter', system-ui, -apple-system, sans-serif",
  fontBody: "'Inter', system-ui, -apple-system, sans-serif",
  fontSizeBase: '1rem',
  headingScale: '1.25',
  lineHeight: '1.6',
  letterSpacing: '-0.01em',
  headingWeight: '700',
  bodyWeight: '400',
  radiusSm: '0.375rem',
  radiusMd: '0.5rem',
  radiusLg: '0.75rem',
  radiusXl: '1rem',
  radiusButton: '0.5rem',
  radiusCard: '0.75rem',
  radiusInput: '0.5rem',
  containerWidth: '1280px',
  sectionPaddingY: '5rem',
  sectionPaddingX: '1.5rem',
  gridGap: '2rem',
  cardSpacing: '1.5rem',
  navbarHeight: '5rem',
  heroHeight: '90vh',
  shadowSm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  shadowMd: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  shadowLg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  shadowXl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  glowIntensity: '0.5',
  blurStrength: '10px',
  animationSpeed: '0.3s',
  hoverIntensity: '1.05',
  scrollIntensity: '0.5',
  parallaxStrength: '0.3',
  heroRotationInterval: '7000',
  heroTransitionDuration: '1000',
  heroAutoRotate: true,
  heroManualControls: true,
  heroOverlayOpacity: '0.4',
  heroContentMaxWidth: '1200px',
  heroMobileHeight: '70vh',
  heroEnableCategoryTransitions: true,
  heroReducedMotion: false,
};

interface ThemeContextType {
  theme: Theme;
  updateTheme: (updates: Partial<Theme>) => void;
  resetTheme: () => void;
  applyPreset: (preset: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('zarms-theme');
    return saved ? { ...defaultTheme, ...JSON.parse(saved) } : defaultTheme;
  });

  useEffect(() => {
    applyThemeToDOM(theme);
    localStorage.setItem('zarms-theme', JSON.stringify(theme));
  }, [theme]);

  const updateTheme = (updates: Partial<Theme>) => {
    setTheme(prev => ({ ...prev, ...updates }));
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
  };

  const applyPreset = (preset: string) => {
    const presets: Record<string, Partial<Theme>> = {
      'balanced-corporate': defaultTheme,
      'tech-focus': {
        brandPrimary: '#0f172a',
        brandSecondary: '#06b6d4',
        brandAccent: '#22d3ee',
        sectionBgDark: '#0f172a',
        heroGradientStart: '#0f172a',
        heroGradientEnd: '#06b6d4',
      },
      'construction-focus': {
        brandPrimary: '#1f2937',
        brandSecondary: '#f59e0b',
        brandAccent: '#ea580c',
        sectionBgDark: '#1c1917',
        heroGradientStart: '#1f2937',
        heroGradientEnd: '#92400e',
      },
      'light-professional': {
        brandPrimary: '#3b82f6',
        brandSecondary: '#60a5fa',
        sectionBgLight: '#f8fafc',
        sectionBgDark: '#f1f5f9',
        cardBackground: '#ffffff',
      },
      'dark-premium': {
        pageBackground: '#0f172a',
        sectionBgLight: '#1e293b',
        sectionBgDark: '#020617',
        cardBackground: '#1e293b',
        textPrimary: '#f1f5f9',
        textSecondary: '#cbd5e1',
        brandPrimary: '#0ea5e9',
        brandAccent: '#f97316',
      },
    };

    if (presets[preset]) {
      setTheme(prev => ({ ...prev, ...presets[preset] }));
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, resetTheme, applyPreset }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}

function applyThemeToDOM(theme: Theme) {
  const root = document.documentElement;
  root.style.setProperty('--brand-primary', theme.brandPrimary);
  root.style.setProperty('--brand-secondary', theme.brandSecondary);
  root.style.setProperty('--brand-accent', theme.brandAccent);
  root.style.setProperty('--brand-highlight', theme.brandHighlight);
  root.style.setProperty('--icon-bg-primary', theme.iconBgPrimary);
  root.style.setProperty('--icon-bg-secondary', theme.iconBgSecondary);
  root.style.setProperty('--page-background', theme.pageBackground);
  root.style.setProperty('--section-bg-light', theme.sectionBgLight);
  root.style.setProperty('--section-bg-dark', theme.sectionBgDark);
  root.style.setProperty('--card-background', theme.cardBackground);
  root.style.setProperty('--glass-bg', theme.glassBg);
  root.style.setProperty('--footer-bg', theme.footerBg);
  root.style.setProperty('--header-bg', theme.headerBg);
  root.style.setProperty('--text-primary', theme.textPrimary);
  root.style.setProperty('--text-secondary', theme.textSecondary);
  root.style.setProperty('--text-muted', theme.textMuted);
  root.style.setProperty('--text-inverse', theme.textInverse);
  root.style.setProperty('--border-color', theme.borderColor);
  root.style.setProperty('--divider-color', theme.dividerColor);
  root.style.setProperty('--input-bg', theme.inputBg);
  root.style.setProperty('--input-border', theme.inputBorder);
  root.style.setProperty('--hover-overlay', theme.hoverOverlay);
  root.style.setProperty('--icon-color', theme.iconColor);
  root.style.setProperty('--badge-bg', theme.badgeBg);
  root.style.setProperty('--badge-text', theme.badgeText);
  root.style.setProperty('--success', theme.success);
  root.style.setProperty('--warning', theme.warning);
  root.style.setProperty('--error', theme.error);
  root.style.setProperty('--info', theme.info);
  root.style.setProperty('--hero-gradient-start', theme.heroGradientStart);
  root.style.setProperty('--hero-gradient-end', theme.heroGradientEnd);
  root.style.setProperty('--btn-gradient-start', theme.btnGradientStart);
  root.style.setProperty('--btn-gradient-end', theme.btnGradientEnd);
  root.style.setProperty('--accent-glow', theme.accentGlow);
  root.style.setProperty('--overlay-tint', theme.overlayTint);
  root.style.setProperty('--font-heading', theme.fontHeading);
  root.style.setProperty('--font-body', theme.fontBody);
  root.style.setProperty('--font-size-base', theme.fontSizeBase);
  root.style.setProperty('--heading-scale', theme.headingScale);
  root.style.setProperty('--line-height', theme.lineHeight);
  root.style.setProperty('--letter-spacing', theme.letterSpacing);
  root.style.setProperty('--heading-weight', theme.headingWeight);
  root.style.setProperty('--body-weight', theme.bodyWeight);
  root.style.setProperty('--radius-sm', theme.radiusSm);
  root.style.setProperty('--radius-md', theme.radiusMd);
  root.style.setProperty('--radius-lg', theme.radiusLg);
  root.style.setProperty('--radius-xl', theme.radiusXl);
  root.style.setProperty('--radius-button', theme.radiusButton);
  root.style.setProperty('--radius-card', theme.radiusCard);
  root.style.setProperty('--radius-input', theme.radiusInput);
  root.style.setProperty('--container-width', theme.containerWidth);
  root.style.setProperty('--section-padding-y', theme.sectionPaddingY);
  root.style.setProperty('--section-padding-x', theme.sectionPaddingX);
  root.style.setProperty('--grid-gap', theme.gridGap);
  root.style.setProperty('--card-spacing', theme.cardSpacing);
  root.style.setProperty('--navbar-height', theme.navbarHeight);
  root.style.setProperty('--hero-height', theme.heroHeight);
  root.style.setProperty('--shadow-sm', theme.shadowSm);
  root.style.setProperty('--shadow-md', theme.shadowMd);
  root.style.setProperty('--shadow-lg', theme.shadowLg);
  root.style.setProperty('--shadow-xl', theme.shadowXl);
  root.style.setProperty('--glow-intensity', theme.glowIntensity);
  root.style.setProperty('--blur-strength', theme.blurStrength);
  root.style.setProperty('--animation-speed', theme.animationSpeed);
  root.style.setProperty('--hover-intensity', theme.hoverIntensity);
  root.style.setProperty('--scroll-intensity', theme.scrollIntensity);
  root.style.setProperty('--parallax-strength', theme.parallaxStrength);
  root.style.setProperty('--hero-rotation-interval', theme.heroRotationInterval);
  root.style.setProperty('--hero-transition-duration', theme.heroTransitionDuration);
  root.style.setProperty('--hero-overlay-opacity', theme.heroOverlayOpacity);
  root.style.setProperty('--hero-content-max-width', theme.heroContentMaxWidth);
  root.style.setProperty('--hero-mobile-height', theme.heroMobileHeight);
}