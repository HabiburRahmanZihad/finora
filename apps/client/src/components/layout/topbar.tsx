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
        <span className="text-lg font-semibold text-primary md:hidden">Finora</span>
      </div>
      <div className="flex items-center gap-2">
        <NotificationBell />
        <UserMenu name={name} email={email} />
      </div>
    </header>
  );
}
