import Link from "next/link";

export default function NotFound() {
  return (
    <main className="table-app">
      <h1>Not found</h1>
      <p className="muted">That page does not exist.</p>
      <Link href="/">Back to items</Link>
    </main>
  );
}
