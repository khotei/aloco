import type { CodegenConfig } from "@graphql-codegen/cli"

const config: CodegenConfig = {
  generates: {
    "./src/graphql.generated.ts": {
      plugins: ["typescript", "typescript-operations"],
    },
  },
  schema: "src/schema.graphql",
}

export default config
