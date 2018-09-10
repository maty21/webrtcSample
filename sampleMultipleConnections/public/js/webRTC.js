
const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
};
let viewers = 0;
const viewersDetails = [];
const MAX = 20;
const socket = io(`${window.location.origin}`);
socket.on('connect', () => console.log('connected'))
const ICE_config = {
    'iceServers': [
        {
            'url': 'stun:stun.l.google.com:19302',

        },
        {
            url: 'turn:numb.viagenie.ca',
            credential: 'muazkh',
            username: 'webrtc@live.com'
        },
        {
            url: 'turn:192.158.29.39:3478?transport=udp',
            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            username: '28224511:1379330808'
        },
        {
            url: 'turn:192.158.29.39:3478?transport=tcp',
            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            username: '28224511:1379330808'
        }
    ]
}
export const caller = async (videoSrc) => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
    videoSrc.srcObject = stream;
    let peerConnection = new RTCPeerConnection(ICE_config);
    peerConnection.onicecandidate = c => c.candidate && socket.emit('callerCandidate:send', c.candidate)
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
    const sdp = await peerConnection.createOffer({ offerToReceiveAudio: 1, offerToReceiveVideo: 1 });
    const res = await peerConnection.setLocalDescription(sdp);
    socket.emit('createOffer:send', sdp)
    socket.on('calleeCandidate:received', candidate => peerConnection.addIceCandidate(candidate))
    socket.on('socketAnswer:received', rmDsec => peerConnection.setRemoteDescription(rmDsec));
}

const viewerCounter = pc => {
     viewers++;
    if (viewers > MAX) {
        let viewerPlace = viewers % MAX;
        viewersDetails[viewerPlace].pc.close();
        viewersDetails[viewerPlace].pc = pc;
        return viewersDetails[viewerPlace].element
        //viewersDetails.push({element,pc}) 
    } else {
        const element = createVideoElement();
        viewersDetails.push({ element, pc });
        return element;
    }


}


export const createVideoElement = () => {
   
    const videoContainer = document.getElementById('videoContainer');
    const videoElement = document.createElement('video');
    videoElement.id = viewers;
    //videoElement.width = '240px';
    //videoElement.height = '120px';
    videoElement.poster = 'https://peach.blender.org/wp-content/uploads/title_anouncement.jpg?x11217';
    videoElement.autoplay = true;
    videoContainer.appendChild(videoElement)
    return videoElement;
}
export const callee = async (video) => {
    //  const _videoSrc = videoSrc;
    socket.on('createOffer:received', async sdp => {
        let peerConnection = null;
        //  const videoSrc = createVideoElement();
        peerConnection = new RTCPeerConnection(ICE_config);
        const videoSrc = viewerCounter(peerConnection);
        socket.on('callerCandidate:received', async candidate => peerConnection.addIceCandidate(candidate))
        peerConnection.onicecandidate = c => c.candidate && socket.emit('calleeCandidate:send', c.candidate)
        peerConnection.ontrack = stream => {
            videoSrc.srcObject = stream.streams[0];

        }
        peerConnection.setRemoteDescription(sdp);
        const sdpAnswer = await peerConnection.createAnswer();
        const res = await peerConnection.setLocalDescription(sdpAnswer);
        socket.emit('socketAnswer:send', sdpAnswer);
    })
}


// export default webrtc = {
//     caller,
//     callee
// }