import { createServer } from "http"
import { createReadStream } from "fs"
import { stat } from "fs/promises"

const PORT = 3000
const STATIC_ROOT = "./web"

const map = {
    html: "text/html",
    css: "text/css",
    js: "text/javascript",
    json: "application/json",
    wasm: "application/wasm"
};

const mime = (url, res) => {
    const ext = url.substring(url.lastIndexOf(".") + 1, url.length);
    const type = map[ext];
    res.writeHead(200, { 'Content-Type': type ? type : "text/plain" })
}

const transform = (url) => {
    let output = STATIC_ROOT + url
    if (url.charAt(url.length - 1) === "/") output += "index.html"
    console.log(`request for ${output}`)
    return output
}

const err = (url, res) => {
    res.writeHead(404, `tried to get a file at location '${url}', but ain't shit there.`)
    res.end()
}

const server = createServer(async (req, res) => {
    const url = transform(req.url);
    try {
        const stats = await stat(url);
        if (stats.isFile()) {
            mime(url, res);
            const readStream = createReadStream(url);
            readStream.pipe(res);
        } else err(url, res)
    } catch (_) { err(url, res) }
});

server.listen(PORT, () => console.log(`server listening on port ${PORT}`));