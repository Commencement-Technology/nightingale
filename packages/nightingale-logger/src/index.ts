/* eslint-disable max-lines */
import { PRODUCTION, POB_TARGET } from 'pob-babel';
import * as util from 'util';
import Level from 'nightingale-levels';
import { Metadata, MetadataStyles, Styles, Handler, Processor, Record } from 'nightingale-types';

declare const global: any;

export { Level };

export interface Options<T> {
  symbol?: string;
  metadataStyles?: MetadataStyles<T>;
  styles?: Styles;
}

export interface ComputedConfigForKey {
  handlers: Handler[];
  processors: Processor[];
}

interface ExtendedErrorMetadata {
  error: Error;
}

interface ExtendedTimeMetadata {
  readableTime: string;
  timeMs: number;
}

interface ExtendedFunctionNameMetadata {
  functionName: string;
}

if (!global.__NIGHTINGALE_GET_CONFIG_FOR_LOGGER) {
  global.__NIGHTINGALE_GET_CONFIG_FOR_LOGGER = (): ComputedConfigForKey => ({
    handlers: [],
    processors: [],
  });
}

if (!global.__NIGHTINGALE_GET_CONFIG_FOR_LOGGER_RECORD) {
  global.__NIGHTINGALE_GET_CONFIG_FOR_LOGGER_RECORD = (
    key: string,
    level: number,
  ): ComputedConfigForKey => {
    const {
      handlers,
      processors,
    }: ComputedConfigForKey = global.__NIGHTINGALE_GET_CONFIG_FOR_LOGGER(key);

    return {
      handlers: handlers.filter(
        handler =>
          level >= handler.minLevel && (!handler.isHandling || handler.isHandling(level, key)),
      ),
      processors,
    };
  };
}

/** @private */
function getConfigForLoggerRecord(key: string, recordLevel: number): ComputedConfigForKey {
  return global.__NIGHTINGALE_GET_CONFIG_FOR_LOGGER_RECORD(key, recordLevel);
}

/**
 * Interface that allows you to log records.
 * This records are treated by handlers
 */
export default class Logger {
  private contextObject?: Object;

  /**
   * Create a new Logger
   *
   * @param {string} key
   * @param {string} [displayName]
   */
  constructor(readonly key: string, readonly displayName?: string) {
    this.key = key;
    this.displayName = displayName;

    if (!PRODUCTION && key.includes('.')) {
      throw new Error(`nightingale: \`.\` in key is no longer supported (key: ${key})`);
    }
  }

  /** @private */
  getHandlersAndProcessors(recordLevel: number): ComputedConfigForKey {
    return getConfigForLoggerRecord(this.key, recordLevel);
  }

  /** @private */
  getConfig(): ComputedConfigForKey {
    return global.__NIGHTINGALE_GET_CONFIG_FOR_LOGGER(this.key, Level.ALL);
  }

  /**
   * Create a child logger
   */
  child(childSuffixKey: string, childDisplayName?: string): Logger {
    return new Logger(`${this.key}:${childSuffixKey}`, childDisplayName);
  }

  /**
   * Create a new Logger with the same key a this attached context
   *
   * @example
   * const loggerMyService = new Logger('app.myService');
   * function someAction(arg1) {
   *     const logger = loggerMyService.context({ arg1 });
   *     logger.info('starting');
   *     // do stuff
   *     logger.info('done');
   * }
   *
   */
  context(context: object): Logger {
    const logger = new Logger(this.key);
    logger.setContext(context);
    return logger;
  }

  /**
   * Set the context of this logger
   *
   * @param {Object} context
   */
  setContext(context: object) {
    this.contextObject = context;
  }

  /**
   * Extends existing context of this logger
   */
  extendsContext(extendedContext: Object) {
    Object.assign(this.contextObject, extendedContext);
  }

  /**
   * Handle a record
   *
   * Use this only if you know what you are doing.
   */
  addRecord<T extends Metadata>(record: Readonly<Record<T>>) {
    const { handlers, processors } = this.getHandlersAndProcessors(record.level);

    if (handlers.length === 0) {
      if (record.level > Level.ERROR) {
        // eslint-disable-next-line no-console
        console.log('[nightingale] no logger for > error level.', {
          key: record.key,
          message: record.message,
        });
      }
      return;
    }

    if (processors) {
      processors.forEach(process => process(record, record.context));
    }

    handlers.some(handler => handler.handle(record) === false);
  }

  /**
   * Log a message
   */
  log<T extends Metadata>(
    message: string,
    metadata?: T,
    level: number = Level.INFO,
    options?: Options<T>,
  ) {
    const context = metadata && metadata.context;
    if (metadata) {
      delete metadata.context;
    }

    const record: Record<T> = {
      level,
      key: this.key,
      displayName: this.displayName,
      datetime: new Date(),
      message,
      context: context || this.contextObject,
      metadata,
      extra: {},
      ...options,
    };
    this.addRecord(record);
  }

