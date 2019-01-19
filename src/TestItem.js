import { Component, RenderingEngine } from 'substance'
import ResultItem from './ResultItem'

export default class TestItem extends Component {
  constructor (...args) {
    super(...args)

    this.onStart = this.onStart.bind(this)
    this.onResult = this.onResult.bind(this)
    this.onEnd = this.onEnd.bind(this)
  }

  getInitialState () {
    return { showBody: false }
  }

  didMount () {
    let test = this.props.test
    test.on('prerun', this.onStart)
    test.on('result', this.onResult)
    test.on('end', this.onEnd)
  }

  dispose () {
    let test = this.props.test
    test.removeListener('prerun', this.onStart)
    test.removeListener('result', this.onResult)
    test.removeListener('end', this.onEnd)
  }

  render ($$) {
    let test = this.props.test
    let el = $$('div').addClass('sc-test')

    let header = $$('div').addClass('se-header')
    header.append($$('div').addClass('se-name').append(test.name))
    el.append(header)

    let controls = $$('span').addClass('se-controls').append(
      $$('button').addClass('se-details')
        .append('\uD83D\uDC41')
        .on('click', this.onToggleVisible),
      $$('button').addClass('se-focus')
        .append('\uD83D\uDCCC')
        .on('click', this.onClickFocus),
      $$('button').addClass('se-run')
        .append('\u25B6')
        .on('click', this.onClickRun)
    )
    el.append(controls)

    let bodyEl = $$('div').addClass('se-body').ref('body')
    bodyEl.append($$('div').addClass('se-results').ref('results'))
    bodyEl.append($$('div').addClass('se-sandbox').ref('sandbox'))
    el.append(bodyEl)

    return el
  }

  // The content of results and sandbox are produced by the test
  // Thus this does not need to be rerendered
  shouldRerender () {
    return false
  }

  clearResult () {
    this.el.removeClass('sm-ok').removeClass('sm-not-ok')
    this.refs.results.empty()
    this.refs.sandbox.empty()
  }

  onStart () {
    let test = this.props.test
    this.el.removeClass('sm-skip')
    if (test._skip) this.el.addClass('sm-skip')
    this.clearResult()
    this.props.test.sandbox = this.refs.sandbox.el
  }

  onResult (result) {
    let renderContext = RenderingEngine.createContext(this)
    let $$ = renderContext.$$
    this.refs.results.append($$(ResultItem, {
      test: this.props.test,
      result: result
    }))
  }

  onEnd () {
    let test = this.props.test
    if (test._skip) {
      this.el.addClass('sm-skip')
    } else if (test._ok) {
      this.el.addClass('sm-ok')
    } else {
      this.el.addClass('sm-not-ok')
    }
    // hiding a test after it has finished
    if (!this.props.hasFilter) {
      this.refs.body.addClass('sm-hidden')
    }
  }

  onClickFocus (e) {
    e.preventDefault()
    e.stopPropagation()
    this.send('focusTest', this.props.test)
  }

  onClickRun (e) {
    e.preventDefault()
    e.stopPropagation()
    let test = this.props.test
    test.reset()
    test.run()
  }

  onToggleVisible (e) {
    e.preventDefault()
    e.stopPropagation()
    if (this.refs.body.hasClass('sm-hidden')) {
      this.refs.body.removeClass('sm-hidden')
    } else {
      this.refs.body.addClass('sm-hidden')
    }
  }
}
