import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Settings, X, Palette, Type, Layout, Sparkles, RefreshCw, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function ThemeCustomizer() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('colors');
  const { theme, updateTheme, resetTheme, applyPreset } = useTheme();

  const tabs = [
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'layout', label: 'Layout', icon: Layout },
    { id: 'effects', label: 'Effects', icon: Sparkles },
    { id: 'hero', label: 'Hero Banner', icon: Film },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-110 cursor-pointer"
        style={{
          background: `linear-gradient(135deg, var(--brand-secondary), var(--brand-accent))`,
          color: 'var(--text-inverse)',
        }}
        aria-label="Open Theme Customizer"
      >
        <Settings className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[60]"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] overflow-y-auto"
              style={{ background: 'var(--card-background)', color: 'var(--text-primary)' }}
            >
              <div className="sticky top-0 z-10 p-6 border-b" style={{ background: 'var(--card-background)', borderColor: 'var(--border-color)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Theme Customizer</h2>
                  <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2">
                  {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors cursor-pointer"
                        style={{
                          background: activeTab === tab.id ? 'var(--brand-primary)' : 'var(--section-bg-light)',
                          color: activeTab === tab.id ? 'var(--text-inverse)' : 'var(--text-secondary)',
                        }}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 space-y-6">
                {activeTab === 'colors' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-4">Presets</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {['balanced-corporate', 'tech-focus', 'construction-focus', 'light-professional', 'dark-premium'].map(preset => (
                          <button
                            key={preset}
                            onClick={() => applyPreset(preset)}
                            className="px-4 py-2 rounded-lg border text-sm hover:scale-105 transition-transform cursor-pointer"
                            style={{ borderColor: 'var(--border-color)' }}
                          >
                            {preset.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </button>
                        ))}
                      </div>
                    </div>

                    <ColorInput label="Primary Color" value={theme.brandPrimary} onChange={v => updateTheme({ brandPrimary: v })} />
                    <ColorInput label="Secondary Color" value={theme.brandSecondary} onChange={v => updateTheme({ brandSecondary: v })} />
                    <ColorInput label="Accent Color" value={theme.brandAccent} onChange={v => updateTheme({ brandAccent: v })} />
                    <ColorInput label="Highlight Color" value={theme.brandHighlight} onChange={v => updateTheme({ brandHighlight: v })} />
                    <ColorInput label="Icon BG Primary" value={theme.iconBgPrimary} onChange={v => updateTheme({ iconBgPrimary: v })} />
                    <ColorInput label="Icon BG Secondary" value={theme.iconBgSecondary} onChange={v => updateTheme({ iconBgSecondary: v })} />
                    <ColorInput label="Page Background" value={theme.pageBackground} onChange={v => updateTheme({ pageBackground: v })} />
                    <ColorInput label="Section Light BG" value={theme.sectionBgLight} onChange={v => updateTheme({ sectionBgLight: v })} />
                    <ColorInput label="Section Dark BG" value={theme.sectionBgDark} onChange={v => updateTheme({ sectionBgDark: v })} />
                    <ColorInput label="Card Background" value={theme.cardBackground} onChange={v => updateTheme({ cardBackground: v })} />
                    <ColorInput label="Footer Background" value={theme.footerBg} onChange={v => updateTheme({ footerBg: v })} />
                    <ColorInput label="Text Primary" value={theme.textPrimary} onChange={v => updateTheme({ textPrimary: v })} />
                    <ColorInput label="Text Secondary" value={theme.textSecondary} onChange={v => updateTheme({ textSecondary: v })} />
                    <ColorInput label="Border Color" value={theme.borderColor} onChange={v => updateTheme({ borderColor: v })} />
                  </div>
                )}

                {activeTab === 'typography' && (
                  <div className="space-y-6">
                    <TextInput label="Heading Font" value={theme.fontHeading} onChange={v => updateTheme({ fontHeading: v })} />
                    <TextInput label="Body Font" value={theme.fontBody} onChange={v => updateTheme({ fontBody: v })} />
                    <TextInput label="Base Font Size" value={theme.fontSizeBase} onChange={v => updateTheme({ fontSizeBase: v })} />
                    <TextInput label="Heading Weight" value={theme.headingWeight} onChange={v => updateTheme({ headingWeight: v })} />
                    <TextInput label="Body Weight" value={theme.bodyWeight} onChange={v => updateTheme({ bodyWeight: v })} />
                    <TextInput label="Line Height" value={theme.lineHeight} onChange={v => updateTheme({ lineHeight: v })} />
                    <TextInput label="Letter Spacing" value={theme.letterSpacing} onChange={v => updateTheme({ letterSpacing: v })} />
                  </div>
                )}

                {activeTab === 'layout' && (
                  <div className="space-y-6">
                    <TextInput label="Border Radius SM" value={theme.radiusSm} onChange={v => updateTheme({ radiusSm: v })} />
                    <TextInput label="Border Radius MD" value={theme.radiusMd} onChange={v => updateTheme({ radiusMd: v })} />
                    <TextInput label="Border Radius LG" value={theme.radiusLg} onChange={v => updateTheme({ radiusLg: v })} />
                    <TextInput label="Card Radius" value={theme.radiusCard} onChange={v => updateTheme({ radiusCard: v })} />
                    <TextInput label="Button Radius" value={theme.radiusButton} onChange={v => updateTheme({ radiusButton: v })} />
                    <TextInput label="Section Padding Y" value={theme.sectionPaddingY} onChange={v => updateTheme({ sectionPaddingY: v })} />
                    <TextInput label="Section Padding X" value={theme.sectionPaddingX} onChange={v => updateTheme({ sectionPaddingX: v })} />
                    <TextInput label="Grid Gap" value={theme.gridGap} onChange={v => updateTheme({ gridGap: v })} />
                    <TextInput label="Card Spacing" value={theme.cardSpacing} onChange={v => updateTheme({ cardSpacing: v })} />
                  </div>
                )}

                {activeTab === 'effects' && (
                  <div className="space-y-6">
                    <TextInput label="Animation Speed" value={theme.animationSpeed} onChange={v => updateTheme({ animationSpeed: v })} />
                    <TextInput label="Hover Intensity" value={theme.hoverIntensity} onChange={v => updateTheme({ hoverIntensity: v })} />
                    <TextInput label="Blur Strength" value={theme.blurStrength} onChange={v => updateTheme({ blurStrength: v })} />
                    <TextInput label="Glow Intensity" value={theme.glowIntensity} onChange={v => updateTheme({ glowIntensity: v })} />
                    <TextInput label="Parallax Strength" value={theme.parallaxStrength} onChange={v => updateTheme({ parallaxStrength: v })} />
                  </div>
                )}

                {activeTab === 'hero' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Rotation Settings</h3>
                      <TextInput
                        label="Rotation Interval (ms)"
                        value={theme.heroRotationInterval}
                        onChange={v => updateTheme({ heroRotationInterval: v })}
                      />
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        Time between banner changes (e.g., 4000 = 4 seconds)
                      </p>
                    </div>

                    <div>
                      <TextInput
                        label="Transition Duration (ms)"
                        value={theme.heroTransitionDuration}
                        onChange={v => updateTheme({ heroTransitionDuration: v })}
                      />
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        Animation speed for transitions (e.g., 1000 = 1 second)
                      </p>
                    </div>

                    <div>
                      <TextInput
                        label="Overlay Opacity"
                        value={theme.heroOverlayOpacity}
                        onChange={v => updateTheme({ heroOverlayOpacity: v })}
                      />
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        Darkness overlay on video (0.0 - 1.0)
                      </p>
                    </div>

                    <div>
                      <TextInput
                        label="Content Max Width"
                        value={theme.heroContentMaxWidth}
                        onChange={v => updateTheme({ heroContentMaxWidth: v })}
                      />
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        Maximum width of hero content (e.g., 1200px)
                      </p>
                    </div>

                    <div>
                      <TextInput
                        label="Mobile Hero Height"
                        value={theme.heroMobileHeight}
                        onChange={v => updateTheme({ heroMobileHeight: v })}
                      />
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        Hero height on mobile devices (e.g., 70vh)
                      </p>
                    </div>

                    <div className="space-y-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                      <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Banner Controls</h3>

                      <CheckboxInput
                        label="Enable Auto Rotation"
                        checked={theme.heroAutoRotate}
                        onChange={v => updateTheme({ heroAutoRotate: v })}
                        description="Automatically cycle through banner states"
                      />

                      <CheckboxInput
                        label="Show Manual Controls"
                        checked={theme.heroManualControls}
                        onChange={v => updateTheme({ heroManualControls: v })}
                        description="Display arrows, dots, and play/pause controls"
                      />

                      <CheckboxInput
                        label="Enable Category Transitions"
                        checked={theme.heroEnableCategoryTransitions}
                        onChange={v => updateTheme({ heroEnableCategoryTransitions: v })}
                        description="Use unique transitions per banner category"
                      />

                      <CheckboxInput
                        label="Reduced Motion Mode"
                        checked={theme.heroReducedMotion}
                        onChange={v => updateTheme({ heroReducedMotion: v })}
                        description="Simplify animations for accessibility"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={resetTheme}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg border transition-all hover:scale-105 cursor-pointer"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset to Default
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>{label}</label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-12 h-12 rounded-lg cursor-pointer border"
          style={{ borderColor: 'var(--border-color)' }}
        />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border"
          style={{
            background: 'var(--input-bg)',
            borderColor: 'var(--input-border)',
            color: 'var(--text-primary)',
          }}
        />
      </div>
    </div>
  );
}

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border"
        style={{
          background: 'var(--input-bg)',
          borderColor: 'var(--input-border)',
          color: 'var(--text-primary)',
        }}
      />
    </div>
  );
}

function CheckboxInput({
  label,
  checked,
  onChange,
  description,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="mt-1 w-5 h-5 rounded cursor-pointer"
        style={{ accentColor: 'var(--brand-primary)' }}
      />
      <div className="flex-1">
        <label className="block font-medium cursor-pointer" style={{ color: 'var(--text-primary)' }}>
          {label}
        </label>
        {description && (
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
