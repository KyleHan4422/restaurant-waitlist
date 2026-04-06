import { PrismaClient, WaitlistStatus } from "@prisma/client";
import { getServiceTimeByPartySize } from "../src/lib/waitlist-utils";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");
  await prisma.waitlistEntry.deleteMany();

  const entries = [
    { name: "Garcia Maria", phone: "555-001-0001", partySize: 2, status: WaitlistStatus.CALLED },
    { name: "Johnson Family", phone: "555-001-0002", partySize: 4, status: WaitlistStatus.WAITING },
    { name: "Chen Wei", phone: "555-001-0003", partySize: 6, status: WaitlistStatus.WAITING },
    { name: "Williams Tom", phone: "555-001-0004", partySize: 1, status: WaitlistStatus.WAITING },
    { name: "Santos Ana", phone: "555-001-0005", partySize: 3, status: WaitlistStatus.WAITING },
  ];

  let cumulativeWait = 0;
  let num = 1;

  for (const entry of entries) {
    const queueNumber = `A${num.toString().padStart(3, "0")}`;
    await prisma.waitlistEntry.create({
      data: {
        queueNumber,
        name: entry.name,
        phone: entry.phone,
        partySize: entry.partySize,
        status: entry.status,
        estimatedWaitMinutes: entry.status === WaitlistStatus.CALLED ? 0 : cumulativeWait,
      },
    });

    if (entry.status === WaitlistStatus.WAITING) {
      cumulativeWait += getServiceTimeByPartySize(entry.partySize);
    }
    num++;
  }

  console.log("Done.");
  const all = await prisma.waitlistEntry.findMany({ orderBy: { createdAt: "asc" } });
  all.forEach((e) =>
    console.log(`  [${e.status}] ${e.queueNumber} ${e.name} (${e.partySize}p) — ~${e.estimatedWaitMinutes}min`)
  );
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
