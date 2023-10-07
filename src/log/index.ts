import { createLogger, format, transports, Logger } from "winston";

const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};

export const logger: Logger = createLogger({
  transports: [new transports.Console()],
  levels: logLevels,
  format: format.combine(
    format.colorize(),
    format.metadata(),
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),

    format.printf(({ timestamp, level, message, metadata }: any) => {
      const { service, ...meta } = metadata;
      return `[${timestamp}]${
        service ? ` [${service}]` : ""
      } ${level}: ${message}${
        Object.values(meta).length !== 0
          ? "\nDetails: " + JSON.stringify(meta, null, 2)
          : ""
      }`;
    }),
  ),
});
