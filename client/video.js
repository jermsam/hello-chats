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
    let recorder = new MediaRecorder(localStream)
      recorder.addEventListener('dataavailable',({ data }) => {
      // stream to the network?
    })
    recorder.start(20)
    
    user1HTMLVideoElement.srcObject = localStream;
    console.log({sending: localStream});
    const stream = await db.collection('videos').insert({video: localStream})
    console.log(stream);
    
    await createOffer(user2HTMLVideoElement)
  }
}

export  async function createOffer(user2HTMLVideoElement) {
  for await (let stream of db.collection('videos').find({
    // clout: {
    //  $gt: 9000
    // },
  })) {
   
    console.log({receiving: stream.video});
    let remoteStream = new MediaStream()
    console.log(remoteStream);
    user2HTMLVideoElement.srcObject = remoteStream;
  }
  
}
