const express = require("express")
const elasticlunr = require("elasticlunr")
const { indexes } = require("../lunr")


const router = express.Router()

router.post("/addModel", (req, res) => {
    indexes[req.body.modelName] = elasticlunr()
    Promise.all(req.body.fields.map((field) => {
        console.log("adding field", field)
        indexes[req.body.modelName].addField(field)
        return true
    }))
    .then(() => {
        // indexes[req.body.modelName].saveDocument(true)
        res.status(200).json({ message: "Model added" })
        console.log(indexes)
    })
    .catch((error) => {
        console.error(error)
        res.status(500).json({ message: "Internal Server Error, see log for additional output" })
    })
})

router.get("/list", (req, res) => {

})

router.post("/deleteModel", (req, res) => {

})

module.exports.router = router
