import winston from "winston";

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const isDevelopment = process.env.NODE_ENV !== "production";

const devFormat = printf(({ level, message, timestamp, stack, requestId, ...metadata }) => {
  let msg = `${timestamp} [${level}]`;
  
  if (requestId) {
    msg += ` [ReqID: ${requestId}]`;
  }
  
  msg += `: ${message}`;
  
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  
  if (stack) {
    msg += `\n${stack}`;
  }
  
  return msg;
});

const prodFormat = combine(
  errors({ stack: true }),
  timestamp(),
  json(),
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: isDevelopment
    ? combine(colorize(), timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), devFormat)
    : prodFormat,
  defaultMeta: { service: "tasks-api" },
  transports: [
    new winston.transports.Console(),
    ...(isDevelopment
      ? []
      : [
          new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
          }),
          new winston.transports.File({ filename: "logs/combined.log" }),
        ]),
  ],
});

export default logger;
