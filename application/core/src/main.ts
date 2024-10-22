import { NestFactory } from "@nestjs/core"

import { AppModule } from "@/app.module"
import {
  type SystemConfigs,
  systemConfigs,
} from "@/common/configs/environments"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors({ origin: "*" })
  const configs = app.get<SystemConfigs>(systemConfigs.KEY)
  await app.listen(configs.port)
}
bootstrap()
