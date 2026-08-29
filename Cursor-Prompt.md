# Detailed Build Prompt for Cursor

Paste everything below into Cursor as the initial project prompt. Make sure `Agents.md` and `Design.md` are added to the repo root first — reference them explicitly as shown.

---

I am building a mobile-first web app for Gujarati farm owners to replace their manual pen-and-paper system for tracking farms, daily worker attendance, cash advances, monthly wage settlement, and daily expenses/income.

Two files are already in the repo root: `Agents.md` and `Design.md`. **Read both fully before writing any code.** `Agents.md` defines the exact tech stack, data model, folder structure, and coding rules — follow it exactly, do not substitute any library or pattern. `Design.md` defines the visual system, layout rules, and component behavior — follow it exactly for every screen you build.

## Language & Locale

- Only two languages: Gujarati (`gu`, default) and English (`en`), switchable via a toggle always visible in the top bar. Use `next-intl` with `messages/gu.json` and `messages/en.json`. Every single piece of user-facing text — labels, buttons, empty states, error messages, confirmation dialogs — must exist in both files. Do not hardcode any English string in a component.
- All currency in Indian Rupees with Indian digit grouping. All dates as `DD-MM-YYYY` in the UI, ISO in the database.

## Authentication

- Phone number + OTP login via Supabase Auth (no email, no social login — the target user has a phone, not necessarily an email).
- On first login, ask for: name, preferred language. Store on the `owners` table.
- Simple 4-digit PIN as an optional extra app-lock layer (local, not tied to auth) since multiple family members may share the phone.

## Build the following in this order. Fully complete and verify each step (including offline behavior) before moving to the next.

### Step 1 — Project setup
Initialize Next.js 14 (App Router, TypeScript, strict), Tailwind CSS, shadcn/ui, next-intl, next-pwa, Supabase client (browser + server), and the folder structure exactly as defined in `Agents.md` section 4. Set up the Supabase schema exactly as defined in `Agents.md` section 3, with Row Level Security so an owner can only read/write their own data (and data of workers/farms/etc. linked to their `owner_id`).

### Step 2 — Auth flow
Build phone+OTP login/signup, the first-time profile setup screen (name + language), and the optional PIN lock screen. Store session via Supabase Auth cookies (SSR-safe).

### Step 3 — Farms management
- List screen: shows all farms as cards (name, location, acres). Empty state if none yet.
- Add/Edit farm: bottom sheet form — name, location text, acres (numeric keypad).
- Delete farm with confirmation (only allowed if no active workers/records depend on it, or cascade with a clear warning — decide based on Supabase FK constraints, but always confirm in plain Gujarati/English before deleting).

### Step 4 — Workers management
- List screen: worker cards (photo/avatar, name, daily wage, assigned farm(s), active/inactive toggle).
- Add/Edit worker: name, phone (optional), daily wage (numeric keypad), assign to one or more farms (multi-select chips), optional photo upload (compressed client-side to under 500KB before upload, works offline via queued upload).
- Mark a worker inactive rather than hard-deleting by default, to preserve historical attendance/advance records.

### Step 5 — Daily attendance (core feature — get this right)
- A single "Today" screen, defaulting to today's date, with a date picker to go back to past dates if the owner forgot to log a day.
- List of all active workers (optionally filterable by farm) as Attendance Rows per `Design.md` section 5: one tap sets status to Present / Half-day / Absent. No extra confirmation step needed — tapping is the save action.
- This must work fully offline: tapping saves instantly to local state + IndexedDB queue, syncs to Supabase in the background when online, with a small non-blocking sync indicator.
- Prevent duplicate attendance rows per worker per day (upsert on `worker_id + date`).

### Step 6 — Advances
- From a worker's detail screen (or a quick "Add Advance" button from the Today screen), let the owner log a cash advance: amount (numeric keypad), date (defaults to today), optional note.
- Show a running list of the worker's advances for the current month directly on their profile.

### Step 7 — Monthly settlement (the key value feature)
- Worker detail screen shows, for the selected month: days worked, gross wage (days × daily rate), total advances taken, and **balance due** as a large, bold number per `Design.md` section 4/6 — this is the single most important number in the whole app, make it impossible to miss.
- Allow navigating between months (previous/next) to review past settlements.
- A summary screen listing all workers with their balance due for the selected month, so the owner can see everyone's dues in one place at settlement time.

### Step 8 — Expenses
- Add expense: amount (numeric keypad), category (chip selector: Fuel, Fertilizer, Seeds, Equipment, Other Labor, Misc), date, optional farm link, optional note, optional receipt photo (compressed, offline-queued upload).
- List screen: grouped by month, running total shown at top as a Big Number Stat, filterable by category and by farm.

### Step 9 — Income
- Same pattern as Expenses: add income (amount, source text, date, optional farm link, optional note), list grouped by month with running total.

### Step 10 — Home screen
- Single home screen showing: this month's total expenses, this month's total income, net (income − expenses), and a shortcut to today's attendance and to workers with pending balance due. Keep it to 3–4 Big Number Stats maximum — no charts, no clutter, per `Design.md` section 9.

### Step 11 — Offline sync hardening
- Implement the full IndexedDB write-queue in `/lib/offline`: every write action (attendance, advance, expense, income, worker/farm add-edit) is written locally first, queued, and flushed to Supabase on reconnect, with conflict handling (last-write-wins is acceptable for MVP given single-owner-writes-own-data).
- Add a visible but non-intrusive "Offline — will sync" banner when the device has no connection, and confirm it clears automatically on reconnect and successful sync.

### Step 12 — PWA polish
- Add manifest, icons, and service worker via `next-pwa` so the app is installable to the home screen and the app shell loads instantly even offline.
- Verify Lighthouse performance score on mobile is 90+ before considering this step done.

## Non-negotiable acceptance criteria (verify before calling anything "done")

1. Every screen works correctly and looks correct in both Gujarati and English.
2. Every write action (attendance, advance, expense, income) works with the network turned off and syncs correctly when reconnected.
3. Every screen is fully usable and readable at 360px width with no horizontal scrolling.
4. Currency and dates are formatted per `Agents.md` rules everywhere, with no exceptions.
5. No feature exists outside what is listed in this prompt — do not add crop advisory, weather, marketplace, GST, or livestock modules.

Build it step by step in the order above. After each step, tell me what you built and what still needs my input (e.g., Supabase project keys, exact category list confirmation) before continuing to the next step.
