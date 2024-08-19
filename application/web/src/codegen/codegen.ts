import {join} from "node:path"
import { generate } from "@graphql-codegen/cli"

generate(
  {
    schema: join(__dirname, '../../../core/src/__generated__/schema.graphql'),
    documents: join(__dirname, './documents/**/*.graphql'),
    generates: {
        [`${join(__dirname, './__generated__')}/`]: {
          preset: 'client',
        config: {
          apolloReactHooksImportFrom: '@apollo/client'
        }
        },

    },
  },
  true
)
