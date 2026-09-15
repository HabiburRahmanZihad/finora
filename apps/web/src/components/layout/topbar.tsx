import { MobileNav } from "./mobile-nav";
import { UserMenu } from "./user-menu";

export function Topbar({ name, email }: { name: string; email: string }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      <div className="flex items-center gap-2">
        <MobileNav />
        <span className="text-lg font-semibold text-primary md:hidden">Finora</span>
      </div>
      <UserMenu name={name} email={email} />
    </header>
  );
}
