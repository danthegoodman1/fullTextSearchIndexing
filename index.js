const elasticlunr = require("elasticlunr")
const http = require("http")
const socketio = require("socket.io")
const express = require("express")

const app = express()
const server = http.createServer(app)
const io = socketio(server)
const index = elasticlunr()

// TODO: Add index model
// TODO: Query
// TODO: Remove index
// TODO: Add index

server.listen(process.env.PORT || 8080, () => {
    console.log(`Listening on port ${process.env.PORT || 8080}`)
})
