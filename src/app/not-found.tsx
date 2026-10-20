import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="text-muted mt-2 text-sm">That route is not part of Northline.</p>
      <Link href="/today" className="text-accent mt-4 inline-block text-sm">
        Back to today
      </Link>
    </div>
  );
}
