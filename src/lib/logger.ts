/**
 * Structured Logger Utility
 * 
 * Provides consistent, JSON-formatted logging for the application.
 * All logs include timestamp and structured metadata for easier debugging.
 */

interface LogMeta {
  [key: string]: any;
}

export const logger = {
  /**
   * Log informational messages
   * @param message - The log message
   * @param meta - Additional metadata to include in the log
   */
  info: (message: string, meta?: LogMeta) => {
    console.log(
      JSON.stringify({
        level: "info",
        message,
        meta,
        timestamp: new Date().toISOString(),
      })
    );
  },

  /**
   * Log error messages
   * @param message - The error message
   * @param meta - Additional error metadata (stack trace, context, etc.)
   */
  error: (message: string, meta?: LogMeta) => {
    console.error(
      JSON.stringify({
        level: "error",
        message,
        meta,
        timestamp: new Date().toISOString(),
      })
    );
  },

  /**
   * Log warning messages
   * @param message - The warning message
   * @param meta - Additional metadata
   */
  warn: (message: string, meta?: LogMeta) => {
    console.warn(
      JSON.stringify({
        level: "warn",
        message,
        meta,
        timestamp: new Date().toISOString(),
      })
    );
  },

  /**
   * Log debug messages (useful for development)
   * @param message - The debug message
   * @param meta - Additional debug metadata
   */
  debug: (message: string, meta?: LogMeta) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(
        JSON.stringify({
          level: "debug",
          message,
          meta,
          timestamp: new Date().toISOString(),
        })
      );
    }
  },
};
