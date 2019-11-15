const elasticlunr = require("elasticlunr")
const fs = require("fs")
const path = require("path")
const { app, server, io } = require("./http")
const model = require("./routes/models")
const querying = require("./routes/query")
const indexing = require("./routes/index")

let index // fill in server.listen

app.use("/models", model.router)
app.use("/q", querying.router)
app.use("/index", indexing.router)

server.listen(process.env.PORT || 8080, () => {
    // Saving interval
    if (process.env.SAVE_TO_DISK === "true") {
        // read from disk, load in
        if (fs.existsSync(path.join(__dirname, "save.json"))) {
            index = elasticlunr.Index.load(JSON.parse(fs.readFileSync(path.join(__dirname, "save.json"), "utf-8")))
        }
        // set interval to write to disk
        setInterval(() => {
            fs.writeFileSync(path.join(__dirname, "save.json"), JSON.stringify(index))
            console.log("Writing out to save.json...")
        }, 30000) // every 30 seconds
    } else {
        index = elasticlunr()
    }

    console.log(`Listening on port ${process.env.PORT || 8080}`)
})
