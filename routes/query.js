const express = require("express")
const fetch = require("node-fetch")
const _ = require("lodash")
const Typo = require("typo-js")
const { indexes, adminkey, clientkey } = require("../utils")
const { ws } = require("../http")

const router = express.Router()
const dic = new Typo("en_US") // Language

/**
 * @description Uses the DataMuse API to find similar terms to what a user has searched for
 * @param {Object} query Query object
 * @returns {Promise} containing array of new index queries (searches)
 */
const likeSearch = (query, length) => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.datamuse.com/words?ml=${encodeURI(query)}`)
        .then((res) => res.json())
        .then(async (res) => {
            const newQueries = []
            const theList = res.slice(0, length)
            await Promise.all(theList.map((item) => {
                newQueries.push(item.word)
                return true
            }))
            resolve(newQueries)
        })
        .catch((error) => {
            console.error("Error contacting datamuse api:")
            console.error(error)
            reject(error)
        })
    })
}

const typoSearch = (query) => {
    return new Promise((resolve, reject) => {
        if (!query.search.includes(" ") && !dic.check(query.search)) { // if no space (single word), and is misspelled
            const sugs = dic.suggest(query.search)
            resolve(sugs.slice(0, query.typoStrength)) // Return slice of array
        }
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
    let results = []
    await Promise.all(result.map((r, i) => {
        results[i] = indexes[req.body.modelName].documentStore.getDoc(r.ref)
        results[i].score = r.score
        return true
    }))
    const searches = [req.body.search]
    if (req.body.typoStrength && req.body.typoStrength > 0) { // Typo correction
        await typoSearch(req.body)
        .then(async (newSearches) => {
            await Promise.all(newSearches.map(async (item) => {
                searches.push(item)
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
        .catch((e) => {
            console.error("Error Getting typos")
            console.error(e)
        })
    }
    if (req.body.fuzzy && req.body.fuzzy.length) { // DataMuse API
        await Promise.all(searches.map(async (aSearch) => {
            await likeSearch(aSearch, req.body.fuzzy.length)
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
            return true
        }))
    }
    if (results.length < 1) {
        res.json({ message: "No results found!" })
        return
    }
    results = _.orderBy(results, "score", "desc")
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
