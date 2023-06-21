import db, {inputCore} from './db';
import cluster from 'webm-cluster-stream';
import recorder from 'media-recorder-stream';

// console.log(db);



// const doc = await db.collection('test').insert({text: 'Hi there'})
// console.log(doc );
//
//
// for await (let doc of db.collection('test').find({
//     // clout: {
//     //  $gt: 9000
//     // },
//    })) {
//     console.log(doc)
//    }

const streamDB = await db.collection('videos')
const videoMime = 'video/webm'
await streamDB.createIndex(['count'])

// const video = (quality === 3) ? 800000 : (quality === 2) ? 500000 : 200000
// const audio = (quality === 3) ? 128000 : (quality === 2) ? 64000 : 32000
//
// const opts = {
//   interval: 1000,
//   videoBitsPerSecond: video,
//   audioBitsPerSecond: audio,
// }

export async function init(user1HTMLVideoElement, user2HTMLVideoElement) {
  if(user1HTMLVideoElement && user2HTMLVideoElement) {
    
    const media = await navigator.mediaDevices.getUserMedia({
      // audio: true,
      video: true
    })
    
    const stream = recorder(media, { interval: 1000 }).pipe(cluster())
    
    
    stream.on('data', function (data) {
      // console.log(data.length, Math.floor(data.length / 16 / 1024), Math.floor(data.length / 10))
      inputCore.append(data)
    })
    
    
    const fullStream = inputCore.createReadStream()
    // 'video/mp4; codecs="avc1.64001e"'
   
    for await (const data of fullStream) {
      // We need array buffers to work with media source
        const arrayBuffer = data.buffer;
     const  recordedBlob = new Blob([arrayBuffer], { type: videoMime });
      user2HTMLVideoElement.src = URL.createObjectURL(recordedBlob);
      console.log(recordedBlob);
    }
    
   
    // const writer =new WritableStream({
    //     count: 0,
    //     async write (chunk) {
    //       const doc = { chunk, count: this.count++ }
    //       console.log(doc)
    //     }
    //   })
    
    // const transformStream = new TransformStream({
    //   start(controller) {
    //     /* … */
    //   },
    //
    //   transform(chunk, controller) {
    //     /* … */
    //   },
    //
    //   flush(controller) {
    //     /* … */
    //   },
    // });
    
    // stream.on('data', chunk => console.log(chunk.toString()))
    
    // await stream.pipe(transformStream)
   
    // let media = await navigator.mediaDevices.getUserMedia({video: true, audio: false})
    //
    // // user1HTMLVideoElement.srcObject = localStream;
    // // console.log({sending: localStream});
    // // let myrecorder = new MediaRecorder(localStream, { mimeType: videoMime })
    // const myStream = recorder(media, { interval: 1000 }).pipe(cluster()) ;
    // // const [latestFrame] = await streamDB.find().sort('count', -1).limit(1)
    // // const stream = new WritableStream({
    // //   count: 0,
    // //   async write (chunk) {
    // //     const doc = { chunk, count: this.count++ }
    // //     await streamDB.insert(doc)
    // //   }
    // // })
    // console.log(myStream);
    // await myStream.pipe(stream, { preventClose: true })
    //   .catch(err => {
    //     console.error('Error while processing streams')
    //   })
    
    // recorder.addEventListener('dataavailable', async ({ data }) => {
    //   await createOffer(user2HTMLVideoElement)
    //
    // })
    // recorder.start(20)
    
    // await createOffer(user2HTMLVideoElement)
  }
}

// export async function createOffer(user2HTMLVideoElement) {
//   if (!MediaSource.isTypeSupported(videoMime)) return console.error('unsupported mime type')
//   const videos = {}
//   for await (let stream of db.collection('videos').find().sort('count', -1).limit(50)) {
//    if (!videos[stream.id]) {
//     videos[stream.id] = []
//   }
//    videos[stream.id].push(stream.chunk)
//   }
//   for (const [id, chunks] of Object.entries(videos)) {
//     const blob = new Blob(chunks, { type: videoMime })
//     const remoteStream = new MediaSource()
//     remoteStream.onsourceopen = async _ => {
//       const buffer = remoteStream.addSourceBuffer(videoMime)
//       buffer.appendBuffer(await blob.arrayBuffer())
//       user2HTMLVideoElement.srcObject = remoteStream
//     }
//     break
//   }
//
// }


//   const sourceBuffer = await new Promise((resolve, reject) => {
//     const getSourceBuffer = () => {
//       try {
//         const sourceBuffer = mediaSource.addSourceBuffer(`video/webm; codecs="vp9,opus"`);
//         resolve(sourceBuffer);
//       } catch (e) {
//         reject(e);
//       }
//     };
//     if (mediaSource.readyState === 'open') {
//       getSourceBuffer();
//     } else {
//       mediaSource.addEventListener('sourceopen', getSourceBuffer);
//     }
//   });
//
//   for await (let doc of streamDB.find({
//     // clout: {
//     //  $gt: 9000
//     /Z/ },
//   })) {
//
//     // const yourVideo = document.createElement('video');
//     //
//     // Create a MediaSource instance and connect it to video element
//
//     // // and assigns it to the video element src
//
//
//     const buffer  = doc._id.id.buffer
//     // const videoBuffer = mediaSource.addSourceBuffer('video/webm;codecs=vp8');
//     // videoBuffer.appendBuffer(buffer)
//
//
//
//     // Now that we have an "open" source buffer, we can append to it
//     sourceBuffer.appendBuffer(buffer);
//
//     // Now that we have an "open" source buffer, we can append to it
//     // sourceBuffer.appendBuffer(buffer);
//     // const videosElement = document.querySelector('#videos')
//     // videosElement.appendChild(yourVideo);
//   }
//
//   // Listen for when append has been accepted and
//   // You could alternative use `.addEventListener` here instead
//   sourceBuffer.onupdateend = () => {
//     // Nothing else to load
//     mediaSource.endOfStream();
//     // Start playback!
//     // Note: this will fail if video is not muted, due to rules about
//     // autoplay and non-muted videos
//     videoElement.play();
//   };
//
// }

