import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-600 shadow-lg">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            AuthProfile
          </h1>
          <p className="mt-3 text-gray-500">
            Secure authentication and profile management built with Next.js,
            TypeScript, and PostgreSQL.
          </p>
        </div>

        <div className="card p-6">
          <div className="space-y-3">
            <Link href="/register" className="btn-primary w-full">
              Create an Account
            </Link>
            <Link href="/login" className="btn-secondary w-full">
              Sign In
            </Link>
          </div>

          <div className="mt-6 border-t border-gray-100 pt-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Features
            </h3>
            <ul className="space-y-2 text-left text-sm text-gray-600">
              {[
                "Secure registration & login with hashed passwords",
                "JWT session management via NextAuth.js",
                "Protected dashboard route with redirect",
                "Profile editing with form validation",
                "Change password, email, and delete account",
                "PostgreSQL persistence via Prisma ORM",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-pink-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
