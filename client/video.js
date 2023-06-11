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

// const videosCollection = db.collection('videos')

export async function init(user1HTMLVideoElement, user2HTMLVideoElement) {
  if(user1HTMLVideoElement && user2HTMLVideoElement) {
    let localStream = await navigator.mediaDevices.getUserMedia({video: true, audio: false})
    
    user1HTMLVideoElement.srcObject = localStream;
    console.log({sending: localStream});
    const streamDB = await db.collection('videos')
    let recorder = new MediaRecorder(localStream)
    const stream = new WritableStream({
      async write (chunk) {
        const doc = { id: localStream.id, chunk }
        console.log('writing', doc, 'to db')
        await streamDB.insert(doc)
      }
    })
    recorder.addEventListener('dataavailable', async ({ data }) => {
      await data.stream().pipeTo(stream, { preventClose: true })
        .catch(err => {
          console.error('Error while processing stream:', err)
        })
    })
    recorder.start(20)
    
    await createOffer(user2HTMLVideoElement)
  }
}

export  async function createOffer(user2HTMLVideoElement) {
  for await (let stream of db.collection('videos').find({
    // clout: {
    //  $gt: 9000
    // },
  })) {
   
    console.log({receiving: stream});
    let remoteStream = new MediaStream()
    console.log(remoteStream);
    user2HTMLVideoElement.srcObject = remoteStream;
  }
  
}
