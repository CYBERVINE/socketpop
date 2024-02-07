const socket = io.connect('https://localhost:8000')

socket.on('hi', data => console.log(data))