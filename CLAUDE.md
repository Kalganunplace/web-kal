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

### State Management
- Uses React Context for layout state (navigation visibility, notifications)
- Mock data system with scenario-based testing in `mock/usage-history.ts`
- Form state managed with React Hook Form

### Styling Conventions
- Mobile-first responsive design
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