"use client";

import { useState, useRef } from "react";
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

export default function ProfileForm({ initialData }: { initialData: UserProfile }) {
  const { update } = useSession();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(initialData.avatarUrl ?? "");
  const [avatarMode, setAvatarMode] = useState<"url" | "upload">("url");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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

      await update({ name: json.user.name, image: json.user.avatarUrl ?? null });
      setSuccessMessage("Profile updated successfully!");
    } catch {
      setServerError("Network error. Please try again.");
    }
  };

  const handleUrlBlur = () => {
    const url = watchedAvatarUrl?.trim();
    if (url) {
      try { new URL(url); setAvatarPreview(url); } catch { /* keep old */ }
    } else {
      setAvatarPreview("");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("/api/profile/upload", { method: "POST", body: formData });
      const json = await res.json();

      if (!res.ok) {
        setUploadError(json.error ?? "Upload failed");
        setAvatarPreview(initialData.avatarUrl ?? "");
        return;
      }

      setValue("avatarUrl", json.avatarUrl, { shouldDirty: true });
      setAvatarPreview(json.avatarUrl);
      await update({ image: json.avatarUrl });
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
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

      {/* Avatar */}
      <div className="space-y-3">
        <div className="flex items-center gap-5">
          {avatarPreview ? (
            <Image
              src={avatarPreview}
              alt="Avatar"
              width={72}
              height={72}
              className="rounded-full object-cover ring-2 ring-pink-100"
              onError={() => setAvatarPreview("")}
            />
          ) : (
            <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-pink-100 text-2xl font-bold text-pink-700">
              {initialData.name?.[0]?.toUpperCase() ?? "U"}
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">Profile Photo</p>
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={() => setAvatarMode("upload")}
                className={`text-xs px-2.5 py-1 rounded-md border transition ${
                  avatarMode === "upload"
                    ? "bg-pink-600 text-white border-pink-600"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Upload file
              </button>
              <button
                type="button"
                onClick={() => setAvatarMode("url")}
                className={`text-xs px-2.5 py-1 rounded-md border transition ${
                  avatarMode === "url"
                    ? "bg-pink-600 text-white border-pink-600"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Image URL
              </button>
            </div>
          </div>
        </div>

        {avatarMode === "upload" ? (
          <div>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-pink-200 bg-pink-50/50 p-6 text-center transition hover:border-pink-400 hover:bg-pink-50"
            >
              {uploading ? (
                <p className="text-sm text-pink-600">Uploading…</p>
              ) : (
                <>
                  <svg className="h-8 w-8 text-pink-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-pink-600">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP, GIF · max 5 MB</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFileChange}
            />
            {uploadError && <p className="error-message">{uploadError}</p>}
          </div>
        ) : (
          <div>
            <input
              type="url"
              placeholder="https://example.com/avatar.jpg"
              className="form-input"
              {...register("avatarUrl")}
              onBlur={handleUrlBlur}
            />
            {errors.avatarUrl && <p className="error-message">{errors.avatarUrl.message}</p>}
          </div>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="form-label">
            Full name <span className="text-red-500">*</span>
          </label>
          <input id="name" type="text" autoComplete="name" className="form-input" {...register("name")} />
          {errors.name && <p className="error-message">{errors.name.message}</p>}
        </div>
        <div>
          <label className="form-label">Email address</label>
          <input type="email" value={initialData.email} disabled className="form-input" />
          <p className="mt-1.5 text-xs text-gray-400">Change email in the section below.</p>
        </div>
      </div>

      <div>
        <label htmlFor="bio" className="form-label">Bio</label>
        <textarea
          id="bio"
          rows={4}
          placeholder="Tell us a little about yourself…"
          className="form-input resize-none"
          {...register("bio")}
        />
        <div className="mt-1.5 flex justify-between">
          {errors.bio ? <p className="error-message">{errors.bio.message}</p> : <span />}
          <span className="text-xs text-gray-400">{watch("bio")?.length ?? 0}/500</span>
        </div>
      </div>

      <div className="flex justify-end border-t border-gray-100 pt-4">
        <button type="submit" disabled={isSubmitting || !isDirty} className="btn-primary">
          {isSubmitting ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
