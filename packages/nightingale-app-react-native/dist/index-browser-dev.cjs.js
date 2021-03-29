'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var reactNative = require('react-native');
var nightingale = require('nightingale');
var nightingaleBrowserConsole = require('nightingale-browser-console');
var nightingaleReactNativeConsole = require('nightingale-react-native-console');

// @ts-expect-error including @types/react-native causes conflicts
const appLogger = new nightingale.Logger('app');
const ReactNativeConsoleHandlerForPlatform = // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
reactNative.Platform.OS === 'web' ? nightingaleBrowserConsole.BrowserConsoleHandler : nightingaleReactNativeConsole.ReactNativeConsoleHandler;
nightingale.configure(process.env.NODE_ENV === 'production' ? [] : [{
  pattern: /^app(:|$)/,
  handlers: [new ReactNativeConsoleHandlerForPlatform(nightingale.Level.DEBUG)],
  stop: true
}, {
  handlers: [new ReactNativeConsoleHandlerForPlatform(nightingale.Level.INFO)]
}]);

exports.Level = nightingale.Level;
exports.addConfig = nightingale.addConfig;
exports.configure = nightingale.configure;
exports.ReactNativeConsoleHandler = nightingaleReactNativeConsole.ReactNativeConsoleHandler;
exports.ReactNativeConsoleHandlerForPlatform = ReactNativeConsoleHandlerForPlatform;
exports.appLogger = appLogger;
//# sourceMappingURL=index-browser-dev.cjs.js.map
