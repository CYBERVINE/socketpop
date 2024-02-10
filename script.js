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
}

const createPeerConnection = async (connection) => {
    console.log(connection)
    const peerConnection = new RTCPeerConnection(configuration)
    if (connection === undefined){
        localStream.getTracks().forEach(track=>{
            console.log(track)
            peerConnection.addTrack(track,localStream)})
        const offer = await peerConnection.createOffer() // SDP
        localDescription = await peerConnection.setLocalDescription(offer)
        socket.emit('offer', offer)
    } else {
        peerConnection.setRemoteDescription(new RTCSessionDescription(connection.offer))
        localStream.getTracks().forEach(track=>{
            console.log(track)
            peerConnection.addTrack(track,localStream)})
        const answer = await peerConnection.createAnswer() //SDP
        await peerConnection.setLocalDescription(answer)
        console.log(answer)
        socket.emit('answer', [answer, connection.offerer])
    }
    console.log(peerConnection)
    peerConnection.addEventListener('icecandidate', event => {
        if(event.candidate) {
            socket.emit('newICE',event.candidate)
        }
    })
    peerConnection.addEventListener('track', event => {
        console.log(event)
        remoteVideo.srcObject = remoteStream
    })
}

//i need to set remote description on the offerer browser

socket.on('newConnection', connection=>{
    joinGame.innerHTML = ""
    const join = document.createElement("button")
    if (socket.id === connection.offerer )  join.innerText = "game request made" 
    else {
        join.addEventListener('click', ()=> createPeerConnection(connection))
        join.innerText = `click to play ${connection.offerer}`
    }
    joinGame.appendChild(join)
})

socket.on('newIceCandidate', candidate => {
    console.log(candidate)

})

startGame.addEventListener('click', ()=>createPeerConnection())

getMedia()