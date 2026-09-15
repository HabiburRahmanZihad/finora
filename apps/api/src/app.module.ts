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
