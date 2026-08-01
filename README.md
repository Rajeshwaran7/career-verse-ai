# CareerVerse AI 🚀

**AI-Powered Talent Discovery Platform** — Connect students with startups through intelligent matching.

## Architecture

```
career-verse-ai/
├── apps/
│   ├── web/        # Next.js 15 frontend (App Router)
│   └── api/        # NestJS backend
└── packages/
    └── shared/     # Shared TypeScript types
```

## Tech Stack

**Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Zustand, Framer Motion, React Hook Form + Zod

**Backend:** NestJS, Prisma ORM, PostgreSQL, JWT + Google OAuth, Swagger, OpenAI API, Cloudinary

## Features

- 🤖 **AI Talent Passport** — AI-generated profile summary, skill scores, strengths & improvement suggestions
- 🔍 **Semantic Search** — Natural language candidate search with AI ranking ("Find React interns in Chennai")
- 📄 **Resume Parser** — Upload PDF → AI extracts skills, education, projects
- 🐙 **GitHub Integration** — Auto-fetch repos, stars, languages, contribution activity
- 🏢 **Startup Dashboard** — Post jobs, search talent, save candidates
- 🎓 **Student Dashboard** — Profile, AI Passport, applications
- 🛡️ **Admin Panel** — User/company/internship management

## Setup

### Prerequisites
- Node.js 18+, pnpm, PostgreSQL

### 1. Install dependencies
```bash
pnpm install
```

### 2. Configure environment

**Backend** (`apps/api/.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/careerverse"
JWT_SECRET="your-secret"
OPENAI_API_KEY="sk-..."
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
FRONTEND_URL="http://localhost:3000"
```

**Frontend** (`apps/web/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

### 3. Database setup
```bash
cd apps/api
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Run development servers
```bash
pnpm dev
```
- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- Swagger: http://localhost:4000/api/docs

## Test Credentials (after seeding)
| Role    | Email                    | Password     |
|---------|--------------------------|--------------|
| Admin   | admin@careerverse.ai     | Admin@123    |
| Startup | hr@techstartup.io        | Startup@123  |
| Student | raj@example.com          | Student@123  |

## API Documentation
Visit `http://localhost:4000/api/docs` for interactive Swagger docs.
