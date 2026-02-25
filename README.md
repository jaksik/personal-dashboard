This is a Next.js admin dashboard with Supabase email/password authentication.

## Authentication

The app uses Supabase Auth and enforces these routes:

- `/` (dashboard): accessible only when authenticated.
- `/sign-in`: accessible only when not authenticated.

If an unauthenticated user visits `/`, they are redirected to `/sign-in`.
If an authenticated user visits `/sign-in`, they are redirected to `/`.

### Environment variables

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Grok (xAI) image generation
GROK_API_KEY=your_grok_api_key
# Optional overrides
# XAI_API_KEY=your_grok_api_key
# GROK_IMAGE_API_URL=https://api.x.ai/v1/images/generations
# GROK_IMAGE_MODEL=grok-2-image-1212

# Vercel Blob (for storing generated images)
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the dashboard in `app/page.tsx` and sign-in page in `app/sign-in/page.tsx`.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Supabase setup notes

- In your Supabase project, enable Email auth under Authentication settings.
- Create at least one user (dashboard admin) using Supabase Auth.
