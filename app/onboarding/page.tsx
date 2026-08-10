"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { CITIES, VIBES } from "@/lib/mock-data";
import { isProfileComplete } from "@/lib/utils/profile";
import { ArrowRight, ArrowLeft, Check, Sparkles } from "lucide-react";

const AGE_RANGES = ["18–20", "21–24", "25–29", "30+"];
const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [gender, setGender] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect unauthenticated users or users with complete profile
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (profile && isProfileComplete(profile)) {
        router.push("/");
      }
    }
  }, [user, profile, loading, router]);

  // Pre-fill existing data
  useEffect(() => {
    if (profile) {
      if (profile.name) setName(profile.name);
      if (profile.ageRange) setAgeRange(profile.ageRange);
      if (profile.gender) setGender(profile.gender);
      if (profile.city) setCity(profile.city);
      if (profile.area) setArea(profile.area);
      if (profile.interests) setSelectedVibes(profile.interests);
      if (profile.phone) setPhone(profile.phone);
      if (profile.instagram) setInstagram(profile.instagram);
      if (profile.avatarUrl) setAvatarUrl(profile.avatarUrl);
    }
  }, [profile]);

  const toggleVibe = (vibeLabel: string) => {
    setSelectedVibes((prev) =>
      prev.includes(vibeLabel)
        ? prev.filter((v) => v !== vibeLabel)
        : [...prev, vibeLabel]
    );
  };

  const handleNextStep = () => {
    setError(null);
    if (step === 1) {
      if (!name.trim() || name.trim().length < 2) {
        setError("Please enter your name (at least 2 characters).");
        return;
      }
      if (!ageRange) {
        setError("Please select your age range.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!city) {
        setError("Please select your city.");
        return;
      }
      if (!area.trim() || area.trim().length < 2) {
        setError("Please enter your area / neighbourhood.");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (selectedVibes.length === 0) {
        setError("Please select at least one vibe you are interested in.");
        return;
      }
      setStep(4);
    }
  };

  const handleFinish = async (skipOptional = false) => {
    setSaving(true);
    setError(null);

    try {
      const { createBrowserClient } = await import("@/lib/supabase/client");
      const supabase = createBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token || "";

      const payload = {
        name: name.trim(),
        ageRange,
        city,
        area: area.trim(),
        interests: selectedVibes,
        gender: !skipOptional && gender ? gender : undefined,
        phone: !skipOptional && phone ? phone.trim() : undefined,
        instagram: !skipOptional && instagram ? instagram.trim() : undefined,
        avatarUrl: !skipOptional && avatarUrl ? avatarUrl.trim() : undefined,
      };

      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error?.message || "Failed to save profile. Please try again.");
        setSaving(false);
        return;
      }

      await refreshProfile();
      router.push("/");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 max-w-lg mx-auto flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full">
          <div className="h-6 bg-[var(--color-surface-2)] rounded w-1/3 mx-auto" />
          <div className="h-80 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 flex items-center justify-center">
      <div className="w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 space-y-6">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--color-muted)] mb-2">
            <span className="flex items-center gap-1 text-[var(--color-primary)] font-bold">
              <Sparkles size={14} /> Step {step} of 4
            </span>
            <span>{step === 4 ? "Final Step" : `${Math.round((step / 4) * 100)}% Complete`}</span>
          </div>
          <div className="h-1.5 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-primary)] transition-all duration-300 rounded-full"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Step 1: About You */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-foreground)]">
                Tell us about yourself
              </h1>
              <p className="text-sm text-[var(--color-muted)] mt-1">
                Help hosts and guests get to know you.
              </p>
            </div>

            <Input
              id="onboard-name"
              label="Your name *"
              placeholder="e.g. Riya Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-2">
                Age Range *
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {AGE_RANGES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setAgeRange(r)}
                    className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all border ${
                      ageRange === r
                        ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm"
                        : "bg-[var(--color-surface-2)] text-[var(--color-foreground)] border-[var(--color-border)] hover:border-[var(--color-muted)]"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Gender</span>
                <span className="text-[10px] text-[var(--color-muted-2)] font-normal uppercase">
                  (Optional)
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {GENDERS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(gender === g ? "" : g)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-medium transition-all border ${
                      gender === g
                        ? "bg-[var(--color-primary-muted)] text-[var(--color-primary)] border-[var(--color-primary)]/40"
                        : "bg-[var(--color-surface-2)] text-[var(--color-muted)] border-[var(--color-border)] hover:text-[var(--color-foreground)]"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <Button fullWidth size="lg" onClick={handleNextStep}>
              Next: Location <ArrowRight size={16} className="inline ml-1" />
            </Button>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-foreground)]">
                Where are you located?
              </h1>
              <p className="text-sm text-[var(--color-muted)] mt-1">
                Havli matches you with events nearby across NCR.
              </p>
            </div>

            <Select
              id="onboard-city"
              label="City *"
              placeholder="Select your city"
              options={CITIES.map((c) => ({ value: c, label: c }))}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />

            <Input
              id="onboard-area"
              label="Area / Neighbourhood *"
              placeholder="e.g. Sector 57, Golf Course Road, Saket..."
              value={area}
              onChange={(e) => setArea(e.target.value)}
              required
            />

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={() => setStep(1)}>
                <ArrowLeft size={16} /> Back
              </Button>
              <Button fullWidth size="lg" onClick={handleNextStep}>
                Next: Interests <ArrowRight size={16} className="inline ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Interests */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-foreground)]">
                What are you into?
              </h1>
              <p className="text-sm text-[var(--color-muted)] mt-1">
                Select your favorite event vibes (select at least 1).
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {VIBES.map((vibe) => {
                const active = selectedVibes.includes(vibe.label);
                return (
                  <button
                    key={vibe.value}
                    type="button"
                    onClick={() => toggleVibe(vibe.label)}
                    className={`p-3.5 rounded-xl text-sm font-semibold transition-all duration-200 border flex items-center justify-between ${
                      active
                        ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm"
                        : "bg-[var(--color-surface-2)] text-[var(--color-foreground)] border-[var(--color-border)] hover:border-[var(--color-muted)]"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{vibe.emoji}</span>
                      <span>{vibe.label}</span>
                    </span>
                    {active && <Check size={16} />}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={() => setStep(2)}>
                <ArrowLeft size={16} /> Back
              </Button>
              <Button fullWidth size="lg" onClick={handleNextStep}>
                Next: Details <ArrowRight size={16} className="inline ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Optional Connect & Photo */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div>
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-[var(--color-foreground)]">
                  Connect & Photo
                </h1>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--color-surface-2)] text-[var(--color-muted)] border border-[var(--color-border)] uppercase tracking-wider">
                  Optional
                </span>
              </div>
              <p className="text-sm text-[var(--color-muted)] mt-1">
                Add optional details to make your profile stand out. You can skip this.
              </p>
            </div>

            <Input
              id="onboard-phone"
              label="Phone number (optional)"
              type="tel"
              placeholder="+91 98xxx xxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <Input
              id="onboard-instagram"
              label="Instagram handle (optional)"
              placeholder="@yourhandle"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
            />

            <Input
              id="onboard-avatar"
              label="Profile Picture URL (optional)"
              placeholder="https://..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />

            <div className="flex flex-col gap-2.5 pt-2">
              <Button fullWidth size="lg" disabled={saving} onClick={() => handleFinish(false)}>
                {saving ? "Saving profile..." : "Complete Profile 🎉"}
              </Button>
              <Button
                variant="secondary"
                fullWidth
                disabled={saving}
                onClick={() => handleFinish(true)}
              >
                Skip optional details
              </Button>
            </div>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="text-xs text-[var(--color-muted)] hover:underline block mx-auto pt-1"
            >
              ← Back to Interests
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
