export type LogLevel = "debug" | "http" | "info" | "warn" | "error" | "silent";

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  http: 1,
  info: 2,
  warn: 3,
  error: 4,
  silent: 5,
};

// ANSI color codes for development terminal output
const colors = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bright: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  blue: "\x1b[34m",
  gray: "\x1b[90m",
};

/**
 * Dynamically checks if the environment is production
 */
const isProductionEnv = (): boolean => {
  return process.env.NODE_ENV === "production";
};

/**
 * Dynamically gets the active minimum log level from environment
 */
const getActiveLogLevel = (): LogLevel => {
  const envLevel = (process.env.LOG_LEVEL || "").toLowerCase() as LogLevel;
  if (envLevel && envLevel in LOG_LEVEL_PRIORITY) {
    return envLevel;
  }
  return isProductionEnv() ? "info" : "debug";
};

/**
 * Determines whether JSON logging format should be used (default in production)
 */
const shouldOutputJson = (): boolean => {
  if (process.env.LOG_FORMAT === "json") return true;
  if (process.env.LOG_FORMAT === "pretty") return false;
  return isProductionEnv();
};

/**
 * Formats development-friendly pretty colored log message
 */
const formatPretty = (level: LogLevel, message: string, meta?: any): string => {
  const timestamp = new Date().toISOString().replace("T", " ").replace("Z", "");
  const time = `${colors.gray}[${timestamp}]${colors.reset}`;

  let levelBadge = "";
  switch (level) {
    case "debug":
      levelBadge = `${colors.blue}${colors.bright}[DEBUG]${colors.reset}`;
      break;
    case "http":
      levelBadge = `${colors.magenta}${colors.bright}[HTTP]${colors.reset}`;
      break;
    case "info":
      levelBadge = `${colors.cyan}${colors.bright}[INFO]${colors.reset}`;
      break;
    case "warn":
      levelBadge = `${colors.yellow}${colors.bright}[WARN]${colors.reset}`;
      break;
    case "error":
      levelBadge = `${colors.red}${colors.bright}[ERROR]${colors.reset}`;
      break;
    default:
      levelBadge = `[${level.toUpperCase()}]`;
  }

  let formatted = `${time} ${levelBadge} ${message}`;

  if (meta !== undefined) {
    if (meta instanceof Error) {
      formatted += `\n${colors.red}${meta.stack || meta.message}${colors.reset}`;
    } else if (typeof meta === "object") {
      try {
        formatted += `\n${colors.dim}${JSON.stringify(meta, null, 2)}${colors.reset}`;
      } catch {
        formatted += ` [Unserializable Object]`;
      }
    } else {
      formatted += ` ${meta}`;
    }
  }

  return formatted;
};

/**
 * Formats production-standard structured JSON log entry for cloud log collectors
 * (AWS CloudWatch, Datadog, GCP Logging, Logstash/ELK, Docker, Kubernetes)
 */
const formatJson = (level: LogLevel, message: string, meta?: any): string => {
  const entry: Record<string, any> = {
    timestamp: new Date().toISOString(),
    level,
    message,
    environment: process.env.NODE_ENV || "development",
  };

  if (meta !== undefined) {
    if (meta instanceof Error) {
      entry.error = {
        name: meta.name,
        message: meta.message,
        stack: meta.stack,
      };
    } else if (typeof meta === "object" && meta !== null) {
      entry.meta = meta;
    } else {
      entry.meta = meta;
    }
  }

  return JSON.stringify(entry);
};

const shouldLog = (level: LogLevel): boolean => {
  const activeLevel = getActiveLogLevel();
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[activeLevel];
};

const outputLog = (level: LogLevel, message: string, meta?: any) => {
  if (!shouldLog(level)) return;

  const output = shouldOutputJson()
    ? formatJson(level, message, meta)
    : formatPretty(level, message, meta);

  if (level === "error") {
    console.error(output);
  } else if (level === "warn") {
    console.warn(output);
  } else {
    console.log(output);
  }
};

export const logger = {
  debug: (message: string, meta?: any) => outputLog("debug", message, meta),
  http: (message: string, meta?: any) => outputLog("http", message, meta),
  info: (message: string, meta?: any) => outputLog("info", message, meta),
  warn: (message: string, meta?: any) => outputLog("warn", message, meta),
  error: (message: string, meta?: any) => outputLog("error", message, meta),
};
