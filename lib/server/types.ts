// ─── Shared constants ────────────────────────────────────────────────────────

export const ALLOWED_CITIES = [
  "Gurgaon",
  "Noida",
  "Delhi",
  "Greater Noida",
  "Ghaziabad",
  "Faridabad",
] as const;

export const ALLOWED_VIBES = [
  "House Party",
  "Music",
  "Gaming",
  "Karaoke",
  "Food",
  "Sports",
  "Chill",
  "Meet People",
] as const;

export const ALLOWED_EVENT_TYPES = [
  "House Party",
  "Music Night",
  "Karaoke",
  "Gaming",
  "Food & Dining",
  "Sports",
  "Chill Hangout",
  "Social Meetup",
  "Social",
  "Music",
  "Other",
] as const;

export const ALLOWED_GENDERS = [
  "Male",
  "Female",
  "Other",
  "Prefer not to say",
] as const;

export type City = (typeof ALLOWED_CITIES)[number];
export type Vibe = (typeof ALLOWED_VIBES)[number];
export type EventType = (typeof ALLOWED_EVENT_TYPES)[number];
export type Gender = (typeof ALLOWED_GENDERS)[number];

// ─── User Profile ─────────────────────────────────────────────────────────────

export type UserRole = "user" | "host" | "admin";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  city?: string;
  area?: string;
  ageRange?: string;
  instagram?: string;
  avatarUrl?: string;
  interests: string[];
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  gender?: string;
  city?: string;
  area?: string;
  ageRange?: string;
  instagram?: string;
  avatarUrl?: string;
  interests?: string[];
  // EXCLUDES role — role cannot be updated by client!
}

// ─── Event ────────────────────────────────────────────────────────────────────

export type EventStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "completed";

export interface EventHost {
  name: string;
  verified: boolean;
  phone?: string; // NOT exposed in public API responses
}

/** Full server-side event record (includes status + private fields) */
export interface ServerEvent {
  id: string;
  title: string;
  description: string;
  type: string;
  vibe: string[];
  city: string;
  area: string;
  date: string;      // Display format e.g. "Sat, 16 Aug"
  dateISO: string;   // ISO date e.g. "2026-08-16"
  time: string;
  price: number;
  capacity: number;
  spotsLeft: number;
  image: string;
  host: EventHost;
  whatToExpect: string[];
  safetyNote: string;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}

/** Public-facing event shape — host.phone stripped */
export type PublicEvent = Omit<ServerEvent, "status" | "updatedAt"> & {
  host: Omit<EventHost, "phone">;
};

export interface CreateEventInput {
  title: string;
  description: string;
  type: string;
  vibe: string[];
  city: string;
  area: string;
  dateISO: string;
  time: string;
  price: number;
  capacity: number;
  image: string;
  host: {
    name: string;
    phone: string;
    instagram?: string;
    verified?: boolean;
  };
  whatToExpect?: string[];
}

// ─── Interest ─────────────────────────────────────────────────────────────────

export interface EventInterest {
  id: string;
  eventId: string;
  userId: string;
  name: string;
  phone: string;
  ageRange: string;
  cityArea: string;
  instagram?: string;
  reason?: string;
  createdAt: string;
}

export interface CreateInterestInput {
  eventId: string;
  userId?: string;
  name: string;
  phone: string;
  ageRange: string;
  cityArea: string;
  instagram?: string;
  reason?: string;
}

// ─── Host Submission ──────────────────────────────────────────────────────────

export type SubmissionStatus = "pending" | "approved" | "rejected";

export interface HostSubmission {
  id: string;
  name: string;
  phone: string;
  instagram?: string;
  eventTitle: string;
  eventType: string;
  city: string;
  area: string;
  date: string;
  startTime: string;
  capacity: number;
  price: number;
  vibe: string;
  description: string;
  image?: string;
  status: SubmissionStatus;
  createdAt: string;
  hostId?: string;
  userId?: string;
}

export interface CreateSubmissionInput {
  name: string;
  phone: string;
  instagram?: string;
  eventTitle: string;
  eventType: string;
  city: string;
  area: string;
  date: string;
  startTime: string;
  capacity: number;
  price: number;
  vibe: string;
  description: string;
  image?: string;
  hostId?: string;
  userId?: string;
}

// ─── API response shapes ──────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
