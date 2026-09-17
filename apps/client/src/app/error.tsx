"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface px-4 py-12 text-center">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/finora.png" alt="Finora" width={40} height={40} priority />
        <Image
          src="/text.png"
          alt="Finora"
          width={120}
          height={40}
          priority
          className="h-8 w-auto"
        />
      </Link>

      <div className="flex size-16 items-center justify-center rounded-full bg-danger/10 text-danger">
        <ServerCrash className="size-8" />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground">Something went wrong</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          An unexpected error occurred on our end. You can try again, or head back home.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => reset()}>Try again</Button>
        <Button variant="outline" asChild>
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </div>
  );
}
