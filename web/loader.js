const loadModule = (uri, imports={}) => WebAssembly.instantiateStreaming(fetch(uri), { imports })
loadModule("hapt.wasm", { f: () => {} })