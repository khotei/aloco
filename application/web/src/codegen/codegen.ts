import { join } from "node:path"

import { generate as gengql } from "@graphql-codegen/cli"
import { generator as genrouter } from "@tanstack/router-generator"

Promise.all([
  gengql(
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
  genrouter({
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
