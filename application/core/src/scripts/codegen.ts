import { generate } from "@graphql-codegen/cli"
import { NestFactory } from "@nestjs/core"

import { AppModule } from "@/app/app.module"

async function bootstrap() {
  // @todo: disable typeorm
  const app = await NestFactory.create(AppModule)
  await app.init()

  await generate(
    {
      generates: {
        "src/__generated__/scheme.generated.ts": {
          plugins: ["typescript", "typescript-operations"],
        },
      },
      schema: "src/__generated__/schema.graphql",
    },
    true
  )
}

bootstrap()
