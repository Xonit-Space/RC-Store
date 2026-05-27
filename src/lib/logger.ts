export type LogLevel = "info" | "warn" | "error" | "debug"

interface LogPayload {
  message: string
  traceId?: string
  context?: Record<string, any>
  error?: any
  [key: string]: any
}

class StructuredLogger {
  private isDev = process.env.NODE_ENV === "development"

  private log(level: LogLevel, payload: string | LogPayload) {
    const timestamp = new Date().toISOString()
    const logData: Record<string, any> = {
      timestamp,
      level: level.toUpperCase(),
      env: process.env.NODE_ENV || "production",
    }

    if (typeof payload === "string") {
      logData.message = payload
    } else {
      const { message, traceId, context, error, ...rest } = payload
      logData.message = message
      if (traceId) logData.traceId = traceId
      if (context) logData.context = context
      if (rest && Object.keys(rest).length > 0) {
        logData.metadata = rest
      }

      if (error) {
        logData.error = {
          name: error.name,
          message: error.message,
          stack: this.isDev ? error.stack : undefined,
        }
      }
    }

    const output = JSON.stringify(logData)

    if (level === "error") {
      console.error(output)
    } else if (level === "warn") {
      console.warn(output)
    } else {
      console.log(output)
    }
  }

  info(payload: string | LogPayload) {
    this.log("info", payload)
  }

  warn(payload: string | LogPayload) {
    this.log("warn", payload)
  }

  error(payload: string | LogPayload) {
    this.log("error", payload)
  }

  debug(payload: string | LogPayload) {
    if (this.isDev || process.env.DEBUG === "true") {
      this.log("debug", payload)
    }
  }
}

export const logger = new StructuredLogger()
