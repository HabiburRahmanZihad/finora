import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Response } from "express";
import { ReceiptsService } from "./receipts.service.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import type { AuthenticatedUser } from "../auth/jwt-verifier.service.js";

@Controller("receipts")
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser, @Query("transactionId") transactionId?: string) {
    return this.receiptsService.findAll(user.id, transactionId);
  }

  @Post()
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: 5 * 1024 * 1024 } }))
  upload(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
    @Query("transactionId") transactionId?: string,
  ) {
    if (!file) throw new BadRequestException("No file uploaded");
    return this.receiptsService.upload(user.id, transactionId, file);
  }

  @Get("file/:storedName")
  async getFile(
    @CurrentUser() user: AuthenticatedUser,
    @Param("storedName") storedName: string,
    @Res() res: Response,
  ) {
    const { filePath, mimeType } = await this.receiptsService.getFilePath(user.id, storedName);
    res.setHeader("Content-Type", mimeType);
    res.sendFile(filePath);
  }

  @Delete(":id")
  remove(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.receiptsService.remove(user.id, id);
  }
}
