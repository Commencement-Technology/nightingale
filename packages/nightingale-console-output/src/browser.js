/* eslint no-console: 0 */
import levels from 'nightingale-levels';

const write = (() => {
    if (console.error) {
        return function write(params, logLevel) {
            console[logLevel >= LogLevel.ERROR ? 'error' : 'log'](...params);
        };
    } else {
        return function write(params, logLevel) {
            console.log(...params);
        };
    }
})();

export default write;
