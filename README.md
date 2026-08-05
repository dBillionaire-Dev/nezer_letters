# Letters to Nezer

> Leave me something you've always wanted to say.

A one-day, completely anonymous letter box built as a birthday project. Visitors land on a
cinematic dark page with a rotating 3D photo sphere, write one message, and send it. Nothing
else is ever collected, no name, email, phone, username, login, social handle, or location.

## Stack

| Layer      | Technology |
| ---------- | ---------- |
| Framework  | TanStack Start v1 (React 19, file-based routing, server functions) |
| Language   | TypeScript (strict) |
| Styling    | Tailwind CSS v4 with an oklch design-token system in `src/styles.css` |
| 3D         | React Three Fiber + Drei + three.js |
| Motion     | Framer Motion + canvas-confetti |
| Forms      | React Hook Form + Zod |
| Backend    | Supabase (PostgreSQL, Auth, Row Level Security) |
| Icons      | Lucide |

> This project runs on TanStack Start, which is the
> framework used here; every requested capability (server-side logic, SSR, file routing,
> API routes) is implemented with its equivalents.

## Routes

| Route | Access | Purpose |
| ----- | ------ | ------- |
| `/` | Public | Hero, 3D photo sphere, anonymous letter modal |
| `/auth` | Public (noindex) | Owner sign-in / one-time owner account creation |
| `/dashboard` | Owner only | Statistics, search, filter, read/unread, delete, pagination |

## Data model

`public.letters`

| Column | Type | Notes |
| ------ | ---- | ----- |
| `id` | `uuid` | primary key |
| `message` | `text` | 1–2000 characters, enforced by a database check |
| `created_at` | `timestamptz` | defaults to now |
| `is_read` | `boolean` | defaults to false |
| `deleted` | `boolean` | soft delete, defaults to false |

`public.user_roles` holds the `admin` role, separate from any profile data, and is read
through the `public.has_role()` security-definer function to keep RLS policies non-recursive.

## Security model

- **RLS on every table.** Anyone may `INSERT` a letter; only accounts holding the `admin`
  role can read or update them. No client can list letters.
- **Roles are never stored on a user/profile row**, avoiding privilege escalation.
- **Server-side validation.** Every write goes through a `createServerFn` handler with Zod
  validation and sanitisation (`src/lib/message.ts`) before it reaches the database.
- **No service-role key in the browser.** Public writes use the publishable key on the
  server; admin reads run as the signed-in user, so RLS still applies.
- **XSS.** Messages are rendered as text only — `dangerouslySetInnerHTML` is never used.
- **SQL injection.** All access goes through the parameterised PostgREST client.
- Dashboard routes are `noindex` and sit behind an authenticated route layout.

## Owner setup

1. Open `/auth`, choose **First time? Create the owner account**, and register with your
   email and a strong password.
2. Ask for the `admin` role to be granted to that account (a single row in `user_roles`).
   Until then the dashboard loads but returns no letters.
3. Sign in at `/auth` and open `/dashboard`.

## Replacing the sphere photos

`src/components/photo-sphere.tsx` imports the images from `src/assets/`. Drop square photos
in that folder, update the `IMAGES` array, and the tiles redistribute automatically over the
sphere. Any count works.

## Deployment

The app is deployed on **Vercel**; the backend (database, auth)
is already provisioned by **Supabase** and its environment variables are injected:

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` — browser
- `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` — server functions

Frontend changes go live when you click Update in the publish dialog; backend changes deploy
immediately. A custom domain can be attached after the first publish from Project Settings.

## Accessibility & performance

Semantic landmarks, labelled controls, visible gold focus rings, 44px minimum tap targets,
`prefers-reduced-motion` support (sphere auto-rotation and confetti both disable), lazy and
client-only loading of the 3D bundle, and route-level code splitting.
