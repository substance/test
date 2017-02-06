let path = require('path')
let fs = require('fs')

// EXPERIMENTAL: trying to make 'installing' the test suite with substance-bundler easier

module.exports.install = function(bundler, taskName = 'test', opts = {}) {
  const cwd = process.cwd()
  let src = opts.src
  // TODO: we should make sure the format of `dest` is fine (e.g. having a trailing '/')
  let dest = opts.dest || '.test/'
  let title = opts.title || 'Substance TestSuite'

  let libs = []
  // TODO: allow to add custom libs
  // libs.push(path.relative(path.join(cwd, dest), path.join(cwd, lib)))

  const SUBST_TEST = './'+path.relative(cwd, path.dirname(require.resolve('./package.json')))
  bundler.task(taskName, function() {
    // copy all assets
    // TODO: generate customized test-suite page
    bundler.copy(SUBST_TEST+'/dist/*', dest, { root: SUBST_TEST+'/dist' })
    if (src) {
      // bundle tests
      bundler.js(src, {
        targets: [{
          dest: dest+'tests.js',
          format: 'umd', moduleName: 'tests'
        }, {
          dest: dest+'tests.cjs.js',
          format: 'cjs'
        }],
        external: ['substance-test']
      })
    }
    bundler.custom('Generating TestSuite page...', {
      execute: () => {
        let tplFile = require.resolve('./src/index.html.tpl')
        let html = fs.readFileSync(tplFile, 'utf8')
        html = html.replace(/TITLE/, title)
        html = html.replace(/SCRIPTS/, libs.map(lib => '<script type="text/javascript" src="'+lib+'"></script>').join('\n'))
        // console.log(html)
        bundler.writeSync(dest+'index.html', html)
      }
    })
  })
}
