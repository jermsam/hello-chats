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
await streamDB.createIndex(['count'])

export async function init(user1HTMLVideoElement, user2HTMLVideoElement) {
  if(user1HTMLVideoElement && user2HTMLVideoElement) {
    let localStream = await navigator.mediaDevices.getUserMedia({video: true, audio: false})
    
    user1HTMLVideoElement.srcObject = localStream;
    console.log({sending: localStream});
    let recorder = new MediaRecorder(localStream)
    const stream = new WritableStream({
      count: 0,
      async write (chunk) {
        const doc = { id: localStream.id, chunk, count: this.count++ }
        await streamDB.insert(doc)
      }
    })
    recorder.addEventListener('dataavailable', async ({ data }) => {
      await data.stream().pipeTo(stream, { preventClose: true })
        .catch(err => {
          console.error('Error while processing stream, happens on locked destination or source')
        })
    })
    recorder.start(20)
    
    await createOffer(user2HTMLVideoElement)
  }
}

export async function createOffer(user2HTMLVideoElement) {
  const [latestFrame] = await streamDB.find().sort('count', -1).limit(1)
  for await (let stream of db.collection('videos').find({
    count: {
      $gt: latestFrame.count
    }
  })) {
   
    console.log({receiving: stream});
    let remoteStream = new MediaStream()
    console.log(remoteStream);
    user2HTMLVideoElement.srcObject = remoteStream;
  }
  
}
