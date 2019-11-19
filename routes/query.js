const express = require("express")
const { indexes, adminkey, clientkey } = require("../utils")
const { ws } = require("../http")

const router = express.Router()

router.post("/", async (req, res) => { // NOTE: add pagination/limit?
    // Auth
    if ((req.body.adminkey && req.body.adminkey !== adminkey) || (req.body.clientkey && req.body.clientkey !== clientkey)) {
        res.status(401).json({ message: "Unauthorized" })
    }
    if (!indexes[req.body.modelName]) {
        res.status(400).json({ message: "Model doesn't exist!" })
    }
    const result = indexes[req.body.modelName].search(req.body.search, {
        fields: req.body.fields || undefined,
        expand: req.body.expand || false
    })
    if (result.length < 1) {
        res.json({ message: "No results found!" })
        return
    }
    const results = []
    await Promise.all(result.map((r, i) => {
        results[i] = indexes[req.body.modelName].documentStore.getDoc(result[i].ref)
        results[i].score = result[i].score
        return true
    }))
    res.json({ results })
})

ws.on("connection", (socket, req) => {
    socket.on("message", async (msg) => {
        const query = JSON.parse(msg)
        if (indexes[query.modelName]) {
            const result = indexes[query.modelName].search(query.search, {
                fields: query.fields || undefined,
                expand: query.expand || false
            })
            const results = []
            await Promise.all(result.map((r, i) => {
                results[i] = indexes[query.modelName].documentStore.getDoc(result[i].ref)
                results[i].score = result[i].score
                return true
            }))
            socket.send(JSON.stringify(results))
        }
    })
})

module.exports.router = router
