const http = require("http")
const socketio = require("socket.io")
const express = require("express")

const app = express()
const server = http.createServer(app)
const io = socketio(server)

module.exports = {
    app, server, io, express
}
