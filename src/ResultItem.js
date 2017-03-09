import Component from 'substance/ui/Component'
import isArray from 'substance/util/isArray'
import isPlainObject from 'substance/util/isPlainObject'

class ResultItem extends Component {

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
      let diffEl = $$('div').addClass('se-diff')
      let expectedEl = $$('div').addClass('se-expected')
        .append('Expected:')
        .append($$('pre').append(_toString(result.expected)))
      let actualEl = $$('div').addClass('se-actual')
        .append('Actual:')
        .append($$('pre').append(_toString(result.actual)))
      diffEl.append(expectedEl, actualEl)
      el.append(diffEl)
    }

    return el
  }
}

function _toString(obj) {
  if (isArray(obj) || isPlainObject(obj)) {
    return JSON.stringify(obj)
  } else {
    String(obj)
  }
}

export default ResultItem
