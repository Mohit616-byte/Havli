"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle, LogIn, UserPlus } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/providers/AuthProvider";

type InterestModalProps = {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
};

type FormData = {
  name: string;
  phone: string;
  ageRange: string;
  cityArea: string;
  instagram: string;
  reason: string;
};

const AGE_RANGES = [
  { value: "18-22", label: "18–22" },
  { value: "23-27", label: "23–27" },
  { value: "28-32", label: "28–32" },
  { value: "33-40", label: "33–40" },
  { value: "40+", label: "40+" },
];

const initialForm: FormData = {
  name: "",
  phone: "",
  ageRange: "",
  cityArea: "",
  instagram: "",
  reason: "",
};

export default function InterestModal({
  isOpen,
  onClose,
  eventId,
  eventTitle,
}: InterestModalProps) {
  const { user, profile } = useAuth();
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Pre-fill form from user profile if available
  useEffect(() => {
    if (profile) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || profile.name || "",
        phone: prev.phone || profile.phone || "",
        cityArea: prev.cityArea || (profile.area && profile.city ? `${profile.area}, ${profile.city}` : profile.city || ""),
        ageRange: prev.ageRange || profile.ageRange || "",
      }));
    }
  }, [profile]);

  const update = (key: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setApiError(null);

    try {
      const { createBrowserClient } = await import("@/lib/supabase/client");
      const supabase = createBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token || "";

      const res = await fetch("/api/interests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventId,
          name: form.name,
          phone: form.phone,
          ageRange: form.ageRange,
          cityArea: form.cityArea,
          instagram: form.instagram || undefined,
          reason: form.reason || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          setApiError("Please log in to continue.");
        } else if (res.status === 409) {
          setApiError("You've already expressed interest in this event.");
        } else {
          setApiError(json.error?.message ?? "Something went wrong. Please try again.");
        }
        return;
      }

      setSubmitted(true);
    } catch {
      setApiError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSubmitted(false);
      setForm(initialForm);
      setApiError(null);
    }, 300);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={submitted ? undefined : !user ? "Log in required" : "I'm Interested"}
    >
      {!user ? (
        // Unauthenticated User Prompt
        <div className="text-center py-6 space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-primary-muted)]">
            <LogIn size={28} className="text-[var(--color-primary)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--color-foreground)]">
            Log in to express interest
          </h2>
          <p className="text-sm text-[var(--color-muted)] leading-relaxed max-w-xs mx-auto">
            Please log in or create an account to join the list for{" "}
            <strong className="text-[var(--color-foreground)]">{eventTitle}</strong>.
          </p>

          <div className="flex flex-col gap-2.5 pt-3">
            <Button href="/login" fullWidth onClick={handleClose}>
              <LogIn size={16} className="inline mr-2" /> Log in to continue
            </Button>
            <Button href="/signup" variant="secondary" fullWidth onClick={handleClose}>
              <UserPlus size={16} className="inline mr-2" /> Create an account
            </Button>
          </div>
        </div>
      ) : submitted ? (
        // Success state
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-primary-muted)] mb-5">
            <CheckCircle size={28} className="text-[var(--color-primary)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--color-foreground)] mb-2">
            You&apos;re on the list 🎉
          </h2>
          <p className="text-sm text-[var(--color-muted)] leading-relaxed">
            We&apos;ll contact you when{" "}
            <strong className="text-[var(--color-foreground)]">{eventTitle}</strong> is confirmed.
          </p>
          <Button variant="secondary" className="mt-6" onClick={handleClose}>
            Got it
          </Button>
        </div>
      ) : (
        // Authenticated Form
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-[var(--color-muted)] -mt-2 mb-2">
            Tell us a bit about yourself for{" "}
            <span className="text-[var(--color-foreground)] font-medium">{eventTitle}</span>
          </p>

          {apiError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-sm text-red-400">{apiError}</p>
            </div>
          )}

          <Input
            id="interest-name"
            label="Name"
            placeholder="Your name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
          />
          <Input
            id="interest-phone"
            label="Phone number"
            type="tel"
            placeholder="+91 98xxx xxxxx"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            required
          />
          <Select
            id="interest-age"
            label="Age range"
            placeholder="Select age range"
            options={AGE_RANGES}
            value={form.ageRange}
            onChange={(e) => update("ageRange", e.target.value)}
            required
          />
          <Input
            id="interest-area"
            label="Your city / area"
            placeholder="e.g. Sector 57, Gurgaon"
            value={form.cityArea}
            onChange={(e) => update("cityArea", e.target.value)}
            required
          />
          <Input
            id="interest-instagram"
            label="Instagram (optional)"
            placeholder="@yourhandle"
            value={form.instagram}
            onChange={(e) => update("instagram", e.target.value)}
          />
          <Textarea
            id="interest-reason"
            label="Why are you interested? (optional)"
            placeholder="Tell the host a bit about why you'd love to join..."
            value={form.reason}
            onChange={(e) => update("reason", e.target.value)}
            rows={3}
          />

          <Button type="submit" fullWidth disabled={loading} className="mt-2">
            {loading ? "Submitting..." : "I'm Interested"}
          </Button>
        </form>
      )}
    </Modal>
  );
}
