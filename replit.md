# Professional Executive Forum (PEF) Platform

## Overview
The Professional Executive Forum (PEF) is a global digital platform designed to collect structured information from professionals, job seekers, employers, business owners, and investors. The platform's current phase focuses on data collection and community building through member registration, profile management, and opportunity posting. Its future phase will implement intelligent matching to connect talent, capital, and business opportunities. PEF launches in Saudi Arabia with international access, emphasizing verified, high-quality data through an admin approval process to foster a trusted professional ecosystem.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
The frontend uses React with TypeScript and Vite. It leverages `shadcn/ui` (built on Radix UI and Tailwind CSS) for its component library, `Wouter` for client-side routing, and `TanStack Query` for server state management. The design system incorporates a navy blue, light blue, and orange/gold color palette, Inter/Open Sans and Montserrat typography, and is responsive with a mobile-first approach. Multi-language support (English, Arabic, Urdu) is planned.

### Backend
The backend is built with Express.js on Node.js with TypeScript, featuring a RESTful API. It uses an abstracted storage interface, currently implemented with Firestore for data persistence. Infrastructure for session management with `connect-pg-simple` (for PostgreSQL) is in place. Development uses Vite middleware for HMR, while production uses esbuild.

### Data
Drizzle ORM is configured for Neon Serverless PostgreSQL, providing type-safe queries and migrations. The current schema includes a `users` table and is designed for sharing between client and server. Drizzle-Zod provides runtime validation. Future expansion will include multi-role profiles, role-specific data, opportunity listings, a member directory, and admin approval workflows.

### Authentication & Authorization
Firebase Authentication handles user registration, login, and password resets. Firestore is the primary data store for all application data, including user profiles, opportunities, and applications, with server-side access via the Firebase Admin SDK. Users can complete registration and import LinkedIn profile data via OAuth 2.0. An admin panel allows filtering and managing user approval statuses. Security measures include user-specific cache keys for TanStack Query, authenticated queries, and mutation cache invalidation. **Critical security concern**: Firebase Admin SDK token verification is currently disabled in deployment when the service account is not configured, which is a severe vulnerability that must be addressed before production. Image uploads are authenticated and validated for MIME type, size, and path security.

## External Dependencies

### UI Component Libraries
- **Radix UI**: Accessible, unstyled UI primitives.
- **shadcn/ui**: Styled components built on Radix UI with Tailwind CSS.
- **Lucide React**: Icon library.
- **React Icons**: Additional icon sets (e.g., social media).
- **Embla Carousel**: Carousel/slider functionality.

### Database & ORM
- **Neon Serverless PostgreSQL**: Cloud-native database.
- **Drizzle ORM**: Type-safe ORM.
- **Drizzle Kit**: Schema migration tool.
- **Drizzle Zod**: Integration for Zod validation.

### State Management & Data Fetching
- **TanStack Query**: Server state management with caching.

### Form Management
- **React Hook Form**: Performant form library.
- **Hookform Resolvers**: Validation resolvers for Zod.
- **Zod**: TypeScript-first schema validation.

### Styling & Design
- **Tailwind CSS**: Utility-first CSS framework.
- **PostCSS & Autoprefixer**: CSS processing.
- **class-variance-authority**: Type-safe variant API.
- **clsx & tailwind-merge**: Utilities for class composition.

### Development Tools
- **TypeScript**: For type safety.
- **Vite**: Fast development server and build tool.
- **esbuild**: Fast JavaScript bundler.
- **tsx**: TypeScript execution environment.

### Third-Party Integrations
- **Replit Plugins**: Development-specific tools.
- **Resend Email Service**: Transactional email service for contact forms and opportunity submissions (API key required).

### Asset Management
- **Attached Assets**: Generated images stored locally with Vite alias.

### Browser APIs & Utilities
- **date-fns**: Date utility library.
- **nanoid**: URL-safe unique ID generator.
- **wouter**: Minimal routing library.

### Session & Security
- **connect-pg-simple**: PostgreSQL session store.
- **Environment Variables**: `DATABASE_URL`, `NODE_ENV`, `RESEND_API_KEY`.