const fs = require('fs')
const https = require('https')
const express = require('express')
// const cors = require('cors')
const socketio = require('socket.io')
const app = express()

app.use(express.static(__dirname))

const key = fs.readFileSync('cert.key')
const cert = fs.readFileSync('cert.crt')

const expressServer = https.createServer({cert, key}, app)
const io = new socketio.Server(expressServer)
// app.use(cors())

io.on('connection', (socket)=> {
    io.emit("hi", socket.id)
    console.log(socket.id)
})





expressServer.listen(8000)

