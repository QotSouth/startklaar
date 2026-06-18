import Link from "next/link";

// Simple brand/logo header.
export function Brand({ href = "/dashboard" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple text-sm font-bold text-white">
        S
      </span>
      <span className="text-lg font-bold tracking-tight text-ink">
        Startklaar
      </span>
    </Link>
  );
}

// A full page header bar with the brand and optional right-side slot.
export function Header({
  brandHref = "/dashboard",
  right,
}: {
  brandHref?: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
        <Brand href={brandHref} />
        {right ? <div className="flex items-center gap-3">{right}</div> : null}
      </div>
    </header>
  );
}
