"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { CITIES, VIBES } from "@/lib/mock-data";
import { User, ShieldCheck, CheckCircle, Camera } from "lucide-react";

const AGE_RANGES = [
  { value: "18–20", label: "18–20" },
  { value: "21–24", label: "21–24" },
  { value: "25–29", label: "25–29" },
  { value: "30+", label: "30+" },
];

const GENDERS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
  { value: "Prefer not to say", label: "Prefer not to say" },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile, logout } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [instagram, setInstagram] = useState("");
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Populate form from profile data
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPhone(profile.phone || "");
      setGender(profile.gender || "");
      setCity(profile.city || "");
      setArea(profile.area || "");
      setAgeRange(profile.ageRange || "");
      setInstagram(profile.instagram || "");
      setSelectedVibes(profile.interests || []);
      setAvatarUrl(profile.avatarUrl || "");
    }
  }, [profile]);

  const toggleVibe = (vibeLabel: string) => {
    setSelectedVibes((prev) =>
      prev.includes(vibeLabel)
        ? prev.filter((v) => v !== vibeLabel)
        : [...prev, vibeLabel]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { createBrowserClient } = await import("@/lib/supabase/client");
      const supabase = createBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token || "";

      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          phone,
          gender,
          city,
          area,
          ageRange,
          instagram,
          avatarUrl,
          interests: selectedVibes,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error?.message || "Failed to update profile");
        return;
      }

      setSuccess(true);
      await refreshProfile();
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 max-w-3xl mx-auto flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full">
          <div className="h-8 bg-[var(--color-surface-2)] rounded w-1/3" />
          <div className="h-64 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-primary)] mb-1">
            Account Management
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--color-foreground)]">
            My Profile
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-muted)] border border-[var(--color-border)] flex items-center gap-1">
            <ShieldCheck size={13} className="text-[var(--color-primary)]" />
            Role: <strong className="text-[var(--color-foreground)] font-bold">{profile?.role || "user"}</strong>
          </span>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSave} className="space-y-8">
        {/* Profile Card Summary */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5">
          <div className="relative w-20 h-20 rounded-full bg-[var(--color-primary-muted)] border-2 border-[var(--color-primary)] flex items-center justify-center text-2xl font-black text-[var(--color-primary)] overflow-hidden shrink-0">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <User size={36} />
            )}
          </div>

          <div className="text-center sm:text-left flex-1">
            <h2 className="text-xl font-bold text-[var(--color-foreground)]">
              {profile?.name || user.email?.split("@")[0]}
            </h2>
            <p className="text-sm text-[var(--color-muted)]">{user.email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2 text-xs text-[var(--color-muted)]">
              {profile?.city && <span>📍 {profile.area ? `${profile.area}, ` : ""}{profile.city}</span>}
              {profile?.ageRange && <span>• Age {profile.ageRange}</span>}
              {profile?.gender && <span>• {profile.gender}</span>}
            </div>
            {profile?.instagram && (
              <p className="text-xs text-[var(--color-primary)] mt-1 flex items-center justify-center sm:justify-start gap-1">
                <Camera size={12} /> {profile.instagram.startsWith("@") ? profile.instagram : `@${profile.instagram}`}
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-400" />
            <p className="text-sm text-emerald-400 font-medium">Profile saved successfully!</p>
          </div>
        )}

        {/* Basic Information */}
        <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-widest mb-2">
            Personal Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="profile-name"
              label="Full name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              id="profile-email"
              label="Email address (read-only)"
              value={user.email || ""}
              disabled
              className="opacity-70"
            />
            <Select
              id="profile-age"
              label="Age range *"
              placeholder="Select age range"
              options={AGE_RANGES}
              value={ageRange}
              onChange={(e) => setAgeRange(e.target.value)}
            />
            <Select
              id="profile-gender"
              label="Gender (optional)"
              placeholder="Select gender"
              options={GENDERS}
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            />
            <Input
              id="profile-phone"
              label="Phone number (optional)"
              type="tel"
              placeholder="+91 98xxx xxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              id="profile-instagram"
              label="Instagram handle (optional)"
              placeholder="@yourhandle"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
            />
          </div>
        </section>

        {/* Location & Preferences */}
        <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-widest mb-2">
            Location & Vibe Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              id="profile-city"
              label="City *"
              placeholder="Select city"
              options={CITIES.map((c) => ({ value: c, label: c }))}
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <Input
              id="profile-area"
              label="Area / Neighbourhood *"
              placeholder="e.g. Sector 57"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
            <Input
              id="profile-avatar"
              label="Profile Picture URL (optional)"
              placeholder="https://..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="sm:col-span-2"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-2">
              Favorite Event Vibes *
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {VIBES.map((vibe) => {
                const active = selectedVibes.includes(vibe.label);
                return (
                  <button
                    key={vibe.value}
                    type="button"
                    onClick={() => toggleVibe(vibe.label)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border flex items-center gap-1.5 ${
                      active
                        ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                        : "bg-[var(--color-surface-2)] text-[var(--color-muted)] border-[var(--color-border)] hover:text-[var(--color-foreground)]"
                    }`}
                  >
                    <span>{vibe.emoji}</span>
                    <span>{vibe.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Save & Logout */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <Button type="submit" size="lg" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>

          <button
            type="button"
            onClick={logout}
            className="text-sm font-semibold text-red-400 hover:text-red-300 transition-colors"
          >
            Log out of Havli
          </button>
        </div>
      </form>
    </div>
  );
}
