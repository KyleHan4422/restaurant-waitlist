"use client";

import { useState, useTransition } from "react";
import type { WaitlistEntry } from "@prisma/client";
import { $Enums } from "@prisma/client";
import { updateStatus } from "@/actions/waitlist";
import { StatusBadge } from "./StatusBadge";

const WaitlistStatus = $Enums.WaitlistStatus;
type WaitlistStatus = $Enums.WaitlistStatus;

interface Props {
  entries: WaitlistEntry[];
  title: string;
  showActions?: boolean;
}

function formatTime(date: Date): string {
  const d = new Date(date);
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

function WaitlistRow({
  entry,
  livePosition,
  showActions,
}: {
  entry: WaitlistEntry;
  livePosition?: number;
  showActions: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleStatusUpdate(status: "SEATED" | "CANCELED") {
    setError(null);
    startTransition(async () => {
      const res = await updateStatus(entry.id, status);
      if (!res.success) {
        setError(res.error);
      }
    });
  }

  return (
    <tr className={`border-t border-slate-100 transition-colors ${isPending ? "opacity-50" : "hover:bg-slate-50"}`}>
      {/* Queue position (live for WAITING, snapshot otherwise) */}
      <td className="py-3 pl-4 pr-3 text-sm font-medium text-slate-500 sm:pl-6">
        {livePosition !== undefined ? (
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
            {livePosition}
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </td>

      <td className="py-3 px-3 text-sm font-semibold text-slate-900">
        {entry.name}
        {error && (
          <span className="ml-2 text-xs font-normal text-red-600">{error}</span>
        )}
      </td>

      <td className="py-3 px-3 text-sm text-slate-700 tabular-nums">
        {entry.partySize}
      </td>

      <td className="py-3 px-3">
        <StatusBadge status={entry.status} />
      </td>

      <td className="py-3 px-3 text-sm text-slate-500 tabular-nums">
        {formatTime(entry.createdAt)}
      </td>

      <td className="py-3 px-3 text-sm text-slate-700 tabular-nums">
        {entry.estimatedWaitMinutes === 0
          ? <span className="text-green-600 font-medium">Next</span>
          : `~${entry.estimatedWaitMinutes} min`}
      </td>

      {showActions && (
        <td className="py-3 pl-3 pr-4 sm:pr-6">
          {entry.status === WaitlistStatus.WAITING ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleStatusUpdate(WaitlistStatus.SEATED)}
                disabled={isPending}
                className="rounded-md bg-green-600 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
              >
                Seat
              </button>
              <button
                onClick={() => handleStatusUpdate(WaitlistStatus.CANCELED)}
                disabled={isPending}
                className="rounded-md bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-300 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          ) : (
            <span className="text-xs text-slate-400">—</span>
          )}
        </td>
      )}
    </tr>
  );
}

export function WaitlistTable({ entries, title, showActions = false }: Props) {
  // Compute live queue positions for WAITING entries only
  const waitingEntries = entries.filter((e) => e.status === WaitlistStatus.WAITING);
  const positionMap = new Map<string, number>(
    waitingEntries.map((e, i) => [e.id, i + 1])
  );

  if (entries.length === 0) {
    return (
      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">{title}</h2>
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
          <p className="text-sm text-slate-500">No entries yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
          {entries.length} {entries.length === 1 ? "party" : "parties"}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="py-3 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:pl-6">
                  #
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Name
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Party
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Added
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Est. Wait
                </th>
                {showActions && (
                  <th className="pl-3 pr-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:pr-6">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {entries.map((entry) => (
                <WaitlistRow
                  key={entry.id}
                  entry={entry}
                  livePosition={positionMap.get(entry.id)}
                  showActions={showActions}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
