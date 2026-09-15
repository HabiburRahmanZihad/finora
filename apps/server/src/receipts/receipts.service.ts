import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import * as fs from "node:fs/promises";
import * as path from "node:path";

const UPLOAD_DIR = path.resolve(process.cwd(), "uploads", "receipts");
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

@Injectable()
export class ReceiptsService {
  constructor(private readonly prisma: PrismaService) {}

  async upload(userId: string, transactionId: string | undefined, file: Express.Multer.File) {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException("Only JPEG, PNG, WebP or PDF receipts are allowed");
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException("Receipt file must be 5MB or smaller");
    }

    if (transactionId) {
      const tx = await this.prisma.transaction.findUnique({ where: { id: transactionId } });
      if (!tx || tx.userId !== userId) {
        throw new NotFoundException("Transaction not found");
      }
    }

    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const safeExt = path.extname(file.originalname).slice(0, 10);
    const storedName = `${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${safeExt}`;
    await fs.writeFile(path.join(UPLOAD_DIR, storedName), file.buffer);

    return this.prisma.receipt.create({
      data: {
        userId,
        transactionId,
        fileName: file.originalname,
        fileUrl: `/receipts/file/${storedName}`,
        mimeType: file.mimetype,
        fileSize: file.size,
      },
    });
  }

  findAll(userId: string, transactionId?: string) {
    return this.prisma.receipt.findMany({
      where: { userId, ...(transactionId ? { transactionId } : {}) },
      orderBy: { createdAt: "desc" },
    });
  }

  async getFilePath(userId: string, storedName: string) {
    const receipt = await this.prisma.receipt.findFirst({
      where: { userId, fileUrl: `/receipts/file/${storedName}` },
    });
    if (!receipt) throw new NotFoundException("Receipt not found");
    return { filePath: path.join(UPLOAD_DIR, storedName), mimeType: receipt.mimeType };
  }

  async remove(userId: string, id: string) {
    const receipt = await this.prisma.receipt.findUnique({ where: { id } });
    if (!receipt || receipt.userId !== userId) {
      throw new NotFoundException("Receipt not found");
    }
    const storedName = receipt.fileUrl.split("/").pop();
    if (storedName) {
      await fs.unlink(path.join(UPLOAD_DIR, storedName)).catch(() => undefined);
    }
    await this.prisma.receipt.delete({ where: { id } });
    return { success: true };
  }
}
