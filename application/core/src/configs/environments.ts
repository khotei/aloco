import { type ConfigType, registerAs } from "@nestjs/config"

export type ServicesConfig = ConfigType<typeof servicesConfigs>
export const servicesConfigs = registerAs("services", () => ({
  getStreamApiKey: process.env.GET_STREAM_API_KEY,
  getStreamApiSecret: process.env.GET_STREAM_API_SECRET,
  pgCert: process.env.PG_CERT,
  pgUrl: process.env.PG_URL.replace("sslmode=require", ""),
  redisUrl: process.env.REDIS_URL,
}))

export type SystemConfigs = ConfigType<typeof systemConfigs>
export const systemConfigs = registerAs("system", () => ({
  codeGen: process.env.CODE_GEN === "true",
  env: process.env.NODE_ENV,
  invitationTimeout: parseInt(process.env.INVITATION_TIMEOUT),
  port: parseInt(process.env.NODE_PORT),
}))
