This is a Next.js admin dashboard with Supabase email/password authentication.

## Authentication

The app uses Supabase Auth and enforces these routes:

- `/` (dashboard): accessible only when authenticated.
- `/sign-in`: accessible only when not authenticated.

If an unauthenticated user visits `/`, they are redirected to `/sign-in`.
If an authenticated user visits `/sign-in`, they are redirected to `/`.



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
