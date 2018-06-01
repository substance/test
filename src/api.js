import test from 'tape'
import addTestAPI from './addTestAPI'
// add some extensions
addTestAPI()

export { test }
export { default as getMountPoint } from './getMountPoint'
export { default as spy } from './spy'
export { default as testAsync } from './testAsync'
export { default as wait } from './wait'
