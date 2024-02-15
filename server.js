const fs = require('fs')
const http = require('http')
const express = require('express')
const cors = require('cors')
const socketio = require('socket.io')
const app = express()

app.use(express.static(__dirname))
app.use(cors())

const expressServer = http.createServer(app)
const io = new socketio.Server(expressServer)

let connections = []
let players = []
let gameId

io.on('connection', (socket)=> {
    players.push({socketId:socket.id,score:0})
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
            return
        }
        connection = connections.find(element=>element.answerer === socket.id)
        if (connection){
            connection.answererICE.push(candidate) 
            console.log(connection, "answer")
            io.to(connection.offerer).emit('newIceCandidate', [candidate, connection.answer])
        }
    })

    socket.on('answer', (answer, ackFunc) => {
        const connection = connections.find(connection => connection.offerer === answer[1])
        connection.answerer = socket.id
        connection.answer = answer[0]
        ackFunc(connection)
    })

    ////////////////// GAME LISTENERS /////////////////////

    socket.on('gameOn', ()=>{
        io.emit('resetButton')
        gameId = setInterval(()=>{
            io.emit('game-state', [Math.floor(Math.random()*8),Math.floor(Math.random()*2)])
        },(500 + Math.random()*4000))
    })

    socket.on('reset',()=>{
        players.forEach(player=>{
            player.score = 0
        })
        io.emit('clearGame')
    })

    socket.on('clicked', discId=>{
        io.emit('toggle', discId)
        const player = players.find(player=>player.socketId === socket.id)
        player.score++
        io.emit('player-score',player)
    })
    
    socket.on('mouse-position',mousePosition=>{
        socket.broadcast.emit('opponent',mousePosition)
    })
    
    socket.on('disconnect', socket=>{
        console.log(socket,"disconnected")
        clearInterval(gameId)
    })
})


setInterval(()=>{
    players = []
    connections = []
},86400000)



expressServer.listen(8000)

