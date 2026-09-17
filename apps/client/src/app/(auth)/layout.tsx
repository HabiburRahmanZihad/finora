import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-surface px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <Image src="/finora.png" alt="Finora" width={40} height={40} priority />
        <Image src="/text.png" alt="Finora" width={120} height={40} priority className="h-8 w-auto" />
      </Link>
      <div className="w-full max-w-sm">{children}</div>
      <p className="mt-8 text-xs text-muted-foreground">Spend Smarter. Save More.</p>
    </div>
  );
}
