# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` or `pnpm dev`
- **Build**: `npm run build` 
- **Production server**: `npm run start`
- **Linting**: `npm run lint`

## Project Overview

This is a Korean knife sharpening service mobile application called "칼가는곳" (Knife Sharpening Place) built with Next.js 15. The app uses the App Router and is designed for mobile-first experience with a maximum width of 500px.

## Architecture

### Framework & Tech Stack
- Next.js 15 with App Router
- TypeScript
- Tailwind CSS for styling
- shadcn/ui component library
- Radix UI components
- React Hook Form for form handling
- Korean fonts: Nanum Gothic, Do Hyeon

### Layout System
The app uses a sophisticated layout provider system:
- `LayoutProvider` manages navigation visibility based on current route
- Main pages (`/`, `/profile`, `/notifications`, `/usage-history`) show bottom navigation
- Other pages hide navigation for focused experience
- Maximum container width: 500px with centered layout

### Component Structure
- **Pages**: Located in `app/` directory using App Router conventions
- **Components**: Feature components in `components/` directory
- **UI Components**: Reusable UI components in `components/ui/`
- **Mock Data**: Test data and scenarios in `mock/` directory

### Key Features
1. **Home Page**: Service overview with banners and quick actions
2. **Knife Request**: Service booking form with address and time selection
3. **Price List**: Service pricing information
4. **Usage History**: Order tracking with real-time status updates
5. **Profile Management**: User information and subscription management
6. **Notifications**: Service status updates
7. **Customer Service**: Support and FAQ

### Authentication System
**IMPORTANT: DO NOT MODIFY AUTHENTICATION FILES UNLESS EXPLICITLY REQUESTED**

The authentication system is complete and working correctly. It uses JWT tokens with HttpOnly cookies.

**Authentication Architecture:**
- **JWT-based authentication** with HttpOnly cookies (cookie name: `auth-token`)
- **Dual user types**: Client users (phone-based) and Admin users (username/password)
- **Account switching modal**: Shows when wrong user type accesses protected pages
- **Unified auth service**: Handles both client and admin authentication

**Protected Files - DO NOT MODIFY:**
- `lib/auth/jwt.ts` - JWT token generation and verification
- `lib/auth/unified.ts` - Unified authentication service
- `stores/auth-store.ts` - Zustand auth state management
- `middleware.ts` - Route protection and authentication middleware
- `app/api/auth/**/*` - All authentication API routes
- `components/auth/auth-guard.tsx` - Authentication guard component
- `components/auth/account-switch-modal.tsx` - Account switching UI

**Key Features:**
- Client authentication: Phone + SMS verification
- Admin authentication: Username + Password
- HttpOnly cookies for security
- Account switching with modal confirmation
- Hybrid routes (accessible to both authenticated and guest users)
- Protected routes with middleware enforcement

**Cookie Details:**
- Name: `auth-token` (hyphen, not underscore)
- HttpOnly: true
- SameSite: strict
- MaxAge: 24 hours
- Path: /

### State Management
- Uses Zustand for authentication state with localStorage persistence
- Uses React Context for layout state (navigation visibility, notifications)
- Mock data system with scenario-based testing in `mock/usage-history.ts`
- Form state managed with React Hook Form

### Design System
**IMPORTANT: DO NOT MODIFY CORE DESIGN SYSTEM UNLESS EXPLICITLY REQUESTED**

The design system is established and must remain consistent across the application.

**Protected Design Elements - DO NOT MODIFY:**

1. **Color System** (완전 수정 금지)
   - Primary brand color: `#F97316` (Orange)
   - Secondary colors: `#E67E22` (Darker orange for accents)
   - Background colors: `#F2F2F2` (Light gray), `#FAF3E0` (Cream)
   - Text colors: `#333333` (Dark gray), `#767676` (Medium gray), `#B0B0B0` (Light gray)
   - DO NOT introduce new colors without explicit permission
   - DO NOT modify existing color values

2. **UI Components** (완전 수정 금지)
   - All components in `components/ui/` are based on shadcn/ui
   - DO NOT modify component APIs or core functionality
   - DO NOT change component styling patterns
   - Files: `components/ui/button.tsx`, `components/ui/typography.tsx`, etc.

3. **Typography**
   - Headings: Do Hyeon font
   - Body text: Nanum Gothic font
   - DO NOT change font families

**Adjustable Design Elements:**

1. **Layout & Spacing** (조정 가능, 단 현재 테마 유지)
   - Margins, paddings, gaps can be adjusted
   - **MUST maintain current UI theme and consistency**
   - Use existing spacing patterns (e.g., `gap-5`, `px-5`, `py-4`)

2. **New Designs** (신규 디자인 시)
   - **MUST follow existing design system**
   - Use only approved colors from the color system
   - Use existing UI components from `components/ui/`
   - Match the visual style of existing pages (rounded corners, shadows, etc.)
   - Maintain mobile-first 500px max-width layout

**Design Guidelines for New Features:**
- Study existing pages (e.g., `/client/page.tsx`, `/client/profile/page.tsx`) for reference
- Use consistent border radius: `rounded-xl` for cards, `rounded-3xl` for large banners
- Use consistent shadows: `shadow-lg` for cards, `shadow-md` for smaller elements
- Maintain visual hierarchy with existing typography components
- Keep Korean language consistency

### Styling Conventions
- Mobile-first responsive design
- Maximum container width: 500px with centered layout
- Orange (#F97316) as primary brand color
- Korean typography with Do Hyeon font for headings
- Custom UI components extending shadcn/ui
- Tailwind CSS with custom design tokens

### Development Notes
- ESLint and TypeScript errors ignored during builds (configured in next.config.mjs)
- Images unoptimized for deployment flexibility
- Uses pnpm as package manager
- Korean language interface throughout

### File Organization
- Route-based pages in `app/` directory
- Shared components in `components/`
- Reusable UI components in `components/ui/`
- Utility functions in `lib/utils.ts`
- Custom hooks in `hooks/`
- Static assets in `public/`

When working on this project, focus on mobile experience, maintain Korean language consistency, and follow the established component patterns using shadcn/ui.