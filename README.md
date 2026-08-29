# Farm Book

Mobile-first web app for Gujarati farm owners to manage farms, worker attendance, advances, monthly settlement, and expenses/income.

## Tech Stack

- Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- Supabase (Auth, PostgreSQL, Storage)
- next-intl (Gujarati + English)
- next-pwa + IndexedDB offline queue

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL Editor
3. Enable Phone Auth in Authentication → Providers
4. Create storage buckets: `worker-photos`, `receipt-photos` (public)
5. Copy `.env.example` to `.env.local` and add your keys:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

See `Agents.md` for full conventions and `Design.md` for UI rules.

## PWA Icons

Place 192×192 and 512×512 PNG icons at:
- `public/icons/icon-192.png`
- `public/icons/icon-512.png`

Or use the SVG at `public/icons/icon.svg` as a source.
