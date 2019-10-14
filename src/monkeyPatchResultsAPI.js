import { platform } from 'substance'

import tape from 'tape'

// monkey-patch tape/lib/Results so that
// Results.createStream() does not start execution

const Results = tape.Results

if (platform.inBrowser) {
  Results.prototype.createStream = function () {
    // NOTE: in /.make/tape.js I have exposed some extras
    let output = tape.resumer()
    output.queue('TAP version 13\n')
    this._stream.pipe(output)
    return output
  }
}
