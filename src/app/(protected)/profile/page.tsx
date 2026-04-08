import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/profile/ProfileForm";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm";
import ChangeEmailForm from "@/components/profile/ChangeEmailForm";
import DeleteAccountSection from "@/components/profile/DeleteAccountSection";

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
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your personal information and account security.
        </p>
      </div>

      {/* Profile Info */}
      <section id="profile" className="card p-8">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-gray-900">Profile Information</h2>
          <p className="mt-0.5 text-sm text-gray-500">Update your name, avatar, and bio.</p>
        </div>
        <ProfileForm initialData={user} />
      </section>

      {/* Change Email */}
      <section id="email" className="card p-8">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-gray-900">Change Email</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Update the email address associated with your account.
          </p>
        </div>
        <ChangeEmailForm currentEmail={user.email} />
      </section>

      {/* Change Password */}
      <section id="password" className="card p-8">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-gray-900">Change Password</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Choose a strong password with at least 8 characters.
          </p>
        </div>
        <ChangePasswordForm />
      </section>

      {/* Danger Zone */}
      <section id="delete" className="card border-red-200 p-8">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-red-700">Danger Zone</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Irreversible actions for your account.
          </p>
        </div>
        <DeleteAccountSection />
      </section>
    </div>
  );
}
