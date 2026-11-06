==================================================
DEVELOPER COMPONENT – GLOBAL THEME CUSTOMIZER
==================================================

In addition to the full website, build a developer-facing **Theme Customizer** component for ZARMS Tec.

This is a global design system controller for the website. It must allow the developer or admin to change major design styles from one place, and those changes must apply to the entire website instantly without editing each page manually.

The Theme Customizer is a developer component, not a normal public user feature. It can be accessed through a hidden toggle, developer panel, admin trigger, or settings icon. It should feel modern, premium, organized, and easy to use.

CORE REQUIREMENT

The website must be built on a centralized theming system using global design tokens / CSS variables / theme configuration so that all styling is controlled from a single source of truth.

When the developer changes values in the Theme Customizer:
- the changes must apply globally across the entire website
- the changes must update all pages and all components instantly
- the changes must persist for the next visit
- the selected theme must be stored in browser cache / local storage / persistent client storage
- the website must reopen with the same previously selected theme
- there must also be a reset-to-default-theme option
- there must be predefined default theme values

Do not hardcode styling separately inside each component.
Use a proper theme architecture so the whole site is dynamic and maintainable.

THEME SYSTEM ARCHITECTURE

Build the website using a centralized theming approach such as:
- CSS custom properties / root variables
- theme provider / context
- design tokens
- global style config
- reusable semantic color tokens
- reusable spacing, radius, typography, and shadow tokens

All major UI elements must consume theme variables, including:
- body background
- section backgrounds
- text colors
- headings
- buttons
- links
- hover states
- cards
- shadows
- borders
- gradients
- form inputs
- dropdown menus
- portfolio filters
- header
- footer
- mobile menu
- service cards
- gallery overlays
- FAQ accordion
- floating WhatsApp button
- CTA ribbons
- badges
- icons
- timeline/process sections
- animation accent colors

THEME CUSTOMIZER UI REQUIREMENTS

Create a polished side panel, drawer, floating settings modal, or expandable developer settings component.

The customizer interface should be well organized into categories such as:
1. Colors
2. Typography
3. Layout
4. Components
5. Effects & Motion
6. Presets
7. Reset / Save / Export

The customizer must provide real-time live preview.

When a theme option is changed:
- it must immediately reflect on the full website
- it must update without page reload if possible
- it must remain stable and clean on all screen sizes

COLOR CONTROLS

The Theme Customizer must include global color settings for:

Main Brand Colors
- Primary Color
- Secondary Color
- Accent Color
- Highlight Color

Background Colors
- Page Background
- Section Background Light
- Section Background Dark
- Card Background
- Glass / overlay background
- Footer Background
- Header Background

Text Colors
- Primary Text Color
- Secondary Text Color
- Muted Text Color
- Inverse Text Color

UI Colors
- Border Color
- Divider Color
- Input Background
- Input Border
- Hover Overlay Color
- Icon Color
- Badge Background
- Badge Text Color

Status / Utility Colors
- Success
- Warning
- Error
- Info

Gradient Controls
- Hero Gradient Start
- Hero Gradient End
- Button Gradient Start
- Button Gradient End
- Accent Glow Color
- Overlay Tint Color

Also allow:
- opacity control for overlays
- dark/light intensity control for sections
- optional monochrome mode toggle
- optional construction-heavy or tech-heavy accent balance

DEFAULT COLOR PRESETS

Include at least these built-in presets:
1. Balanced Corporate
   - deep navy / slate base
   - electric blue / teal accent
   - warm amber / copper construction accent

2. Tech Focus
   - darker digital background
   - cooler blues and cyan highlights
   - more futuristic feel

3. Construction Focus
   - deeper charcoal base
   - warm gold / amber / copper accents
   - grounded industrial look

4. Light Professional
   - clean white and gray surfaces
   - subtle blue accents
   - soft warm contrast

5. Dark Premium
   - luxury dark background
   - glowing blue/teal accents
   - elegant copper highlights

TYPOGRAPHY CONTROLS

The Theme Customizer must allow developer control over:
- Heading Font Family
- Body Font Family
- Button Font Family if needed
- Base Font Size
- Heading Scale
- Body Text Size
- Small Text Size
- Line Height
- Letter Spacing
- Heading Weight
- Body Weight

Typography changes must update site-wide consistently, including:
- hero headings
- page titles
- navigation
- form labels
- buttons
- body text
- testimonials
- footer text
- portfolio captions

LAYOUT CONTROLS

Include developer controls for:
- Global Border Radius
- Button Radius
- Card Radius
- Input Radius
- Container Width
- Section Padding Vertical
- Section Padding Horizontal
- Grid Gap
- Card Spacing
- Navbar Height
- Hero Section Height
- Sticky Header Density
- Footer Padding

Allow presets such as:
- Compact
- Balanced
- Spacious

COMPONENT STYLE CONTROLS

The Theme Customizer must allow global styling changes for reusable components, including:

