import * as process from "node:process"

import { NestFactory } from "@nestjs/core"

import { AppModule } from "@/app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors({ origin: "*" })
  await app.listen(process.env.NODE_PORT ?? 4000)
}
bootstrap()
