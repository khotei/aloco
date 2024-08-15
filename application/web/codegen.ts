import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: '../core/src/__generated__/schema.graphql',
  documents: '**/*.graphql',
  generates: {
    './src/__generated__/graphql.tsx': {
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
    },
  },
};
export default config;