Buttons
- filled / outline / soft / gradient style
- button shadow intensity
- hover lift amount
- glow effect on/off
- border thickness
- button text transform
- icon placement style

Cards
- flat / elevated / glass / outlined style
- shadow softness
- border visibility
- hover transform intensity
- card background transparency
- spotlight hover effect on/off

Forms
- input height
- input radius
- label style
- focus glow color
- form border style
- placeholder text tone
- submit button style

Navigation
- transparent hero header on/off
- solid sticky header on scroll
- menu hover underline style
- active menu indicator style
- dropdown menu style
- mobile drawer style

Gallery / Portfolio
- hover overlay style
- caption placement
- image border radius
- filter tab style
- modal/lightbox theme
- grayscale-to-color hover toggle
- zoom hover intensity

Footer
- footer theme dark/light
- footer column spacing
- social icon style
- footer CTA emphasis

EFFECTS AND MOTION CONTROLS

The Theme Customizer must include settings for motion and visual effects across the whole site.

Controls should include:
- Global Animation Speed
- Section Reveal Style
- Hover Intensity
- Scroll Effect Intensity
- Parallax Strength
- Mouse Move Effect Strength
- Blur Strength
- Glow Intensity
- Shadow Depth
- Morph Effect Intensity
- Image Transition Speed
- Button Hover Style
- Card Tilt On/Off
- Floating Shapes On/Off
- Animated Gradient On/Off
- Link Underline Animation Style
- Reduced Motion Toggle

The developer should be able to choose between motion presets:
- Minimal
- Balanced
- Rich
- Reduced Motion

If reduced motion is enabled:
- disable heavy parallax
- reduce hover movement
- simplify section entrances
- keep accessibility and performance strong

LIVE GLOBAL APPLICATION REQUIREMENT

All theme changes must propagate to:
- Home page
- About page
- Services page
- Construction Services page
- Software Solutions page
- Portfolio page
- Contact page
- Header
- Footer
- Forms
- Dropdowns
- Buttons
- Floating contact buttons
- Gallery cards
- Project cards
- FAQ accordions
- Process timelines
- Testimonials
- CTA sections
- background overlays
- shadows and borders

Nothing should remain visually disconnected from the global theme.

PERSISTENCE / STORAGE REQUIREMENT

Persist theme settings in browser storage so the selected theme remains active the next time the website is opened.

Requirements:
- store current theme settings in local storage or equivalent client persistence
- load stored theme automatically on page load
- if no saved theme exists, fall back to default theme
- include “Reset to Default” action
- include optional “Save Theme” action
- include optional “Export Theme JSON” action
- include optional “Import Theme JSON” action for future reuse

DEFAULT THEME OBJECT

Create a clean default theme configuration for the website that includes at minimum:
- primary color
- secondary color
- accent color
- page background
- section backgrounds
- text colors
- border color
- heading font
- body font
- radius scale
- spacing scale
- shadow depth
- motion preset
- button style
- card style

The default theme should match the premium corporate style intended for ZARMS Tec.

SUGGESTED DEFAULT THEME FOR ZARMS TEC

Use this as the default theme:
- Primary: deep navy
- Secondary: teal / electric blue
- Accent: warm amber / copper
- Background: white and soft gray sections
- Dark sections: charcoal / deep slate
- Heading text: near-black or dark navy
- Body text: muted slate gray
- Card style: elevated with soft shadow
- Button style: premium filled + subtle gradient
- Radius: medium modern rounded corners
- Motion: balanced premium
- Hover effects: refined but not excessive

DEVELOPER EXPERIENCE REQUIREMENT

The Theme Customizer should feel like a real developer/admin utility panel, not a toy color picker.

It must be:
- well structured
- cleanly labeled
- easy to extend later
- based on reusable theme tokens
- future-proof for adding more brand presets
- able to support multiple client themes later
- maintainable for production use

OPTIONAL ADVANCED FEATURES

If possible, include:
- instant theme preview chips
- preset thumbnails
- theme name field
- duplicate theme
- compare current theme vs default
- dark mode toggle
- auto contrast handling for text
- gradient builder
- shadow scale presets
- section style presets
- component preview mini panel
- responsive preview inside customizer

IMPORTANT IMPLEMENTATION DIRECTION

Do not simply build a static website with a separate settings box.
Build the entire website around a true dynamic theme system.

The theme customizer must control the full design language of the site, not just two colors.

The final result should allow the developer to quickly adapt the website for changing client requirements by editing:
- colors
- fonts
- spacing
- radii
- shadows
- component styles
- motion intensity
- overlay styles
- visual effect behavior

This must work consistently across the full website and persist between sessions.

FINAL EXPECTATION FOR THIS FEATURE

Create the ZARMS Tec website with a built-in developer theme customizer component that:
- controls the entire global theme
- includes color and style customization
- applies changes site-wide instantly
- persists changes in storage for future visits
- includes default theme values
- includes reset functionality
- makes the website truly dynamic and reusable
- supports premium UI and modern UX without breaking consistency