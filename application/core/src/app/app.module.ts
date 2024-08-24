import { join } from "node:path"

import {
  ApolloDriver,
  type ApolloDriverConfig,
  ValidationError,
} from "@nestjs/apollo"
import { Module, ValidationPipe } from "@nestjs/common"
import { APP_PIPE } from "@nestjs/core"
import { GraphQLModule } from "@nestjs/graphql"
import { TypeOrmModule } from "@nestjs/typeorm"

import { InvitationsModule } from "@/invitations/invitations.module"
import { MapModule } from "@/map/map.module"
import { PassportModule } from "@/passport/passport.module"

@Module({
  imports: [
    TypeOrmModule.forRoot({
      autoLoadEntities: true,
      database: "test",
      host: "localhost",
      password: "test",
      port: 5432,
      synchronize: true,
      type: "postgres",
      username: "test",
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: join(process.cwd(), "src/__generated__/schema.graphql"),
      driver: ApolloDriver,
      formatError(error) {
        if (error.extensions?.code === "GRAPHQL_VALIDATION_FAILED") {
          return {
            ...error,
            validationErrors: error.extensions?.errors,
          }
        }
        return error
      },
      subscriptions: {
        "graphql-ws": true,
      },
    }),
    PassportModule,
    MapModule,
    InvitationsModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        exceptionFactory(errors) {
          return new ValidationError("Invalid data", {
            extensions: {
              errors: Object.fromEntries(
                errors.map((error) => [
                  error.property,
                  Object.values(error.constraints),
                ])
              ),
            },
          })
        },
        forbidUnknownValues: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
        whitelist: true,
      }),
    },
  ],
})
export class AppModule {}
