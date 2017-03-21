# nightingale-handler [![NPM version][npm-image]][npm-url]

Nightingale handler

[![Dependency ci Status][dependencyci-image]][dependencyci-url]
[![Dependency Status][daviddm-image]][daviddm-url]

## Install

```sh
npm install --save nightingale-handler
```

## Usage

```js
import createHandler from 'nightingale-handler';

export default createHandler(record => {
  // handle the record
});
```

[npm-image]: https://img.shields.io/npm/v/nightingale-handler.svg?style=flat-square
[npm-url]: https://npmjs.org/package/nightingale-handler
[daviddm-image]: https://david-dm.org/nightingalejs/nightingale-handler.svg?style=flat-square
[daviddm-url]: https://david-dm.org/nightingalejs/nightingale-handler
[dependencyci-image]: https://dependencyci.com/github/nightingalejs/nightingale-handler/badge?style=flat-square
[dependencyci-url]: https://dependencyci.com/github/nightingalejs/nightingale-handler