'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _Logger = require('./Logger');

var _Logger2 = _interopRequireDefault(_Logger);

var _BrowserConsoleHandler = require('./handlers/BrowserConsoleHandler');

var _BrowserConsoleHandler2 = _interopRequireDefault(_BrowserConsoleHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A simplified way of creating a {@link Logger} with a {@link ConsoleHandler}
 */
let ConsoleLogger = class ConsoleLogger extends _Logger2.default {

    /**
     * Creates a new ConsoleLogger with a prefix.
     *
     * If no min level is specified, the min level is ALL if name is in `process.env.DEBUG`, else WARN
     *
     * @param {string} name
     * @param {int} [minLevel]
     */
    constructor(name, minLevel) {
        super([new _BrowserConsoleHandler2.default(minLevel != null ? minLevel : name)]);

        this.setPrefix(`[${ name }]`);
    }
};
exports.default = ConsoleLogger;
//# sourceMappingURL=BrowserConsoleLogger.js.map