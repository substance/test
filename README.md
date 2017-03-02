# substance-test

A test-suite based on [tape](https://github.com/substack/tape).

# Running tape tests in the Substance TestSuite

Install `substance-test`:

```sh
$ npm install --save-dev substance-test
```

Bundle your tests using `rollup`:

```js
var glob = require('glob');
var rollup = require('rollup');
var hypothetical = require('rollup-plugin-hypothetical')

// Create an index file for all tests
let index = glob.sync('test/*.js').map((f) => {
  return `import './${f}'`
}).join('\n');
rollup.rollup({
  entry: 'index.js',
  plugins: [
    hypothetical({
      files: {
        'index.js': index
      },
      allowRealFiles: true
    }),
  ],
  // let rollup skip tape
  external: ['tape'],
}).then((bundle) => {
  bundle.write({
    format: 'umd', moduleName: 'tests',
    dest: 'dist/tests.js',
    globals: {
      // instead of using tape directly
      // we want to use the one managed by the test suite
      tape: 'substanceTest.test'
    }
  })
})
```

Create an HTML file like the following:

```html
<html>
  <head>
    <title>My TestSuite</title>
    <link href='node_modules/substance-test/dist/test.css' rel='stylesheet' type='text/css'/>
    <script type="text/javascript" src="node_modules/substance-test/dist/testsuite.js"></script>
    <script type="text/javascript" src="dist/tests.js"></script>
  </head>
</html>
```

Then open this file in your browser.
