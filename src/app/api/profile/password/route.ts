import { NextResponse } from "next/server";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { changePasswordSchema } from "@/lib/validations";

export async function PUT(request: Request) {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    const account = await prisma.account.findFirst({
      where: { userId: session.user.id, providerId: "credential" },
      select: { password: true },
    });

    if (!account?.password) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, account.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.account.updateMany({
      where: { userId: session.user.id, providerId: "credential" },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: "Password updated successfully" });
  } catch {
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 }
    );
  }
}
