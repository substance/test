import { substanceGlobals, Component, isArray, isPlainObject, isString } from 'substance'
import DMP from '../vendor/google-diff-match-patch/dmp'

substanceGlobals.DEBUG_RENDERING = false

export default class ResultItem extends Component {
  constructor (...args) {
    super(...args)

    this.dmp = new DMP()
  }

  shouldRerender () {
    return false
  }

  render ($$) {
    let test = this.props.test
    let result = this.props.result
    let el = $$('div').addClass('sc-test-result')

    if (isString(result)) {
      el.addClass('sm-comment')
      el.append(result)
      // header.append(
      //   $$('span').addClass('se-description').append(result)
      // )
    } else {
      let header = $$('div')
      if (!test._skip) {
        if (result.ok) {
          header.append($$('span').addClass('se-status sm-ok').append('\u2713'))
        } else {
          header.append($$('span').addClass('se-status sm-not-ok').append('\u26A0'))
        }
      }
      header.append($$('span').addClass('se-description').append(String(result.name)))
      el.append(header)

      if (!test._skip && !result.ok && (result.expected || result.actual)) {
        let expStr = _toString(result.expected)
        let actStr = _toString(result.actual)
        if (expStr !== actStr) {
          el.append(this._renderPatch($$, expStr, actStr))
        }
        let diffEl = $$('div').addClass('se-diff')
        diffEl.append(
          $$('div').addClass('se-expected')
            .append('Expected:')
            .append(
              $$('pre').append(_toString(result.expected))
            )
        )
        diffEl.append(
          $$('div').addClass('se-actual')
            .append('Actual:')
            .append(
              $$('pre').append(_toString(result.actual))
            )
        )
        el.append(diffEl)
      }
    }

    return el
  }

  _renderPatch ($$, act, exp) {
    const dmp = this.dmp
    let d = dmp.diff_main(act, exp)
    d = _shortenDiff(d)
    let html = dmp.diff_prettyHtml(d)
    html = html.replace(/\.\.\.&para;/g, '...')
    return $$('div').addClass('se-patch').html(html)
  }
}

function _toString (obj) {
  if (isArray(obj) || isPlainObject(obj)) {
    return JSON.stringify(obj)
  } else {
    return String(obj)
  }
}

function _shortenDiff (diffs) {
  return diffs.map(d => {
    if (d[0] === 0) {
      let lines = d[1].split(/\r?\n/)
      let L = lines.length
      if (L > 10) {
        d[1] = [lines[0], '...', lines[L - 1]].join('\n')
      }
    }
    return d
  })
}
