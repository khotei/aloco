import { generate } from "@graphql-codegen/cli"
import { NestFactory } from "@nestjs/core"

import { AppModule } from "@/app.module"

async function bootstrap() {
  process.env.CODE_GEN = "true"
  const app = await NestFactory.create(AppModule)
  await app.init()
  await generate(
    {
      documents: "src/test/documents/**/*.graphql",
      generates: {
        "src/__generated__/scheme.generated.ts": {
          config: {
            rawRequest: false,
            skipTypename: true,
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
