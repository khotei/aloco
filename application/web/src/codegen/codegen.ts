import { join } from "node:path"

import { generate as genGql } from "@graphql-codegen/cli"
import { generator as genRouter } from "@tanstack/router-generator"

Promise.all([
  genGql(
    {
      documents: join(__dirname, "./documents/**/*.graphql"),
      generates: {
        [`${join(__dirname, "./__generated__")}/gql/`]: {
          config: {
            skipTypename: true,
          },
          preset: "client",
          presetConfig: {
            fragmentMasking: false,
          },
        },
      },
      schema: join(__dirname, "../../../core/src/__generated__/schema.graphql"),
    },
    true
  ),
  genRouter({
    addExtensions: false,
    disableLogging: false,
    disableManifestGeneration: false,
    disableTypes: false,
    experimental: {},
    generatedRouteTree: join(__dirname, "./__generated__/routes.ts"),
    quoteStyle: "double",
    routeFileIgnorePrefix: "-",
    routesDirectory: join(__dirname, "../routes"),
    routeTreeFileFooter: [],
    routeTreeFileHeader: [],
    semicolons: false,
  }),
])
