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

let connections = []
let sockets = []

io.on('connection', (socket)=> {
    sockets.push(socket)

    socket.on('offer', offer=>{
        connections.push({
            offerer: socket.id,
            offer: offer,
            offererICE: [],
            answerer: null,
            anser: null,
            answererICE: []

        })
        io.emit('newConnection', connections[connections.length-1])
    })

    socket.on('newICE', candidate => {
        console.log("socket",socket.id)
        let connectionOfferer
        connections.forEach(c=>{
            console.log((c.offerer === socket.id))
            if (c.offerer === socket.id) connectionOfferer = c
        })
        console.log(connectionOfferer)
        if (connectionOfferer){
            connectionOfferer.offererICE.push(candidate) 
            return}
        
        const connectionAnswerer = connections.find((c)=>c.answerer===socket.id)
        console.log(connectionAnswerer)
        if (connectionAnswerer){
            connectionAnswerer.answererICE.push(candidate) 
            return}
    })

    socket.on('disconnect', socket=>{
        console.log(socket,"disconnected")
    })
})





expressServer.listen(8000)

