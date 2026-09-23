# BACKEND.md — Havli Phase 5 (Real Booking System)

## Overview

The Havli backend lives entirely inside the Next.js project using App Router Route Handlers and Supabase.

```
User (Browser)
  ↓
Signup / Login
  ↓
Browse Approved Events (/explore)
  ↓
Event Detail (/events/[id])
  ↓
Book Your Spot (POST /api/bookings)
  ↓
Atomic DB reservation via reserve_booking() PostgreSQL function
  ↓
Booking confirmed → User sees in My Bookings (/bookings)
  ↓
Host sees guest in Dashboard (/host/dashboard)
```

---

## Authentication & Onboarding Architecture

### 1. Automatic Profile Creation Trigger
When a user signs up via `supabase.auth.signUp()`, PostgreSQL trigger `on_auth_user_created` fires automatically:
- Inserts row into `public.profiles` matching `id = auth.users.id`.
- Sets `role = 'user'` (ALWAYS forced to 'user', client cannot specify role).

### 2. Profile Completion Evaluation
A profile is evaluated as complete via `isProfileComplete(profile)`:
- **Required Fields**: `name` (min 2 chars), `ageRange`, `city`, `area`, `interests` (min 1 selected).
- **Optional Fields**: `gender`, `phone`, `instagram`, `avatarUrl`.
- If required fields are missing, user is guided through the 4-step wizard at `/onboarding`.

---

## Routes & Pages

| Route | Type | Description |
|---|---|---|
| `/login` | Page | Email & Password Login form |
| `/signup` | Page | Account Creation form |
| `/onboarding` | Protected Page | 4-Step Profile Onboarding Wizard |
| `/profile` | Protected Page | User Profile dashboard |
| `/explore` | Page | Browse approved events |
| `/events/[id]` | Page | Event detail with Book Your Spot CTA |
| `/bookings` | Protected Page | My Bookings list |
| `/bookings/[id]` | Protected Page | Single booking detail |
| `/host` | Protected Page | Host submission form |
| `/host/dashboard` | Protected Page (host/admin) | Host event dashboard |
| `/host/dashboard/[eventId]/guests` | Protected Page (host/admin) | Guest list for an event |
| `/admin` | Protected Page (admin) | Admin approval queue |

---

## API Routes

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/auth/profile` | GET | Required | Fetch authenticated user profile |
| `/api/auth/profile` | PUT | Required | Update authenticated user profile |
| `/api/events` | GET | None | List approved events (with filters) |
| `/api/events/[id]` | GET | None | Single event detail |
| `/api/bookings` | POST | Required | Create a booking (atomic) |
| `/api/bookings` | GET | Required | Get current user's bookings |
| `/api/bookings/[id]` | GET | Required | Single booking detail (own only) |
| `/api/host/events` | GET | Required | Host's events with booking counts |
| `/api/host/events/[id]/guests` | GET | Required | Guest list (ownership verified) |
| `/api/admin/events` | GET | Admin only | Pending submissions |
| `/api/admin/events` | PATCH | Admin only | Approve / reject submission |
| `/api/host-submissions` | POST | Required | Submit a new host event |

---

## Phase 5: Booking System

### Booking Flow

```
POST /api/bookings
  Body: { eventId }
  Auth: Bearer token (userId extracted server-side, never from body)
  ↓
bookingService.createBooking(eventId, userId)
  ↓
Validate: event exists, status = 'approved'
  ↓
supabaseAdmin.rpc('reserve_booking', { p_event_id, p_user_id, p_amount })
  ↓
PostgreSQL function: FOR UPDATE lock on event row
  → SOLD_OUT    → 409 "Sorry, this event is sold out."
  → DUPLICATE   → 409 "You already have a confirmed booking."
  → OK:<uuid>   → 201 { booking }
```

### Atomic Overbooking Prevention

The `reserve_booking()` PostgreSQL function (`SECURITY DEFINER`) uses `SELECT ... FOR UPDATE` on the event row to serialize concurrent booking attempts. This ensures that if only 1 seat remains, only 1 of N simultaneous requests will succeed.

### Price Snapshotting

`bookings.amount` is set to `events.price` at booking time. If the event price changes later, existing bookings retain the original price.

### Test Payment Model (Phase 5)

All bookings are created with `payment_status = 'test_paid'`. No real money moves.

**Phase 6 upgrade path**: Replace `'test_paid'` with Razorpay order verification. The `bookings.payment_status` column is designed to be updated to `'paid'` after Razorpay confirms payment.

---

## Database Migration (Phase 5)

Migration: `supabase/migrations/20260828000005_bookings.sql`

### bookings table

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | `gen_random_uuid()` |
| `event_id` | UUID FK → events | CASCADE delete |
| `user_id` | UUID FK → profiles | CASCADE delete |
| `amount` | INTEGER | Snapshot of price at booking time |
| `status` | TEXT | `confirmed \| cancelled \| refunded` |
| `payment_status` | TEXT | `test_paid \| pending \| failed \| refunded` |
| `created_at` | TIMESTAMPTZ | `NOW()` |
| `updated_at` | TIMESTAMPTZ | Auto-updated by trigger |

### Key Constraints

- `UNIQUE (event_id, user_id) WHERE status = 'confirmed'` — partial index prevents double-booking but allows rebooking after cancellation
- All standard indexes on `event_id`, `user_id`, `status`, `payment_status`

### RLS Policies

- `bookings_select_own`: Users read their own bookings
- `bookings_host_select`: Hosts read bookings for their events
- `bookings_update_own`: Users can cancel their own bookings
- `bookings_admin_all`: Admins have full access

---

## Security Audit & RLS Policies

- **`profiles` RLS**:
  - `profiles_select_own`: Users can read their own profile (`id = auth.uid()`).
  - `profiles_update_own`: Users can update their own profile, but `role` check prevents role elevation.
- **`event_interests` RLS**:
  - `event_interests_insert_own`: Only allowed when `user_id = auth.uid()`.
  - `UNIQUE(event_id, user_id)` constraint prevents duplicate registrations per user.
- **`events` RLS**:
  - `events_select_approved_public`: Public anonymous read access restricted to `status = 'approved'`.
- **`bookings` RLS**:
  - Users can only read/update their own bookings.
  - Hosts can read bookings for their own events only.
  - Booking creation is done via `reserve_booking()` (SECURITY DEFINER) — client cannot submit arbitrary `user_id`.

