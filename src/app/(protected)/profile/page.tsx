import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/profile/ProfileForm";

export const metadata = { title: "Edit Profile — AuthProfile" };

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, bio: true, avatarUrl: true },
  });

  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update your personal information and public profile.
        </p>
      </div>

      <div className="card p-8 max-w-2xl">
        <ProfileForm initialData={user} />
      </div>
    </div>
  );
}
