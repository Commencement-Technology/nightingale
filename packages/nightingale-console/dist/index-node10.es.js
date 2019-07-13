import formatterANSI from 'nightingale-ansi-formatter';
import formatterJSON from 'nightingale-json-formatter';
import consoleOutput from 'nightingale-console-output';
import createFindDebugLevel from 'nightingale-debug';
import { Level } from 'nightingale-types';

const defaultFormatter = !process.stdout.isTTY && process.env.NIGHTINGALE_CONSOLE_FORMATTER !== 'ansi' ? formatterJSON : formatterANSI;

const createHandle = (formatter = defaultFormatter, output = consoleOutput) => {
  return record => {
    return output(formatter(record), record);
  };
};

const findDebugLevel = createFindDebugLevel(process.env.DEBUG);
class ConsoleHandler {
  constructor(minLevel, options = {}) {
    this.minLevel = Level.ALL;
    this.minLevel = minLevel;

    this.isHandling = (level, key) => level >= findDebugLevel(minLevel, key);

    this.handle = createHandle(options.formatter, options.output);
  }

}

export default ConsoleHandler;
//# sourceMappingURL=index-node10.es.js.map