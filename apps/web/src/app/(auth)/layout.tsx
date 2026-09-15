import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-surface px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <span className="text-2xl font-semibold tracking-tight text-primary">Finora</span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
      <p className="mt-8 text-xs text-muted-foreground">Spend Smarter. Save More.</p>
    </div>
  );
}
