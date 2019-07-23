const webpack = require('webpack');
const path = require('path');
const ImportStatsPlugin = require('../');

test('normal import', done => {
  const compiler = webpack({
    entry: [path.join(__dirname, 'case1.js')],
    output: {
      path: path.join(__dirname, 'dist'),
    },
    plugins: [
      new ImportStatsPlugin({
        imports: ['lodash', 'inexistent'],
        print: result => expect(result).toEqual({ lodash: { default: 1, debounce: 1, get: 1 } }),
      })
    ]
  });

  compiler.run(err => {
    if (err) {
      throw err;
    }

    done();
  })
})