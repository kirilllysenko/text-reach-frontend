import { addTypenameSelectionDocumentTransform } from "@graphql-codegen/client-preset";
import type { CodegenConfig } from "@graphql-codegen/cli";

const schemaUrl = process.env.HIVE_ROUTER_URL ?? "http://localhost:4000/graphql";

const config: CodegenConfig = {
  schema: schemaUrl,
  documents: ["src/**/*.graphql"],
  generates: {
    "src/gql/": {
      preset: "client",
      presetConfig: {
        fragmentMasking: false,
      },
      documentTransforms: [addTypenameSelectionDocumentTransform],
      config: {
        defaultScalarType: "unknown",
        strictScalars: true,
        useTypeImports: true,
        scalars: {
          Date: "string",
          DateTime: "string",
          DateTimeTimezone: "string",
          JSON: "unknown",
          Long: "number",
          Ulid: "string",
        },
      },
    },
  },
  ignoreNoDocuments: false,
};

export default config;
