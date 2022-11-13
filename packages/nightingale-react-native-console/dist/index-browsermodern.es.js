import formatterANSI from 'nightingale-ansi-formatter';
import { Platform } from 'react-native';
import parseErrorStack from 'react-native/Libraries/Core/Devtools/parseErrorStack';
import symbolicateStackTrace from 'react-native/Libraries/Core/Devtools/symbolicateStackTrace';

/* eslint-disable @typescript-eslint/no-unsafe-argument */
const getStackTrace = e => {
  // eslint-disable-next-line no-prototype-builtins
  if (Platform.hasOwnProperty('constants')) {
    // RN version >= 0.63
    if (Platform.constants.reactNativeVersion.minor >= 64) {
      // RN version >= 0.64 -> Stacktrace as string
      return parseErrorStack(e.stack);
    }
    // RN version == 0.63 -> Stacktrace as string
    else return parseErrorStack(e);
  }
  // RN version < 0.63 -> Stacktrace as string
  else return parseErrorStack(e);
};
function parsedStackToString(stack) {
  return stack.map(frame => `  at ${frame.file}${frame.lineNumber ? `:${frame.lineNumber}${frame.column ? `:${frame.column}` : ''}` : ''}${frame.methodName ? ` in ${frame.methodName}` : ''}`).join('\n');
}
function consoleOutput(param) {
  // eslint-disable-next-line no-console
  console.log(...param);
}
const createHandle = () => {
  return record => {
    var _record$metadata, _record$metadata2;
    const error = (_record$metadata = record.metadata) === null || _record$metadata === void 0 ? void 0 : _record$metadata.error;
    if (error && error instanceof Error) {
      (_record$metadata2 = record.metadata) === null || _record$metadata2 === void 0 ? true : delete _record$metadata2.error;
      symbolicateStackTrace(getStackTrace(error)).then(({
        stack,
        codeFrame
      }) => {
        error.stack = parsedStackToString(stack);
        consoleOutput([formatterANSI(record)]);
      }).catch(() => {
        consoleOutput([formatterANSI(record)]);
      });
    } else {
      consoleOutput([formatterANSI(record)]);
    }
  };
};
class ReactNativeConsoleHandler {
  minLevel = 0;
  constructor(minLevel) {
    this.minLevel = minLevel;
    this.isHandling = level => level >= minLevel;
    this.handle = createHandle();
  }
}

export { ReactNativeConsoleHandler };
//# sourceMappingURL=index-browsermodern.es.js.map
