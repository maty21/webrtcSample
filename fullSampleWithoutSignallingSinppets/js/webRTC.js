
const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
};
const socket = io(`http://${window.location.hostname}:12345`);
socket.on('connect', () => console.log('connected'))


export const caller = async (videoSrc) => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
    videoSrc.srcObject = stream;
    const peerConnection = new RTCPeerConnection(null);
    peerConnection.onicecandidate = c =>  c.candidate &&  socket.emit('callerCandidate:send', c.candidate)
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
    const sdp = await peerConnection.createOffer({offerToReceiveAudio: 1,offerToReceiveVideo: 1});
    const res = await peerConnection.setLocalDescription(sdp);
    socket.emit('createOffer:send', sdp)
    socket.on('calleeCandidate:received', candidate => peerConnection.addIceCandidate(candidate))
    socket.on('socketAnswer:received', rmDsec => peerConnection.setRemoteDescription(rmDsec));
}

export const callee = async videoSrc => {
    const _videoSrc = videoSrc;
    let peerConnection = null;
    socket.on('createOffer:received', async sdp => {
        peerConnection = new RTCPeerConnection(null);
        peerConnection.onicecandidate = c => c.candidate && socket.emit('calleeCandidate:send', c.candidate)
        peerConnection.ontrack = stream =>  _videoSrc.srcObject = stream.streams[0]
        peerConnection.setRemoteDescription(sdp);
        const sdpAnswer = await peerConnection.createAnswer();
        const res = await peerConnection.setLocalDescription(sdpAnswer);
        socket.emit('socketAnswer:send', sdpAnswer);
    })
    socket.on('callerCandidate:received', async candidate => peerConnection.addIceCandidate(candidate))
}


// export default webrtc = {
//     caller,
//     callee
// }