import db from './db';

const doc = await db.collection('test').insert({text: 'Hi there'})
console.log(doc );

console.log(db);

for await (let doc of db.collection('test').find({
    // clout: {
    //  $gt: 9000
    // },
   })) {
    console.log(doc)
   }