import { join } from "node:path"
import * as process from "node:process"

import {
  ApolloDriver,
  type ApolloDriverConfig,
  ValidationError,
} from "@nestjs/apollo"
import { BullModule } from "@nestjs/bull"
import { Module, ValidationPipe } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { APP_PIPE } from "@nestjs/core"
import { GraphQLModule } from "@nestjs/graphql"
import { JwtModule } from "@nestjs/jwt"
import { PassportModule as NestPassportModule } from "@nestjs/passport"
import { TypeOrmModule } from "@nestjs/typeorm"
import { PubSub } from "graphql-subscriptions"

import { JwtStrategy } from "@/api/authentication/strategies/jwt.strategy"
import {
  INVITATION_TIMEOUT_JOB_TIMEOUT,
  INVITATION_TIMEOUT_QUEUE_KEY,
  INVITATION_TIMEOUT_QUEUE_TIME_KEY,
} from "@/api/interceptors/invitation-sent-interceptor"
import { AuthenticationResolver } from "@/api/resolvers/authentication.resolver"
import { InvitationsResolver } from "@/api/resolvers/invitations.resolver"
import { MapResolver } from "@/api/resolvers/map.resolver"
import {
  type ServicesConfig,
  servicesConfigs,
  type SystemConfigs,
  systemConfigs,
} from "@/common/configs/environments"
import { Invitation } from "@/domain/entities/invitation.entity"
import { Room } from "@/domain/entities/room.entity"
import { UserLocation } from "@/domain/entities/user-location.entity"
import { User } from "@/domain/entities/user.entity"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [systemConfigs, servicesConfigs],
    }),
    TypeOrmModule.forRootAsync({
      inject: [systemConfigs.KEY, servicesConfigs.KEY],
      useFactory: (
        systemConfigs: SystemConfigs,
        servicesConfig: ServicesConfig
      ) => ({
        autoLoadEntities: true,
        manualInitialization: systemConfigs.codeGen,
        ssl: servicesConfig.pgCert
          ? {
              ca: servicesConfig.pgCert,
              rejectUnauthorized: true,
            }
          : undefined,
        synchronize: true,
        type: "postgres",
        url: servicesConfig.pgUrl,
      }),
    }),
    TypeOrmModule.forFeature([User, UserLocation, Invitation, Room]),
    BullModule.forRootAsync({
      inject: [systemConfigs.KEY, servicesConfigs.KEY],
      useFactory: (
        systemConfigs: SystemConfigs,
        servicesConfig: ServicesConfig
      ) => ({
        redis: systemConfigs.codeGen
          ? {}
          : {
              host: servicesConfig.redisUrl,
            },
      }),
    }),
    BullModule.registerQueue({
      name: INVITATION_TIMEOUT_QUEUE_KEY,
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
    NestPassportModule.register({ property: "auth" }),
    JwtModule.register({
      secret: "secret",
    }),
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
    {
      provide: PubSub,
      useValue: new PubSub(),
    },
    AuthenticationResolver,
    JwtStrategy,
    MapResolver,
    InvitationsResolver,
    {
      inject: [systemConfigs.KEY],
      provide: INVITATION_TIMEOUT_QUEUE_TIME_KEY,
      useFactory: (systemConfigs: SystemConfigs) =>
        isNaN(systemConfigs.invitationTimeout)
          ? INVITATION_TIMEOUT_JOB_TIMEOUT
          : systemConfigs.invitationTimeout,
    },
  ],
})
export class AppModule {}
