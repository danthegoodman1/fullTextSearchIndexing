const elasticlunr = require("elasticlunr")
const fs = require("fs")
const path = require("path")
const { app, server } = require("./http")
const model = require("./routes/models")
const querying = require("./routes/query")
const indexing = require("./routes/index")
const { indexes } = require("./utils")

app.use("/models", model.router)
app.use("/q", querying.router)
app.use("/index", indexing.router)

server.listen(process.env.PORT || 8080, async () => {
    // Saving interval
    if (process.env.SAVE_TO_DISK === "true") {
        // read from disk, load in
        if (fs.existsSync(path.join(__dirname, "saves"))) {
            console.log("Reading saved indexes from disk...")
            const files = fs.readdirSync(path.join(__dirname, "saves"))
            if (files.length < 1) {
                console.log("No indexes to load!")
            } else {
                await Promise.all(files.map((file) => {
                    const indexName = file.split(".")[0]
                    console.log(`Loading in index: ${indexName}`)
                    indexes[indexName] = elasticlunr.Index.load(JSON.parse(fs.readFileSync(path.join(__dirname, "saves", file), "utf-8")))
                    return true
                }))
                console.log("Loaded all indexes")
            }
        }
    }

    console.log(`Listening on port ${process.env.PORT || 8080}`)
})

module.exports.indexes = indexes
