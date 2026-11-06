Enhance the existing ZARMS Tec platform by adding a complete authentication, login, registration, forgot-password, OTP verification, session, and role-based access control system.

This platform has:
- a public website accessible to everyone
- protected internal pages for authenticated users only

Protected internal pages include:
- Dashboard
- Portfolio
- Gallery
- Enquiries
- Contact
- Users
- any future admin/internal pages

Public users must never get access to protected dashboard pages.

This is not a redesign from scratch.
Keep the current website, dashboard design system, theme system, responsiveness, and premium UI.
Add a secure, maintainable auth system and users management flow.

==================================================
FINAL ROLE MODEL
==================================================

Use only these roles:

1. public
- website only
- no login required for website access
- cannot access dashboard/internal pages

2. admin
- full dashboard access
- can access:
  - Dashboard
  - Portfolio
  - Gallery
  - Enquiries
  - Contact
  - Users
- can add other admins
- can manage users
- can receive registration approval only if marked as primary admin
- non-primary admins can access all dashboard pages exactly like primary admin
- only the primary admin receives registration OTP emails

3. superadmin
- developer company only
- must not be created from public UI
- manual insert only
- full dashboard access
- full platform control
- can create the first admin/admins
- has access to special customization/theme options
- can manage users and admins
- can set or change primary admin if needed

There is no user role.
Remove all old references to “user” role.

==================================================
PRIMARY ADMIN RULE
==================================================

Add support for one and only one primary admin at a time.

Database/model field example:
- primary: true | false

Rules:
- only one admin can have primary=true at a time
- if one admin is set as primary, all others must automatically become primary=false
- registration OTP emails must go only to the current primary admin
- if primary admin is changed, future registration OTP emails must go to the new primary admin

==================================================
AUTHENTICATION / ACCESS RULES
==================================================

Public website pages:
- accessible to everyone

Protected dashboard pages:
- accessible only to authenticated admin or superadmin accounts

Superadmin-only areas:
- special theme customization options
- any future developer-only controls

If public user tries to access protected routes:
- redirect to login page

If logged-in admin tries to access superadmin-only pages:
- show access denied / insufficient permissions page

==================================================
REGISTER FLOW
==================================================

Build the registration flow exactly like this:

Step 1: Register form
Ask for:
- Name
- Mobile Number
- Email

Validations:
- all fields required
- trim whitespace
- email must be valid
- email must be unique
- mobile number must be valid
- mobile number must be unique
- prevent duplicate registrations using same email/mobile
- sanitize text inputs

When user clicks Register:
- validate form
- check email uniqueness
- check mobile uniqueness
- create a temporary registration request/session
- send OTP email to the current primary admin only
- do not ask password yet
- do not log the registrant in yet
- do not create a fully active account yet
- registrant is preparing to become an admin after OTP verification + password creation

Step 2: OTP verification
- show OTP verification screen after successful registration submission
- user enters OTP
- OTP is the one sent to the primary admin
- admin manually shares the OTP with the registrant
- verify OTP entered by registrant

OTP rules:
- OTP valid for 5 minutes
- resend allowed after 60 seconds
- maximum 3 resends
- maximum 5 invalid attempts
- on expiry, user must request resend
- on too many invalid attempts, lock or fail the current registration attempt cleanly

Step 3: Password setup
Only after successful OTP verification:
Ask for:
- Password
- Confirm Password

Password rules:
- required
- minimum 8 characters
- at least 1 uppercase letter
- at least 1 lowercase letter
- at least 1 number
- at least 1 special character
- confirm password must match

After successful password setup:
- create the account as a full admin immediately
- role = admin
- active = true
- verified = true
- primary = false by default
- redirect to login page or auto-login depending on implementation choice
Recommended:
- redirect to login page with success message

Important:
- there is no pending registration dashboard queue
- if the registrant successfully gets the OTP from primary admin and verifies it, they can directly complete account creation
- no public account should gain access without OTP verification and password setup