  /**
   * Log a trace message
   */
  trace<T extends Metadata>(message: string, metadata?: T, metadataStyles?: MetadataStyles<T>) {
    this.log(message, metadata, Level.TRACE, { metadataStyles });
  }

  /**
   * Log a debug message
   */
  debug<T extends Metadata>(message: string, metadata?: T, metadataStyles?: MetadataStyles<T>) {
    this.log(message, metadata, Level.DEBUG, { metadataStyles });
  }

  /**
   * Notice an info message
   */
  notice<T extends Metadata>(message: string, metadata?: T, metadataStyles?: MetadataStyles<T>) {
    this.log(message, metadata, Level.NOTICE, { metadataStyles });
  }

  /**
   * Log an info message
   */
  info<T extends Metadata>(message: string, metadata?: T, metadataStyles?: MetadataStyles<T>) {
    this.log(message, metadata, Level.INFO, { metadataStyles });
  }

  /**
   * Log a warn message
   */
  warn<T extends Metadata>(message: string, metadata?: T, metadataStyles?: MetadataStyles<T>) {
    this.log(message, metadata, Level.WARN, { metadataStyles });
  }

  /**
   * Log an error message
   */
  error<T extends Metadata>(
    message: string | Error,
    metadata?: T,
    metadataStyles?: MetadataStyles<T>,
  ) {
    if (message instanceof Error) {
      const extendedMetadata: T & ExtendedErrorMetadata = Object.assign({}, metadata, {
        error: message,
      });
      message = `${extendedMetadata.error.name}: ${extendedMetadata.error.message}`;
      this.log(message, extendedMetadata, Level.ERROR, { metadataStyles });
    } else {
      this.log(message, metadata, Level.ERROR, { metadataStyles });
    }
  }

  /**
   * Log an critical message
   */
  critical<T extends Metadata>(message: string, metadata?: T, metadataStyles?: MetadataStyles<T>) {
    this.log(message, metadata, Level.CRITICAL, { metadataStyles });
  }

  /**
   * Log a fatal message
   */
  fatal<T extends Metadata>(message: string, metadata?: T, metadataStyles?: MetadataStyles<T>) {
    this.log(message, metadata, Level.FATAL, { metadataStyles });
  }

  /**
   * Log an alert message
   */
  alert<T extends Metadata>(message: string, metadata?: T, metadataStyles?: MetadataStyles<T>) {
    this.log(message, metadata, Level.ALERT, { metadataStyles });
  }

  /**
   * Log an inspected value
   */
  inspectValue<T extends Metadata>(value: any, metadata?: T, metadataStyles?: MetadataStyles<T>) {
    if (POB_TARGET === 'browser') {
      throw new Error('Not supported for the browser. Prefer `debugger;`');
    } else {
      // Note: inspect is a special function for node:
      // https://github.com/nodejs/node/blob/a1bda1b4deb08dfb3e06cb778f0db40023b18318/lib/util.js#L210
      value = util.inspect(value, { depth: 6 });
      this.log(value, metadata, Level.DEBUG, { metadataStyles, styles: ['gray'] });
    }
  }

  /**
   * Log a debugged var
   */
  inspectVar<T extends Metadata>(
    varName: string,
    varValue: any,
    metadata?: T,
    metadataStyles?: MetadataStyles<T>,
  ) {
    if (POB_TARGET === 'browser') {
      throw new Error('Not supported for the browser. Prefer `debugger;`');
    } else {
      varValue = util.inspect(varValue, { depth: 6 });
      this.log(`${varName} = ${varValue}`, metadata, Level.DEBUG, {
        metadataStyles,
        styles: ['cyan'],
      });
    }
  }

  /**
   * Alias for infoSuccess
   */
  success<T extends Metadata>(message: string, metadata?: T, metadataStyles?: MetadataStyles<T>) {
    this.infoSuccess(message, metadata, metadataStyles);
  }

  /**
   * Log an info success message
   */
  infoSuccess<T extends Metadata>(
    message: string,
    metadata?: T,
    metadataStyles?: MetadataStyles<T>,
  ) {
    this.log(message, metadata, Level.INFO, {
      metadataStyles,
      symbol: '✔',
      styles: ['green', 'bold'],
    });
  }

  /**
   * Log an debug success message
   */
  debugSuccess<T extends Metadata>(
    message: string,
    metadata?: T,
    metadataStyles?: MetadataStyles<T>,
  ) {
    this.log(message, metadata, Level.DEBUG, {
      metadataStyles,
      symbol: '✔',
      styles: ['green'],
    });
  }

  /**
   * Alias for infoFail
   */
  fail<T extends Metadata>(message: string, metadata?: T, metadataStyles?: MetadataStyles<T>) {
    this.infoFail(message, metadata, metadataStyles);
  }

