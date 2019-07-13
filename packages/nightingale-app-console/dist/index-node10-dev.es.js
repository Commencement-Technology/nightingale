import { install } from 'source-map-support';
import Logger, { listenUnhandledErrors, configure, Level } from 'nightingale';
export { Level, addConfig, configure, levels } from 'nightingale';
import TerminalConsoleHandler from 'nightingale-console';

const ConsoleHandler = TerminalConsoleHandler;
install({
  environment: 'node'
});
const logger = new Logger('app');
const appLogger = logger;
Error.stackTraceLimit = Infinity;
listenUnhandledErrors(logger);
configure([{
  pattern: /^app(:|$)/,
  handlers: [new ConsoleHandler(Level.DEBUG)],
  stop: true
}, {
  handlers: [new ConsoleHandler(Level.INFO)]
}]);

export { appLogger, logger };
//# sourceMappingURL=index-node10-dev.es.js.map