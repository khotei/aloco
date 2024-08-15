import { generate } from "@graphql-codegen/cli"
import { NestFactory } from "@nestjs/core"

import { AppModule } from "@/app/app.module"

async function bootstrap() {
  // @todo: avoid connecting typeorm to pg
  const app = await NestFactory.create(AppModule)
  await app.init()

  await generate(
    {
      documents: "**/*.document.graphql",
      generates: {
        "src/__generated__/scheme.generated.ts": {
          config: {
            rawRequest: false,
          },
          plugins: [
            "typescript",
            "typescript-operations",
            "typescript-graphql-request",
          ],
        },
      },
      schema: "src/__generated__/schema.graphql",
    },
    true
  )
  await app.close()
}
bootstrap()
