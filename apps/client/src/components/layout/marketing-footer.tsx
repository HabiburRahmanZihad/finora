import Link from "next/link";
import Image from "next/image";

const productLinks = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Dashboard", href: "/login" },
];

const companyLinks = [
  { label: "About Finora", href: "/about" },
  { label: "Create an account", href: "/register" },
  { label: "Log in", href: "/login" },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[2fr_1fr_1fr] md:px-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Image src="/finora white.png" alt="Finora" width={32} height={32} />
            <span className="text-lg font-semibold">Finora</span>
          </div>
          <p className="max-w-sm text-sm text-primary-foreground/70">
            A personal finance tracker that turns your income and expenses into clear, rule-based
            insights — so you always know where your money goes.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-foreground/60">
            Product
          </h3>
          {productLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-primary-foreground/80 hover:text-primary-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-foreground/60">
            Company
          </h3>
          {companyLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-primary-foreground/80 hover:text-primary-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-6 md:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 text-xs text-primary-foreground/60 md:flex-row">
          <p>© {new Date().getFullYear()} Finora. All rights reserved.</p>
          <p>Spend Smarter. Save More.</p>
        </div>
      </div>
    </footer>
  );
}
