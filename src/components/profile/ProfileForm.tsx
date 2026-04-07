"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { profileSchema, type ProfileInput } from "@/lib/validations";

interface UserProfile {
  name: string;
  email: string;
  bio?: string | null;
  avatarUrl?: string | null;
}

interface ProfileFormProps {
  initialData: UserProfile;
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const { update } = useSession();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(
    initialData.avatarUrl ?? ""
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialData.name,
      bio: initialData.bio ?? "",
      avatarUrl: initialData.avatarUrl ?? "",
    },
  });

  const watchedAvatarUrl = watch("avatarUrl");

  const onSubmit = async (data: ProfileInput) => {
    setServerError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error ?? "Failed to update profile");
        return;
      }

      // Sync the NextAuth session with the new name/avatar
      await update({ name: json.user.name, image: json.user.avatarUrl ?? null });
      setSuccessMessage("Profile updated successfully!");
    } catch {
      setServerError("Network error. Please try again.");
    }
  };

  const handleAvatarBlur = () => {
    const url = watchedAvatarUrl?.trim();
    if (url) {
      try {
        new URL(url);
        setAvatarPreview(url);
      } catch {
        // invalid URL — keep old preview
      }
    } else {
      setAvatarPreview("");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {serverError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
          {serverError}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 border border-green-200">
          {successMessage}
        </div>
      )}

      {/* Avatar preview */}
      <div className="flex items-center gap-5">
        {avatarPreview ? (
          <Image
            src={avatarPreview}
            alt="Avatar preview"
            width={72}
            height={72}
            className="rounded-full object-cover ring-2 ring-blue-100"
            onError={() => setAvatarPreview("")}
          />
        ) : (
          <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
            {initialData.name?.[0]?.toUpperCase() ?? "U"}
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-gray-900">Profile Photo</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Paste a public image URL below to update your avatar.
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="form-label">
            Full name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            className="form-input"
            {...register("name")}
          />
          {errors.name && (
            <p className="error-message">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="form-label">Email address</label>
          <input
            type="email"
            value={initialData.email}
            disabled
            className="form-input"
            title="Email cannot be changed"
          />
          <p className="mt-1.5 text-xs text-gray-400">Email cannot be changed.</p>
        </div>
      </div>

      <div>
        <label htmlFor="avatarUrl" className="form-label">
          Avatar URL
        </label>
        <input
          id="avatarUrl"
          type="url"
          placeholder="https://example.com/avatar.jpg"
          className="form-input"
          {...register("avatarUrl")}
          onBlur={handleAvatarBlur}
        />
        {errors.avatarUrl && (
          <p className="error-message">{errors.avatarUrl.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="bio" className="form-label">
          Bio
        </label>
        <textarea
          id="bio"
          rows={4}
          placeholder="Tell us a little about yourself…"
          className="form-input resize-none"
          {...register("bio")}
        />
        <div className="mt-1.5 flex justify-between">
          {errors.bio ? (
            <p className="error-message">{errors.bio.message}</p>
          ) : (
            <span />
          )}
          <span className="text-xs text-gray-400">
            {watch("bio")?.length ?? 0}/500
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
        <button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="btn-primary"
        >
          {isSubmitting ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
