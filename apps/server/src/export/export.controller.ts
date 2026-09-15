import { Controller, Get, Query, Res } from "@nestjs/common";
import type { Response } from "express";
import { ExportService } from "./export.service.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import type { AuthenticatedUser } from "../auth/jwt-verifier.service.js";
import { ExportTransactionsQueryDto } from "./dto/export-transactions-query.dto.js";
import { ExportReportQueryDto } from "./dto/export-report-query.dto.js";

@Controller("export")
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get("transactions")
  async exportTransactions(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ExportTransactionsQueryDto,
    @Res() res: Response,
  ) {
    const file = await this.exportService.exportTransactions(
      user.id,
      query.format,
      query.from,
      query.to,
    );
    this.send(res, file);
  }

  @Get("monthly-report")
  async exportMonthlyReport(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ExportReportQueryDto,
    @Res() res: Response,
  ) {
    const now = new Date();
    const file = await this.exportService.exportMonthlyReport(
      user.id,
      query.format,
      query.year ?? now.getFullYear(),
      query.month ?? now.getMonth() + 1,
    );
    this.send(res, file);
  }

  private send(res: Response, file: { buffer: Buffer; filename: string; contentType: string }) {
    res.setHeader("Content-Type", file.contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${file.filename}"`);
    res.send(file.buffer);
  }
}
