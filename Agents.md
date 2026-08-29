# Agents.md — AI Coding Agent Guide

This file tells any AI coding agent (Cursor, Claude Code, etc.) how to work on this codebase. Follow it exactly. Do not introduce alternative libraries, patterns, or architectures not listed here.

## 1. Project Summary

A mobile-first web app for Gujarati farm owners to manage:
- Multiple farms/plots (different locations, different acreage)
- Daily worker attendance (irregular, day-wage labor)
- Cash advances given to workers anytime
- Automatic monthly wage settlement (days worked × daily rate − advances = balance)
- Daily expenses (diesel, fertilizer, seeds, equipment, etc.)
- Income (crop sales etc.)

Primary users are Gujarati-speaking farm owners on low-to-mid-range Android phones, often on weak mobile networks. **Speed, offline reliability, and functional correctness matter more than visual polish.**

## 2. Fixed Tech Stack (do not deviate)

- **Framework**: Next.js 14 (App Router), TypeScript, strict mode on.
- **Styling**: Tailwind CSS only. No CSS-in-JS, no separate CSS frameworks.
- **UI Components**: shadcn/ui as the base, customized per `Design.md`.
- **Database + Auth + Storage**: Supabase (PostgreSQL). Use Supabase Auth (phone OTP login), Supabase Storage for worker/expense photos, Postgres Row Level Security for data isolation per owner.
- **State management**: React Server Components + Server Actions for data mutations wherever possible. Use Zustand only for small client-only UI state (e.g., active language, offline queue status). No Redux.
- **Offline support**: PWA via `next-pwa`. Service worker caches the app shell and last-synced data. Writes made offline are queued in IndexedDB (via `idb` library) and synced to Supabase when connectivity returns.
- **i18n**: `next-intl` for Gujarati (`gu`) and English (`en`). Gujarati is the default locale. No other languages, ever.
- **Forms/validation**: `react-hook-form` + `zod`.
- **Deployment**: Vercel (frontend) + Supabase (backend), free/low tiers acceptable for MVP.

Do not suggest Firebase, MongoDB, Prisma+separate DB, GraphQL, Redux, or any state/backend alternative to the above. If a limitation is hit, flag it — do not silently swap tech.

## 3. Data Model (source of truth)

Implement exactly these tables in Supabase (adjust column types as needed, but do not add unrelated tables in MVP):

```
owners
  id, phone, name, preferred_language ('gu' | 'en'), pin_hash, created_at

farms
  id, owner_id (fk), name, location_text, acres, created_at

workers
  id, owner_id (fk), name, phone, photo_url, daily_wage, is_active, created_at

worker_farm_assignments
  id, worker_id (fk), farm_id (fk)   -- a worker can be linked to one or more farms

attendance
  id, worker_id (fk), farm_id (fk), date, status ('present' | 'absent' | 'half_day'), created_at
  -- unique constraint on (worker_id, date)

advances
  id, worker_id (fk), date, amount, note, created_at

expenses
  id, owner_id (fk), farm_id (fk, nullable), date, category
    (enum: 'fuel' | 'fertilizer' | 'seeds' | 'equipment' | 'labor_other' | 'misc'),
  amount, note, photo_url, created_at

income
  id, owner_id (fk), farm_id (fk, nullable), date, source_text, amount, note, created_at
```

Monthly settlement per worker is **computed on read**, not stored, unless a "close month" action is explicitly added later (out of MVP scope). Formula:
```
days_worked = count(attendance where status='present') + 0.5 * count(status='half_day')
gross = days_worked * worker.daily_wage
advances_total = sum(advances.amount) for that worker in that month
balance_due = gross - advances_total
```

## 4. Folder Structure

```
/app
  /(auth)/login
  /(dashboard)/farms
  /(dashboard)/workers
  /(dashboard)/attendance
  /(dashboard)/expenses
  /(dashboard)/income
  /(dashboard)/settlement
/components
  /ui         -- shadcn primitives
  /shared     -- app-specific reusable components
/lib
  /supabase   -- client + server clients
  /offline    -- IndexedDB queue + sync logic
  /i18n
/messages
  gu.json
  en.json
```

## 5. Coding Conventions

- TypeScript everywhere, no `any` unless justified with a comment.
- Server Actions for all writes (attendance marking, advances, expenses, income). Never call Supabase directly from client components for writes — always go through a Server Action or a queued offline write.
- Every list/table screen must have a loading skeleton and an empty state, both in Gujarati and English.
- Every currency value is formatted as Indian Rupees with Indian digit grouping (e.g., ₹12,500 not ₹12500 or $12,500).
- Every date is stored in ISO format in the DB but displayed in `DD-MM-YYYY` in the UI.
- Every mutation (attendance mark, advance entry, expense entry) must work fully offline and sync automatically — this is non-negotiable, not a "nice to have."
- Keep components small and single-purpose. No component file over ~150 lines — split it.
- No feature outside the MVP scope in `Detailed Prompt.md` may be added without being asked for explicitly.

## 6. Performance Rules

- Target first meaningful paint under 2 seconds on 3G-equivalent throttling.
- Lazy-load anything not needed on first screen (charts, photo uploads, settlement calculations for past months).
- Images (worker photos, receipt photos) must be compressed client-side before upload (max 500KB).
- No client-side library over 50KB gzipped may be added without a stated reason.

## 7. Testing & Verification Expectations

- After building any feature, verify it: (a) works with no network connection, (b) syncs correctly when connection returns, (c) renders correctly in both `gu` and `en`, (d) is usable one-handed on a small Android screen (test at 360px width).
- Do not mark a feature "done" until offline behavior is verified — this is the single most important non-functional requirement of this app.

## 8. What NOT to do

- Do not add crop advisory, weather, marketplace, GST/tax, or livestock features. Out of scope.
- Do not add more than 2 languages.
- Do not introduce a design system inconsistent with `Design.md`.
- Do not build a generic "farm management SaaS" — this app is specifically the attendance + advance + settlement + expense workflow described above. Stay scoped.
