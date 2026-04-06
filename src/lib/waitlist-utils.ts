import { WaitlistEntry, WaitlistStatus } from "@prisma/client";
import { db } from "./db";

/** Estimated service time per party size (deterministic rule). */
export function getServiceTimeByPartySize(partySize: number): number {
  if (partySize <= 2) return 10;
  if (partySize <= 4) return 15;
  if (partySize <= 6) return 20;
  return 25;
}

/** All WAITING entries in queue order (createdAt asc). */
export async function getActiveWaitlist(): Promise<WaitlistEntry[]> {
  return db.waitlistEntry.findMany({
    where: { status: WaitlistStatus.WAITING },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Calculates estimated wait for the next customer to join.
 * Returns the sum of service times of all current WAITING entries.
 */
export function calculateEstimatedWait(waitingEntries: WaitlistEntry[]): {
  estimatedWaitMinutes: number;
} {
  const estimatedWaitMinutes = waitingEntries.reduce(
    (total, e) => total + getServiceTimeByPartySize(e.partySize),
    0
  );
  return { estimatedWaitMinutes };
}

/**
 * Generates the next sequential queue number (A001, A002, ...).
 * Finds the highest existing number and increments it.
 * Safe for MVP single-kiosk use; wrap in a transaction for concurrency.
 */
export async function generateQueueNumber(): Promise<string> {
  const last = await db.waitlistEntry.findFirst({
    orderBy: { createdAt: "desc" },
    select: { queueNumber: true },
  });

  if (!last) return "A001";

  const numeric = parseInt(last.queueNumber.replace(/^\D+/, ""), 10);
  const next = isNaN(numeric) ? 1 : numeric + 1;
  // Pad to 3 digits; past 999 just append raw number (graceful overflow)
  return `A${next.toString().padStart(3, "0")}`;
}
