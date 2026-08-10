# BACKEND.md — Havli Phase 4.1 (Authentication & Profile Onboarding)

## Overview

The Havli backend lives entirely inside the Next.js project using App Router Route Handlers and Supabase Auth.

```
User (Browser)
  ↓
Signup (Name + Email + Password)
  ↓
Supabase Auth Session
  ↓
Incomplete Profile Check
  ↓
Onboarding Wizard (/onboarding)
  ↓
Havli Home (/)
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
| `/signup` | Page | Account Creation form (Name, Email, Password, Confirm) |
| `/onboarding` | Protected Page | 4-Step Profile Onboarding Wizard (Required + Optional details) |
| `/profile` | Protected Page | User Profile dashboard (View/Edit name, gender, phone, city, area, age range, instagram, interests) |
| `/api/auth/profile` | API Route | `GET` (fetch profile), `PUT` (update profile — role is whitelisted out) |

---

## Database Migration (Phase 4.1)

Migration: `supabase/migrations/20260810000002_add_gender_to_profiles.sql`
- Adds optional column `gender TEXT` to `public.profiles`.

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
