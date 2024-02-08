

const localVideo = document.getElementById('localVideo')
const startGame = document.getElementById('startGame')
const joinGame = document.getElementById('joinGame')
let playerOne, playerTwo, localStream, localDescription

const peerConfig = {
    iceServers: [{
        urls: [
            "stun1.l.google.com:19302",
            "stun2.l.google.com:19302",
            "stun3.l.google.com:19302",
            "stun4.l.google.com:19302",
        ]
    }]
}

const getLocalMedia = async () => {

    const localTracks = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
    })
    localStream = localTracks
    console.log(localStream)
    localVideo.srcObject = localTracks
}

const initalizePeerConnection = async () => {
    const peerConnection = new RTCPeerConnection(peerConfig)
    console.log(peerConnection)
    localDescription = await peerConnection.setLocalDescription(peerConnection.localDescription)
    const tracks = localStream.getTracks()
    console.log(tracks)
    tracks.forEach(track => {
        peerConnection.addTrack(track,localStream)
    });

    console.log(peerConnection.tracks)
}


startGame.addEventListener('click', ()=>initalizePeerConnection())














getLocalMedia()



