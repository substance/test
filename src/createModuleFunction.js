import TestFunction from './TestFunction'

export default function createModuleFunction(harness) {
  return function module(name, defaultOpts) {
    return new TestFunction(name, defaultOpts, harness)
  }
}
