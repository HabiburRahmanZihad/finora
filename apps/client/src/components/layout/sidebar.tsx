import Link from "next/link";
import Image from "next/image";
import { NavLinks } from "./nav-links";

export function Sidebar({ role }: { role?: string }) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/finora.png" alt="Finora" width={28} height={28} priority />
          <Image
            src="/text.png"
            alt="Finora"
            width={90}
            height={30}
            priority
            className="h-6 w-auto"
          />
        </Link>
      </div>
      <NavLinks role={role} />
    </aside>
  );
}
