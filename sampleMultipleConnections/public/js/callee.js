import { caller, callee } from "./webRTC.js";
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const callerButton = document.getElementById('callerButton');
const calleeButton = document.getElementById('calleeButton');

//calleeButton.onclick = () => callee(remoteVideo);




callee(remoteVideo)
