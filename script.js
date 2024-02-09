const socket = io('https://localhost:8000/')
const localVideo = document.getElementById('localVideo')
const remoteVideo = document.getElementById('remoteVideo')
const startGame = document.getElementById('startGame')
const joinGame = document.getElementById('joinGame')
let playerOne, playerTwo, remoteStream, localStream, localDescription, offerer

const configuration = {
    'iceServers': [
        {'urls': ['stun:stun.l.google.com:19302',
                  'stun:stun1.l.google.com:19302'
]}]}

const getMedia = async () => {
    const media = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
    })
    localStream = new MediaStream(media)
    localVideo.srcObject = localStream
    remoteVideo.srcObject = remoteStream
}

const initalizePeerConnection = async () => {
    offerer = true
    const peerConnection = new RTCPeerConnection(configuration)
    localStream.getTracks().forEach(track=>peerConnection.addTrack(track,localStream))
    const offer = await peerConnection.createOffer() // SDP
    localDescription = await peerConnection.setLocalDescription(offer)

    console.log(peerConnection)
    socket.emit('offer', offer)

    peerConnection.addEventListener('icecandidate', event => {
        if(event.candidate) {
            socket.emit('newICE',event.candidate)
            console.log(event.candidate)
        }
    })

}
const continuePeerConnection = async (connection) => {
    
}

socket.on('newConnection', connection=>{
    joinGame.innerHTML = ""
    const join = document.createElement("button")
    if (socket.id === connection.offerer )  join.innerText = "game request made" 
    else {
        join.addEventListener('click', continuePeerConnection(connection))
        join.innerText = `click to play ${connection.offerer}`
    }
    joinGame.appendChild(join)
})

startGame.addEventListener('click', ()=>initalizePeerConnection())

getMedia()



