import tape from 'tape'
import spy from './spy'
import createModuleFunction from './createModuleFunction'
import addTestAPI from './addTestAPI'

// add some extensions
addTestAPI()

export { tape, test, module, spy }
