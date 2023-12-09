const APP_ID = "cc8b323785d344988d1dde3cad36b76e"

let uid = sessionStorage.getItem('uid');
console.log("ui", uid)
if(!uid)
{
    uid = String(Math.floor(Math.random()*10000));
    console.log("uid here", uid)
    sessionStorage.setItem('uid', uid)
}
let token = null;
let client;
let sharingScreen = false;
let localScreenTracks;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

let roomId = urlParams.get('room');

if(!roomId)
{
    roomId = 'main'
}
let localTracks = []
let remoteUsers = {}

let joinRoomInit = async()=>{
    client = AgoraRTC.createClient({mode: 'rtc', codec:'vp8'})
    await client.join(APP_ID, roomId, token, uid);
    client.on('user-published', handleUserPublished);
    client.on('user-left', handleUserLeft)
    joinStream();
}

let joinStream = async()=>{
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks({}, {});
    let player = `<div class="video__container" id="user-container-${uid}">
    <div class="video-player" id="user-${uid}"></div></div>`
document.getElementById('streams__container').insertAdjacentHTML('beforeend', player)
document.getElementById(`user-container-${uid}`).addEventListener('click', expandVideoFrame)
localTracks[1].play(`user-${uid}`)
console.log("video track", localTracks[1])
await client.publish([localTracks[1], localTracks[0]])
}

let switchToCamera = async()=>{
    let player = `<div class="video__container" id="user-container-${uid}">
    <div class="video-player" id="user-${uid}"></div></div>`
    document.getElementById('stream__box').style.display = 'block'
    displayFrame.insertAdjacentHTML('beforeend', player)
    document.getElementById(`user-${uid}`).addEventListener('click', hideDisplayFrame)
    await localTracks[0].setMuted(true)
    await localTracks[1].setMuted(true)
    document.getElementById('mic-btn').classList.remove('active')
    document.getElementById('screen-btn').classList.remove('active')
    localTracks[1].play(`user-${uid}`);
    await client.publish(localTracks[1])
}

let handleUserPublished = async(user, mediaType)=>{
    remoteUsers[user.uid] = user;
    console.log("media", mediaType)
    await client.subscribe(user, mediaType);
    console.log("hello", user)
    let player = document.getElementById(`user-container-${user.uid}`);
    if(player === null)
    {
        console.log("hey")
        player =  `<div class="video__container" id="user-container-${user.uid}">
        <div class="video-player" id="user-${user.uid}"></div></div>`
        // console.log("track", playerTrack)
        document.getElementById('streams__container').insertAdjacentHTML('beforeend', player)
        document.getElementById(`user-container-${user.uid}`).addEventListener('click', expandVideoFrame)
        console.log("hey", `user-container-${user.uid}`)
    }

    if(displayFrame.style.display)
    {
        let videoFrame = document.getElementById(`user-container-${user.uid}`)
        videoFrame.style.height = '100px';
        videoFrame.style.width = '100px';
    }
        if(mediaType === 'video')
        {
            console.log("hey2")
            console.log("check")
            user.videoTrack.play(`user-${user.uid}`);
        }
        if(mediaType === 'audio')
        {
            user.audioTrack.play();
        }

}

let handleUserLeft = async(user)=>{
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()
    if(userIdInDisplayFrame === `user-container-${user.uid}`){
        displayFrame.style.display = null
        let videoFrames = document.getElementsByClassName('video__container');
    for(let i = 0; i < videoFrames.length; ++i)
    {
        videoFrames[i].style.height = '300px'
        videoFrames[i].style.width = '300px'
    }
    }
}

let toggleCamera = async(e)=>{
    let button = e.currentTarget;
    if(localTracks[1].muted)
    {
        await localTracks[1].setMuted(false);
        button.classList.add('active')
    }
    else
    {
        await localTracks[1].setMuted(true);
        button.classList.remove('active')
    }
}

let toggleMic = async(e)=>{
    let button = e.currentTarget;
    if(localTracks[0].muted)
    {
        await localTracks[0].setMuted(false);
        button.classList.add('active')
    }
    else
    {
        await localTracks[0].setMuted(true);
        button.classList.remove('active')
    }
}

let toggleScreen = async(e)=>{
    let screenButton = e.currentTarget;
    let cameraButton = document.getElementById('camera-btn')
    if(!sharingScreen) {
        sharingScreen = true;
        screenButton.classList.add('active')
        cameraButton.classList.remove('active')
        cameraButton.style.display = 'none'
        localScreenTracks = await AgoraRTC.createScreenVideoTrack();
        document.getElementById(`user-container-${uid}`).remove();
        displayFrame.style.display = 'block'

        let player = `<div class="video__container" id="user-container-${uid}">
    <div class="video-player" id="user-${uid}"></div></div>`

    displayFrame.insertAdjacentHTML('beforeend', player)
    document.getElementById(`user-container-${uid}`).addEventListener('click', expandVideoFrame)
    userIdInDisplayFrame = `user-container-${uid}`
    localScreenTracks.play(`user-${uid}`)

    await client.unpublish(localTracks[1]);
    await client.publish(localScreenTracks);
    let videoFrames = document.getElementsByClassName('video__container')
    for(let i = 0; i < videoFrames.length; ++i)
{
  if(videoFrames[i]!=userIdInDisplayFrame) {
  videoFrames[i].style.height = '100px';
  videoFrames[i].style.width = '100px';
  }
  // videoFrames[i].addEventListener('click', expandVideoFrame)
}
    }
    else{
        sharingScreen = false;
        cameraButton.style.display = 'block'
        document.getElementById(`user-container-${uid}`).remove()
        await client.unpublish([localScreenTracks]);
        await switchToCamera();
    }
}

let leaveRoom = async(e)=>{
    e.preventDefault();
    let leaveButton = e.currentTarget;
    window.location = `index.html`
}

document.getElementById('camera-btn').addEventListener('click', toggleCamera)
document.getElementById('mic-btn').addEventListener('click', toggleMic)
document.getElementById('screen-btn').addEventListener('click', toggleScreen)
document.getElementById('leave-btn').addEventListener('click', leaveRoom)

joinRoomInit()
