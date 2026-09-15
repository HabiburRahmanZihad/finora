import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import helmet from "helmet";
import { ZodValidationPipe } from "nestjs-zod";
import { AppModule } from "./app.module.js";
import { HttpExceptionFilter } from "./common/http-exception.filter.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });

  app.use(helmet());
  app.enableCors({
    origin: process.env.WEB_APP_URL ?? "http://localhost:3000",
    credentials: true,
    // File downloads (export, receipts) need the browser to read the real
    // filename; Content-Disposition isn't in the default CORS-safelisted
    // response headers, so it must be explicitly exposed.
    exposedHeaders: ["Content-Disposition"],
  });

  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT ? Number(process.env.PORT) : 4000;
  await app.listen(port);
  console.log(`Finora API listening on http://localhost:${port}`);
}

bootstrap();
