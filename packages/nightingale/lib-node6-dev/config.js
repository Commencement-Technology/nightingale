'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.configure = configure;
exports.addConfig = addConfig;

var _tcombForked = require('tcomb-forked');

var _tcombForked2 = _interopRequireDefault(_tcombForked);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Config = _tcombForked2.default.interface({
  pattern: _tcombForked2.default.maybe(RegExp),
  key: _tcombForked2.default.maybe(_tcombForked2.default.String),
  keys: _tcombForked2.default.maybe(_tcombForked2.default.list(_tcombForked2.default.String)),
  handler: _tcombForked2.default.maybe(_tcombForked2.default.Object),
  handlers: _tcombForked2.default.maybe(_tcombForked2.default.list(_tcombForked2.default.Object)),
  processor: _tcombForked2.default.maybe(_tcombForked2.default.Any),
  processors: _tcombForked2.default.maybe(_tcombForked2.default.list(_tcombForked2.default.Any))
}, {
  name: 'Config',
  strict: true
});

if (global.__NIGHTINGALE_GLOBAL_HANDLERS) {
  // eslint-disable-next-line no-console
  throw new Error('nightingale: update all to ^5.0.0');
}

if (!global.__NIGHTINGALE_CONFIG) {
  global.__NIGHTINGALE_CONFIG = [];
  global.__NIGHTINGALE_LOGGER_MAP_CACHE = new Map();
  global.__NIGHTINGALE_CONFIG_DEFAULT = { handlers: [], processors: [] };
}

function clearCache() {
  global.__NIGHTINGALE_LOGGER_MAP_CACHE.clear();
}

function handleConfig(config) {
  _assert(config, Config, 'config');

  if (config.keys) {
    if (config.pattern) {
      throw new Error('Cannot have key and pattern for the same config');
    }
    if (config.key) {
      throw new Error('Cannot have key and keys for the same config');
    }
  } else if (config.key) {
    if (config.pattern) {
      throw new Error('Cannot have key and pattern for the same config');
    }
    config.keys = [config.key];
    delete config.key;
  }

  if (config.patterns) {
    throw new Error('config.patterns is no longer supported, use pattern');
  }

  if (config.handler) {
    if (config.handlers) {
      throw new Error('Cannot have handler and handlers for the same config');
    }
    config.handlers = [config.handler];
    delete config.handler;
  }

  if (config.processor) {
    if (config.processors) {
      throw new Error('Cannot have processors and processors for the same config');
    }
    config.processors = [config.processor];
    delete config.processor;
  }

  return config;
}

function configure(config) {
  if (global.__NIGHTINGALE_CONFIG.length !== 0) {
    // eslint-disable-next-line no-console
    console.log('nightingale: warning: config overridden');
  }

  clearCache();
  global.__NIGHTINGALE_CONFIG = config.map(handleConfig);
}

function addConfig(config, unshift = false) {
  _assert(config, Config, 'config');

  config = handleConfig(config);
  global.__NIGHTINGALE_CONFIG[unshift ? 'unshift' : 'push'](config);
  clearCache();
}

const configIsForKey = key => config => {
  if (config.keys) return config.keys.includes(key);
  if (config.pattern) return config.pattern.test(key);
  return true;
};

global.__NIGHTINGALE_GET_CONFIG_FOR_LOGGER = function getConfigForLogger(key) {
  const globalCache = global.__NIGHTINGALE_LOGGER_MAP_CACHE;

  if (globalCache.has(key)) {
    return globalCache.get(key);
  }

  const loggerConfig = {
    handlers: [],
    processors: []
  };

  global.__NIGHTINGALE_CONFIG.filter(configIsForKey(key)).some(config => {
    if (config.handlers) loggerConfig.handlers.push(...config.handlers);
    if (config.processors) loggerConfig.processors.push(...config.processors);
    return config.stop;
  });

  globalCache.set(key, loggerConfig);
  return loggerConfig;
};

global.__NIGHTINGALE_GET_CONFIG_FOR_LOGGER_RECORD = function getConfigForLoggerRecord(key, level) {
  const { handlers, processors } = global.__NIGHTINGALE_GET_CONFIG_FOR_LOGGER(key);

  return {
    handlers: handlers.filter(handler => level >= handler.minLevel && (!handler.isHandling || handler.isHandling(level, key))),
    processors
  };
};

function _assert(x, type, name) {
  function message() {
    return 'Invalid value ' + _tcombForked2.default.stringify(x) + ' supplied to ' + name + ' (expected a ' + _tcombForked2.default.getTypeName(type) + ')';
  }

  if (_tcombForked2.default.isType(type)) {
    if (!type.is(x)) {
      type(x, [name + ': ' + _tcombForked2.default.getTypeName(type)]);

      _tcombForked2.default.fail(message());
    }
  } else if (!(x instanceof type)) {
    _tcombForked2.default.fail(message());
  }

  return x;
}
//# sourceMappingURL=config.js.map