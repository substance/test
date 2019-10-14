import tape from 'tape'
import addTestAPI from './addTestAPI'

const testFunc = tape
addTestAPI(tape.Test)

export default testFunc
