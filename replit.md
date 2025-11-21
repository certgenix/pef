# Professional Executive Forum (PEF) Platform

## Overview

Professional Executive Forum (PEF) is a global digital platform designed to collect structured information from five distinct user roles: professionals, job seekers, employers, business owners, and investors. The platform operates in two phases:

**Phase 1 (Current)**: Data collection and community building through member registrations, profile management, and opportunity posting. Members can select any combination of the five roles under a single profile.

**Phase 2 (Future)**: Intelligent opportunity matching using the collected database to connect talent, capital, and business opportunities.

The platform launches primarily in Saudi Arabia while being open to international members from Canada, UK, Germany, Italy, and other regions from day one. It emphasizes verified, high-quality data through admin approval processes and aims to create a trusted professional ecosystem distinct from typical social platforms.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack**: React with TypeScript, using Vite as the build tool and development server.

**UI Framework**: shadcn/ui component library built on Radix UI primitives, providing accessible and customizable components. The design system uses Tailwind CSS with a custom configuration following the "new-york" style preset.

**Routing**: Client-side routing implemented with Wouter, a lightweight routing solution. Current routes include Home (`/`), About (`/about`), and a catch-all NotFound page.

**State Management**: TanStack Query (React Query) handles server state management and data fetching. Local component state managed with React hooks.

