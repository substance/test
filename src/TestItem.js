import { Component, RenderingEngine } from 'substance'
import ResultItem from './ResultItem'

class TestItem extends Component {

  constructor(...args) {
    super(...args)

    this.onStart = this.onStart.bind(this)
    this.onResult = this.onResult.bind(this)
    this.onEnd = this.onEnd.bind(this)
  }

  didMount() {
    let test = this.props.test
    test.on('prerun', this.onStart)
    test.on('result', this.onResult)
    test.on('end', this.onEnd)
  }

  dispose() {
    let test = this.props.test
    test.removeListener('prerun', this.onStart)
    test.removeListener('result', this.onResult)
    test.removeListener('end', this.onEnd)
  }

  render($$) {
    let test = this.props.test
    let el = $$('div').addClass('sc-test')

    let header = $$('div').addClass('se-header')
    header.append($$('div').addClass('se-name').append(test.name))
    el.append(header)

    let controls = $$('span').addClass('se-controls').append(
      $$('button').addClass('se-focus')
        .append('\uD83D\uDCCC')
        .on('click', this.onClickFocus),
      $$('button').addClass('se-run')
        .append('\u25B6')
        .on('click', this.onClickRun)
    )
    el.append(controls)

    let body = $$('div').addClass('se-body')
    body.append($$('div').addClass('se-results').ref('results'))
    body.append($$('div').addClass('se-sandbox').ref('sandbox'))
    el.append(body)

    el.on('click', this.toggleExpand)

    return el
  }

  // The content of results and sandbox are produced by the test
  // Thus this does not need to be rerendered
  shouldRerender() {
    return false
  }

  clearResult() {
    this.el.removeClass('sm-ok').removeClass('sm-not-ok')
    this.refs.results.empty()
    this.refs.sandbox.empty()
  }

  onStart() {
    let test = this.props.test
    this.el.removeClass('sm-skip')
    if (test._skip) this.el.addClass('sm-skip')
    this.clearResult()
    this.props.test.sandbox = this.refs.sandbox.el
  }

  onResult(result) {
    let renderContext = RenderingEngine.createContext(this)
    let $$ = renderContext.$$
    this.refs.results.append($$(ResultItem, {
      test: this.props.test,
      result: result
    }))
  }

  onEnd() {
    let test = this.props.test
    if (test._skip) {
      this.el.addClass('sm-skip')
    } else if (test._ok) {
      this.el.addClass('sm-ok')
    } else {
      this.el.addClass('sm-not-ok')
    }
  }

  onClickFocus(e) {
    e.preventDefault()
    e.stopPropagation()
    this.send('focusTest', this.props.test)
  }

  onClickRun(e) {
    e.preventDefault()
    e.stopPropagation()
    let test = this.props.test
    test.reset()
    test.run()
  }

  toggleExpand(e) {
    e.preventDefault()
    e.stopPropagation()
    let expanded = this.el.hasClass('sm-expanded')
    if (expanded) this.el.removeClass('sm-expanded')
    else this.el.addClass('sm-expanded')
  }
}

export default TestItem