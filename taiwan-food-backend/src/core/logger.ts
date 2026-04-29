type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  requestId?: string;
  [key: string]: unknown;
}

const format = (entry: LogEntry): string => {
  // Production: JSON để log aggregation. Development: human-readable.
  if (process.env.NODE_ENV === "production") {
    return JSON.stringify(entry);
  }
  const { timestamp, level, message, requestId, ...rest } = entry;
  const prefix = requestId ? `[${requestId}]` : "";
  const extra = Object.keys(rest).length ? ` ${JSON.stringify(rest)}` : "";
  return `${timestamp} ${level.toUpperCase()} ${prefix} ${message}${extra}`;
};

const emit = (entry: LogEntry) => {
  const line = format(entry);
  if (entry.level === "error") {
    process.stderr.write(line + "\n");
  } else {
    process.stdout.write(line + "\n");
  }
};

const create =
  (level: LogLevel) =>
  (message: string, meta?: Record<string, unknown>) => {
    emit({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta,
    });
  };

export const logger = {
  debug: create("debug"),
  info: create("info"),
  warn: create("warn"),
  error: create("error"),
};
