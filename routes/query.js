const express = require("express")
const { indexes } = require("../utils")

const router = express.Router()

router.post("/", async (req, res) => { // NOTE: add pagination/limit?
    const result = indexes[req.body.modelName].search(req.body.search, {
        fields: req.body.fields || undefined
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

module.exports.router = router
