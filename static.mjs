import { createServer } from "http"
import { createReadStream } from "fs"
import { createGzip } from "zlib"
import { stat } from "fs/promises"

const PORT = 3000
const STATIC_ROOT = "./web"

const CACHE_AGE = 60
const CACHE_HEADER = `public, max-age=${CACHE_AGE}`

const map = {
    html: "text/html",
    css: "text/css",
    js: "text/javascript",
    json: "application/json",
    wasm: "application/wasm"
}

const mime = (url, res) => {
    const ext = url.substring(url.lastIndexOf(".") + 1, url.length);
    const type = map[ext];
    res.writeHead(200, "epic swag", { 'Content-Type': type ? type : "text/plain" })
}

const transform = (url) => {
    let output = STATIC_ROOT + url
    if (url.charAt(url.length - 1) === "/") output += "index.html"
    return output
}

const err = (url, res) => {
    console.log(`request for ${url} (not found)`)
    res.writeHead(404, `tried to get a file at location '${url}', but ain't shit there.`)
    res.end()
}

const check_cache = (url, stats, req, res) => {
    if (new Date(req.headers["If-Modified-Since"]) >= stats.mtime) {
        console.log(`request for ${url} (cached)`)
        res.writeHead(304, "your cache is good, champ.")
        res.end()
        return true
    }
}

const server = createServer(async (req, res) => {
    const url = transform(req.url);
    try {
        const stats = await stat(url);
        if (stats.isFile()) {
            res.setHeader("Content-Encoding", "gzip")
            res.setHeader("Cache-Control", CACHE_HEADER)
            res.setHeader("Last-Modified", stats.mtime.toUTCString())
            if (check_cache(url, stats, req, res)) return
            console.log(`request for ${url}`)
            mime(url, res);
            createReadStream(url).pipe(createGzip()).pipe(res);
        } else err(url, res)
    } catch (_) { err(url, res) }
})

server.listen(PORT, () => console.log(`server listening on port ${PORT}`));