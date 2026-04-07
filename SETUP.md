# Setup Guide

## Prerequisites
- Node.js 18+
- PostgreSQL running locally (or a remote connection string)

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Edit `.env` and set your PostgreSQL connection string and a random `NEXTAUTH_SECRET`.

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/auth_profile_db"
NEXTAUTH_SECRET="<run: openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Create the database (if it doesn't exist)
```sql
CREATE DATABASE auth_profile_db;
```

### 4. Push the Prisma schema to the database
```bash
npm run db:push
```
This creates the `users` table in your PostgreSQL database.

### 5. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Unauthenticated pages
│   │   ├── login/
│   │   └── register/
│   ├── (protected)/         # JWT-guarded pages
│   │   ├── dashboard/
│   │   └── profile/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/  # NextAuth handler
│   │   │   └── register/       # Registration endpoint
│   │   └── profile/            # GET & PUT profile
│   ├── layout.tsx
│   └── page.tsx             # Landing page
├── components/
│   ├── auth/                # Login & Register forms
│   ├── layout/              # Navbar
│   ├── profile/             # ProfileForm
│   └── providers/           # SessionProvider wrapper
├── lib/
│   ├── auth.ts              # NextAuth config (Credentials + JWT)
│   ├── db.ts                # Prisma client singleton
│   └── validations.ts       # Zod schemas
├── middleware.ts             # Route protection + auth redirect
└── types/
    └── next-auth.d.ts       # Session type augmentation
prisma/
└── schema.prisma            # User model
```

## Tech Stack
| Concern | Library |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Auth | NextAuth.js v4 (Credentials, JWT) |
| ORM | Prisma 5 |
| Database | PostgreSQL |
| Validation | Zod + React Hook Form |
| Styling | Tailwind CSS |
| Passwords | bcryptjs (cost 12) |
