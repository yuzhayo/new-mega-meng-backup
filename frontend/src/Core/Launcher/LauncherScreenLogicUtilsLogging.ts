// File: LauncherScreenLogicUtilsLogging.ts
// IMPORT SECTION
// (No external imports needed)

// TYPES SECTION
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  module: string;
  message: string;
  data?: any;
}

// LOGGER CLASS
/**
 * Logger with module-specific prefixes and rate limiting
 */
export class Logger {
  private loggedMessages = new Set<string>();
  private logHistory: LogEntry[] = [];
  private maxHistorySize = 100;

  constructor(private module: string) {}

  private log(level: LogLevel, message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: performance.now(),
      level,
      module: this.module,
      message,
      data
    };

    // Add to history
    this.logHistory.push(entry);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }

    // Console output
    const prefix = `[${this.module}]`;
    const methods = {
      debug: console.debug,
      info: console.info,
      warn: console.warn,
      error: console.error
    };

    if (data !== undefined) {
      methods[level](prefix, message, data);
    } else {
      methods[level](prefix, message);
    }
  }

  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: any): void {
    this.log('error', message, data);
  }

  /**
   * Log once - prevents spam of repeated messages
   */
  warnOnce(message: string, data?: any): void {
    const key = `${this.module}:warn:${message}`;
    if (!this.loggedMessages.has(key)) {
      this.loggedMessages.add(key);
      this.warn(message, data);
    }
  }

  errorOnce(message: string, data?: any): void {
    const key = `${this.module}:error:${message}`;
    if (!this.loggedMessages.has(key)) {
      this.loggedMessages.add(key);
      this.error(message, data);
    }
  }

  getHistory(): LogEntry[] {
    return [...this.logHistory];
  }

  clearHistory(): void {
    this.logHistory = [];
  }

  clearOnceCache(): void {
    this.loggedMessages.clear();
  }
}

/**
 * Create logger instance for a module
 */
export const createLogger = (module: string): Logger => {
  return new Logger(module);
};

// Pre-created loggers for each logic module
export const loggers = {
  Config: createLogger('Config'),
  Logic1: createLogger('Logic1'),
  Logic2: createLogger('Logic2'),
  Logic2A: createLogger('Logic2A'),
  Logic3: createLogger('Logic3'),
  Logic3A: createLogger('Logic3A'),
  Clock: createLogger('Clock'),
  Effect: createLogger('Effect'),
  Effect3D: createLogger('Effect3D'),
  Composer: createLogger('Composer')
};