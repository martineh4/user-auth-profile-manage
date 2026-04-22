import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }: { user: { email: string }; url: string }) => {
      await sendPasswordResetEmail(user.email, url);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }: { user: { email: string }; url: string }) => {
      await sendVerificationEmail(user.email, url);
    },
  },
  user: {
    additionalFields: {
      bio: {
        type: "string",
        required: false,
        nullable: true,
        defaultValue: null,
        input: false,
      },
      avatarUrl: {
        type: "string",
        required: false,
        nullable: true,
        defaultValue: null,
        input: false,
      },
    },
  },
});
