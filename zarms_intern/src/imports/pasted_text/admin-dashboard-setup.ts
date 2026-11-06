Enhance the existing ZARMS Tec website by adding a dynamic admin dashboard and dynamic content management system for Services Portfolio, Service Galleries, and Contact Details.

This is not a redesign from scratch.
Preserve the current website design system, theme customizer, responsive behavior, hero sections, animations, and premium UI.
This update is focused on making the website content-driven and manageable through an internal admin dashboard.

CORE GOAL

Build a dynamic website management layer for ZARMS Tec so that the following website content can be controlled through an Admin dashboard:

1. Portfolio items for:
   - Construction Services
   - Software Solutions

2. Gallery items for:
   - Construction Gallery
   - Software Solutions Gallery

3. Contact page and global contact details:
   - phone numbers
   - email addresses
   - enquiry receiving email addresses
   - address
   - WhatsApp number
   - social media links
   - business hours

For now, use TypeScript data files as the data source.
Do not connect a real backend yet.
Structure everything cleanly so a backend or database can be added later without major refactoring.

==================================================
HIGH-LEVEL REQUIREMENT
==================================================

Create a full Admin section with:
- collapsible sidebar
- topbar with logo
- user/profile area
- logout button
- dashboard pages
- forms with validations
- list views
- filter options
- add/edit/delete capability in UI
- conditional rendering on the public website based on available data

The public website must automatically reflect the data managed in the dashboard.

==================================================
ADMIN ACCESS / NAVIGATION
==================================================

Add “Admin” to the website footer Quick Links.
This should navigate to the Admin dashboard pages.

Footer Quick Links must include:
- Home
- About Us
- Construction Services
- Software Solutions
- Portfolio
- Contact Us
- Admin

Use a clean internal admin route structure such as:
- /admin
- /admin/portfolio
- /admin/gallery
- /admin/contact-settings

==================================================
ADMIN DASHBOARD UI REQUIREMENTS
==================================================

Create a premium, modern, responsive admin dashboard UI.

Layout:
- collapsible left sidebar
- top navigation/header bar
- logo in topbar
- page title and breadcrumbs area
- profile section in topbar or sidebar
- user details in profile area
- logout button in profile dropdown or sidebar footer
- clean cards, tables, forms, filters
- desktop and mobile friendly admin layout

Sidebar menu items:
- Dashboard
- Portfolio Entries
- Gallery Entries
- Contact Settings
- Theme Settings (optional placeholder if already exists)
- Logout

Admin dashboard design direction:
- modern professional admin panel
- clean spacing
- icon-based navigation
- no emojis
- use proper icons only
- premium cards and table styling
- consistent with the ZARMS Tec website design system
- responsive drawer/sidebar on mobile

Dashboard home page should include:
- total portfolio items
- total construction portfolio items
- total software portfolio items
- total gallery items
- total construction gallery items
- total software gallery items
- contact settings summary
- quick action buttons such as:
  - Add Portfolio Item
  - Add Gallery Item
  - Edit Contact Details

==================================================
DATA SOURCE REQUIREMENT
==================================================

For now, manage all data using TypeScript files and interfaces.

Use a clean structure such as:
- data/portfolio.ts
- data/gallery.ts
- data/contact.ts
- data/adminUser.ts
- data/icons.ts

Use strongly typed interfaces.

Example content types:
- PortfolioItem
- GalleryItem
- ContactSettings
- BusinessHour
- SocialLink
- AdminUser

All dashboard forms should read from and update these mock TypeScript data structures in a way that can later be replaced by API/database calls.

Make the code architecture future-ready.

==================================================
PORTFOLIO MANAGEMENT PAGE
==================================================

Create an Admin page for Portfolio Entries.

Purpose:
Allow admin to add, edit, delete, filter, and manage portfolio items that will appear in:
- Portfolio page
- Construction Services page
- Software Solutions page

Portfolio entry form fields:
- Service Type
  - Construction Services
  - Software Solutions
- Project Name
- Description
- Images
- Icon
- Optional Subtitle
- Optional Short Summary
- Optional Status
  - Ongoing
  - Completed
- Optional Project Location
- Optional Featured toggle
- Optional Tags

Icon field:
- show a selectable icon picker
- list all available icons from the chosen icon library
- use a searchable icon selection panel
- allow selecting one icon per project entry
- preview selected icon before saving

