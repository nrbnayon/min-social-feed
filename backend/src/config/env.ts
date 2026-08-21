import "dotenv/config";

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

export const env = {
  port: Number(process.env.PORT ?? 5000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15m",
  jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  clientOrigin: process.env.CLIENT_ORIGIN ?? "*",
};