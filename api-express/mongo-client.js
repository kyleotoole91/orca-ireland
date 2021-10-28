import { MongoClient } from 'mongodb';
require('dotenv').config()

let mongoClient

async function connectToDB(){
  try {
    mongoClient = new MongoClient(process.env.MONGO_DB_URL)
    await mongoClient.connect()
    //let dbList = await mongoClient.db().admin().listDatabases()
    //console.log(dbList)
  } catch (e) {
    console.error(e);
  }
}

connectToDB()

export default mongoClient
