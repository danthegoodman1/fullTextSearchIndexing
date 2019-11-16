const express = require("express")
const elasticlunr = require("elasticlunr")
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

router.post("/addModel", (req, res) => {
    // Auth
    if (req.body.adminkey !== adminkey) {
        res.status(401).json({ message: "Unauthorized" })
        return
    }
    // check if model already exists
    if (indexes[req.body.modelName]) {
        res.status(400).json({ message: "Model already exists!" })
        return
    }
    indexes[req.body.modelName] = elasticlunr()
    Promise.all(req.body.fields.map((field) => {
        indexes[req.body.modelName].addField(field)
        return true
    }))
    .then(() => {
        // indexes[req.body.modelName].saveDocument(true)
        writeModel(req.body.modelName)
        res.status(200).json({ message: "Model added" })
    })
    .catch((error) => {
        console.error(error)
        res.status(500).json({ message: "Internal Server Error, see log for additional output" })
    })
})

router.post("/list", (req, res) => {
    // Auth
    if (req.body.adminkey !== adminkey) {
        res.status(401).json({ message: "Unauthorized" })
        return
    }
    res.json({ models: Object.keys(indexes) })
})

router.post("/deleteModel", (req, res) => {
    // Auth
    if (req.body.adminkey !== adminkey) {
        res.status(401).json({ message: "Unauthorized" })
        return
    }
})

module.exports.router = router
