'use strict'

const mediaStreamConstraints = {
    video: true,
    audio: true
}

const offerOptions = {
    offerToReceiveVideo: 1,
    offerToReceiveVideo: 1
}

const localVideo = document.getElementById('localVideo')
const remoteVideo = document.getElementById('remoteVideo')
let localStream
let remoteStream
let localPeerConnection
let remotePeerConnection


function gotLocalMediaStream(mediaStream) {
    localVideo.srcObject = mediaStream
    localStream = mediaStream
    callButton.disabled = false  // Enable call button.
}

function gotRemoteMediaStream(event) {
    const mediaStream = event.stream
    remoteVideo.srcObject = mediaStream
    remoteStream = mediaStream
}

function handleConnection(event) {
    const peerConnection = event.target
    const iceCandidate = event.candidate

    if (iceCandidate) {
        const newIceCandidate = new RTCIceCandidate(iceCandidate)
        remotePeerConnection.addIceCandidate(newIceCandidate)
            .then(() => console.log("PEER CONNECTED"))
            .catch((error) => console.log("ERROR CONNECTING PEER"))
    }
}

function createdOffer(description) {
    localPeerConnection.setLocalDescription(description)
        .then(() => console.log("SET L_SDP OK"))
        .catch(() => console.log("SET L_SDP ERR"))

    remotePeerConnection.setRemoteDescription(description)
        .then(() => console.log("SET R_SDP OK"))
        .catch((Err) => console.log("SET R_SDP ERR"))

    remotePeerConnection.createAnswer()
        .then(createdAnswer)
        .catch((Err) => console.log("SET R_SDP ERR"))
}

function createdAnswer(description) {
    remotePeerConnection.setLocalDescription(description)
        .then(() => console.log("SET R_SDP OK"))
        .catch((Err) => console.log("SET R_SDP ERR"))

    localPeerConnection.setRemoteDescription(description)
        .then(() => console.log("SET L_SDP OK"))
        .catch(() => console.log("SET L_SDP ERR"))
}

const startButton = document.getElementById('startButton')
const callButton = document.getElementById('callButton')
const hangupButton = document.getElementById('hangupButton')
callButton.disabled = true
hangupButton.disabled = true

function startAction() {
    startButton.disabled = true
    navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
        .then(gotLocalMediaStream)
        .catch((Err) => console.log("L_MEDIA ERR"))
}


function callAction() {
    callButton.disabled = true
    hangupButton.disabled = false

    const servers = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] }

    localPeerConnection = new RTCPeerConnection(servers)
    localPeerConnection.addEventListener('icecandidate', handleConnection)
    localPeerConnection.addEventListener('iceconnectionstatechange', console.log('ICE state change event'))

    remotePeerConnection = new RTCPeerConnection(servers)
    remotePeerConnection.addEventListener('icecandidate', handleConnection)
    remotePeerConnection.addEventListener('iceconnectionstatechange', console.log('ICE state change event'))
    remotePeerConnection.addEventListener('addstream', gotRemoteMediaStream)

    localPeerConnection.addStream(localStream)
    localPeerConnection.createOffer(offerOptions)
        .then(createdOffer).catch((Err)=>console.log("Create Offer Err"))
}


function hangupAction() {
    localPeerConnection.close()
    remotePeerConnection.close()
    localPeerConnection = null
    remotePeerConnection = null
    hangupButton.disabled = true
    callButton.disabled = false
}

startButton.addEventListener('click', startAction)
callButton.addEventListener('click', callAction)
hangupButton.addEventListener('click', hangupAction)
