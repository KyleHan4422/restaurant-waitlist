# Restaurant Waitlist

An internal staff dashboard for managing restaurant walk-in queues. Staff add customers with a name and party size, and the system instantly calculates an estimated wait time based on who's already in line.

## Features

- Add customers with name and party size
- Instant estimated wait time calculation
- Queue position display
- Live active waitlist with seat/cancel actions
- Seated and canceled history panel
- Server-side validation
- Fully persistent via PostgreSQL + Prisma

## Wait Time Logic

| Party Size | Service Time |
|-----------|-------------|
| 1–2       | 10 min      |
| 3–4       | 15 min      |
| 5–6       | 20 min      |
| 7+        | 25 min      |

A new customer's estimated wait = sum of service times of all WAITING customers ahead of them in the queue (ordered by `createdAt` ascending).

## Tech Stack

- **Next.js 14** (App Router, Server Actions)
- **TypeScript**
- **Tailwind CSS**
- **Prisma ORM**
- **PostgreSQL**

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with header
│   ├── page.tsx            # Main dashboard page (SSR)
│   └── globals.css
├── actions/
│   └── waitlist.ts         # Server actions: addCustomer, updateStatus
├── lib/
│   ├── db.ts               # Prisma client singleton
│   └── waitlist-utils.ts   # getServiceTimeByPartySize, calculateEstimatedWait, getActiveWaitlist
└── components/
    ├── AddCustomerForm.tsx  # Form with optimistic loading state
    ├── ConfirmationCard.tsx # Post-submit success/error feedback
    ├── WaitlistTable.tsx    # Table for active queue and history
    └── StatusBadge.tsx      # Color-coded status pill
prisma/
├── schema.prisma            # DB schema with WaitlistEntry model
└── seed.ts                  # Optional seed with example data
```

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL running locally (or a connection string to a hosted instance)

### 1. Clone and install

```bash
git clone <repo-url>
cd restaurant-waitlist
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set your database connection string:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/restaurant_waitlist"
```

> **Tip:** Create the database first if it doesn't exist:
> ```sql
> CREATE DATABASE restaurant_waitlist;
> ```

### 3. Run migrations

```bash
npm run db:migrate
# When prompted, give the migration a name like "init"
```

### 4. Generate Prisma client

```bash
npm run db:generate
```

### 5. (Optional) Seed the database

```bash
npm run db:seed
```

This creates 4 waiting customers plus one seated and one canceled entry for demo purposes.

### 6. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:reset` | Reset and re-migrate (drops all data) |

## Database Schema

```prisma
enum WaitlistStatus {
  WAITING
  SEATED
  CANCELED
}

model WaitlistEntry {
  id                    String         @id @default(cuid())
  name                  String
  partySize             Int
  status                WaitlistStatus @default(WAITING)
  estimatedWaitMinutes  Int
  queuePositionSnapshot Int
  createdAt             DateTime       @default(now())
  updatedAt             DateTime       @updatedAt
}
```

## Production Deployment

1. Set `DATABASE_URL` in your hosting environment's secrets.
2. Run `prisma migrate deploy` (not `migrate dev`) in CI/CD before starting the server.
3. The app uses `force-dynamic` rendering so no stale cache issues with the waitlist.
