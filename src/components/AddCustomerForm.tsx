"use client";

import { useRef, useState, useTransition } from "react";
import { addCustomer, AddCustomerResult } from "@/actions/waitlist";
import { ConfirmationCard } from "./ConfirmationCard";

export function AddCustomerForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [result, setResult] = useState<AddCustomerResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await addCustomer(formData);
      setResult(res);
      if (res.success) {
        formRef.current?.reset();
      }
    });
  }

  return (
    <div className="space-y-4">
      <form ref={formRef} onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          {/* Name field */}
          <div className="flex-1">
            <label
              htmlFor="name"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={100}
              placeholder="e.g. Johnson Family"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60"
              disabled={isPending}
            />
          </div>

          {/* Party size field */}
          <div className="w-full sm:w-36">
            <label
              htmlFor="partySize"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Party Size <span className="text-red-500">*</span>
            </label>
            <input
              id="partySize"
              name="partySize"
              type="number"
              required
              min={1}
              max={99}
              defaultValue=""
              placeholder="e.g. 4"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60"
              disabled={isPending}
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isPending ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Adding…
              </>
            ) : (
              <>
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                Add to Waitlist
              </>
            )}
          </button>
        </div>
      </form>

      {/* Confirmation / error feedback */}
      {result && (
        <ConfirmationCard result={result} onDismiss={() => setResult(null)} />
      )}
    </div>
  );
}
