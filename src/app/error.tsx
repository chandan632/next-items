"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="table-app">
      <h1>Something went wrong</h1>
      <p className="muted">An unexpected error occurred. Please try again.</p>
      <button type="button" className="btn" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
