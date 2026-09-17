import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import { Compass } from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const session = await auth.api.getSession({ headers: await headers() });
  const homeHref = session ? "/dashboard" : "/";

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

      <div className="flex size-16 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
        <Compass className="size-8" />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">404</h1>
        <p className="text-lg font-medium text-foreground">This page doesn&apos;t exist</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          The page you&apos;re looking for may have been moved, renamed, or never existed.
        </p>
      </div>

      <Button asChild>
        <Link href={homeHref}>{session ? "Back to dashboard" : "Back home"}</Link>
      </Button>
    </div>
  );
}
