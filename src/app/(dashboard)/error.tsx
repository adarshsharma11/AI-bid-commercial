"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <h1 className="text-xl font-semibold">This page hit an error</h1>
      <p className="text-muted mt-2 text-sm">The demo could not render this view.</p>
      <button
        type="button"
        className="bg-accent mt-4 h-9 rounded-md px-3 text-sm text-white"
        onClick={reset}
      >
        Try again
      </button>
    </div>
  );
}
