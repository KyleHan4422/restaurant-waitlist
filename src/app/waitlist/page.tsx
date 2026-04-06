import Link from "next/link";
import { db } from "@/lib/db";
import { WaitlistStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

/** Mask name: show first name + last initial only, e.g. "Johnson F." */
function maskName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

const statusLabel: Record<WaitlistStatus, string> = {
  WAITING: "Waiting",
  CALLED: "Called",
  SEATED: "Seated",
  CANCELED: "Canceled",
};

const statusColor: Record<WaitlistStatus, string> = {
  WAITING: "text-amber-400",
  CALLED: "text-green-400",
  SEATED: "text-neutral-500",
  CANCELED: "text-neutral-700",
};

export default async function WaitlistPage() {
  const called = await db.waitlistEntry.findFirst({
    where: { status: WaitlistStatus.CALLED },
    orderBy: { updatedAt: "desc" },
  });

  const entries = await db.waitlistEntry.findMany({
    where: {
      status: { in: [WaitlistStatus.WAITING, WaitlistStatus.CALLED] },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="min-h-screen bg-neutral-950 px-6 py-10 flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <p className="text-neutral-500 text-sm">The Table</p>
      </div>

      <h1 className="text-4xl font-bold text-white mb-2">Current Queue</h1>

      {/* Now serving banner */}
      {called && (
        <div className="mt-4 mb-8 rounded-2xl bg-green-500/10 border border-green-500/30 px-6 py-5 flex items-center justify-between">
          <span className="text-green-400 font-semibold text-lg">Now Serving</span>
          <span className="text-5xl font-black text-green-400">{called.queueNumber}</span>
        </div>
      )}

      {/* Queue list */}
      {entries.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <p className="text-5xl mb-4">🍽️</p>
          <p className="text-2xl font-bold text-white">No one waiting</p>
          <p className="text-neutral-500 mt-2">The queue is empty right now.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 mt-2">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between rounded-xl border px-5 py-4 ${
                entry.status === WaitlistStatus.CALLED
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-neutral-800 bg-neutral-900"
              }`}
            >
              {/* Queue number */}
              <div className="flex items-center gap-4">
                <span className={`text-3xl font-black ${entry.status === WaitlistStatus.CALLED ? "text-green-400" : "text-amber-400"}`}>
                  {entry.queueNumber}
                </span>
                <div>
                  <p className="text-white font-semibold text-lg">{maskName(entry.name)}</p>
                  <p className="text-neutral-500 text-sm">Party of {entry.partySize}</p>
                </div>
              </div>

              {/* Right side */}
              <div className="text-right">
                <p className={`text-sm font-semibold ${statusColor[entry.status]}`}>
                  {statusLabel[entry.status]}
                </p>
                {entry.status === WaitlistStatus.WAITING && index > 0 && (
                  <p className="text-neutral-600 text-xs mt-0.5">
                    ~{entry.estimatedWaitMinutes}m wait
                  </p>
                )}
                {entry.status === WaitlistStatus.WAITING && index === 0 && (
                  <p className="text-amber-400 text-xs mt-0.5 font-medium">Up next</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Join CTA */}
      <div className="mt-10">
        <Link
          href="/join"
          className="block w-full rounded-2xl bg-amber-400 py-5 text-center text-xl font-bold text-neutral-950 active:scale-95 transition-transform"
        >
          Join the Waitlist
        </Link>
      </div>
    </div>
  );
}
