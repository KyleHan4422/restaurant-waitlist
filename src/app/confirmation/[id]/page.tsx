import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ConfirmationPage({
  params,
}: {
  params: { id: string };
}) {
  const entry = await db.waitlistEntry.findUnique({
    where: { id: params.id },
  });

  if (!entry) notFound();

  const waitLabel =
    entry.estimatedWaitMinutes === 0
      ? "You're next!"
      : `~${entry.estimatedWaitMinutes} min`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-neutral-950 px-6 py-10">

      {/* Top */}
      <div className="w-full flex justify-between items-center">
        <div /> {/* spacer */}
        <p className="text-neutral-500 text-sm">The Table</p>
      </div>

      {/* Main confirmation card */}
      <div className="flex flex-col items-center text-center gap-6 w-full max-w-lg">

        {/* Success icon */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 border border-green-500/30">
          <svg className="h-10 w-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div>
          <p className="text-green-400 font-semibold text-lg mb-1">You&apos;re on the list!</p>
          <h2 className="text-3xl font-bold text-white">
            Welcome, {entry.name}
          </h2>
          <p className="text-neutral-500 mt-2">
            Party of {entry.partySize} · We&apos;ll seat you when your number is called
          </p>
        </div>

        {/* Queue number — massive */}
        <div className="w-full rounded-3xl border border-neutral-800 bg-neutral-900 py-12 px-8">
          <p className="text-neutral-500 uppercase tracking-widest text-sm mb-4">
            Your Queue Number
          </p>
          <p className="text-[8rem] font-black leading-none tracking-tight text-amber-400">
            {entry.queueNumber}
          </p>
        </div>

        {/* Wait time */}
        <div className="w-full rounded-2xl border border-neutral-800 bg-neutral-900/50 py-6 px-8 flex items-center justify-between">
          <span className="text-neutral-400 text-lg">Estimated Wait</span>
          <span className="text-3xl font-bold text-white">{waitLabel}</span>
        </div>

        <p className="text-neutral-600 text-sm px-4">
          Please stay nearby. Watch the screen for your number to be called.
        </p>
      </div>

      {/* Bottom */}
      <Link
        href="/"
        className="w-full max-w-lg rounded-2xl border border-neutral-700 py-5 text-center text-lg font-semibold text-neutral-300 hover:border-neutral-500 hover:text-white transition active:scale-95"
      >
        Back to Home
      </Link>
    </div>
  );
}