==================================================
LOGIN FLOW
==================================================

Build a proper login system using:
- Email
- Password

No mobile login.

Login behavior:
- validate email
- validate password
- check account exists
- check account is active
- check credentials
- on success generate auth token/session
- persist authenticated session
- redirect based on role

Role redirect behavior:
- superadmin -> dashboard
- admin -> dashboard
- public -> no login-based dashboard access

Session duration:
- 7 days

Recommendation:
Use secure server-managed auth with httpOnly cookie if backend exists.
If this is still frontend/mock-only for now, use sessionStorage as temporary implementation.
Architecture must be future-ready so it can later switch to secure httpOnly cookie/session auth.

Preferred implementation direction:
- abstract auth storage layer
- temporary sessionStorage for mock/dev mode
- future-ready migration to secure cookie-based auth

==================================================
FORGOT PASSWORD FLOW
==================================================

Build forgot password exactly like this:

Step 1: Forgot Password form
Ask for:
- Email

Behavior:
- validate email format
- check account exists
- if account exists, send OTP to the account owner’s email
- if account does not exist, show safe and user-friendly error behavior

Recommended response:
Use a security-safe message or a controlled error depending on preference.
At minimum, do not leak unnecessary system details.

Step 2: OTP verification
- ask for OTP
- verify OTP
- OTP valid for 5 minutes
- resend after 60 seconds
- max 3 resends
- max 5 invalid attempts

Step 3: Reset password
Ask for:
- New Password
- Confirm Password

Use same password policy:
- minimum 8 chars
- uppercase
- lowercase
- number
- special character
- confirm must match

After successful password reset:
- update password
- automatically revoke/log out all existing sessions
- redirect to login page
- show success message

==================================================
USERS PAGE
==================================================

Create a protected Users management page inside the dashboard.

This page is accessible to:
- admin
- superadmin

Users page must support:
- list all admin/superadmin accounts
- show:
  - name
  - email
  - mobile number
  - role
  - primary status
  - account status
  - created date
- search and filter
- edit user/admin details
- activate/deactivate/suspend if status model is used
- create/add new admins
- manage primary admin selection

Important primary admin feature:
Add a control so admin/superadmin can select who can receive registration emails by marking one admin as primary.

Behavior:
- set admin as primary
- update database/data model field: primary=true
- automatically set all other admins primary=false
- only one primary admin allowed

Since role model is only admin and superadmin:
- do not show any “user role” options
- do not show admin-to-user conversion
- only role changes allowed if explicitly permitted by business rules
- keep superadmin protected from accidental downgrade unless intentionally allowed by superadmin flow

Users page can include sections such as:
- All Accounts
- Active Admins
- Superadmins
- Primary Admin indicator

==================================================
ACCOUNT STATUS MODEL
==================================================

Add account status support for clarity and future safety.

Recommended statuses:
- active
- suspended
- inactive

Rules:
- only active accounts can log in
- suspended/inactive accounts cannot log in
- status should be visible in Users page

==================================================
PROTECTED ROUTES
==================================================

Build route guards for:
- auth-required pages
- role-based pages
- superadmin-only pages

Required wrappers/components:
- ProtectedRoute
- RoleGuard
- SuperadminGuard
- SessionGuard

Behavior:
- if not authenticated -> redirect to login
- if authenticated but not authorized -> access denied page
- if session expired -> clear auth state and redirect to login

==================================================
AUTH PAGES TO BUILD
==================================================

Create these pages/components:

1. Login Page
2. Register Page
3. Registration OTP Verification Page / Step
4. Create Password Page after registration OTP verification
5. Forgot Password Page
6. Forgot Password OTP Verification Page / Step
7. Reset Password Page
8. Access Denied Page
9. Session Expired handling
10. Logout action

Optional:
- auth loading screen
- resend OTP status UI
- password strength indicator
- show/hide password toggle

==================================================
VALIDATION REQUIREMENTS
==================================================

