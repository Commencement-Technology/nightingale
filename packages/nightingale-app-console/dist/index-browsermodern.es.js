import Logger, { configure, addConfig, levels } from 'nightingale';
export { configure, addConfig, levels } from 'nightingale';
import BrowserConsoleHandler from 'nightingale-browser-console';

const ConsoleHandler = BrowserConsoleHandler;
const logger = new Logger('app');
const appLogger = logger;
configure([{
  handlers: [new ConsoleHandler(levels.INFO)]
}]);

export { logger, appLogger };
//# sourceMappingURL=index-browsermodern.es.js.map