Portfolio list page must include:
- table or card list view
- project image thumbnail
- project name
- service type
- status
- featured badge if enabled
- quick actions: edit / delete / view
- filter tools
- search input

Portfolio filter options in admin:
- filter by service type
- filter by status
- filter by featured/non-featured
- search by project name
- sort by newest / oldest / alphabetical

Public website behavior:
- Construction portfolio items must display only in Construction-related sections
- Software portfolio items must display only in Software-related sections
- Portfolio page should support category filters for visitors
- If no items exist for a service category, hide that category block and its heading

==================================================
GALLERY MANAGEMENT PAGE
==================================================

Create an Admin page for Gallery Entries.

Purpose:
Allow admin to upload and manage gallery content for service-specific gallery sections:
- Construction Gallery
- Software Solutions Gallery

Gallery entry form fields:
- Service Type
  - Construction Services
  - Software Solutions
- Image
- Title
- Subtitle
- Optional Sort Order
- Optional Featured toggle

Admin gallery list page must include:
- image thumbnail
- title
- subtitle
- service type
- quick actions: edit / delete / preview
- filtering tools

Public website behavior:
- Construction gallery items must appear only in the “Construction Gallery” section
- Software gallery items must appear only in the “Software Solutions Gallery” section
- If construction gallery has no entries, hide the full section including:
  - section title
  - section subtitle
  - gallery grid
- If software gallery has no entries, hide the full section including:
  - section title
  - section subtitle
  - gallery grid

Example:
If Construction Gallery is empty, do not show:
“Construction Gallery”
“Explore our recent construction and renovation projects”
or any empty gallery container

==================================================
CONTACT SETTINGS PAGE
==================================================

Create an Admin page for Contact Settings.

This page must dynamically control the public Contact page and all global contact references across the website including header/footer/contact blocks/CTA/contact buttons.

Fields to manage:
- Registered Address
- Construction Services Phone Number
- Construction Services Email
- Software Solutions Phone Number
- Software Solutions Email
- WhatsApp Number
- Enquiry Receiving Emails
  - allow multiple email addresses
- Social Media Links
  - Facebook
  - Instagram
  - LinkedIn
  - YouTube
  - add optional custom social links if needed
- Business Hours
  - multiple entries
  - e.g. Monday to Saturday: 9:00 AM – 6:00 PM
- Optional Google Map link / location embed URL

Behavior rules:
- if a field is empty, do not render its related UI block on the public website
- if construction phone number is empty:
  - hide construction phone icon
  - hide construction phone text
  - hide related call action button where appropriate
- if WhatsApp number is empty:
  - hide WhatsApp section and WhatsApp CTA buttons
- if social media link is empty:
  - hide only that social icon/link
- if business hours are empty:
  - hide the business hours section
- if enquiry emails are empty:
  - hide enquiry email block
- if address is empty:
  - hide address section or address icon block

This conditional rendering rule must apply site-wide.

==================================================
VALIDATIONS AND FORM RULES
==================================================

Add strong validations and admin-side checks.

GENERAL VALIDATION REQUIREMENTS
- required field validation
- trim whitespace before validation
- prevent saving invalid empty-looking values
- show inline validation errors
- disable submit until required conditions are met where appropriate
- prevent broken public output

PORTFOLIO VALIDATIONS
- Project Name required
- Description required
- Service Type required
- At least one image required unless explicitly optional by design
- Icon required if portfolio card uses icons

Character limits:
- Project Name max 80 characters
- Optional Subtitle max 100 characters
- Short Summary max 140 characters
- Description max 500 characters

Image rules:
- set upload limit, for example max 5 images per portfolio item
- recommended dimensions display in helper text
- recommended aspect ratio display in helper text
- image size limit per file, for example 2MB or 5MB
- allow crop before save
- show image preview before save
- reject unsupported file types
- support reorder if multiple images exist

GALLERY VALIDATIONS
- Service Type required
- Image required
- Title required
- Subtitle optional or required based on design, but validate length
- title max 80 characters
- subtitle max 120 characters
- one image per gallery entry unless multi-image mode is added later
- show crop tool before save
- show recommended image ratio and size
- enforce file size/type limits

CONTACT VALIDATIONS
- mobile number validation
- email validation
- URL validation for social media links
- multiple enquiry receiving emails must each be validated
- business hours text validation or structured time validation
- WhatsApp number validation
- prevent invalid phone/email links from rendering

