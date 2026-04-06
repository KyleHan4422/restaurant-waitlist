"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { joinWaitlist } from "@/actions/waitlist";

const PARTY_SIZES = [1, 2, 3, 4, 5, 6, 7, 8];

export default function JoinPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedSize, setSelectedSize] = useState<number | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!selectedSize) {
      setError("Please select your party size.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("partySize", String(selectedSize));

    startTransition(async () => {
      try {
        await joinWaitlist(formData);
        // redirect happens inside the action; if we get here there was no redirect
      } catch (err: unknown) {
        // Next.js redirect throws internally — let it propagate
        if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
        const msg = err instanceof Error ? err.message : "Something went wrong.";
        setError(msg);
      }
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 px-6 py-10">

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

      {/* Title */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white">Join the Waitlist</h1>
        <p className="mt-2 text-neutral-500 text-lg">
          We'll add your party to the queue right away.
        </p>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-8 flex-1">

        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-neutral-400 uppercase tracking-widest mb-3">
            Your Name
          </label>
          <input
            name="name"
            type="text"
            required
            maxLength={100}
            placeholder="e.g. Johnson"
            disabled={isPending}
            className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-5 py-4 text-xl text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition disabled:opacity-50"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold text-neutral-400 uppercase tracking-widest mb-3">
            Phone Number
          </label>
          <input
            name="phone"
            type="tel"
            required
            placeholder="e.g. 555-123-4567"
            disabled={isPending}
            className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-5 py-4 text-xl text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition disabled:opacity-50"
          />
        </div>

        {/* Party size grid */}
        <div>
          <label className="block text-sm font-semibold text-neutral-400 uppercase tracking-widest mb-3">
            Party Size
          </label>
          <div className="grid grid-cols-4 gap-3">
            {PARTY_SIZES.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setSelectedSize(n)}
                disabled={isPending}
                className={`rounded-xl py-5 text-2xl font-bold transition active:scale-95 disabled:opacity-50 ${
                  selectedSize === n
                    ? "bg-amber-400 text-neutral-950 shadow-lg shadow-amber-400/20"
                    : "bg-neutral-900 border border-neutral-700 text-white hover:border-amber-400"
                }`}
              >
                {n}
              </button>
            ))}
            {/* Large party option */}
            <button
              type="button"
              onClick={() => setSelectedSize(9)}
              disabled={isPending}
              className={`col-span-4 rounded-xl py-4 text-xl font-bold transition active:scale-95 disabled:opacity-50 ${
                selectedSize === 9
                  ? "bg-amber-400 text-neutral-950 shadow-lg shadow-amber-400/20"
                  : "bg-neutral-900 border border-neutral-700 text-white hover:border-amber-400"
              }`}
            >
              9+ guests
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-900/40 border border-red-700 px-5 py-4 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="mt-auto pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-2xl bg-amber-400 py-6 text-2xl font-bold text-neutral-950 active:scale-95 transition-transform disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-amber-400/10"
          >
            {isPending ? "Adding you to the queue…" : "Confirm & Join Waitlist"}
          </button>
        </div>
      </form>
    </div>
  );
}
