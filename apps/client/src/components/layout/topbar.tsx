import Link from "next/link";
import Image from "next/image";
import { MobileNav } from "./mobile-nav";
import { UserMenu } from "./user-menu";
import { NotificationBell } from "./notification-bell";

export function Topbar({
  name,
  email,
  role,
}: {
  name: string;
  email: string;
  role?: string;
}) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      <div className="flex items-center gap-2">
        <MobileNav role={role} />
        <Link href="/dashboard" className="flex items-center gap-1.5 md:hidden">
          <Image src="/finora.png" alt="Finora" width={24} height={24} />
          <Image src="/text.png" alt="Finora" width={80} height={26} className="h-5 w-auto" />
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <NotificationBell />
        <UserMenu name={name} email={email} />
      </div>
    </header>
  );
}
