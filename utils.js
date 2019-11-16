const fs = require("fs")
const path = require("path")
const uid = require("uuid/v4")

const indexes = {}

module.exports.indexes = indexes

let adminkey

if (!fs.existsSync(path.join(__dirname, "adminkey"))) {
    console.log("Generating admin key...")
    adminkey = uid()
    fs.writeFileSync(path.join(__dirname, "adminkey"), adminkey)
} else {
    adminkey = fs.readFileSync(path.join(__dirname, "adminkey"), "utf-8")
}

module.exports.adminkey = adminkey

let clientkey

if (!fs.existsSync(path.join(__dirname, "clientkey"))) {
    console.log("Generating client key...")
    clientkey = uid()
    fs.writeFileSync(path.join(__dirname, "clientkey"), clientkey)
} else {
    clientkey = fs.readFileSync(path.join(__dirname, "clientkey"), "utf-8")
}

module.exports.clientkey = clientkey

let jwtsecret

if (!fs.existsSync(path.join(__dirname, "jwtsecret"))) {
    console.log("Generating jwt secret...")
    jwtsecret = uid()
    fs.writeFileSync(path.join(__dirname, "jwtsecret"), jwtsecret)
} else {
    jwtsecret = fs.readFileSync(path.join(__dirname, "jwtsecret"), "utf-8")
}

module.exports.jwtsecret = jwtsecret
