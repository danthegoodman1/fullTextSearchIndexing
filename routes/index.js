const express = require("express")
const { indexes } = require("../lunr")

const router = express.Router()

router.post("/add", async (req, res) => { // TODO: Add indexing for id
    // Check for extra fields
    const listF = []
    const list = await Promise.all(Object.keys(req.body.doc).map((key) => {
        if (indexes[req.body.modelName]._fields.indexOf(key) < 0) {
            listF.push(key)
            return false
        }
        return true
    }))
    if (list.includes(false)) {
        res.status(500).json({ message: `extra fields in model, please remove`, extra: listF })
        return
    }
    // Check for missing fields
    const list2F = []
    const list2 = await Promise.all(indexes[req.body.modelName]._fields.map((key) => {
        if (Object.keys(req.body.doc).indexOf(key) < 0) {
            list2F.push(key)
            return false
        }
        return true
    }))
    if (list2.includes(false)) {
        res.status(500).json({ message: `missing fields in model, please add`, missing: list2F })
        return
    }
    // We all good
    indexes[req.body.modelName].addDoc(req.body.doc)
    res.json({ message: "Index added" })
})

router.post("/delete", (req, res) => {

})

router.get("/list", (req, res) => { // do we need this? coudly querying for everything just give this?

})

module.exports.router = router
