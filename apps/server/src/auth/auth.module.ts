import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtVerifierService } from "./jwt-verifier.service.js";
import { JwtAuthGuard } from "./jwt-auth.guard.js";

@Module({
  providers: [
    JwtVerifierService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [JwtVerifierService],
})
export class AuthModule {}
