const loadModule = (uri) => WebAssembly.instantiateStreaming(fetch(uri).then(response.blob()))