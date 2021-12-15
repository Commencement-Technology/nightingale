import { configure, Level, Logger } from 'nightingale';
import { ConsoleHandler } from 'nightingale-console';

export { configure, addConfig, levels, Level, Logger } from 'nightingale';

const testMinLevel =
  process.env.NIGHTINGALE_TEST_MIN_LEVEL !== undefined &&
  process.env.NIGHTINGALE_TEST_MIN_LEVEL !== ''
    ? Number(process.env.NIGHTINGALE_TEST_MIN_LEVEL)
    : __DEV__
    ? Level.DEBUG
    : Level.INFO;

const libMinLevel =
  process.env.NIGHTINGALE_LIB_MIN_LEVEL !== undefined &&
  process.env.NIGHTINGALE_LIB_MIN_LEVEL !== ''
    ? Number(process.env.NIGHTINGALE_LIB_MIN_LEVEL)
    : Level.INFO;

export const testLogger = new Logger('unit-testing');

configure([
  {
    pattern: /^app(:|$)/,
    handlers: [new ConsoleHandler(testMinLevel)],
    stop: true,
  },
  {
    handlers: [new ConsoleHandler(libMinLevel)],
  },
]);
