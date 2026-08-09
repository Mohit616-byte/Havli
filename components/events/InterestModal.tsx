"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";

type InterestModalProps = {
  isOpen: boolean;
  onClose: () => void;
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

const initialForm: FormData = { name: "", phone: "", ageRange: "", cityArea: "", instagram: "", reason: "" };

export default function InterestModal({ isOpen, onClose, eventTitle }: InterestModalProps) {
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
    await new Promise((res) => setTimeout(res, 900));
    setLoading(false);
    setSubmitted(true);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => { setSubmitted(false); setForm(initialForm); }, 300);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={submitted ? undefined : `I'm Interested`}>
      {submitted ? (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-primary-muted)] mb-5">
            <CheckCircle size={28} className="text-[var(--color-primary)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--color-foreground)] mb-2">
            You&apos;re on the list 🎉
          </h2>
          <p className="text-sm text-[var(--color-muted)] leading-relaxed">
            We&apos;ll contact you when <strong className="text-[var(--color-foreground)]">{eventTitle}</strong> is confirmed.
          </p>
          <Button variant="secondary" className="mt-6" onClick={handleClose}>
            Got it
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-[var(--color-muted)] -mt-2 mb-2">
            Tell us a bit about yourself for{" "}
            <span className="text-[var(--color-foreground)] font-medium">{eventTitle}</span>
          </p>

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
