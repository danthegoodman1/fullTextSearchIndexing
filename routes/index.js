const express = require("express")
const fs = require("fs")
const path = require("path")
const { indexes, adminkey } = require("../utils")

const router = express.Router()

const writeModel = (model) => {
    console.log(`Writing ${model} to disk`)
    if (!fs.existsSync(path.join(__dirname, "..", "saves"))) {
        fs.mkdirSync(path.join(__dirname, "..", "saves"))
    }
    fs.writeFileSync(path.join(__dirname, "..", "saves", model), JSON.stringify(indexes[model]))
}

router.post("/add", async (req, res) => { // TODO: Add indexing for id
    // Auth
    if (req.body.adminkey !== adminkey) {
        res.status(401).json({ message: "Unauthorized" })
        return
    }
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
        if (Object.keys(req.body.doc).indexOf(key) < 0 && key !== "id") {
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
    const theID = (+new Date).toString(36)
    req.body.doc.id = theID
    indexes[req.body.modelName].addDoc(req.body.doc)
    writeModel(req.body.modelName)
    res.json({ message: "Index added", id: theID })
})

router.post("/delete", (req, res) => {
    // Auth
    if (req.body.adminkey !== adminkey) {
        res.status(401).json({ message: "Unauthorized" })
        return
    }
    if (!req.body.modelName) {
        res.status(400).json({ message: "Missing modelName in JSON body" })
        return
    }
    if (!req.body.id) {
        res.status(400).json({ message: "Missing id in JSON body" })
        return
    }
    if (indexes[req.body.modelName].documentStore.docs[req.body.id]) {
        indexes[req.body.modelName].removeDocByRef(req.body.id)
        writeModel(req.body.modelName)
        res.json({ message: "Deleted index" })
    } else {
        res.status(400).json({ message: "Index with that id doesn't exist!" })
    }
})

router.post("/list", (req, res) => { // do we need this? coudly querying for everything just give this?
    // Auth
    if (req.body.adminkey !== adminkey) {
        res.status(401).json({ message: "Unauthorized" })
        return
    }
    if (!req.body.modelName) {
        res.status(400).json({ message: "Missing modelName in JSON body" })
        return
    }
    res.json({ indexes: indexes[req.body.modelName].documentStore.docs })
})

module.exports.router = router
