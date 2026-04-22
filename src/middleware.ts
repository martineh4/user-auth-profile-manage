import { betterFetch } from "@better-fetch/fetch";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { data: session } = await betterFetch<{ session: { id: string } }>(
    "/api/auth/get-session",
    {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
    }
  );

  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/profile");

  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register");

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/login",
    "/register",
  ],
};
