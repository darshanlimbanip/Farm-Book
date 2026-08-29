# Design.md — UI/UX System

Design priority order for this app, always in this order: **1. Responsiveness/speed 2. Functionality/clarity 3. Visual polish.** If a design choice trades off speed or clarity for aesthetics, reject it.

## 1. Design Principles

- **One task per screen.** No dashboards crammed with widgets. Mark attendance is its own screen. Add expense is its own screen.
- **Big touch targets.** Minimum 48x48px tap area everywhere — users will tap with dirt/wet fingers, sometimes in sunlight glare.
- **Numbers over charts.** Farmers want "₹5,500 balance due" in large text, not a pie chart. Use charts nowhere in MVP.
- **Icons + text together, always.** Never icon-only buttons. Some users have low literacy; icons alone or text alone both fail — pair them.
- **Minimal typing.** Prefer tap/select/toggle over free text entry wherever possible (e.g., attendance is a single tap per worker: Present / Absent / Half-day — not a form).
- **Immediate visible feedback.** Every tap shows an instant state change (checkmark, color fill, toast) even before server sync completes, so the app never feels "stuck" on slow networks.

## 2. Layout & Responsiveness

- Mobile-first, single-column layout. Design at 360px width first, then scale up.
- Breakpoints: `sm` 360–480px (primary target), `md` 481–768px, `lg` 768px+ (secondary — used mostly for viewing reports if opened on a bigger screen).
- No horizontal scrolling ever, on any screen.
- Bottom navigation bar (fixed) with 4 icons max: **Home / Attendance / Workers / Expenses**. This must always be reachable with a thumb.
- Forms: one field visible and focused at a time on small screens where practical (e.g., "Add Expense" shows amount input large and centered, category as a horizontal scroll chip-selector below).

## 3. Color System

Keep it to a small, functional palette — do not add decorative colors.

- **Primary (brand/action)**: Deep green `#1B5E20` — represents farming, used for primary buttons, active states, bottom nav active icon.
- **Secondary (accent)**: Warm amber `#F9A825` — used sparingly for highlights (e.g., "balance due" numbers, alerts).
- **Success**: `#2E7D32` (present/paid states)
- **Danger**: `#C62828` (absent/balance owed states, delete actions)
- **Neutral background**: `#FAFAFA`
- **Neutral text**: `#212121` (primary text), `#757575` (secondary/meta text)
- **Card/surface**: `#FFFFFF` with a subtle `1px solid #E0E0E0` border, no heavy shadows (shadows cost render performance and look cluttered at small size — use borders instead).

Contrast: all text must meet WCAG AA minimum (4.5:1) — assume outdoor sunlight use, so err toward higher contrast than the minimum.

## 4. Typography

- Primary font: **Noto Sans Gujarati** for Gujarati text, **Inter** for English/numbers/Latin text. Load both via `next/font` — do not use a CDN font that requires a live network fetch (must work offline).
- Base font size: 16px minimum on mobile (never smaller — Gujarati script needs slightly more size than Latin to stay legible).
- Headings: bold, 20–24px. Body: 16px. Meta/labels: 14px, never below 13px.
- Numbers (currency, counts): always slightly larger and bolder than surrounding text — they're the most important data point on almost every screen.

## 5. Core Components

- **Worker Card**: photo (or initial-letter avatar if no photo), name, daily wage, today's attendance status as a colored tag. Tapping opens worker detail.
- **Attendance Row**: worker photo + name on the left, three large tap-targets on the right (Present / Half / Absent) shown as pill buttons, current selection filled solid, others outlined.
- **Big Number Stat**: used for "This month's expense total," "Balance due," etc. — large bold number, small label above it in gray.
- **Bottom Sheet, not modal dialogs**, for add/edit forms on mobile — bottom sheets are faster to reach and dismiss one-handed than centered modals.
- **Language toggle**: a simple `ગુજરાતી | English` switch, always visible in the top bar, persists per user (stored on the owner's profile, defaults to Gujarati).

## 6. Iconography

- Use `lucide-react` icons only — consistent weight, tree-shakeable, already available in the stack.
- Icon meanings must be learned once and stay consistent: rupee symbol = money/expense, calendar = attendance, person = worker, sprout/plant = farm.

## 7. Motion & Feedback

- Keep animation minimal and fast (150–200ms max) — this is a performance/clarity app, not a showcase app.
- Use skeleton loaders, not spinners, for anything that takes over 300ms to load.
- Every offline action shows a small persistent "syncing" indicator (e.g., a subtle dot near the top bar) rather than blocking the UI — never make the user wait for network before letting them keep working.

## 8. Accessibility & Literacy Considerations

- Never rely on color alone to convey status — always pair color with an icon or short label (e.g., red + ✕ + "Absent," not just a red dot).
- Confirmation dialogs for destructive actions (delete worker, delete expense) must use plain-language Gujarati, not translated jargon.
- Numeric keypad (`inputmode="numeric"`) for all amount and day-count fields — never make users switch keyboards manually.
- Currency and dates formatted consistently everywhere per `Agents.md` rules (₹ Indian grouping, DD-MM-YYYY).

## 9. What to Avoid

- No dense dashboards, no multi-column data tables on mobile, no charts/graphs in MVP, no long onboarding flows, no more than 2 nested navigation levels, no light/decorative illustrations that add load weight without functional value.
