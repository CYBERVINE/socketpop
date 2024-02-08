const socket = io.connect('https://localhost:8000')


socket.on('hi', (socket) => {
    playerOne = socket
    console.log(playerOne)
})
