import Link from "next/link";
import { db } from "@/lib/db";
import { WaitlistStatus } from "@prisma/client";
import { getServiceTimeByPartySize } from "@/lib/waitlist-utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const waiting = await db.waitlistEntry.findMany({
    where: { status: WaitlistStatus.WAITING },
    orderBy: { createdAt: "asc" },
  });

  const called = await db.waitlistEntry.findFirst({
    where: { status: WaitlistStatus.CALLED },
    orderBy: { updatedAt: "desc" },
  });

  const partiesWaiting = waiting.length;

  // Total estimated wait = sum of all WAITING service times
  const totalWait = waiting.reduce(
    (sum, e) => sum + getServiceTimeByPartySize(e.partySize),
    0
  );

  const nowServing = called?.queueNumber ?? waiting[0]?.queueNumber ?? null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-8 py-12 bg-neutral-950">

      {/* Top: Restaurant identity */}
      <div className="text-center">
        <p className="text-yellow-300 tracking-[0.25em] uppercase text-sm font-semibold mb-2">
          Welcome to
        </p>
        <h1 className="text-5xl font-bold tracking-tight text-white">The Vicino</h1>
      </div>

      {/* Center: Live queue stats */}
      <div className="w-full max-w-2xl flex flex-col items-center gap-10">

        {/* Now Serving */}
        <div className="text-center">
          <p className="text-yellow-300 uppercase tracking-widest text-sm font-semibold mb-3">
            Now Serving
          </p>
          {nowServing ? (
            <p className="text-[9rem] font-black leading-none tracking-tight text-white">
              {nowServing}
            </p>
          ) : (
            <p className="text-5xl font-bold text-neutral-500">—</p>
          )}
        </div>

        {/* Stats row */}
        <div className="flex w-full divide-x divide-neutral-800 rounded-2xl border border-neutral-800 bg-neutral-900 overflow-hidden">
          <div className="flex-1 px-8 py-8 text-center">
            <p className="text-yellow-300 text-sm font-semibold uppercase tracking-widest mb-2">
              Parties Waiting
            </p>
            <p className="text-6xl font-black text-white">{partiesWaiting}</p>
          </div>
          <div className="flex-1 px-8 py-8 text-center">
            <p className="text-yellow-300 text-sm font-semibold uppercase tracking-widest mb-2">
              Est. Wait
            </p>
            <p className="text-6xl font-black text-amber-400">
              {partiesWaiting === 0 ? (
                <span className="text-4xl text-green-400">No Wait</span>
              ) : (
                `${totalWait}m`
              )}
            </p>
          </div>
        </div>

        {/* View waitlist link */}
        <Link
          href="/waitlist"
          className="text-yellow-300 font-semibold underline underline-offset-4 text-base hover:text-yellow-100 transition-colors"
        >
          View full waitlist →
        </Link>
      </div>

      {/* Bottom: Join CTA */}
      <div className="w-full max-w-lg flex flex-col items-center gap-4">
        <Link
          href="/join"
          className="w-full rounded-2xl bg-amber-400 py-7 text-center text-2xl font-bold text-neutral-950 shadow-lg active:scale-95 transition-transform"
        >
          Join the Waitlist
        </Link>
        <p className="text-neutral-600 text-sm">
          Tap to add your party to the queue
        </p>
      </div>
    </div>
  );
}
