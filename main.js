let localStream;
let remoteStream;
let peerConnection

const servers = {
  iceServer: [
    {
      urls:["stun1.l.google.com:19302", "stun2.l.google.com:19302"]
    }
  ]
}

async function init () {
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false
  })
  document.getElementById("user-1").srcObject = localStream

  createOffer()

  console.log(localStream)
  console.log(peerConnection)

}

async function createOffer () {
  peerConnection = new RTCPeerConnection(servers)
  remoteStream = new MediaStream()
  document.getElementById("user-2").srcObject = remoteStream

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream)
  })


  peerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track)
    })
  }

  peerConnection.onicecandidate = async (event) => { 
    if(event.candidate){
      console.log(event.candidate)
    }
  }

  let offer = await peerConnection.createOffer()
  await peerConnection.setLocalDescription(offer) // fires off ice candidates to stun server
    console.log("offer",offer)
}

init()