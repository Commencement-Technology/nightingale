import levelNames from 'nightingale-level-names';

/* eslint camelcase:"off" */
class WinstonAdapterHandler {
  constructor(winstonTransport, minLevel) {
    this.minLevel = void 0;
    this.handle = void 0;
    this.minLevel = minLevel;

    this.handle = function (record) {
      // new Promise((resolve, reject) => {
      winstonTransport.log(record.level, record.message, {
        level_name: levelNames.get(record.level),
        key: record.key,
        metadata: record.metadata,
        extra: record.extra,
        context: record.context
      }, function (err) {
        if (err) {
          console.warn(err); // return reject(err);
        } // resolve();

      }); // });
    };
  }

}

export default WinstonAdapterHandler;
//# sourceMappingURL=index-browsermodern.es.js.map