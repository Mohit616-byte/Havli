/** Lightweight validation utilities — no external dependencies */

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

type Rule = (value: unknown) => string | null;

function check(
  fields: Record<string, unknown>,
  rules: Record<string, Rule[]>
): ValidationResult {
  const errors: Record<string, string> = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    for (const rule of fieldRules) {
      const error = rule(fields[field]);
      if (error) {
        errors[field] = error;
        break; // First failure per field is enough
      }
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

// ─── Individual rules ─────────────────────────────────────────────────────────

export const required =
  (label: string): Rule =>
  (v) => {
    if (v === undefined || v === null || String(v).trim() === "")
      return `${label} is required`;
    return null;
  };

export const minLength =
  (label: string, min: number): Rule =>
  (v) => {
    if (typeof v === "string" && v.trim().length < min)
      return `${label} must be at least ${min} characters`;
    return null;
  };

export const maxLength =
  (label: string, max: number): Rule =>
  (v) => {
    if (typeof v === "string" && v.trim().length > max)
      return `${label} must be at most ${max} characters`;
    return null;
  };

export const isPositiveNumber =
  (label: string): Rule =>
  (v) => {
    const n = Number(v);
    if (isNaN(n) || n < 0) return `${label} must be a non-negative number`;
    return null;
  };

export const isPositiveInt =
  (label: string, min = 1): Rule =>
  (v) => {
    const n = Number(v);
    if (!Number.isInteger(n) || n < min)
      return `${label} must be a whole number of at least ${min}`;
    return null;
  };

export const isISODate =
  (label: string): Rule =>
  (v) => {
    if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v))
      return `${label} must be a valid date (YYYY-MM-DD)`;
    const d = new Date(v);
    if (isNaN(d.getTime())) return `${label} is not a valid date`;
    return null;
  };

export const isTime =
  (label: string): Rule =>
  (v) => {
    if (typeof v !== "string" || !/^\d{1,2}:\d{2}(:\d{2})?(\s?(AM|PM))?$/i.test(v))
      return `${label} must be a valid time`;
    return null;
  };

export const isAllowedValue =
  (label: string, allowed: readonly string[]): Rule =>
  (v) => {
    if (typeof v !== "string" || !allowed.includes(v))
      return `${label} must be one of: ${allowed.join(", ")}`;
    return null;
  };

export const isPhone =
  (label: string): Rule =>
  (v) => {
    if (typeof v !== "string" || !/^[+\d\s\-()]{7,15}$/.test(v.trim()))
      return `${label} must be a valid phone number`;
    return null;
  };

// ─── Composed validators ──────────────────────────────────────────────────────

export { check };
