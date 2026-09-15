import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { ReportsService } from "../reports/reports.service.js";
import { Prisma } from "@finora/database";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

export interface ExportFile {
  buffer: Buffer;
  filename: string;
  contentType: string;
}

function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

const TRANSACTION_COLUMNS = [
  "Date",
  "Type",
  "Category",
  "Account",
  "Amount",
  "Currency",
  "Payment Method",
  "Note",
] as const;

@Injectable()
export class ExportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reportsService: ReportsService,
  ) {}

  private async fetchTransactions(userId: string, from?: Date, to?: Date) {
    return this.prisma.transaction.findMany({
      where: { userId, ...(from || to ? { date: { gte: from, lte: to } } : {}) },
      include: { category: true, account: true, fromAccount: true, toAccount: true },
      orderBy: { date: "desc" },
    });
  }

  private rowFor(tx: Awaited<ReturnType<ExportService["fetchTransactions"]>>[number]) {
    const accountName =
      tx.type === "TRANSFER"
        ? `${tx.fromAccount?.name ?? "?"} -> ${tx.toAccount?.name ?? "?"}`
        : (tx.account?.name ?? "");
    return [
      tx.date.toISOString().slice(0, 10),
      tx.type,
      tx.category?.name ?? "",
      accountName,
      new Prisma.Decimal(tx.amount).toFixed(2),
      tx.currency,
      tx.paymentMethod ?? "",
      tx.note ?? "",
    ];
  }

  async exportTransactions(userId: string, format: "csv" | "excel" | "pdf", from?: Date, to?: Date): Promise<ExportFile> {
    const transactions = await this.fetchTransactions(userId, from, to);
    const rangeLabel = from && to ? `${from.toISOString().slice(0, 10)}_to_${to.toISOString().slice(0, 10)}` : "all";

    if (format === "csv") {
      const lines = [
        TRANSACTION_COLUMNS.join(","),
        ...transactions.map((tx) => this.rowFor(tx).map(csvEscape).join(",")),
      ];
      return {
        buffer: Buffer.from(lines.join("\n"), "utf-8"),
        filename: `finora-transactions-${rangeLabel}.csv`,
        contentType: "text/csv",
      };
    }

    if (format === "excel") {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Transactions");
      sheet.addRow([...TRANSACTION_COLUMNS]);
      sheet.getRow(1).font = { bold: true };
      for (const tx of transactions) sheet.addRow(this.rowFor(tx));
      sheet.columns.forEach((col) => {
        col.width = 18;
      });
      const buffer = await workbook.xlsx.writeBuffer();
      return {
        buffer: Buffer.from(buffer),
        filename: `finora-transactions-${rangeLabel}.xlsx`,
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      };
    }

    const buffer = await this.renderPdf((doc) => {
      doc.fontSize(18).text("Finora — Transaction Export", { align: "center" });
      doc.fontSize(10).fillColor("#666").text(`Range: ${rangeLabel.replace(/_/g, " ")}`, { align: "center" });
      doc.moveDown(1.5);

      doc.fontSize(9).fillColor("#000");
      const colWidths = [70, 55, 80, 100, 60, 70];
      let y = doc.y;
      const headers = ["Date", "Type", "Category", "Account", "Amount", "Payment"];
      headers.forEach((h, i) => doc.text(h, doc.x + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y, { width: colWidths[i], continued: false }));
      doc.moveDown(0.5);
      doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();

      for (const tx of transactions) {
        if (doc.y > doc.page.height - 80) doc.addPage();
        y = doc.y + 4;
        const accountName =
          tx.type === "TRANSFER"
            ? `${tx.fromAccount?.name ?? "?"} -> ${tx.toAccount?.name ?? "?"}`
            : (tx.account?.name ?? "");
        const row = [
          tx.date.toISOString().slice(0, 10),
          tx.type,
          tx.category?.name ?? "-",
          accountName,
          new Prisma.Decimal(tx.amount).toFixed(2),
          tx.paymentMethod ?? "-",
        ];
        row.forEach((cell, i) =>
          doc.text(cell, doc.page.margins.left + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y, {
            width: colWidths[i],
          }),
        );
        doc.moveDown(0.8);
      }
    });

    return { buffer, filename: `finora-transactions-${rangeLabel}.pdf`, contentType: "application/pdf" };
  }

  async exportMonthlyReport(userId: string, format: "csv" | "excel" | "pdf", year: number, month: number): Promise<ExportFile> {
    const report = await this.reportsService.getMonthlyReport(userId, year, month);
    const label = `${year}-${String(month).padStart(2, "0")}`;

    if (format === "csv") {
      const lines = [
        "Metric,Value",
        `Total Income,${report.totalIncome}`,
        `Total Expense,${report.totalExpense}`,
        `Total Saving,${report.totalSaving}`,
        `Savings Rate,${report.savingsRate}%`,
        `Average Daily Expense,${report.averageDailyExpense}`,
        "",
        "Category,Amount",
        ...report.categoryBreakdown.map((c) => `${csvEscape(c.categoryName)},${c.amount}`),
      ];
      return {
        buffer: Buffer.from(lines.join("\n"), "utf-8"),
        filename: `finora-monthly-report-${label}.csv`,
        contentType: "text/csv",
      };
    }

    if (format === "excel") {
      const workbook = new ExcelJS.Workbook();
      const summary = workbook.addWorksheet("Summary");
      summary.addRows([
        ["Total Income", report.totalIncome],
        ["Total Expense", report.totalExpense],
        ["Total Saving", report.totalSaving],
        ["Savings Rate", `${report.savingsRate}%`],
        ["Average Daily Expense", report.averageDailyExpense],
      ]);
      const categories = workbook.addWorksheet("Categories");
      categories.addRow(["Category", "Amount"]);
      categories.getRow(1).font = { bold: true };
      report.categoryBreakdown.forEach((c) => categories.addRow([c.categoryName, c.amount]));
      const buffer = await workbook.xlsx.writeBuffer();
      return {
        buffer: Buffer.from(buffer),
        filename: `finora-monthly-report-${label}.xlsx`,
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      };
    }

    const buffer = await this.renderPdf((doc) => {
      doc.fontSize(18).text(`Finora — Monthly Report`, { align: "center" });
      doc.fontSize(11).fillColor("#666").text(label, { align: "center" });
      doc.moveDown(1.5);
      doc.fontSize(11).fillColor("#000");
      doc.text(`Total Income: ৳${report.totalIncome}`);
      doc.text(`Total Expense: ৳${report.totalExpense}`);
      doc.text(`Total Saving: ৳${report.totalSaving}`);
      doc.text(`Savings Rate: ${report.savingsRate}%`);
      doc.text(`Average Daily Expense: ৳${report.averageDailyExpense}`);
      doc.moveDown();
      doc.fontSize(13).text("Category Breakdown");
      doc.moveDown(0.5);
      doc.fontSize(10);
      for (const c of report.categoryBreakdown) {
        doc.text(`${c.categoryName}: ৳${c.amount}`);
      }
    });

    return { buffer, filename: `finora-monthly-report-${label}.pdf`, contentType: "application/pdf" };
  }

  private renderPdf(draw: (doc: PDFKit.PDFDocument) => void): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
      draw(doc);
      doc.end();
    });
  }
}
