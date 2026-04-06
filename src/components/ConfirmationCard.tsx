"use client";

import { AddCustomerResult } from "@/actions/waitlist";

interface Props {
  result: AddCustomerResult;
  onDismiss: () => void;
}

export function ConfirmationCard({ result, onDismiss }: Props) {
  if (!result.success) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-red-500">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Error</p>
            <p className="mt-0.5 text-sm text-red-700">{result.error}</p>
          </div>
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-600 transition-colors"
            aria-label="Dismiss"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  const { entry } = result;
  const waitLabel =
    entry.estimatedWaitMinutes === 0
      ? "Next up — no wait"
      : `~${entry.estimatedWaitMinutes} min`;

  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-500 text-white">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-green-900">
              {entry.name} added to waitlist
            </p>
            <p className="text-sm text-green-700">Party of {entry.partySize}</p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-green-400 hover:text-green-600 transition-colors"
          aria-label="Dismiss"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>

      <div className="mt-4 flex gap-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-900">#{entry.queuePosition}</p>
          <p className="text-xs text-green-600 mt-0.5">Queue Position</p>
        </div>
        <div className="w-px bg-green-200" />
        <div className="text-center">
          <p className="text-2xl font-bold text-green-900">{waitLabel}</p>
          <p className="text-xs text-green-600 mt-0.5">Estimated Wait</p>
        </div>
      </div>
    </div>
  );
}
