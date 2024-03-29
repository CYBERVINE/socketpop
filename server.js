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
let playerOne = {}
let playerTwo = {}
let gameId

io.on('connection', (socket)=> {
    if (!playerTwo.socketId){
        socket.emit('openOffer',connections[connections.length-1])
    }
    if (playerOne.socketId && playerTwo.socketId){
        socket.emit("gameInProgress")
    }
    socket.on('offer', offer=>{
        playerOne = {socketId:socket.id,score:0}
        connections.push({
            offerer: socket.id,
            offer: offer,
            offererICE: [],
            answerer: null,
            answer: null,
            answererICE: []
        })
        io.emit('newConnection', connections[connections.length-1])
    })

    socket.on('newICE', candidate => {
        let connection = connections.find(element => element.offerer === socket.id)
        if (connection){
            connection.offererICE.push(candidate) 
            io.to(connection?.answerer).emit('newIceCandidate', candidate)
            return
        }
        connection = connections.find(element=>element.answerer === socket.id)
        if (connection){
            connection.answererICE.push(candidate) 
            io.to(connection.offerer).emit('newIceCandidate', [candidate, connection.answer])
        }
    })
    
    socket.on('answer', (answer, ackFunc) => {
        const connection = connections.find(connection => connection.offerer === answer[1])
        connection.answerer = socket.id
        connection.answer = answer[0]
        playerTwo = {socketId:socket.id,score:0}
        ackFunc(connection)
    })
    
    ////////////////// GAME LISTENERS /////////////////////
    
    // need game on to only emit to the connectioned sockets

    socket.on('gameOn', ()=>{
        io.emit('gameInProgress')
        io.to(playerOne.socketId).to(playerTwo.socketId).emit('resetButton')
        gameId = setInterval(()=>{
            io.emit('game-state', [Math.floor(Math.random()*8),Math.floor(Math.random()*2)])
        },(500 + Math.random()*4000))
    })
    
    socket.on('reset',()=>{
        playerOne.score = 0
        playerTwo.score = 0
        io.emit('clearGame')
    })
    
    socket.on('clicked', discId=>{
        if (socket.id === playerOne.socketId || socket.id === playerTwo.socketId) {
            io.emit('toggle', discId)
            const player = socket.id === playerOne.socketId ? playerOne : playerTwo
            player.score++
            io.emit('player-score',player)
        }
    })
    
    socket.on('mouse-position',mousePosition=>{
        if (socket.id === playerOne.socketId || socket.id === playerTwo.socketId) {
            if (socket.id === playerOne.socketId) {
                socket.to(playerTwo.socketId).emit('opponent',mousePosition)
            } else if (socket.id === playerTwo.socketId) {
                socket.to(playerOne.socketId).emit('opponent',mousePosition)
            }
        }
    })
    
    socket.on('disconnecting', reason=>{
        clearInterval(gameId)
        for (i=0;i<connections.length;i++){
            if (connections[i].offerer === socket.id || connections[i].answerer === socket.id){
                const otherSocket = socket.id === connections[i].offerer ? connections[i].answerer : connections[i].offerer 
                socket.to(otherSocket).emit("opponentLeft")
                connections.splice(i,1)
            }
        }
        if (socket.id === playerOne.socketId){playerOne={}}
        if (socket.id === playerTwo.socketId){playerTwo={}}
    })
})


expressServer.listen(8000)

