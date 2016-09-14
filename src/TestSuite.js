import startsWith from 'lodash/startsWith'
import clone from 'lodash/clone'
import { Component, Router } from 'substance'
import TestItem from './TestItem'

class TestSuite extends Component {

  constructor(...args) {
    super(...args)

    let moduleNames = {}
    this.props.harness.getTests().forEach(function(t) {
      if (t.moduleName) {
        moduleNames[t.moduleName] = true
      }
    })
    this.moduleNames = Object.keys(moduleNames)
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
    header.append(
      $$('div').addClass('se-logo').append('Substance TestSuite')
    )
    el.append(header)

    let toolbar = $$('div').addClass('se-toolbar')
    let moduleSelect = $$('select').ref('moduleNames')
    moduleSelect.append($$('option').attr('value', '').append('---   All   --'))
    this.moduleNames.forEach(function(moduleName) {
      let option = $$('option').attr('value', moduleName).append(moduleName)
      if (moduleName === state.filter) option.attr('selected', true)
      moduleSelect.append(option)
    })
    moduleSelect.on('change', this.onModuleSelect)
    toolbar.append(moduleSelect)
    toolbar.append(
      $$('div').append(
        $$('input').attr({ type: 'checkbox' })
          .on('change', this.onToggleHideSuccessful).ref('hideCheckbox'),
        $$('label').append('Only show failed tests only')
      )
    )

    el.append(toolbar)

    let body = $$('div').addClass('se-body')

    let tests = $$('div').addClass('se-tests').ref('tests')
    this.props.harness.getTests().forEach(function(test) {
      let testItem = $$(TestItem, { test: test })
      if (!_filter(test.moduleName, filter)) {
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

  didUpdate() {
    this.runTests()
  }

  runTests() {
    let testItems = this.refs.tests.getChildren()
    let tests = []
    let filter = this.state.filter || ''
    testItems.forEach(function(testItem) {
      let t = testItem.props.test
      if(_filter(t.moduleName, filter)) {
        testItem.removeClass('sm-hidden')
        tests.push(t)
      } else {
        testItem.addClass('sm-hidden')
      }
    })
    this.props.harness.runTests(tests)
  }

  onModuleSelect() {
    let filter = this.refs.moduleNames.htmlProp('value')
    this.extendState({
      filter: filter
    })
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
}

function _filter(name, f) {
  return startsWith(name, f)
}

export default TestSuite
