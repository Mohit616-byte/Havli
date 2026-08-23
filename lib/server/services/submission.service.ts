/**
 * SubmissionService — business logic for host event submissions.
 * Saves proposals to Supabase 'host_submissions' PostgreSQL table.
 */

import { submissionRepository } from "@/lib/server/repositories/submission.repository";
import {
  check,
  required,
  minLength,
  isPositiveNumber,
  isPositiveInt,
  isISODate,
  isPhone,
  isAllowedValue,
} from "@/lib/server/validation";
import { ALLOWED_CITIES, ALLOWED_VIBES } from "@/lib/server/types";
import type { CreateSubmissionInput, HostSubmission } from "@/lib/server/types";

export const submissionService = {
  async validateAndCreate(
    input: unknown,
    userId?: string
  ): Promise<
    | { ok: true; data: { submissionId: string; message: string } }
    | { ok: false; status: number; code: string; message: string; fields?: Record<string, string> }
  > {
    const body = input as Record<string, unknown>;

    const { valid, errors } = check(body, {
      name: [required("Name"), minLength("Name", 2)],
      phone: [required("Phone"), isPhone("Phone")],
      eventTitle: [required("Event title"), minLength("Event title", 3)],
      eventType: [required("Event type")],
      city: [required("City"), isAllowedValue("City", ALLOWED_CITIES)],
      area: [required("Area"), minLength("Area", 2)],
      date: [required("Date"), isISODate("Date")],
      startTime: [required("Start time")],
      capacity: [required("Capacity"), isPositiveInt("Capacity", 2)],
      price: [isPositiveNumber("Price")],
      vibe: [required("Vibe"), isAllowedValue("Vibe", ALLOWED_VIBES)],
      description: [required("Description"), minLength("Description", 20)],
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

    const createInput: CreateSubmissionInput = {
      name: String(body.name),
      phone: String(body.phone),
      instagram: body.instagram ? String(body.instagram) : undefined,
      eventTitle: String(body.eventTitle),
      eventType: String(body.eventType),
      city: String(body.city),
      area: String(body.area),
      date: String(body.date),
      startTime: String(body.startTime),
      capacity: Number(body.capacity),
      price: Number(body.price ?? 0),
      vibe: String(body.vibe),
      description: String(body.description),
      image: body.image ? String(body.image) : undefined,
      userId: userId,
      hostId: userId,
    };

    const submission: HostSubmission = await submissionRepository.create(
      createInput
    );

    return {
      ok: true,
      data: {
        submissionId: submission.id,
        message:
          "Event submitted successfully. We'll review and contact you within 24 hours.",
      },
    };
  },
};
