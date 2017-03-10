import tape from 'tape'
import spy from './spy'
import createModuleFunction from './createModuleFunction'
import addTestAPI from './addTestAPI'

// add some extensions
addTestAPI()

const module = createModuleFunction()
// default module
const test = module()

export { tape, test, module, spy }
