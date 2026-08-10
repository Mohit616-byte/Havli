/**
 * InterestService — business logic for interest registrations.
 * Requires authenticated user context (userId resolved server-side).
 */

import { interestRepository } from "@/lib/server/repositories/interest.repository";
import { eventRepository } from "@/lib/server/repositories/event.repository";
import {
  check,
  required,
  minLength,
  isPhone,
  isAllowedValue,
} from "@/lib/server/validation";
import type { CreateInterestInput, EventInterest } from "@/lib/server/types";

const AGE_RANGES = ["18-22", "23-27", "28-32", "33-40", "40+"] as const;

export const interestService = {
  async validateAndCreate(
    userId: string,
    input: unknown
  ): Promise<
    | { ok: true; data: EventInterest }
    | { ok: false; status: number; code: string; message: string; fields?: Record<string, string> }
  > {
    const body = input as Record<string, unknown>;

    // Validate required fields
    const { valid, errors } = check(body, {
      eventId: [required("Event ID")],
      name: [required("Name"), minLength("Name", 2)],
      phone: [required("Phone"), isPhone("Phone")],
      ageRange: [required("Age range"), isAllowedValue("Age range", AGE_RANGES)],
      cityArea: [required("City / area")],
    });

    if (!valid) {
      return {
        ok: false,
        status: 400,
        code: "VALIDATION_ERROR",
        message: "Please check the highlighted fields",
        fields: errors,
      };
    }

    // Ensure event exists in Supabase
    const event = await eventRepository.getById(String(body.eventId));
    if (!event) {
      return {
        ok: false,
        status: 404,
        code: "NOT_FOUND",
        message: "Event not found",
      };
    }

    // Prevent duplicate entries using server-resolved userId
    const isDup = await interestRepository.isDuplicate(
      String(body.eventId),
      String(body.phone),
      userId
    );
    if (isDup) {
      return {
        ok: false,
        status: 409,
        code: "CONFLICT",
        message: "You've already expressed interest in this event",
      };
    }

    const createInput: CreateInterestInput & { userId: string } = {
      eventId: String(body.eventId),
      userId,
      name: String(body.name),
      phone: String(body.phone),
      ageRange: String(body.ageRange),
      cityArea: String(body.cityArea),
      instagram: body.instagram ? String(body.instagram) : undefined,
      reason: body.reason ? String(body.reason) : undefined,
    };

    const record = await interestRepository.create(createInput);
    return { ok: true, data: record };
  },
};
