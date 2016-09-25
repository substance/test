import Component from 'substance/ui/Component'
import RenderingEngine from 'substance/ui/RenderingEngine'
import ResultItem from './ResultItem'

class TestItem extends Component {

  constructor(...args) {
    super(...args)

    this.onStart = this.onStart.bind(this)
    this.onResult = this.onResult.bind(this)
    this.onEnd = this.onEnd.bind(this)
  }

  didMount() {
    this.props.test.on('prerun', this.onStart)
    this.props.test.on('result', this.onResult)
    this.props.test.on('end', this.onEnd)
  }

  dispose() {
    this.props.test.removeListener('prerun', this.onStart)
    this.props.test.removeListener('result', this.onResult)
    this.props.test.removeListener('end', this.onEnd)
  }

  render($$) {
    let test = this.props.test
    let el = $$('div').addClass('sc-test')

    let header = $$('div').addClass('se-header')
    header.append($$('div').addClass('se-name').append(test.name))
    el.append(header)

    let controls = $$('span').addClass('se-controls').append(
      $$('button').addClass('se-run')
        .append('Run')
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

  onStart() {
    let test = this.props.test
    this.el.removeClass('sm-skip')
    if (test._skip) this.el.addClass('sm-skip')
    this.refs.results.empty()
    this.refs.sandbox.empty()
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