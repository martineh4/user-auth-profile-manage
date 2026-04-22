"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";

export default function Navbar() {
  const { data: session } = authClient.useSession();
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/profile", label: "Profile" },
  ];

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  const avatarUrl = (session?.user as { avatarUrl?: string | null })?.avatarUrl;

  return (
    <header className="border-b border-pink-100 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-gray-900">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-600">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          AuthProfile
        </Link>

        <nav className="flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                pathname === href
                  ? "bg-pink-50 text-pink-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={session?.user?.name ?? "User"}
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-sm font-semibold text-pink-700">
                {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
              </div>
            )}
            <span className="text-sm text-gray-700">{session?.user?.name}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="btn-secondary py-1.5 text-xs"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
