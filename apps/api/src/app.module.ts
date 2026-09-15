import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { PrismaModule } from "./prisma/prisma.module.js";
import { AuthModule } from "./auth/auth.module.js";
import { UsersModule } from "./users/users.module.js";
import { HealthController } from "./health/health.controller.js";
import { CategoriesModule } from "./categories/categories.module.js";
import { FinancialAccountsModule } from "./financial-accounts/financial-accounts.module.js";
import { TagsModule } from "./tags/tags.module.js";
import { TransactionsModule } from "./transactions/transactions.module.js";
import { DashboardModule } from "./dashboard/dashboard.module.js";
import { BudgetsModule } from "./budgets/budgets.module.js";
import { SavingGoalsModule } from "./saving-goals/saving-goals.module.js";
import { ReportsModule } from "./reports/reports.module.js";
import { AnalyticsModule } from "./analytics/analytics.module.js";
import { InsightsModule } from "./insights/insights.module.js";
import { ForecastModule } from "./forecast/forecast.module.js";
import { HealthScoreModule } from "./health-score/health-score.module.js";
import { SubscriptionsModule } from "./subscriptions/subscriptions.module.js";
import { RecurringTransactionsModule } from "./recurring-transactions/recurring-transactions.module.js";
import { NotificationsModule } from "./notifications/notifications.module.js";
import { ExportModule } from "./export/export.module.js";
import { ReceiptsModule } from "./receipts/receipts.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: [".env"] }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 120 }],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    FinancialAccountsModule,
    TagsModule,
    TransactionsModule,
    DashboardModule,
    BudgetsModule,
    SavingGoalsModule,
    ReportsModule,
    AnalyticsModule,
    InsightsModule,
    ForecastModule,
    HealthScoreModule,
    SubscriptionsModule,
    RecurringTransactionsModule,
    NotificationsModule,
    ExportModule,
    ReceiptsModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
