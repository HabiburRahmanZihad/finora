import Link from "next/link";
import type { Metadata } from "next";
import {
  Eye,
  Sparkles,
  Lock,
  TrendingUp,
  Server,
  Smartphone,
  Database,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "About — Finora",
  description: "Why Finora exists, how it turns your data into insights, and where it's headed.",
};

const values = [
  {
    icon: Eye,
    title: "Transparency",
    description: "Every insight traces back to a rule you can see, never a black box you have to trust blindly.",
  },
  {
    icon: Sparkles,
    title: "Simplicity",
    description: "Tracking your money shouldn't feel like a second job. Finora keeps the essentials front and center.",
  },
  {
    icon: Lock,
    title: "Privacy",
    description: "Your financial data belongs to you. It's used to help you, not to be sold or mined.",
  },
  {
    icon: TrendingUp,
    title: "Progress over perfection",
    description: "Finora is built to nudge better habits over time, not to shame a single bad month.",
  },
];

const stack = [
  { icon: Server, label: "NestJS + PostgreSQL backend, one API for every client" },
  { icon: Smartphone, label: "Next.js web app and a React Native Android app" },
  { icon: Database, label: "Your history lives in a real relational database, not a spreadsheet" },
  { icon: ShieldCheck, label: "JWT-based auth with Google login and secure password hashing" },
];

const timeline = [
  {
    label: "Now",
    title: "Rule-based intelligence",
    description:
      "Every insight, budget warning, and health score today comes from SQL queries and analytics rules over your own data, no AI required.",
  },
  {
    label: "Next",
    title: "Deeper analytics",
    description:
      "More granular trend detection and forecasting, still explainable, still built on the data you already track.",
  },
  {
    label: "Future",
    title: "An optional AI layer",
    description:
      "Once the rule-based foundation is solid, an AI layer may be added on top, as an enhancement, never a replacement for transparency.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* 1. Hero */}
      <section className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-20 text-center md:px-6 md:py-28">
        <Badge>About Finora</Badge>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Money management shouldn&apos;t be a mystery
        </h1>
        <p className="max-w-xl text-base text-muted-foreground md:text-lg">
          Finora is a personal finance tracker built to answer one question honestly: where does
          your money actually go, and what can you do about it?
        </p>
      </section>

      {/* 2. Mission */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-16 md:grid-cols-2 md:px-6">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Our mission</h2>
            <p className="mt-3 text-muted-foreground">
              Most finance apps stop at logging numbers. Finora goes further, it looks at your
              income, expenses, and habits and tells you what they actually mean.
            </p>
          </div>
          <ul className="flex flex-col gap-3 text-sm text-foreground">
            <li>Where you&apos;re spending too much</li>
            <li>Which expenses are unnecessary</li>
            <li>Which budgets are being exceeded, and by how much</li>
            <li>How much you&apos;re really saving</li>
            <li>How to save more, based on your own patterns</li>
          </ul>
        </div>
      </section>

      {/* 3. What makes it different */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            What makes Finora different
          </h2>
          <p className="mt-3 text-muted-foreground">
            No AI guesswork. Just your data, clear rules, and recommendations you can verify.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-medium text-foreground">Explainable by design</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Every recommendation in Finora is generated from database queries and analytics
                rules over your own transactions, budgets, and goals. If Finora tells you
                something, it can show you why.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-medium text-foreground">Built for the long run</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Beyond tracking, Finora covers budgets, saving goals, loans, subscriptions, and
                reports, the full picture of your financial life in one connected system.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 4. Values */}
      <section className="bg-card">
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">What we value</h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div key={value.title} className="flex flex-col gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <value.icon className="size-5" />
                </div>
                <h3 className="font-medium text-foreground">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. How it's built */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">How it&apos;s built</h2>
            <p className="mt-3 text-muted-foreground">
              Finora runs on the same backend and database whether you sign in from the web or
              Android, so your financial picture never gets out of sync.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {stack.map((item) => (
              <div key={item.label} className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
                <item.icon className="size-5 shrink-0 text-primary" />
                <span className="text-sm text-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Roadmap */}
      <section className="bg-card">
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">Where we&apos;re headed</h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {timeline.map((item) => (
              <div key={item.label} className="flex flex-col gap-2">
                <Badge variant="outline" className="w-fit">
                  {item.label}
                </Badge>
                <h3 className="font-medium text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="flex flex-col items-center gap-5 p-10 text-center md:p-16">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              See your money clearly, starting today
            </h2>
            <p className="max-w-xl text-primary-foreground/80">
              Join Finora and let your own data show you how to spend smarter and save more.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">
                Create your free account <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
