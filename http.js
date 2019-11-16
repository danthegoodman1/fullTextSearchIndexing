const http = require("http")
const express = require("express")
const WebSocket = require("ws")
const jwt = require("jsonwebtoken")
const cors = require("cors")
const querystring = require("querystring")
const { jwtsecret, clientkey } = require("./utils")

const app = express()
app.use(cors())
const server = http.createServer(app)
// http://iostreamer.me/ws/node.js/jwt/2016/05/08/websockets_authentication.html
const ws = new WebSocket.Server({
    server
})

server.on("upgrade", (req, socket, head) => {
    const { token } = querystring.parse(req.url.replace("/?", ""))
    jwt.verify(token, jwtsecret, (err, decoded) => {
        if (err) {
            socket.destroy()
        }
    })
})

app.post("/auth/generatejwt", (req, res) => {
    if (req.body.clientkey !== clientkey) {
        res.status(403).json({ message: "Unauthorized" })
        return
    }
    const token = jwt.sign({ user: "client" }, jwtsecret, { expiresIn: "12h" }) // token expire every 12 hours
    res.json({ token })
})

module.exports = {
    app, server, ws
}
