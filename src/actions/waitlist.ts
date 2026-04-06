"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  getActiveWaitlist,
  calculateEstimatedWait,
  generateQueueNumber,
} from "@/lib/waitlist-utils";
import { WaitlistStatus } from "@prisma/client";

/** Join the waitlist. Validates, writes to DB, redirects to confirmation. */
export async function joinWaitlist(formData: FormData) {
  const rawName = formData.get("name");
  const rawPhone = formData.get("phone");
  const rawPartySize = formData.get("partySize");

  // Validation
  if (!rawName || typeof rawName !== "string" || rawName.trim().length === 0) {
    throw new Error("Customer name is required.");
  }
  const name = rawName.trim();
  if (name.length > 100) throw new Error("Name must be 100 characters or fewer.");

  if (!rawPhone || typeof rawPhone !== "string" || rawPhone.trim().length === 0) {
    throw new Error("Phone number is required.");
  }
  const phone = rawPhone.trim();
  if (!/^\+?[\d\s\-().]{7,20}$/.test(phone)) {
    throw new Error("Please enter a valid phone number.");
  }

  const partySize = parseInt(rawPartySize as string, 10);
  if (isNaN(partySize) || partySize < 1) {
    throw new Error("Party size must be at least 1.");
  }
  if (partySize > 99) throw new Error("Party size cannot exceed 99.");

  // Calculate wait and generate queue number
  const currentWaiting = await getActiveWaitlist();
  const { estimatedWaitMinutes } = calculateEstimatedWait(currentWaiting);
  const queueNumber = await generateQueueNumber();

  const entry = await db.waitlistEntry.create({
    data: {
      queueNumber,
      name,
      phone,
      partySize,
      status: WaitlistStatus.WAITING,
      estimatedWaitMinutes,
    },
  });

  revalidatePath("/");
  revalidatePath("/waitlist");

  redirect(`/confirmation/${entry.id}`);
}

export type UpdateStatusResult =
  | { success: true }
  | { success: false; error: string };

/** Update a waitlist entry status. Used by staff admin (if needed). */
export async function updateStatus(
  id: string,
  status: "CALLED" | "SEATED" | "CANCELED"
): Promise<UpdateStatusResult> {
  if (!id) return { success: false, error: "Invalid ID." };

  const allowed = ["CALLED", "SEATED", "CANCELED"];
  if (!allowed.includes(status)) return { success: false, error: "Invalid status." };

  const existing = await db.waitlistEntry.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Entry not found." };
  if (existing.status !== WaitlistStatus.WAITING && status !== "SEATED") {
    return { success: false, error: `Entry is already ${existing.status.toLowerCase()}.` };
  }

  await db.waitlistEntry.update({ where: { id }, data: { status: status as WaitlistStatus } });

  revalidatePath("/");
  revalidatePath("/waitlist");

  return { success: true };
}
