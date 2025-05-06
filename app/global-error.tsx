"use client";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 to-rose-100 p-6">
      <div className="max-w-lg w-full bg-white/90 rounded-xl shadow-lg p-8 flex flex-col items-center border border-rose-200">
        <div className="text-6xl mb-4">😿</div>
        <h1 className="text-2xl font-bold text-rose-600 mb-2">
          Something went wrong
        </h1>
        <p className="text-foreground mb-4 text-center">
          Sorry, an unexpected error occurred. Please try again or go back home.
        </p>
        {error?.message && (
          <div className="w-full bg-rose-50 border border-rose-200 rounded-md p-4 mb-4">
            <div className="font-semibold text-rose-700 mb-1">Error:</div>
            <div className="text-rose-800 break-words whitespace-pre-wrap text-sm">
              {error.message}
            </div>
          </div>
        )}
        {error?.stack && (
          <details className="w-full bg-gray-50 border border-gray-200 rounded-md p-4 mb-4 text-xs text-foreground">
            <summary className="cursor-pointer font-semibold mb-1">
              Show error stack
            </summary>
            <pre className="whitespace-pre-wrap break-words">{error.stack}</pre>
          </details>
        )}
        <Link
          href="/"
          className="mt-4 px-6 py-2 bg-rose-500 hover:bg-rose-600 text-foreground rounded-lg font-semibold shadow transition-colors"
        >
          Go back home
        </Link>
        <button
          onClick={() => reset()}
          className="mt-2 text-xs text-foreground underline hover:text-rose-500"
          type="button"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
