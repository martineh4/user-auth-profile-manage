import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";

export const metadata = { title: "Dashboard — AuthProfile" };

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { name: true, email: true, bio: true, avatarUrl: true, createdAt: true },
  });

  const joinDate = user?.createdAt
    ? new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(user.createdAt)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {user?.name ?? session!.user.name}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="card p-6 sm:col-span-1">
          <div className="flex flex-col items-center text-center">
            {user?.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.name}
                width={80}
                height={80}
                className="rounded-full object-cover ring-2 ring-pink-100"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-pink-100 text-2xl font-bold text-pink-700">
                {user?.name?.[0]?.toUpperCase() ?? "U"}
              </div>
            )}
            <h2 className="mt-3 text-lg font-semibold text-gray-900">{user?.name}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            {user?.bio && (
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{user.bio}</p>
            )}
            <Link href="/profile" className="btn-primary mt-4 w-full text-xs py-2">
              Edit Profile
            </Link>
          </div>
        </div>

        <div className="space-y-4 sm:col-span-2">
          <div className="card p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
              Account Details
            </h3>
            <dl className="space-y-3">
              {[
                { label: "Full name", value: user?.name },
                { label: "Email address", value: user?.email },
                { label: "Bio", value: user?.bio ?? "No bio added yet" },
                { label: "Member since", value: joinDate },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col sm:flex-row sm:gap-4">
                  <dt className="w-32 shrink-0 text-xs font-medium text-gray-500">{label}</dt>
                  <dd className="text-sm text-gray-900">{value ?? "—"}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="card p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              <Link href="/profile" className="btn-primary text-sm">
                Edit Profile
              </Link>
              <Link href="/profile#password" className="btn-secondary text-sm">
                Change Password
              </Link>
              <Link href="/profile#email" className="btn-secondary text-sm">
                Change Email
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
