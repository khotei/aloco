import { join } from "path"

import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo"
import { Module } from "@nestjs/common"
import { GraphQLModule } from "@nestjs/graphql"

import { AppController } from "@/app/app.controller"
import { AppService } from "@/app/app.service"
import { PassportModule } from "@/passport/passport.module"

@Module({
  controllers: [AppController],
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: join(process.cwd(), "src/schema.graphql"),
      driver: ApolloDriver,
    }),
    PassportModule,
  ],
  providers: [AppService],
})
export class AppModule {}
