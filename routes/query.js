const express = require("express")
const { indexes } = require("../lunr")

const router = express.Router()

router.post("/", (req, res) => {
    const result = indexes[req.body.modelName].search(req.body.search, {
        fields: req.body.fields || {}
    })
    console.log(result)
    if (result.length < 1) {
        res.json({ message: "No results found!" })
        return
    }
    res.json({ result: indexes[req.body.modelName].documentStore.getDoc(result[0].ref) })
})

module.exports.router = router
