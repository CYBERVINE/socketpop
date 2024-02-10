const fs = require('fs')
const https = require('https')
const express = require('express')
const cors = require('cors')
const socketio = require('socket.io')
const app = express()

app.use(express.static(__dirname))
app.use(cors())

const key = fs.readFileSync('cert.key')
const cert = fs.readFileSync('cert.crt')

const expressServer = https.createServer({cert, key}, app)
const io = new socketio.Server(expressServer,{
    cors: {
        origin: [
            "https://localhost",
            'https://192.168.1.72'
        ]
    }
})

let connections = []

io.on('connection', (socket)=> {
    socket.on('offer', offer=>{
        connections.push({
            offerer: socket.id,
            offer: offer,
            offererICE: [],
            answerer: null,
            answer: null,
            answererICE: []
        })
        console.log(offer)
        io.emit('newConnection', connections[connections.length-1])
    })

    socket.on('newICE', candidate => {
        let connection = connections.find(element => element.offerer === socket.id)
        if (connection){
            console.log(connection, "offer")
            connection.offererICE.push(candidate) 
            io.to(connection?.answerer).emit('newIceCandidate', candidate)
            return}
        connection = connections.find(element=>element.answerer === socket.id)
        if (connection){
            connection.answererICE.push(candidate) 
            console.log(connection, "answer")
            io.to(connection.offerer).emit('newIceCandidate', [candidate, connection.answer])
            return}
    })

    socket.on('answer', answer => {
        const connection = connections.find(connection => connection.offerer === answer[1])
        connection.answerer = socket.id
        connection.answer = answer[0]
    })

    // socket.on('disconnect', socket=>{
    //     console.log(socket,"disconnected")
    // })
})





expressServer.listen(8000)

