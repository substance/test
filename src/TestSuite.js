import clone from 'substance/util/clone'
import Component from 'substance/ui/Component'
import Router from 'substance/ui/Router'
import TestItem from './TestItem'

const TILDE = '~'.charCodeAt(0)
const CARET = '^'.charCodeAt(0)
const SLASH = '/'.charCodeAt(0)

class TestSuite extends Component {

  constructor(...args) {
    super(...args)

    this.moduleNames = this.props.harness.getModuleNames()

    this.handleAction('focusTest', this.handleFocusTest)
  }

  didMount() {
    this.router.on('route:changed', this.onRouteChange, this)
    this.router.start()
    this.runTests()
  }

  dispose() {
    this.router.off(this)
  }

  getInitialState() {
    this.router = new Router()
    return this.router.readRoute()
  }

  render($$) {
    let el = $$('div').addClass('sc-test-suite')

    let state = this.state
    let filter = this.state.filter || ''

    let header = $$('div').addClass('se-header')
    let title = this.props.title || window.document.title || 'TestSuite'
    header.append(
      $$('div').addClass('se-logo').append(title)
    )
    el.append(header)

    let toolbar = $$('div').addClass('se-toolbar')
    if (this.moduleNames && this.moduleNames.length > 0) {
      let moduleSelect = $$('select').ref('moduleNames')
      moduleSelect.append($$('option').attr('value', '').append('---   All   --'))
      this.moduleNames.forEach(function(moduleName) {
        let option = $$('option').attr('value', moduleName).append(moduleName)
        if (moduleName === state.filter) option.attr('selected', true)
        moduleSelect.append(option)
      })
      moduleSelect.on('change', this.onModuleSelect)
      toolbar.append(moduleSelect)
    }

    let hideSuccessfulCheckbox = $$('input').ref('hideCheckbox')
      .attr('type', 'checkbox')
      .htmlProp('checked', state.hideSuccessful)
      .on('change', this.onToggleHideSuccessful)
    toolbar.append(
      $$('div').append(
        hideSuccessfulCheckbox,
        $$('label').append('Only show failed tests')
      )
    )
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

    el.append(toolbar)

    let body = $$('div').addClass('se-body')

    let _filter = this._getFilter()
    let tests = $$('div').addClass('se-tests').ref('tests')
    this.props.harness.getTests().forEach(function(test) {
      let testItem = $$(TestItem, { test: test }).ref(test.name)
      if (!_filter(test)) {
        testItem.addClass('sm-hidden')
      }
      tests.append(testItem)
    })

    body.append(tests)
    el.append(body)

    if (this.state.hideSuccessful) {
      el.addClass('sm-hide-successful')
    }

    return el
  }

  didUpdate(oldProps, oldState) {
    if (this.state.filter !== oldState.filter) {
      this.runTests()
    }
  }

  runTests() {
    // console.log('Running tests...')
    let testItems = this.refs.tests.getChildren()
    let tests = []
    let _filter = this._getFilter()
    testItems.forEach(function(testItem) {
      let t = testItem.props.test
      if(_filter(t)) {
        testItem.removeClass('sm-hidden')
        tests.push(t)
      } else {
        testItem.addClass('sm-hidden')
      }
    })
    const harness = this.props.harness
    harness.runTests(tests)
  }

  _getFilter() {
    // no pattern means we select all
    if (!this.state.filter) return () => { return true }

    const pattern = window.decodeURIComponent(this.state.filter)

    if (pattern.charCodeAt(0) === SLASH && pattern.charCodeAt(pattern.length-1)) {
      let re = new RegExp(pattern.slice(1,-1))
      return (t) => {
        return re.exec(t.name)
      }
    }

    // legacy
    if (pattern.charCodeAt(0) === CARET) {
      let re = new RegExp(pattern)
      return (t) => {
        return re.exec(t.name)
      }
    }

    if (pattern.charCodeAt(0) === TILDE) {
      let moduleName = pattern.slice(1)
      return (t) => {
        return t.moduleName === moduleName
      }
    }

    return t => (t.name === pattern)
  }

  onModuleSelect() {
    let filter = window.encodeURIComponent('~'+this.refs.moduleNames.htmlProp('value'))
    this.extendState({
      filter: filter
    })
    this.updateRoute()
  }

  handleFocusTest(test) {
    const filter = window.encodeURIComponent(test.name)
    this.extendState({ filter })
    this.updateRoute()
  }

  updateRoute() {
    this.router.writeRoute(this.state)
  }

  onRouteChange(newState) {
    this.setState(newState)
  }

  onToggleHideSuccessful() {
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

  onClearFilter() {
    let newState = clone(this.state)
    delete newState.filter
    this.setState(newState)
    this.updateRoute()
  }

  onChangeFilter() {
    const filter = '/' + window.encodeURIComponent(this.refs.filterInput.el.getValue()) + '/'
    this.extendState({
      filter
    })
    this.updateRoute()
  }
}

export default TestSuite
