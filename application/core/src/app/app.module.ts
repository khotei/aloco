import { join } from "node:path"

import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo"
import { Module, ValidationPipe } from "@nestjs/common"
import { APP_PIPE } from "@nestjs/core"
import { GraphQLModule } from "@nestjs/graphql"
import { TypeOrmModule } from "@nestjs/typeorm"

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
    }),
    PassportModule,
    MapModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    },
  ],
})
export class AppModule {}
