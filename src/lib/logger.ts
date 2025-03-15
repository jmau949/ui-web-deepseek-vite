type LogLevel = "info" | "warn" | "error" | "debug";

// interface LogEntry {
//   message: string;
//   level: LogLevel;
//   timestamp: string;
//   data?: any;
// }

class Logger {
  private isProd = import.meta.env.MODE === "production";

  info(message: string, data?: any) {
    this.log("info", message, data);
  }

  warn(message: string, data?: any) {
    this.log("warn", message, data);
  }

  error(message: string, data?: any) {
    this.log("error", message, data);
  }

  debug(message: string, data?: any) {
    this.log("debug", message, data);
  }

  private log(level: LogLevel, message: string, data?: any) {
    // const entry: LogEntry = {
    //   message,
    //   level,
    //   timestamp: new Date().toISOString(),
    //   data,
    // };

    if (this.isProd) {
      // In production, send logs to your logging service
      // e.g., this.sendToLogService(entry);

      // Only log errors to console in production
      if (level === "error") {
        console.error(message, data);
      }
    } else {
      // In development, log to console with color
      switch (level) {
        case "info":
          console.log(`ℹ️ ${message}`, data || "");
          break;
        case "warn":
          console.warn(`⚠️ ${message}`, data || "");
          break;
        case "error":
          console.error(`❌ ${message}`, data || "");
          break;
        case "debug":
          console.debug(`🔍 ${message}`, data || "");
          break;
      }
    }
  }

  // // Send logs to a centralized logging service in production
  // private sendToLogService(entry: LogEntry) {
  //   // Implementation depends on your logging service
  //   // e.g., fetch('/api/logs', {
  //   //   method: 'POST',
  //   //   body: JSON.stringify(entry)
  //   // });
  // }
}

export const logger = new Logger();