Register form:
- name required
- email required
- email format valid
- email unique
- mobile required
- mobile unique
- mobile format valid
- trim whitespace
- prevent empty-looking values
- sanitize input

OTP form:
- required
- numeric/alphanumeric based on implementation
- fixed length
- expiry handling
- invalid attempt handling
- resend cooldown UI
- resend limit UI

Password forms:
- password required
- confirm required
- match validation
- strength validation
- helpful inline messages

Login form:
- email required
- email valid
- password required
- invalid credentials handling

Forgot password:
- email required
- email valid
- account existence check
- safe messaging

General:
- inline validation messages
- disabled submit state when invalid where appropriate
- loading state while processing
- prevent double submit

==================================================
TOKEN / SESSION REQUIREMENTS
==================================================

After successful login:
- generate token/session
- store auth state
- keep session active for 7 days
- protect routes using auth state
- support logout
- clear auth state on logout
- clear auth state on session expiry
- clear old sessions after password reset

Recommended architecture:
- Auth service abstraction
- Token/session storage abstraction
- OTP service abstraction
- Validation schema layer
- API-ready future structure

For now:
- sessionStorage is acceptable for mock/dev implementation
- but structure code so real backend can replace it later with secure cookie-based auth

==================================================
EMAIL / OTP LOGIC
==================================================

Registration OTP:
- send only to current primary admin email
- valid 5 minutes
- resend after 60 seconds
- max 3 resends
- max 5 failed attempts

Forgot password OTP:
- send only to account owner email
- valid 5 minutes
- resend after 60 seconds
- max 3 resends
- max 5 failed attempts

Important:
- registration OTP flow depends on admin manually sharing the OTP with registrant
- keep this logic explicit in the system design

==================================================
DASHBOARD AUTH INTEGRATION
==================================================

Integrate auth with the existing dashboard.

Dashboard behavior:
- show logged-in account info
- show role in profile area
- show logout button
- hide superadmin-only items from admins
- allow admin and superadmin into standard dashboard pages
- allow only superadmin into theme customization/developer options

Profile area should show:
- name
- email
- role
- avatar placeholder
- logout button

==================================================
SECURITY / UX REQUIREMENTS
==================================================

Use modern, professional auth UX:
- no emojis
- use icons only
- accessible labels
- clean error messages
- modern OTP input UI
- proper loading indicators
- success/error toast or inline feedback
- responsive layout
- mobile friendly

Security rules:
- do not allow public access to protected pages
- do not expose superadmin creation in public UI
- prevent unlimited OTP spam
- prevent duplicate registration abuse
- revoke sessions on password reset
- validate everything server-side when backend is added
- sanitize all inputs
- future-proof for audit logs and API integration

==================================================
SUPERADMIN CREATION RULE
==================================================

Superadmin must be:
- developer-only
- manual insert only
- not creatable through register form
- not exposed in public UI

Superadmin can:
- create first admin/admins
- access all dashboard pages
- access special theme customization options
- manage users/admins
- control primary admin assignment

==================================================
FINAL EXPECTATION
==================================================

Add a complete auth and login system to the ZARMS Tec platform with:

- public website access for everyone
- protected internal dashboard pages
- roles:
  - public
  - admin
  - superadmin
- one primary admin only
- registration flow:
  - name
  - mobile number
  - email
  - OTP sent only to primary admin
  - admin manually shares OTP
  - registrant verifies OTP
  - registrant sets password
  - account becomes full admin immediately
- login flow:
  - email + password only
  - token/session generation
  - 7-day session
- forgot password:
  - email check
  - OTP to account owner email
  - verify OTP
  - reset password
  - revoke all existing sessions
- Users page:
  - manage admins/superadmins
  - set one primary admin
  - add other admins
  - view role/status/details
- protected routes
- superadmin-only access to special theme customization
- responsive, clean, production-ready auth UI
- future-ready architecture for backend and email integration