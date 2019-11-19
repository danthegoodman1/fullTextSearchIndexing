const express = require("express")
const fetch = require("node-fetch")
const _ = require("lodash")
const { indexes, adminkey, clientkey } = require("../utils")
const { ws } = require("../http")

const router = express.Router()

/**
 * @description Uses the DataMuse API to find similar terms to what a user has searched for
 * @param {Object} query Query object
 * @returns {Promise} containing array of new index queries (searches)
 */
const likeSearch = (query) => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.datamuse.com/words?ml=${encodeURI(query.search)}`)
        .then((res) => res.json())
        .then(async (res) => {
            let newQueries = []
            let theList = res.slice(0, query.fuzzy.length)
            for (item of theList) {
                newQueries.push(item.word)
            }
            resolve(newQueries)
        })
        .catch((error) => {
            console.error("Error contacting datamuse api:")
            console.error(error)
            reject(error)
        })
    })
}

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
    let results = []
    await Promise.all(result.map((r, i) => {
        results[i] = indexes[req.body.modelName].documentStore.getDoc(r.ref)
        results[i].score = r.score
        return true
    }))
    if (req.body.fuzzy && req.body.fuzzy.length) { // DataMuse API
        await likeSearch(req.body)
        .then(async (newSearches) => {
            await Promise.all(newSearches.map(async (item) => {
                const newRes = indexes[req.body.modelName].search(item, {
                    fields: req.body.fields || undefined,
                    expand: req.body.expand || false
                })
                if (newRes.length < 1) { return }
                await Promise.all(newRes.map((r) => {
                    results.push({
                        ...indexes[req.body.modelName].documentStore.getDoc(r.ref),
                        score: r.score
                    })
                    return true
                }))
                return true
            }))
        })
        results = _.orderBy(results, "score", "desc")
    }
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
