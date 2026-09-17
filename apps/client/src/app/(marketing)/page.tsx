import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import {
  ArrowLeftRight,
  PiggyBank,
  Target,
  HandCoins,
  BarChart3,
  Lightbulb,
  ArrowRight,
  Laptop,
  Smartphone,
  ShieldCheck,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const stats = [
  { label: "Free to use", value: "100%" },
  { label: "Platforms", value: "Web + Android" },
  { label: "AI black boxes", value: "0" },
  { label: "Your data, your rules", value: "Always" },
];

const features = [
  {
    icon: ArrowLeftRight,
    title: "Transactions",
    description: "Log every income and expense in seconds and keep a complete, searchable history.",
  },
  {
    icon: PiggyBank,
    title: "Budgets",
    description: "Set category budgets and get warned the moment you're close to going over.",
  },
  {
    icon: Target,
    title: "Saving Goals",
    description: "Turn a target amount into a plan, and watch your progress grow with every contribution.",
  },
  {
    icon: HandCoins,
    title: "Loans & Subscriptions",
    description: "Track loan repayment schedules and recurring subscriptions in one place.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description: "Visual breakdowns of spending by category, monthly trends, and exportable reports.",
  },
  {
    icon: Lightbulb,
    title: "Smart Insights",
    description: "A rule-based engine reads your data and tells you where to cut back, and why.",
  },
];

const steps = [
  {
    step: "01",
    title: "Track",
    description: "Add your income, expenses, and accounts as they happen.",
  },
  {
    step: "02",
    title: "Organize",
    description: "Categorize spending, set budgets, and schedule recurring bills.",
  },
  {
    step: "03",
    title: "Understand",
    description: "Finora analyzes your data and surfaces where your money is really going.",
  },
  {
    step: "04",
    title: "Improve",
    description: "Follow rule-based recommendations to cut waste and hit your goals faster.",
  },
];

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) {
    redirect("/dashboard");
  }

  return (
    <>
      {/* 1. Hero */}
      <section className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-20 text-center md:px-6 md:py-28">
        <Badge>Personal Finance, Simplified</Badge>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
          Spend Smarter. <span className="text-accent">Save More.</span>
        </h1>
        <p className="max-w-xl text-base text-muted-foreground md:text-lg">
          Finora tracks your income and expenses, then turns your own data into clear, rule-based
          insights, so you always know where your money goes and how to save more of it.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/register">
              Get started for free <ArrowRight />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#how-it-works">See how it works</Link>
          </Button>
        </div>
      </section>

      {/* 2. Stats strip */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-10 md:grid-cols-4 md:px-6">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center text-center">
              <span className="text-2xl font-semibold text-primary md:text-3xl">{stat.value}</span>
              <span className="mt-1 text-xs text-muted-foreground md:text-sm">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            Everything you need to manage your money
          </h2>
          <p className="mt-3 text-muted-foreground">
            One place for transactions, budgets, goals, loans, and the insights that tie them all
            together.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardContent className="flex flex-col gap-3 p-6">
                <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <feature.icon className="size-5" />
                </div>
                <h3 className="font-medium text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. How it works */}
      <section id="how-it-works" className="bg-card">
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">How Finora works</h2>
            <p className="mt-3 text-muted-foreground">
              From your first transaction to your next saving goal, four simple steps.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((item) => (
              <div key={item.step} className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-accent">{item.step}</span>
                <h3 className="font-medium text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Insights highlight */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 py-20 md:px-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Badge variant="outline">No AI black boxes</Badge>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            Insights you can actually trust
          </h2>
          <p className="text-muted-foreground">
            Finora&apos;s recommendations come from your own data, run through transparent SQL
            queries and rules, not an opaque model guessing on your behalf. You can always see the
            &quot;why&quot; behind every suggestion.
          </p>
          <ul className="flex flex-col gap-2 text-sm text-foreground">
            <li className="flex items-center gap-2">
              <ShieldCheck className="size-4 shrink-0 text-success" /> Overspending alerts by
              category
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="size-4 shrink-0 text-success" /> A financial health score you
              can improve
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="size-4 shrink-0 text-success" /> Clear, explainable saving
              recommendations
            </li>
          </ul>
        </div>
        <Card>
          <CardContent className="flex flex-col gap-5 p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Financial Health Score</span>
              <Badge variant="success">Good</Badge>
            </div>
            <Progress value={78} tone="NORMAL" />
            <div className="flex items-start gap-3 rounded-lg bg-secondary p-4">
              <Lightbulb className="size-4 shrink-0 text-secondary-foreground" />
              <p className="text-sm text-secondary-foreground">
                You spent 22% more on Dining Out this month. Trimming it back to your usual pace
                would add ~$60 to your savings.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 6. Multi-platform */}
      <section className="bg-card">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-20 text-center md:px-6">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            One account, every device
          </h2>
          <p className="max-w-xl text-muted-foreground">
            Start a transaction on the web, check your budget on your phone. Finora Web and Android
            share the same backend and the same data, always in sync.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground">
              <Laptop className="size-4" /> Web App
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground">
              <Smartphone className="size-4" /> Android App
            </div>
          </div>
        </div>
      </section>

      {/* 7. Final CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="flex flex-col items-center gap-5 p-10 text-center md:p-16">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Ready to take control of your finances?
            </h2>
            <p className="max-w-xl text-primary-foreground/80">
              Create your free Finora account and see exactly where your money goes this month.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">
                Get started for free <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
