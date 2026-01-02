# MSEDCL Admin Dashboard

Next.js 16 implementation of the MSEDCL Bill Automation System Admin Panel.

## Tech Stack

- **Framework**: Next.js 16.0.8 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **State Management**: React Context + TanStack Query
- **Database**: Supabase
- **Bundler**: Turbopack (Next.js 16 default)

## Features

- ✅ Next.js 16 with App Router
- ✅ TypeScript for type safety
- ✅ Tailwind CSS v4 for styling
- ✅ shadcn/ui component library
- ✅ Role-based authentication
- ✅ Protected routes
- ✅ Responsive design
- ✅ Server and Client Components
- ✅ React Server Components support

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` file with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Note**: Environment variables are required for building. The app uses Supabase for data storage and authentication.

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

Make sure your `.env.local` file is configured with valid Supabase credentials before building:

```bash
npm run build
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/        # Dashboard route group
│   │   ├── admin/          # Admin routes
│   │   └── layout.tsx      # Dashboard layout
│   ├── login/              # Login page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Root redirect
│   └── providers.tsx       # Context providers
├── components/             # React components
│   ├── ui/                 # shadcn/ui components
│   ├── Layout.tsx          # Main layout component
│   ├── PageHeader.tsx      # Page header component
│   ├── RoleBadge.tsx       # Role badge component
│   ├── StatusBadge.tsx     # Status badge component
│   └── LoadingSpinner.tsx  # Loading components
├── contexts/               # React Context providers
│   ├── AuthContext.tsx     # Authentication context
│   └── DataContext.tsx     # Data management context
├── lib/                    # Utility libraries
│   ├── supabase/           # Supabase client & API
│   └── utils.ts            # Utility functions
└── types/                  # TypeScript type definitions
    └── index.ts            # Core types
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Best Practices Implemented

1. **Server Components by Default**: Most components are Server Components where possible
2. **Client Components**: Only marked with `'use client'` when needed for interactivity
3. **Route Groups**: Using `(dashboard)` for organization without affecting URLs
4. **Type Safety**: Full TypeScript coverage
5. **Component Composition**: Modular, reusable components
6. **Performance**: Leveraging Next.js 16 optimizations and Turbopack

## Authentication

The app uses Supabase for authentication. Sessions are stored in localStorage (client-side). In production, consider using Supabase Auth with proper session management.

## Environment Variables

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key

## License

MIT
