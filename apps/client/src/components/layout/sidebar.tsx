import Link from "next/link";
import { NavLinks } from "./nav-links";

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="flex h-16 items-center border-b border-border px-5">
        <Link href="/dashboard" className="text-xl font-semibold tracking-tight text-primary">
          Finora
        </Link>
      </div>
      <NavLinks />
    </aside>
  );
}
