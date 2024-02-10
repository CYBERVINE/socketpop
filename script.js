const socket = io('https://localhost:8000/')
// const socket = io('https://192.168.1.72:8000/')
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

const peerConnection = new RTCPeerConnection(configuration)

const createPeerConnection = async (connection) => {
    localStream.getTracks().forEach(track=>{
        console.log(track)
        peerConnection.addTrack(track,localStream)})

    console.log(connection)
    if (connection === undefined){
        const offer = await peerConnection.createOffer() // SDP
        localDescription = await peerConnection.setLocalDescription(offer)
        socket.emit('offer', offer)
    } else {
        console.log(connection)// use this socket id to get recent offerer
        await peerConnection.setRemoteDescription(new RTCSessionDescription(connection.offer))
        const answer = await peerConnection.createAnswer() //SDP
        await peerConnection.setLocalDescription(answer)
        // remoteVideo.srcObject = peerConnection.MediaStream
        console.log(connection.tracks)
        const offer = await socket.emitWithAck('answer', [answer, connection.offerer])
        offer.offererICE.forEach(ICE=>peerConnection.addIceCandidate(ICE))
        console.log(offer)
        console.log(peerConnection)
    }
    console.log(peerConnection)
    peerConnection.addEventListener('icecandidate', event => {
        console.log(event.candidate)
        if(event.candidate) {
            socket.emit('newICE',event.candidate)
        }
    })
    peerConnection.addEventListener('track', event => { //answerer neeed tracks
        console.log(event)
        remoteVideo.srcObject = event.streams[0]
    })
}

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

socket.on('newIceCandidate', async answer => {
    if(!peerConnection.remoteDescription){
        await peerConnection.setRemoteDescription( new RTCSessionDescription(answer[1]))
    }
    peerConnection.addIceCandidate(answer[0])

})

startGame.addEventListener('click', ()=>createPeerConnection())

getMedia()