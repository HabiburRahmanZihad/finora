import { Injectable, NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";
import { PrismaService } from "../prisma/prisma.service.js";
import type { AuthenticatedUser } from "../auth/jwt-verifier.service.js";

/**
 * Records every API request for the admin "web traffic" dashboard. Runs
 * before the auth guards, but reads `request.user` inside the `finish`
 * listener (fired after the full request lifecycle, guards included) so the
 * acting user still gets attributed. Never blocks or throws into the
 * response cycle — a logging failure must not affect the actual request.
 */
@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  use(req: Request & { user?: AuthenticatedUser }, res: Response, next: NextFunction) {
    const startedAt = Date.now();

    res.on("finish", () => {
      if (req.path === "/health") return;

      this.prisma.requestLog
        .create({
          data: {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            durationMs: Date.now() - startedAt,
            userId: req.user?.id,
          },
        })
        .catch(() => {
          // Best-effort logging only — never surface this to the request.
        });
    });

    next();
  }
}
