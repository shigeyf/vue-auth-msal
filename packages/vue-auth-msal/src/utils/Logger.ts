// packages/vue-auth-msal/src/utils/Logger.ts

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Enum LogLevel
 * @public
 */
export enum LogLevel {
  Error,
  Warn,
  Info,
  Debug,
  Trace,
}

/**
 * Class Logger
 * @public
 */
export class Logger {
  private static _instance: Logger

  public static Instance() {
    return this._instance || (this._instance = new this())
  }

  private _base: {
    log: (message?: any, ...optionalParams: any[]) => void
    trace: (message?: any, ...optionalParams: any[]) => void
    debug: (message?: any, ...optionalParams: any[]) => void
    info: (message?: any, ...optionalParams: any[]) => void
    warn: (message?: any, ...optionalParams: any[]) => void
    error: (message?: any, ...optionalParams: any[]) => void
  }
  private _logLevel: LogLevel

  private constructor() {
    this._base = {
      log: console.log,
      trace: console.trace,
      debug: console.debug,
      info: console.info,
      warn: console.warn,
      error: console.error,
    }
    this._logLevel = LogLevel.Error
  }

  public setLogLevel(logLevel: LogLevel) {
    this._logLevel = logLevel
  }

  public log(message?: any, ...optionalParams: any[]) {
    this._base.log(message, ...optionalParams)
  }

  public trace(message?: any, ...optionalParams: any[]) {
    if (this._logLevel >= LogLevel.Trace) {
      this._base.trace(message, ...optionalParams)
    }
  }

  public debug(message?: any, ...optionalParams: any[]) {
    if (this._logLevel >= LogLevel.Debug) {
      this._base.debug(message, ...optionalParams)
    }
  }

  public info(message?: any, ...optionalParams: any[]) {
    if (this._logLevel >= LogLevel.Info) {
      this._base.info(message, ...optionalParams)
    }
  }

  public warn(message?: any, ...optionalParams: any[]) {
    if (this._logLevel >= LogLevel.Warn) {
      this._base.warn(message, ...optionalParams)
    }
  }

  public error(message?: any, ...optionalParams: any[]) {
    if (this._logLevel >= LogLevel.Error) {
      this._base.error(message, ...optionalParams)
    }
  }
}

/**
 * Constant loggerInstance
 * @public
 */
export const loggerInstance = Logger.Instance()
