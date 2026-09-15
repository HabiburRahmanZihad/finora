"use client";

import { Flame, CalendarOff, Trophy, Lock, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useGamification } from "@/features/gamification/use-gamification";

export default function ChallengesPage() {
  const { data, isLoading } = useGamification();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Challenges</h1>
        <p className="text-sm text-muted-foreground">Streaks and achievements from your habits.</p>
      </div>

      {isLoading || !data ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex size-11 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <Trophy className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Saving Streak</p>
                  <p className="text-xl font-semibold text-foreground">{data.savingStreakMonths} months</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex size-11 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <Flame className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">No-Spend Streak</p>
                  <p className="text-xl font-semibold text-foreground">{data.noSpendStreakDays} days</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex size-11 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <CalendarOff className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">No-Spend Days (this month)</p>
                  <p className="text-xl font-semibold text-foreground">{data.noSpendDaysThisMonth}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold text-foreground">Achievements</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.achievements.map((achievement) => (
                <Card key={achievement.id} className={achievement.achieved ? "" : "opacity-60"}>
                  <CardContent className="flex items-start gap-3 p-4">
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                        achievement.achieved ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {achievement.achieved ? <Check className="size-4" /> : <Lock className="size-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{achievement.title}</p>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
