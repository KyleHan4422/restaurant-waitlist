import { WaitlistStatus } from "@prisma/client";

const config: Record<WaitlistStatus, { label: string; className: string }> = {
  WAITING: {
    label: "Waiting",
    className: "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
  },
  SEATED: {
    label: "Seated",
    className: "bg-green-100 text-green-800 ring-1 ring-green-200",
  },
  CALLED: {
    label: "Called",
    className: "bg-blue-100 text-blue-800 ring-1 ring-blue-200",
  },
  CANCELED: {
    label: "Canceled",
    className: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
  },
};

export function StatusBadge({ status }: { status: WaitlistStatus }) {
  const { label, className } = config[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}
