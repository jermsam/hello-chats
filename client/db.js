
import DHT from '@hyperswarm/dht-relay'
import Stream from '@hyperswarm/dht-relay/ws'
import * as SDK from "hyper-sdk"
import b4a from 'b4a';
import goodbye from 'graceful-goodbye'
import Autobase from './autobase';
import { DB } from 'hyperbeedeebee';
import AutoBee from './autobee';

const socket = new WebSocket('ws://localhost:3210');

const dht = new DHT(new Stream(true, socket))


const sdk = await SDK.create({
    // Specify the "storage" you want
    // Regular strings will be passed to `random-access-application` to store in your user directory
    // On web this will use `random-access-web` to choose the best storage based on the browser
    // You can specify an absolute or relative path `./example/` to choose where to store data
    // You can specify `false` to not persist data at all and do everything in-memory
    storage: false,
  
    // This controls whether the SDK will automatically start swarming when loading a core via `get`
    // Set this to false if you want to have more fine control over peer discovery
    autoJoin: false,
  
    // Specify options to pass to the Corestore constructor
    // The storage will get derived from the `storage` parameter
    // https://github.com/hypercore-protocol/corestore/
    // corestoreOpts: {},
  
    // Specify options to pass to the hyperswarm constructor
    // The keypair will get derived automatically from the corestore
    // https://github.com/hyperswarm/hyperswarm
    swarmOpts: {
        dht
    },
  })

  sdk.on('peer-add', (peerInfo) => {
    console.log('Connected to', peerInfo.publicKey, 'on', peerInfo.topics);
    // console.log(peerInfo);
  })

  // Topics are just identifiers to find other peers under
// const topic = crypto.createHash('sha256').update('Insert a topic name here').digest()
const topic = await crypto.subtle.digest('SHA-256', b4a.from('voting 101', 'hex')).then(b4a.from)

 const discoveryCore = await sdk.get(topic);

 const store =  await sdk.namespace('voting 101')

 const inputCore = store.get({ name: 'your vote' })

 const outputCore = store.get({ name: 'there vote' })

 goodbye(async () => {
    await Promise.all([inputCore.close(), outputCore.close()])
  })


 await Promise.all([inputCore.ready(), outputCore.ready()])

  const DBCores = new Set()
   DBCores.add(inputCore.id)
   console.log(inputCore.id)

   const autobase = Autobase({
    localInput: inputCore,
    inputs: [inputCore],
    localOutput: outputCore
   })
  
  
   const extPrefix = 'voting';

  const newDBExt = discoveryCore.registerExtension(extPrefix + '-db-sync', {
    encoding: 'json',
    onmessage: async dbs => {
      let sawNew = false
      for (const db of dbs) {
        if (typeof db !== 'string' || DBCores.has(db)) continue
          DBCores.add(db)
          try {
            await autobase.addInput(await sdk.get(db))
          } catch (e) {
            console.error('error adding db:', e)
          }
        
        sawNew = true
      }
      if (sawNew) {
        newDBExt.broadcast(Array.from(DBCores))
        console.log('got new dbs message, current inputs count:', DBCores.size)
        console.log('autobase inputs count:', autobase.inputs.filter(core => core.readable).length)
        console.log('autobase status:', autobase.view.core.status)
      }
    }
  })
  
  discoveryCore.on('peer-add', () => {
    newDBExt.broadcast(Array.from(DBCores))
  })
  newDBExt.broadcast(Array.from(DBCores))


 console.log('yourVote public key:', inputCore.key.toString('hex'))
console.log('theirVote public key:', outputCore.key.toString('hex'))
console.log('yourVote has', inputCore.length, 'entries')
console.log('theirVote has', outputCore.length, 'entries')

 console.log(discoveryCore.peers.length);

 discoveryCore.on('peer-add', (peerInfo) => {
    console.log('Connected to', peerInfo.publicKey, 'on', peerInfo.topics); 
    console.log('new peer, peer:', peerInfo, 'peer count:', discoveryCore.peers.length)
 });

 await autobase.ready()

  const localBee = new AutoBee(autobase)

  await localBee.ready()

  const db = new DB(localBee);

  goodbye(async () => {
    await db.close()
    await discoveryCore.close()
    await sdk.close()
  })

export  default db;