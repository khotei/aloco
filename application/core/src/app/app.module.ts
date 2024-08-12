import { join } from "node:path"

import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo"
import { Module } from "@nestjs/common"
import { GraphQLModule } from "@nestjs/graphql"
import { TypeOrmModule } from "@nestjs/typeorm"

import { PassportModule } from "@/passport/passport.module"

@Module({
  imports: [
    TypeOrmModule.forRoot({
      autoLoadEntities: true,
      database: "data.sqlite",
      synchronize: true,
      type: "sqlite",
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: join(process.cwd(), "src/__generated__/schema.graphql"),
      driver: ApolloDriver,
    }),
    PassportModule,
  ],
})
export class AppModule {}
