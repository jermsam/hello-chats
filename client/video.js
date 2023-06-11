import db from './db';


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

export async function init(user1HTMLVideoElement, user2HTMLVideoElement) {
  if(user1HTMLVideoElement && user2HTMLVideoElement) {
    let localStream = await navigator.mediaDevices.getUserMedia({video: true, audio: false})
    
    user1HTMLVideoElement.srcObject = localStream;
    console.log({sending: localStream});
    let recorder = new MediaRecorder(localStream, { mimeType: videoMime })
    const [latestFrame] = await streamDB.find().sort('count', -1).limit(1)
    const stream = new WritableStream({
      count: latestFrame?.count || 0,
      async write (chunk) {
        const doc = { id: localStream.id, chunk, count: this.count++ }
        await streamDB.insert(doc)
      }
    })
    recorder.addEventListener('dataavailable', async ({ data }) => {
      await createOffer(user2HTMLVideoElement)
      await data.stream().pipeTo(stream, { preventClose: true })
        .catch(err => {
          console.error('Error while processing streams')
        })
      
    })
    recorder.start(20)
    
    await createOffer(user2HTMLVideoElement)
  }
}

export async function createOffer(user2HTMLVideoElement) {
  if (!MediaSource.isTypeSupported(videoMime)) return console.error('unsupported mime type')
  const videos = {}
  for await (let stream of db.collection('videos').find().sort('count', -1).limit(50)) {
   if (!videos[stream.id]) {
    videos[stream.id] = []
  }
   videos[stream.id].push(stream.chunk)
  }
  for (const [id, chunks] of Object.entries(videos)) {
    const blob = new Blob(chunks, { type: videoMime })
    const remoteStream = new MediaSource()
    remoteStream.onsourceopen = async _ => {
      const buffer = remoteStream.addSourceBuffer(videoMime)
      buffer.appendBuffer(await blob.arrayBuffer())
      user2HTMLVideoElement.srcObject = remoteStream
    }
    break
  }
  
}
