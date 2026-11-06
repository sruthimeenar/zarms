Enhance the existing ZARMS Tec website Home page hero section by replacing the current static background banner with a premium dynamic rotating video-banner system.

This is an enhancement to the existing website, not a full redesign. Keep the current visual identity, theme customizer, responsiveness, premium styling, and overall UX. Only upgrade the Home page hero/banner experience into a more immersive, branded, and dynamic section.

CORE EXPECTATION

The current hero banner uses a static background image.
Replace it with a multi-state rotating hero banner that uses short silent background video clips.

The hero must rotate automatically between 3 banner states:
1. Common / Brand Banner
2. Construction Services Banner
3. IT / Software Solutions Banner

This should NOT look like visible tabs.
It should feel like one premium hero area that intelligently changes its background media, overlay content, supporting text, and transition style.

Each banner state must:
- have its own short looping background video clip
- play without sound
- have unique overlay text/content
- have its own visual identity
- have its own transition style when entering/leaving
- feel connected to the ZARMS Tec brand

AUTO ROTATION REQUIREMENT

The hero must automatically switch between banner states every 4 seconds by default.

Important:
The rotation duration must be configurable inside the developer Theme Customizer.
Do not hardcode the 4-second timing.
Create a hero/banner timing setting in the Theme Customizer so the developer can change it later.

Examples:
- Default rotation interval: 4 seconds
- Allow change to 5s, 6s, 8s, etc.
- Also allow transition duration control separately if possible

BANNER STATES

==================================================
BANNER STATE 1 – COMMON / BRAND BANNER
==================================================

Purpose:
Represent ZARMS Tec as a combined Construction + Technology company.

Video direction:
Use a premium, silent, short looping video clip that blends:
- architectural visuals
- project planning
- business consultation
- construction + technology mood
- modern corporate feel

Avoid making this state too construction-heavy or too software-heavy.
It should feel like the master brand identity.

Text content suggestion:
Headline:
Building Better Spaces. Creating Smarter Digital Solutions.

Subheadline:
ZARMS Tec combines dependable construction services and practical software solutions under one trusted brand, helping clients move from idea to execution with confidence.

CTA buttons:
- Explore Services
- View Portfolio
- Contact Us

Visual overlay style:
- premium dark/gradient overlay
- subtle blended warm + cool accent glow
- elegant floating abstract shapes
- soft depth layers
- premium cinematic feel

Transition style for this banner:
Use a refined branded transition such as:
- smooth morphing gradient wipe
- elegant layered reveal
- soft glass-panel slide
- premium light streak transition
- branded wave/mask reveal

This transition should feel neutral, premium, and brand-oriented.

==================================================
BANNER STATE 2 – CONSTRUCTION SERVICES BANNER
==================================================

Purpose:
Represent the Construction Services division clearly and powerfully.

Video direction:
Use a short silent looping clip showing one or more of the following:
- active construction site
- building exterior
- renovation progress
- structural work
- interior finishing
- blueprint/planning visuals
- engineering/site supervision
- crane/building motion if elegant

The video must feel premium and professional, not raw or chaotic.

Text content suggestion:
Headline:
Construction Services That Prioritize Quality, Practicality, and Trust.

Subheadline:
From building support and renovation to interiors, civil work, and project coordination, ZARMS Tec delivers dependable construction solutions with a focus on quality execution and lasting value.

CTA buttons:
- Construction Services
- Request Consultation
- Call Construction Team

Construction contact shortcut:
Phone: 9840344369

Visual overlay style:
- warm amber / copper / industrial accents
- blueprint lines
- architectural grid overlays
- subtle geometric textures
- grounded, strong, structural visual tone

UNIQUE TRANSITION REQUIREMENT FOR CONSTRUCTION BANNER

When switching into or out of the Construction banner, use a construction-inspired transition effect.

The transition must feel premium and relevant to construction, not cartoonish.

Possible transition ideas:
- brick/block segment reveal
- blueprint line-draw wipe
- crane-lift style panel transition
- structural grid assembly transition
- architectural drafting reveal
- concrete slab split transition
- measured line/frame build-in effect
- industrial panel shutter motion

Important:
Use one refined construction-themed transition style consistently for this banner state, or a family of related transitions.
Keep it elegant, smooth, and performance-friendly.

Do NOT make it gimmicky or heavy.

==================================================
BANNER STATE 3 – IT / SOFTWARE SOLUTIONS BANNER
==================================================

Purpose:
Represent the Software Solutions division with a strong digital/tech identity.

Video direction:
Use a premium silent looping video clip showing:
- dashboards
- software interfaces
- website screens
- digital workflow
- laptop/device UI
- coding or development environment in a refined way
- business software visuals
- abstract tech motion

Keep it modern, clean, and business-focused.
Avoid hacker-style clichés.

Text content suggestion:
Headline:
Software Solutions Designed for Business Growth and Digital Efficiency.

Subheadline:
ZARMS Tec helps businesses strengthen digital presence, improve workflows, and build scalable technology solutions through websites, applications, and practical software systems.

CTA buttons:
- Software Solutions
- Request IT Consultation
- Contact Software Team

Software contact shortcut:
Phone: 9994123797

Visual overlay style:
- cool blue / teal / electric accents
- soft digital grid
- glowing node lines
- layered UI glass effects
- futuristic but credible corporate tone

UNIQUE TRANSITION REQUIREMENT FOR IT / SOFTWARE BANNER

When switching into or out of the IT banner, use a software/digital-themed transition effect.

