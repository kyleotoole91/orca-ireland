require('dotenv').config()
import mongoClient from '../mongo-client'
import jwt_decode from 'jwt-decode'
const ObjectId = require('mongodb').ObjectId

const collectionName = 'events'
let token
let result, message

export class EventsModel {

  constructor() {
    token='',
    message='events'
  }

  async setToken(tokenParam){
    try { 
      this.token = tokenParam 
      let decoded = jwt_decode(tokenParam)
      console.log(decoded)
    } catch (error) {
      console.error(error);
    }
  } 

  async getEvents() {
    this.message = 'Events'
    try {
      result = await mongoClient.db(process.env.MONGO_DB_NAME).collection(collectionName).find({}).toArray()
      if(!result) {
        this.message = 'Events not found'
      }
    } catch (error) {
      result = null
      this.message = error.message
      console.log(error)
    } finally {
      return result  
    }
  }

  async getEvent(id) {
    this.message = 'Event'
    try {
      const objId = new ObjectId(id)
      result = await mongoClient.db(process.env.MONGO_DB_NAME).collection(collectionName).findOne({ '_id': objId })
      if(!result) { this.message = 'Event not found: ' + id }
    } catch (error) {
      result = null
      this.message = error.message
      console.log(error)
    } finally {
      return result  
    }
  }

  async addEvent(event){
    this.message = 'Added event'
    try {
      result = await mongoClient.db(process.env.MONGO_DB_NAME).collection(collectionName).insertOne({ event })
      if(!result) { this.message = 'Event not added' }
    } catch (error) {
      result = null
      this.message = error.message
      console.log(error)
    } finally {
      return result  
    } 
  }

  async deleteEvent(id){
    this.message = 'Deleted event'
    try {
      const objId = new ObjectId(id)
      result = await mongoClient.db(process.env.MONGO_DB_NAME).collection(collectionName).findOneAndDelete({'_id': objId})
      result = result.value
      if(!result) { this.message = 'Error deleting event: ' + id }
    } catch (error) {
      result = null
      this.message = error.message
      console.log(error)
    } finally {
      return result  
    } 
  }

  async updateEvent(id, event){
    this.message = 'Updated event'
    try {
      const objId = new ObjectId(id)
      result = await mongoClient.db(process.env.MONGO_DB_NAME).collection(collectionName).findOneAndUpdate({'_id': objId}, {$set:{ event }} )
      result = result.value
      if(!result) {
        this.message = 'Error updating event: ' + id
      }
    } catch (error) {
      result = null
      this.message = error.message
      console.log(error)
    } finally {
      return result  
    } 
  }
}
