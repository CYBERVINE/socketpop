const socket = io('https://localhost:8000/')
// const socket = io('https://192.168.1.72:8000/')
const localVideo = document.getElementById('localVideo')
const remoteVideo = document.getElementById('remoteVideo')
const startGame = document.getElementById('startGame')
const joinGame = document.getElementById('joinGame')
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
        audio: false
    })
    localStream = new MediaStream(media)
    localVideo.srcObject = localStream
    localStream.getTracks().forEach(track=>{
        console.log(track)
        peerConnection.addTrack(track,localStream)})
}

const createConnection = async (connection) => {
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
    }
    console.log(peerConnection)
}

socket.on('newConnection', connection=>{
    joinGame.innerHTML = ""
    const join = document.createElement("button")
    if (socket.id === connection.offerer )  join.innerText = "game request made" 
    else {
        join.addEventListener('click', ()=> createConnection(connection))
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

startGame.addEventListener('click', ()=>createConnection())

getMedia()

















// const socket = io('https://localhost:8000/')
// // const socket = io('https://192.168.1.72:8000/')
// const localVideo = document.getElementById('localVideo')
// const remoteVideo = document.getElementById('remoteVideo')
// const startGame = document.getElementById('startGame')
// const joinGame = document.getElementById('joinGame')
// let playerOne, playerTwo, remoteStream, localStream, localDescription, offerer

// const configuration = {
//     'iceServers': [
//         {'urls': ['stun:stun.l.google.com:19302',
//                   'stun:stun1.l.google.com:19302',
//                   "stun:stun2.l.google.com:19302",
//                     "stun:stun3.l.google.com:19302",
//                     "stun:stun4.l.google.com:19302",
//                     "stun:stun01.sipphone.com",
//                     "stun:stun.ekiga.net",
//                     "stun:stun.fwdnet.net",
//                     "stun:stun.ideasip.com",
// ]}]}

// const peerConnection = new RTCPeerConnection(configuration)

// const getMedia = () => {
//     return new Promise(async(resolve, reject)=>{
//         try{
//     const media = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         // audio: false
//     })
//         localVideo.srcObject = media
//         localStream = media
//         localStream.getTracks().forEach(track=>{
//             console.log(track)
//             peerConnection.addTrack(track,localStream)})
//         resolve();    
//     }catch(err){
//         console.log(err);
//         reject()
//     }})
// }

// const createPeerConnection = async (connection) => {
//    return new Promise(async(resolve, reject)=>{
//     remoteStream = new MediaStream()
//     remoteVideo.srcObject = remoteStream
//     peerConnection.addEventListener('icecandidate', event => {
//         console.log(event.candidate)
//         if(event.candidate) {
//             socket.emit('newICE',event.candidate)
//         }
//     })
//     peerConnection.addEventListener('track', event => { // answerer neeed tracks
//         console.log(event)
//         remoteVideo.srcObject = event.streams[0]
//     })

//     console.log(connection)

//     if (connection === undefined){
//         const offer = await peerConnection.createOffer()
//         localDescription = await peerConnection.setLocalDescription(offer)
//         socket.emit('offer', offer)
//         console.log(peerConnection.getTransceivers())
//     } else {
//         console.log(connection)
//         await peerConnection.setRemoteDescription(new RTCSessionDescription(connection.offer))
//         const answer = await peerConnection.createAnswer({}) //this object
//         const offer = await socket.emitWithAck('answer', [answer, connection.offerer])
//         offer.offererICE.forEach(ICE=>peerConnection.addIceCandidate(ICE))
//         await peerConnection.setLocalDescription(answer)
//         console.log(connection.tracks)
//         console.log(offer)
//         console.log(peerConnection)
//     }

//     // peerConnection.addEventListener('icecandidate', event => {
//     //     console.log(event.candidate)
//     //     if(event.candidate) {
//     //         socket.emit('newICE',event.candidate)
//     //     }
//     // })
//     // peerConnection.addEventListener('track', event => { // answerer neeed tracks
//     //     console.log(event)
//     //     remoteVideo.srcObject = event.streams[0]
//     // })
//     resolve();
// })
// }

// const makeCall = async ()=> {
//     await getMedia()
//     await createPeerConnection()
// }

// const answerCall = async (connection)=>{
//     await getMedia()
//     await createPeerConnection(connection)
// }

// socket.on('newConnection', connection=>{
//     joinGame.innerHTML = ""
//     const join = document.createElement("button")
//     if (socket.id === connection.offerer )  join.innerText = "game request made" 
//     else {
//         join.addEventListener('click', ()=> answerCall(connection))
//         join.innerText = `click to play ${connection.offerer}`
//     }
//     joinGame.appendChild(join)
// })

// socket.on('newIceCandidate', async answer => {
//     if(!peerConnection.remoteDescription){
//         await peerConnection.setRemoteDescription( new RTCSessionDescription(answer[1]))
//     }
//     peerConnection.addIceCandidate(answer[0])
// })

// startGame.addEventListener('click', ()=>makeCall())
