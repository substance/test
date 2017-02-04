export default function getTestArgs(args) {
  let name = '(anonymous)'
  let opts = {}
  let cb
  for (let i = 0; i < args.length; i++) {
    let arg = args[i]
    let t = typeof arg
    if (t === 'string') {
      name = arg
    }
    else if (t === 'object') {
      opts = arg || opts
    }
    else if (t === 'function') {
      cb = arg
    }
  }
  return { name, opts, cb }
}