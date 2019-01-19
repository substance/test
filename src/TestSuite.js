import { clone, Component, Router } from 'substance'
import TestItem from './TestItem'

const SLASH = '/'.charCodeAt(0)

export default class TestSuite extends Component {
  constructor (...args) {
    super(...args)

    this.handleAction('focusTest', this.handleFocusTest)
  }

  didMount () {
    this.router.on('route:changed', this.onRouteChange, this)
    this.router.start()
    this.runTests()
  }

  dispose () {
    this.router.off(this)
  }

  getInitialState () {
    this.router = new Router()
    return this.router.readRoute()
  }

  render ($$) {
    let el = $$('div').addClass('sc-test-suite')

    const harness = this._getHarness()
    const state = this.state
    const filter = this.state.filter || ''

    let header = $$('div').addClass('se-header')
    let title = this.props.title || window.document.title || 'TestSuite'
    header.append(
      $$('div').addClass('se-logo').append(title)
    )
    el.append(header)

    let toolbar = $$('div').addClass('se-toolbar')
    if (filter) {
      toolbar.append(
        $$('div').addClass('se-clear-filter').append(
          $$('button').addClass('se-clear')
            .append('Clear Filter \u232B')
            .on('click', this.onClearFilter)
        )
      )
    } else {
      let filterInput = $$('input').addClass('se-filter-input')
        .ref('filterInput')
        .attr('type', 'text')
        .on('change', this.onChangeFilter)
      toolbar.append($$('div').append(
        $$('span').text('Filter: '),
        filterInput
      ))
    }

    let hideSuccessfulCheckbox = $$('input').ref('hideCheckbox')
      .attr('type', 'checkbox')
      .htmlProp('checked', state.hideSuccessful)
      .on('change', this.onToggleHideSuccessful)
    let stopOnErrorCheckbox = $$('input').ref('stopOnErrorCheckbox')
      .attr('type', 'checkbox')
      .htmlProp('checked', state.stopOnError)
      .on('change', this.onToggleStopOnError)
    toolbar.append(
      $$('div').append(
        hideSuccessfulCheckbox,
        $$('label').append('Only show failed tests')
      ).append(
        stopOnErrorCheckbox,
        $$('label').append('Stop on first error')
      )
    )

    toolbar.append(
      $$('div').append(
        $$('button').addClass('se-toggle-run-button').ref('toggleRunButton')
          .on('click', this.onToggleRun)
          .addClass(harness.isRunning() ? 'sm-running' : 'sm-stopped')
      )
    )

    // run

    el.append(toolbar)

    let bodyEl = $$('div').addClass('se-body')

    let _filter = this._getFilter()
    let tests = $$('div').addClass('se-tests').ref('tests')
    harness.getTests().forEach((test) => {
      let testItem = $$(TestItem, { test: test, hasFilter: Boolean(this.state.filter) }).ref(test.name)
      if (!_filter(test)) {
        testItem.addClass('sm-hidden')
      }
      tests.append(testItem)
    })

    bodyEl.append(tests)
    el.append(bodyEl)

    if (this.state.hideSuccessful) {
      el.addClass('sm-hide-successful')
    }

    return el
  }

  didUpdate (oldProps, oldState) {
    if (this.state.filter !== oldState.filter) {
      this.runTests()
    }
  }

  restart () {
    const harness = this._getHarness()
    const _filter = this._getFilter()
    harness.getTests().forEach((test) => {
      if (_filter(test)) {
        this.refs[test.name].clearResult()
      }
    })
    this.runTests()
  }

  runTests () {
    // console.log('Running tests...')
    let testItems = this.refs.tests.getChildren()
    let tests = []
    let _filter = this._getFilter()
    testItems.forEach((testItem) => {
      let t = testItem.props.test
      if (_filter(t)) {
        testItem.removeClass('sm-hidden')
        tests.push(t)
      } else {
        testItem.addClass('sm-hidden')
      }
    })
    const harness = this._getHarness()
    harness.runTests(tests, { stopOnError: this.state.stopOnError })
    this.refs.toggleRunButton.addClass('sm-running').removeClass('sm-stopped')
  }

  _getFilter () {
    // no pattern means we select all
    if (!this.state.filter) return () => { return true }

    const pattern = window.decodeURIComponent(this.state.filter)

    if (pattern.charCodeAt(0) === SLASH && pattern.charCodeAt(pattern.length - 1)) {
      let re = new RegExp(pattern.slice(1, -1))
      return (t) => {
        return re.exec(t.name)
      }
    }

    return t => (t.name === pattern)
  }

  _getHarness () {
    return this.props.harness
  }

  handleFocusTest (test) {
    const filter = window.encodeURIComponent(test.name)
    this.extendState({ filter })
    this.updateRoute()
  }

  updateRoute () {
    this.router.writeRoute(this.state)
  }

  onRouteChange (newState) {
    this.setState(newState)
  }

  onToggleHideSuccessful () {
    let checked = this.refs.hideCheckbox.htmlProp('checked')
    if (checked) {
      this.extendState({
        hideSuccessful: checked
      })
    } else {
      let newState = clone(this.state)
      delete newState.hideSuccessful
      this.setState(newState)
    }
    this.updateRoute()
  }

  onToggleStopOnError () {
    let checked = this.refs.stopOnErrorCheckbox.htmlProp('checked')
    if (checked) {
      this.extendState({
        stopOnError: checked
      })
    } else {
      let newState = clone(this.state)
      delete newState.stopOnError
      this.setState(newState)
    }
    this.updateRoute()
  }

  onToggleRun () {
    const harness = this._getHarness()
    if (harness.isRunning()) {
      harness.cancel()
      this.refs.toggleRunButton
        .removeClass('sm-running')
        .addClass('sm-stopped')
    } else {
      this.restart()
      this.refs.toggleRunButton
        .removeClass('sm-stopped')
        .addClass('sm-running')
    }
  }

  onClearFilter () {
    let newState = clone(this.state)
    delete newState.filter
    this.setState(newState)
    this.updateRoute()
  }

  onChangeFilter () {
    const filter = '/' + window.encodeURIComponent(this.refs.filterInput.el.getValue()) + '/'
    this.extendState({
      filter
    })
    this.updateRoute()
  }
}
