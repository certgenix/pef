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

**Storage Layer**: Abstracted storage interface (`IStorage`) with an in-memory implementation (`MemStorage`) for development. This allows easy migration to database-backed storage without changing application logic.

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

**Current State**: Basic user schema prepared with username/password fields. No authentication implementation yet.

**Planned Approach**: Session-based authentication (infrastructure present with connect-pg-simple). Admin approval workflow required for member verification, indicating need for role-based permissions system.

**Security Considerations**: Production deployment will require password hashing, CSRF protection, rate limiting on registration endpoints, and secure session configuration.

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

### Asset Management

Generated images stored in `attached_assets/generated_images/` directory (e.g., professional handshake hero image). Vite alias configured for `@assets` path resolution.

### Browser APIs & Utilities

**date-fns**: Modern date utility library for potential date formatting and manipulation needs.

**nanoid**: Compact URL-safe unique ID generator for client-side ID generation.

**cmdk**: Command palette component library (imported but not yet implemented).

**wouter**: Minimal routing library (~1.2KB) chosen over React Router for simplicity.

### Session & Security

**connect-pg-simple**: PostgreSQL session store for Express sessions, prepared for authentication implementation.

**Environment Variables**: `DATABASE_URL` required for database connection. `NODE_ENV` controls development vs production behavior.