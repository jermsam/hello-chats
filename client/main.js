import './style.css'
import {init} from './video.js';

document.querySelector('#app').innerHTML = `
  <div>
     <div id="videos" class="grid grid-cols-2 gap-2">
      <video id="user-1" autoplay playsinline class="video-player"></video>
      <div class="bg-red-900"></div>
      <video id="user-2" autoplay playsinline class="video-player"></video>
    </div>
  </div>
`

 await init(
  document.querySelector('#user-1'),
  document.querySelector('#user-2')
)

