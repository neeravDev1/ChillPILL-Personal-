let displayFrame = document.getElementById('stream__box');
let videoFrames = document.getElementsByClassName('video__container');
let userIdInDisplayFrame = null;

let expandVideoFrame = (e)=>{
  console.log("hello")
  let child = displayFrame.children[0];
  if(child)
  {
    console.log("child")
    document.getElementById('streams__container').appendChild(child)
  }
  displayFrame.style.display = 'block'
  displayFrame.appendChild(e.currentTarget)
  userIdInDisplayFrame = e.currentTarget.id

for(let i = 0; i < videoFrames.length; ++i)
{
  if(videoFrames[i]!=userIdInDisplayFrame) {
  videoFrames[i].style.height = '100px';
  videoFrames[i].style.width = '100px';
  }
  // videoFrames[i].addEventListener('click', expandVideoFrame)
}
}

for(let i = 0; i < videoFrames.length; ++i)
{
  videoFrames[i].addEventListener('click', expandVideoFrame)
}

let hideDisplayFrame = ()=>{
  userIdInDisplayFrame = null;
  displayFrame.style.display = null
  let child = displayFrame.children[0];
    document.getElementById('streams__container').appendChild(child)
    for(let i = 0; i < videoFrames.length; ++i)
{
  videoFrames[i].style.height = '300px'
  videoFrames[i].style.width = '300px'
}
}

displayFrame.addEventListener('click', hideDisplayFrame)