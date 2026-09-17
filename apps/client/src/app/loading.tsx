import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface">
      <div className="relative flex size-16 items-center justify-center">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-secondary border-t-primary" />
        <Image src="/finora.png" alt="Finora" width={30} height={30} priority />
      </div>
      <p className="text-sm font-medium text-muted-foreground">Loading Finora…</p>
    </div>
  );
}
