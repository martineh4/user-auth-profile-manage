import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { profileSchema } from "@/lib/validations";

export async function GET() {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, bio: true, avatarUrl: true, createdAt: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PUT(request: Request) {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, bio, avatarUrl } = parsed.data;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        bio: bio || null,
        avatarUrl: avatarUrl || null,
      },
      select: { id: true, name: true, email: true, bio: true, avatarUrl: true },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
