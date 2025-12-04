# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start dev server on port 8080 (uses Turbopack by default)
pnpm build      # Production build
pnpm start      # Start production server
```

## Architecture

This is a Next.js 16 starter kit with MongoDB authentication using NextAuth.js v5 (Auth.js).

### Key Directories

- `src/app/` - Next.js App Router pages and API routes
- `src/actions/` - Server actions for form submissions (register, update-user)
- `src/components/` - React components (Navbar, UI primitives in `ui/`)
- `src/lib/` - Core utilities: MongoDB connection, session helpers
- `src/models/` - Mongoose models (User)

### Authentication Flow

1. **Auth.js (NextAuth v5)** with credentials provider
   - `src/auth.ts` - Main auth configuration with providers
   - `src/auth.config.ts` - Edge-compatible config for proxy/middleware
2. JWT-based sessions with configurable cookie prefix via `AUTH_COOKIE_PREFIX` env var
3. **Proxy** (`src/proxy.ts`) protects `/dashboard/*` and `/admin/*` routes using the `authorized` callback
4. **Session helper** (`src/lib/session.ts`) provides `getSessionUser()` for server components and `is(role)` for role checks

### User Roles

Users have a `role` field: `"admin"` or `"regular"`. Admin routes are under `/admin/*`.

### Environment Variables

Required:
- `MONGODB_URI` - MongoDB connection string
- `AUTH_SECRET` - Auth.js secret key (renamed from NEXTAUTH_SECRET)
- `AUTH_COOKIE_PREFIX` - Cookie prefix to avoid collisions between projects (defaults to "app")

### Path Aliases

`@/*` maps to `./src/*`
