"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { CITIES, VIBES } from "@/lib/mock-data";

type FormData = {
  name: string;
  phone: string;
  instagram: string;
  eventTitle: string;
  eventType: string;
  city: string;
  area: string;
  date: string;
  time: string;
  capacity: string;
  price: string;
  vibe: string;
  description: string;
};

const EVENT_TYPES = [
  "House Party", "Music Night", "Gaming", "Karaoke", "Food & Dining",
  "Sports", "Chill Hangout", "Social Meetup", "Other",
];

const initialForm: FormData = {
  name: "", phone: "", instagram: "", eventTitle: "", eventType: "",
  city: "", area: "", date: "", time: "", capacity: "", price: "", vibe: "", description: "",
};

export default function HostForm() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (key: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulated async — replace with API call later
    await new Promise((res) => setTimeout(res, 1000));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-16 px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-primary-muted)] mb-6">
          <CheckCircle size={32} className="text-[var(--color-primary)]" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-3">
          Event submitted 🎉
        </h2>
        <p className="text-[var(--color-muted)] max-w-sm mx-auto leading-relaxed">
          We&apos;ll review the details and contact you shortly. You&apos;ll hear from us within 24 hours.
        </p>
        <Button
          variant="secondary"
          className="mt-8"
          onClick={() => { setForm(initialForm); setSubmitted(false); }}
        >
          Submit another event
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* About you */}
      <section>
        <h2 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-widest mb-4">
          About you
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="host-name"
            label="Your name"
            placeholder="Riya Sharma"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
          />
          <Input
            id="host-phone"
            label="Phone number"
            type="tel"
            placeholder="+91 98xxx xxxxx"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            required
          />
          <Input
            id="host-instagram"
            label="Instagram handle (optional)"
            placeholder="@yourhandle"
            value={form.instagram}
            onChange={(e) => update("instagram", e.target.value)}
            className="sm:col-span-2"
          />
        </div>
      </section>

      {/* Event details */}
      <section>
        <h2 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-widest mb-4">
          Event details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="event-title"
            label="Event title"
            placeholder="Rooftop Social Night"
            value={form.eventTitle}
            onChange={(e) => update("eventTitle", e.target.value)}
            required
            className="sm:col-span-2"
          />
          <Select
            id="event-type"
            label="Event type"
            placeholder="Select type"
            options={EVENT_TYPES.map((t) => ({ value: t, label: t }))}
            value={form.eventType}
            onChange={(e) => update("eventType", e.target.value)}
            required
          />
          <Select
            id="event-vibe"
            label="Vibe"
            placeholder="Select vibe"
            options={VIBES.map((v) => ({ value: v.label, label: `${v.emoji} ${v.label}` }))}
            value={form.vibe}
            onChange={(e) => update("vibe", e.target.value)}
          />
          <Select
            id="event-city"
            label="City"
            placeholder="Select city"
            options={CITIES.map((c) => ({ value: c, label: c }))}
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            required
          />
          <Input
            id="event-area"
            label="Area / neighbourhood"
            placeholder="Sector 57, Golf Course Road..."
            value={form.area}
            onChange={(e) => update("area", e.target.value)}
            required
          />
          <Input
            id="event-date"
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
            required
          />
          <Input
            id="event-time"
            label="Start time"
            type="time"
            value={form.time}
            onChange={(e) => update("time", e.target.value)}
            required
          />
          <Input
            id="event-capacity"
            label="Max capacity"
            type="number"
            placeholder="e.g. 20"
            min="2"
            max="500"
            value={form.capacity}
            onChange={(e) => update("capacity", e.target.value)}
            required
          />
          <Input
            id="event-price"
            label="Entry price (₹)"
            type="number"
            placeholder="0 for free"
            min="0"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
          />
          <Textarea
            id="event-description"
            label="Event description"
            placeholder="Tell people what to expect — vibe, music, food, activities..."
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={5}
            className="sm:col-span-2"
          />
        </div>
      </section>

      <Button type="submit" size="lg" fullWidth disabled={loading}>
        {loading ? "Submitting..." : "Submit event"}
      </Button>

      <p className="text-xs text-center text-[var(--color-muted-2)]">
        By submitting, you agree to Havli&apos;s hosting guidelines. We&apos;ll review and contact you within 24 hours.
      </p>
    </form>
  );
}