The transition must feel premium, modern, and clearly tech-oriented.

Possible transition ideas:
- digital grid scan reveal
- circuit-line trace transition
- UI panel stack transition
- pixel-to-screen morph
- holographic card sweep
- neon line data-flow reveal
- interface frame expansion
- matrix-like panel wipe, but subtle and professional

Important:
Use refined tech transitions only.
Do not use flashy gaming effects or cyberpunk overload.

==================================================
BANNER SYSTEM BEHAVIOR
==================================================

Build the hero as a rotating state-based banner system, not as user-click tabs.

Behavior requirements:
- auto-rotate between the 3 banner states
- silent looping video background per state
- smooth content change with transition sync
- text and buttons change with each state
- background video and overlay style change together
- transition effect changes based on the current banner category
- allow manual navigation if desired through subtle indicators/arrows, but keep auto-play primary
- if manual controls exist, they should be elegant and minimal

Optional controls:
- tiny progress indicators
- subtle slide counter
- minimal dot indicators
- previous/next arrows
- pause/play button if needed

The hero should feel cinematic, premium, and brand-rich.

CONTENT OVERLAY REQUIREMENTS

For each banner state:
- keep the content readable over the video
- use dark/light overlay balance based on the video
- maintain strong contrast
- allow animated text reveal
- CTA buttons should animate in gracefully
- support theme-based styling from the global Theme Customizer

Overlay content behavior:
- headline entrance animation
- subheadline fade/slide
- CTA staggered reveal
- contact shortcut reveal if included
- transition timing synchronized with background change

VIDEO REQUIREMENTS

Use short, silent, high-quality looping video clips.

Requirements:
- muted / no sound
- auto-play
- loop
- plays inline
- optimized for web performance
- responsive cropping
- visually suitable for desktop and mobile
- darkened/overlaid enough for readable text
- must not feel distracting

Recommended format:
- MP4/WebM optimized
- use compressed, lightweight video clips
- avoid huge file sizes
- use poster/fallback image if video fails
- use mobile-friendly fallback behavior if autoplay restrictions occur

Performance requirements:
- preload intelligently
- avoid loading all full-size videos too heavily at once
- use efficient transitions
- keep hero smooth on mobile
- preserve fast first impression
- use fallback static images where required

MOBILE AND RESPONSIVE REQUIREMENTS

The rotating video banner must work beautifully across:
- desktop
- tablet
- mobile

Mobile behavior:
- maintain readable overlay text
- crop videos elegantly for portrait screens
- keep CTA buttons thumb-friendly
- reduce visual clutter
- simplify very heavy transitions if needed
- keep premium feeling without performance issues

On smaller screens:
- use smaller text scale
- keep content stacked cleanly
- ensure no important focal area is cut off badly
- maintain overlay readability
- allow reduced-motion adaptation

THEME CUSTOMIZER INTEGRATION

This new hero system must be integrated into the existing developer Theme Customizer.

Add a dedicated Hero Banner settings group inside the Theme Customizer.

Include the following settings:
- Hero Rotation Interval
- Transition Duration
- Enable/Disable Auto Rotate
- Enable/Disable Manual Controls
- Hero Overlay Opacity
- Hero Text Alignment
- Hero Height
- Banner Content Max Width
- Video Overlay Tint Color
- Video Brightness / Darkness balance
- Transition Intensity
- Enable/Disable Unique Category Transitions
- Enable/Disable Background Motion Effects
- Reduced Motion Mode for Hero
- Mobile Hero Height
- Banner Indicator Style
- CTA Style in Hero

Optional advanced settings:
- per-banner overlay color
- per-banner content position
- per-banner CTA style
- per-banner text animation style
- per-banner fallback image
- per-banner transition selection

The hero settings must persist in the same browser storage system used by the global theme customizer.

ANIMATION REQUIREMENTS

Use premium motion, not generic slider animation.

Include:
- text reveal synced with banner change
- layered overlay transition
- slight background zoom or parallax motion
- elegant crossfade between videos if needed
- custom mask or directional reveal based on banner type
- smooth CTA entrance
- minimal progress indicator animation
- subtle ambient floating accents

CATEGORY-SPECIFIC TRANSITION LOGIC

The transition must feel different depending on which banner is active.

Suggested logic:
- Common banner → premium morph / light sweep / gradient mask
- Construction banner → brick/grid/blueprint/structural reveal
- IT banner → digital scan/circuit/UI/pixel reveal

Important:
These transitions must feel like part of the same design system.
Do not make them visually inconsistent or theatrical.
Keep them elegant, branded, and modern.

ACCESSIBILITY AND UX

Ensure:
- text remains readable at all times
- videos do not overpower content
- reduced-motion mode is supported
- controls are accessible if provided
- transitions are smooth, not jarring
- content does not shift unpredictably
- hero still communicates clearly even if video fails

If reduced-motion is enabled:
- reduce or remove complex transition effects
- simplify text entrance animations
- preserve clean fade transitions

FINAL EXPECTATION

Transform the current Home page static banner into a premium rotating hero video system for ZARMS Tec that:
- cycles between Common, Construction, and IT banner states
- uses silent background video clips
- changes content with each state
- uses unique transition effects based on the active banner type
- integrates with the developer Theme Customizer
- allows rotation timing customization
- remains responsive, high-performance, and elegant
- feels modern, cinematic, branded, and presentation-ready

Do not create visible tabs.
Do not keep a static image-only banner.
Do not use generic slider transitions.
Make the hero feel custom, immersive, and aligned with the ZARMS Tec brand.