Recommended validation rules:
- mobile number must support country-safe numeric validation pattern
- email must use proper email format validation
- URLs must begin with valid protocol or valid domain format
- address max length if needed
- business hours entries should not allow broken incomplete rows

OPTIONAL EXTRA CHECKS
- duplicate project name warning
- duplicate gallery title warning within same service category
- image aspect-ratio warning before upload
- file type restriction to jpg/png/webp
- sanitize text inputs
- prevent script injection in text fields

==================================================
CONDITIONAL SECTION VISIBILITY RULE
==================================================

This rule is critical.

If any website section has no valid content, hide the entire section including title, subtitle, icons, and wrappers.

Examples:
- if construction gallery has no items, hide the entire Construction Gallery section
- if software gallery has no items, hide the entire Software Solutions Gallery section
- if no construction portfolio items exist, hide construction portfolio preview block
- if construction phone is empty, hide construction contact block
- if social link is empty, hide that social icon
- if address is empty, hide address block
- if all enquiry emails are empty, hide enquiry email section

Do not leave empty placeholders on the public site.
Do not show headings for empty sections.

==================================================
PUBLIC WEBSITE INTEGRATION RULES
==================================================

Connect admin-managed data to these public pages:

Construction Services page:
- show only construction portfolio items
- show only construction gallery items
- hide empty related sections

Software Solutions page:
- show only software portfolio items
- show only software gallery items
- hide empty related sections

Portfolio page:
- show all portfolio items
- allow filter by service type
- allow filter by status if available
- allow search if implemented
- use admin-managed images, titles, descriptions, icons

Contact page:
- load all admin-managed contact settings dynamically
- hide empty blocks intelligently

Header/Footer:
- phone numbers, email links, WhatsApp links, social icons can be driven from contact settings
- hide empty values cleanly

==================================================
IMAGE HANDLING UX
==================================================

For image uploads in Portfolio and Gallery:
- add image preview
- add crop before save
- show upload requirements
- recommended dimensions helper text
- recommended aspect ratio helper text
- file size helper text
- drag and drop uploader if possible
- remove/replace image action
- upload progress UI placeholder if needed

Recommended helper examples:
- Portfolio image recommended: 1200x800 px
- Gallery image recommended: 1200x900 px
- Use WebP/JPG/PNG
- Max 2MB or 5MB per image

==================================================
ICONS
==================================================

Use a proper icon library.
No emojis anywhere.

Use a searchable icon picker for portfolio icons.
Possible icon library:
- Lucide
or another clean consistent icon set

Admin icon picker must:
- list available icons
- allow preview
- allow select
- store selected icon key/name in TypeScript data
- render that icon on public website cards

==================================================
ADMIN USER / PROFILE SECTION
==================================================

Create a simple admin user profile section in dashboard.

Include:
- admin name
- role
- avatar placeholder
- email
- logout button

Place profile area in topbar dropdown or sidebar footer.
Add clean account card styling.

For now use mock admin data in TypeScript.

==================================================
RESPONSIVE BEHAVIOR
==================================================

Make admin pages responsive:
- collapsible sidebar on desktop
- drawer/sidebar on mobile
- tables that adapt or become cards on smaller screens
- forms with proper stacking
- touch-friendly action buttons

Public website dynamic sections must remain fully responsive after integrating admin data.

==================================================
ARCHITECTURE EXPECTATION
==================================================

Build this in a maintainable way.

Use:
- reusable form components
- reusable validation helpers
- reusable image upload component
- reusable conditional render helpers
- reusable section wrappers
- reusable filter components
- clean typed models
- clean separation between admin data and public rendering

Future-ready structure:
- easy to replace TS files with API/database later
- easy to extend with authentication later
- easy to add more service categories later if needed

==================================================
FINAL EXPECTATION
==================================================

Enhance the ZARMS Tec website with a dynamic Admin dashboard that manages:
- Portfolio Entries
- Gallery Entries
- Contact Settings

Use TypeScript data files for now.
Add strong validations.
Add image upload rules and crop support.
Add filters for portfolio and gallery management.
Hide empty website sections automatically.
Add Admin link in footer Quick Links.
Use a collapsible sidebar, topbar logo, profile section, and logout button in the dashboard.

The final result must feel:
- modern
- maintainable
- dynamic
- admin-manageable
- responsive
- clean
- production-ready in structure
- easy to connect to backend later