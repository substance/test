import { substanceGlobals, Component, isArray, isPlainObject } from 'substance'
import DMP from '../vendor/google-diff-match-patch/dmp'

substanceGlobals.DEBUG_RENDERING = false

class ResultItem extends Component {

  constructor(...args) {
    super(...args)

    this.dmp = new DMP()
  }

  shouldRerender() {
    return false
  }

  render($$) {
    var test = this.props.test
    var result = this.props.result
    var el = $$('div').addClass('sc-test-result')

    var header = $$('div')
    if (!test._skip) {
      if (result.ok) {
        header.append($$('span').addClass('se-status sm-ok').append("\u2713"))
      } else {
        header.append($$('span').addClass('se-status sm-not-ok').append("\u26A0"))
      }
    }
    header.append($$('span').addClass('se-description').append(String(result.name)))
    el.append(header)

    if (!test._skip && !result.ok && (result.expected || result.actual) ) {
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

    return el
  }

  _renderPatch($$, act, exp) {
    const dmp = this.dmp
    let d = dmp.diff_main(act, exp);
    let html = dmp.diff_prettyHtml(d);
    return $$('div').addClass('se-patch').html(html)
  }
}

function _toString(obj) {
  if (isArray(obj) || isPlainObject(obj)) {
    return JSON.stringify(obj)
  } else {
    return String(obj)
  }
}

export default ResultItem