  /**
   * Log an info fail message
   */
  infoFail<T extends Metadata>(message: string, metadata?: T, metadataStyles?: MetadataStyles<T>) {
    this.log(message, metadata, Level.INFO, {
      metadataStyles,
      symbol: '✖',
      styles: ['red', 'bold'],
    });
  }

  /**
   * Log an debug fail message
   */
  debugFail<T extends Metadata>(message: string, metadata?: T, metadataStyles?: MetadataStyles<T>) {
    this.log(message, metadata, Level.DEBUG, {
      metadataStyles,
      symbol: '✖',
      styles: ['red'],
    });
  }

  /**
   * @returns {number} time to pass to timeEnd
   */
  time<T extends Metadata>(
    message?: string,
    metadata?: T,
    metadataStyles?: MetadataStyles<T>,
    level: number = Level.DEBUG,
  ): number {
    if (message) {
      this.log(message, metadata, level, { metadataStyles });
    }

    return Date.now();
  }

  infoTime<T extends Metadata>(
    message?: string,
    metadata?: T,
    metadataStyles?: MetadataStyles<T>,
  ): number {
    return this.time(message, metadata, metadataStyles, Level.INFO);
  }

  /**
   * Finds difference between when this method
   * was called and when the respective time method
   * was called, then logs out the difference
   * and deletes the original record
   */
  timeEnd<T extends Metadata>(
    startTime: number,
    message: string,
    metadata?: T,
    metadataStyles?: MetadataStyles<T>,
    level: number = Level.DEBUG,
    options?: Options<T>,
  ) {
    const now = Date.now();

    const diffTime = now - startTime;
    let readableTime;

    if (diffTime < 1000) {
      readableTime = `${diffTime}ms`;
    } else {
      const seconds = diffTime > 1000 ? Math.floor(diffTime / 1000) : 0;
      const ms = diffTime - seconds * 1000;
      readableTime = `${seconds ? `${seconds}s and ` : ''}${ms}ms`;
    }

    const extendedMetadata: T & ExtendedTimeMetadata = Object.assign({}, metadata, {
      readableTime,
      timeMs: diffTime,
    });

    this.log(message, extendedMetadata, level, { ...options, metadataStyles });
  }

  /**
   * Like timeEnd, but with INFO level
   */
  infoTimeEnd<T extends Metadata>(
    time: number,
    message: string,
    metadata?: T,
    metadataStyles?: MetadataStyles<T>,
  ) {
    this.timeEnd(time, message, metadata, metadataStyles, Level.INFO);
  }

  /**
   * Like timeEnd, but with INFO level
   */
  infoSuccessTimeEnd<T extends Metadata>(
    time: number,
    message: string,
    metadata?: T,
    metadataStyles?: MetadataStyles<T>,
  ) {
    this.timeEnd(time, message, metadata, metadataStyles, Level.INFO, {
      symbol: '✔',
      styles: ['green', 'bold'],
    });
  }

  /**
   * Log an enter in a function
   *
   * @example
   * class A {
   *   method(arg1) {
   *     logger.enter(method, { arg1 });
   *     // Do your stuff
   *   }
   * }
   *
   */
  enter<T extends Metadata>(fn: Function, metadata?: T, metadataStyles?: MetadataStyles<T>) {
    const extendedMetadata: Metadata = metadata || {};
    extendedMetadata.functionName = fn.name;
    this.log('enter', metadata, Level.TRACE, { metadataStyles });
  }

  /**
   * Log an exit in a function
   *
   * @example
   * const logger = new ConsoleLogger('myNamespace.A');
   * class A {
   *   method(arg1) {
   *     // Do your stuff
   *     logger.exit(method, { arg1 });
   *   }
   * }
   */
  exit<T extends Metadata>(
    fn: Function,
    metadata?: T,
    metadataStyles?: MetadataStyles<T & { functionName: string }>,
  ) {
    const extendedMetadata: T & ExtendedFunctionNameMetadata = Object.assign({}, metadata, {
      functionName: fn.name,
    });
    this.log('exit', extendedMetadata, Level.TRACE, { metadataStyles });
  }

  /**
   * Wrap around a function to log enter and exit of a function
   *
   * @example
   * const logger = new ConsoleLogger('myNamespace.A');
   * class A {
   *   method() {
   *     logger.wrap(method, () => {
   *       // Do your stuff
   *     });
   *   }
   * }
   *
   * @param {Function} fn
   * @param {Object} [metadata]
   * @param {Object} [metadataStyles]
   * @param {Function} callback
   */
  wrap<T extends Metadata>(
    fn: Function,
    metadata?: T | Function,
    metadataStyles?: MetadataStyles<T> | Function,
    callback?: Function,
  ) {
    if (typeof metadata === 'function') {
      callback = metadata;
      metadata = undefined;
    } else if (typeof metadataStyles === 'function') {
      callback = metadataStyles;
      metadataStyles = undefined;
    }

    this.enter(fn, metadata, metadataStyles as MetadataStyles<T>);
    (callback as Function)();
    this.exit(fn);
  }
}