**Design System**: 
- Color palette based on navy blue primary (#1e3c72), light blue secondary (#4fc3f7), and orange/gold accent (#ff9800)
- Typography using Inter/Open Sans for body text and Montserrat/Inter Bold for headings
- Multi-language support planned for English, Arabic, and Urdu
- Responsive design with mobile-first approach

**Component Structure**: Page-level components (Home, About) compose reusable section components (HeroSection, FiveRolesSection, PlatformBenefitsSection, HowItWorksSection, GlobalReachSection, CTASection, Header, Footer). Each section is self-contained with its own styling and interaction logic.

**Accessibility**: Built on Radix UI primitives ensuring ARIA compliance and keyboard navigation support throughout the component library.

### Backend Architecture

**Server Framework**: Express.js running on Node.js with TypeScript for type safety.

**API Design**: RESTful API structure with all routes prefixed with `/api`. Currently minimal route implementation in `server/routes.ts`, prepared for expansion.

**Storage Layer**: Abstracted storage interface (`IStorage`) with Firestore implementation for data persistence. All user data, profiles, opportunities, and applications are stored in Firestore collections.

**Session Management**: Infrastructure prepared for session handling with connect-pg-simple for PostgreSQL session storage.

**Development Setup**: Custom Vite middleware integration for HMR (Hot Module Replacement) in development mode, with separate production build configuration using esbuild for server code bundling.

### Data Architecture

**Database ORM**: Drizzle ORM configured for PostgreSQL (Neon serverless), providing type-safe database queries and migrations.

**Schema Design**: Currently minimal with a `users` table containing id, username, and password fields. Schema defined in `shared/schema.ts` for sharing between client and server.

**Validation**: Drizzle-Zod integration provides runtime validation schemas derived from database schema definitions, ensuring type safety from database to API to client.

**Migration Strategy**: Drizzle Kit manages schema migrations with configuration pointing to `./migrations` directory. Push command available for rapid development iteration.

**Future Expansion Needs**: The platform will require tables for:
- Multi-role profiles (professional, job seeker, employer, business owner, investor)
- Role-specific data collection (investment preferences, job requirements, business details)
- Opportunity listings (jobs, investments, partnerships)
- Member directory with filterable attributes
- Admin approval workflows
- Multi-language content support

### Authentication & Authorization

**Current State**: Firebase/Firestore authentication and data persistence system.

**Architecture**: 
- **Firebase Authentication**: Handles user registration, login, password reset, and email verification
- **Firestore**: Primary data store for all application data including:
  - User profiles and role information (professionals, job seekers, employers, business owners, investors)
  - Opportunities (jobs, investments, partnerships)
  - Applications (job applications with status tracking)
  - Role-specific profile data
- **Server-Side API**: Express.js REST API provides server-side access to Firestore data via Firebase Admin SDK

**Implementation Details**:
- Users register through Firebase Auth and complete their profile via `/api/auth/complete-registration`
- All data persisted to Firestore collections with proper typing and validation
- Admin approval workflow tracks approval status in Firestore
- Job Seeker Dashboard displays all opportunities and tracks application status
- Application tracking system prevents duplicates and maintains status history
- **LinkedIn OAuth Integration**: Users can import their LinkedIn profile data during registration
  - Secure OAuth 2.0 flow with state validation (CSRF protection)
  - Profile data (name, email, headline, location, profile picture) auto-populated in registration form
  - Server-side session-based data transfer (no sensitive data in URLs)
  - Single-use session tokens with automatic 10-minute expiration
  - Allowlisted redirect URLs to prevent open redirect attacks
  - Endpoints: `/api/auth/linkedin`, `/api/auth/linkedin/callback`, `/api/auth/linkedin/profile`

**CRITICAL Security Issues - MUST FIX BEFORE PRODUCTION**:
1. ⚠️ **Firebase ID Token Verification**: Backend currently decodes ID tokens WITHOUT signature verification when `FIREBASE_ADMIN_SERVICE_ACCOUNT` is not configured. This is a severe security vulnerability. Must set up Firebase Admin SDK credentials before production deployment.
2. **Duplicate Prevention**: Firestore doesn't have database-level unique constraints. While the code checks for existing applications before creating new ones, parallel requests could still create duplicates. Consider implementing Firestore security rules or transactions for atomic duplicate prevention.
3. **Rate Limiting**: No rate limiting implemented on API endpoints. Should add rate limiting before production to prevent abuse.

**Image Upload Security**:
- ⚠️ **Upload Endpoint Authentication**: The `/api/upload` endpoint follows the same authentication pattern as all other API endpoints. When `FIREBASE_ADMIN_SERVICE_ACCOUNT` is not configured, it falls back to INSECURE client-side JWT decoding (with console warnings). When configured, it uses proper server-side token verification via Firebase Admin SDK.
- **Admin Role Enforcement**: Upload endpoint requires verified admin role after authentication (queries Firestore for user roles)
- **File Validation**: Strict MIME type whitelist (JPEG, PNG, GIF, WebP only) and 5MB file size limit
- **Path Security**: File serving endpoint (`/api/files/images/*`) has path traversal prevention and extension validation
- **Public File Access**: File serving endpoint is intentionally unauthenticated to allow gallery and leadership images to display on public-facing pages
- **Storage**: All uploaded images stored in Replit Object Storage under `images/` prefix with timestamp-based unique filenames

**Next Steps for Production**:
- **REQUIRED**: Set up Firebase Admin SDK service account credentials in `FIREBASE_ADMIN_SERVICE_ACCOUNT` environment variable to enable secure image uploads
- Implement Firebase Admin SDK for server-side token verification
- Add CSRF protection for API endpoints
- Implement rate limiting on registration endpoints
- Document and implement profile update sync strategy
- Secure session configuration with proper expiry and rotation

## External Dependencies

### UI Component Libraries

**Radix UI**: Comprehensive set of unstyled, accessible UI primitives including dialogs, dropdowns, accordions, popovers, and form controls. Chosen for accessibility compliance and flexibility.

**shadcn/ui**: Pre-built component implementations using Radix UI primitives with Tailwind CSS styling. Provides consistent design system while allowing customization.

**Lucide React**: Icon library providing consistent iconography across the platform (e.g., Briefcase, Search, Building2, Handshake, TrendingUp icons for five roles).

**React Icons**: Additional icon sets (specifically SiLinkedin, SiYoutube, SiX for social media links in footer).

**Embla Carousel**: Carousel/slider functionality for potential content showcases.

### Database & ORM

**Neon Serverless PostgreSQL**: Cloud-native PostgreSQL database optimized for serverless deployments. Requires `DATABASE_URL` environment variable.

**Drizzle ORM**: Type-safe ORM with zero-dependency approach and excellent TypeScript support. Chosen for simplicity and performance.

**Drizzle Kit**: CLI tool for schema management and migrations.

**Drizzle Zod**: Integration layer between Drizzle and Zod for validation schema generation.

### State Management & Data Fetching

**TanStack Query**: Server state management with built-in caching, background refetching, and optimistic updates. Configuration disables automatic refetching (staleTime: Infinity) for more controlled data flow.

### Form Management

**React Hook Form**: Performant form library with minimal re-renders.

**Hookform Resolvers**: Validation resolver integration for Zod schemas.

**Zod**: TypeScript-first schema validation library used for both client-side form validation and API request validation.

### Styling & Design

**Tailwind CSS**: Utility-first CSS framework configured with custom design tokens matching PEF brand guidelines.

**PostCSS & Autoprefixer**: CSS processing pipeline for vendor prefixing and optimization.

**class-variance-authority**: Type-safe variant API for component styling.

**clsx & tailwind-merge**: Utility libraries for conditional class composition and conflict resolution.

### Development Tools

**TypeScript**: Type safety across the entire stack with strict mode enabled.

**Vite**: Fast development server and optimized production builds with custom plugins for Replit integration.

**esbuild**: Fast JavaScript bundler used for server-side code compilation.

**tsx**: TypeScript execution environment for running the development server.

### Third-Party Integrations

**Replit Plugins**: Development-specific plugins for error overlays, cartographer (code navigation), and dev banner when running in Replit environment.

**Resend Email Service**: Transactional email service for sending notifications. Configured to use environment variable `RESEND_API_KEY`. Emails are sent from `onboarding@resend.dev` (testing email) to `abdulmoiz.cloud25@gmail.com` for:
- Contact form submissions from the `/contact` page
- New opportunity submissions from the `/opportunities` page

Email notifications include formatted HTML with all submission details, timestamp, and sender information.

### Asset Management

Generated images stored in `attached_assets/generated_images/` directory (e.g., professional handshake hero image). Vite alias configured for `@assets` path resolution.

### Browser APIs & Utilities

**date-fns**: Modern date utility library for potential date formatting and manipulation needs.

**nanoid**: Compact URL-safe unique ID generator for client-side ID generation.

**cmdk**: Command palette component library (imported but not yet implemented).

**wouter**: Minimal routing library (~1.2KB) chosen over React Router for simplicity.

### Session & Security

**connect-pg-simple**: PostgreSQL session store for Express sessions, prepared for authentication implementation.

**Environment Variables**: 
- `DATABASE_URL`: Required for database connection
- `NODE_ENV`: Controls development vs production behavior
- `RESEND_API_KEY`: Required for email notifications (contact form and opportunity submissions)