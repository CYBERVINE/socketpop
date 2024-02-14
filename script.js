// const socket = io('http://localhost:8000/')
const socket = io('https://socketpop.onrender.com/')
const localVideo = document.getElementById('localVideo')
const remoteVideo = document.getElementById('remoteVideo')
const startGame = document.getElementById('startGame')
const menu = document.getElementById('menu')
let remoteStream, localStream, localDescription, offerer

const configuration = {
    'iceServers': [
        {'urls': ['stun:stun.l.google.com:19302',
                  'stun:stun1.l.google.com:19302'
]}]}

const peerConnection = new RTCPeerConnection(configuration)

peerConnection.addEventListener('icecandidate', event => {
    console.log(event.candidate)
    if(event.candidate) {
        socket.emit('newICE',event.candidate)
    }
})
peerConnection.addEventListener('track', event => {
    remoteVideo.srcObject = event.streams[0]
})

const getMedia = async () => {
    const media = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    })
    localStream = new MediaStream(media)
    localVideo.srcObject = localStream
    localStream.getTracks().forEach(track=>{
        console.log(track)
        peerConnection.addTrack(track,localStream)})
}

const createConnection = async (connection) => {
    await getMedia()
    if (connection === undefined){
        const offer = await peerConnection.createOffer() // SDP
        localDescription = await peerConnection.setLocalDescription(offer)
        socket.emit('offer', offer)
    } else {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(connection.offer))
        const answer = await peerConnection.createAnswer() 
        await peerConnection.setLocalDescription(answer)
        const offer = await socket.emitWithAck('answer', [answer, connection.offerer])
        offer.offererICE.forEach(ICE=>peerConnection.addIceCandidate(ICE))
        socket.emit('gameOn')
    }
    console.log(peerConnection)
}

socket.on('newConnection', connection=>{
    menu.innerHTML = ""
    const join = document.createElement("button")
    if (socket.id === connection.offerer )  join.innerText = "game request made" 
    else {
        join.addEventListener('click', ()=> createConnection(connection))
        join.innerText = "Join Game"
    }
    menu.appendChild(join)
})

socket.on('newIceCandidate', async answer => {
    if(!peerConnection.remoteDescription){
        await peerConnection.setRemoteDescription( new RTCSessionDescription(answer[1]))
    }
    peerConnection.addIceCandidate(answer[0])
})

startGame.addEventListener('click', ()=>createConnection())


