/**
 * EventService — business logic for events.
 * Delegates data access to eventRepository (Supabase).
 */

import {
  eventRepository,
  type EventFilters,
} from "@/lib/server/repositories/event.repository";
import {
  check,
  required,
  minLength,
  maxLength,
  isPositiveNumber,
  isPositiveInt,
  isISODate,
  isAllowedValue,
} from "@/lib/server/validation";
import { ALLOWED_CITIES, ALLOWED_EVENT_TYPES } from "@/lib/server/types";
import type { CreateEventInput, PublicEvent } from "@/lib/server/types";

export type EventsQuery = {
  city?: string;
  type?: string;
  vibe?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  date?: string;
};

export const eventService = {
  async listEvents(query: EventsQuery): Promise<PublicEvent[]> {
    const filters: EventFilters = {
      city: query.city || undefined,
      type: query.type || undefined,
      vibe: query.vibe || undefined,
      search: query.search || undefined,
      date: query.date || undefined,
      minPrice: query.minPrice ? Number(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
    };
    return await eventRepository.getAll(filters);
  },

  async getEvent(id: string): Promise<PublicEvent | null> {
    return await eventRepository.getById(id);
  },

  async validateAndCreate(
    input: unknown
  ): Promise<
    { valid: true; data: PublicEvent } | { valid: false; errors: Record<string, string> }
  > {
    const body = input as Record<string, unknown>;

    const { valid, errors } = check(body, {
      title: [required("Title"), minLength("Title", 3), maxLength("Title", 100)],
      description: [required("Description"), minLength("Description", 20)],
      type: [required("Event type"), isAllowedValue("Event type", ALLOWED_EVENT_TYPES)],
      city: [required("City"), isAllowedValue("City", ALLOWED_CITIES)],
      area: [required("Area"), minLength("Area", 2)],
      dateISO: [required("Date"), isISODate("Date")],
      time: [required("Time")],
      price: [isPositiveNumber("Price")],
      capacity: [required("Capacity"), isPositiveInt("Capacity", 2)],
      image: [required("Image URL")],
      "host.name": [required("Host name")],
      "host.phone": [required("Host phone")],
    });

    if (!valid) return { valid: false, errors };

    const host = body.host as Record<string, unknown>;
    const createInput: CreateEventInput = {
      title: String(body.title),
      description: String(body.description),
      type: String(body.type),
      vibe: Array.isArray(body.vibe)
        ? (body.vibe as string[])
        : body.vibe
        ? [String(body.vibe)]
        : [],
      city: String(body.city),
      area: String(body.area),
      dateISO: String(body.dateISO),
      time: String(body.time),
      price: Number(body.price ?? 0),
      capacity: Number(body.capacity),
      image: String(body.image),
      host: {
        name: String(host?.name ?? ""),
        phone: String(host?.phone ?? ""),
        instagram: host?.instagram ? String(host.instagram) : undefined,
        verified: false,
      },
      whatToExpect: Array.isArray(body.whatToExpect)
        ? (body.whatToExpect as string[])
        : [],
    };

    const created = await eventRepository.create(createInput);
    return { valid: true, data: created };
  },
};
