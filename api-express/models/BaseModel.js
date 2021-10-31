require('dotenv').config()
import mongoClient from '../mongo-client'
import jwt_decode from 'jwt-decode'
const ObjectId = require('mongodb').ObjectId

export class BaseModel {

  constructor(collectionName) {
    this.result = null
    this.token = ''
    this.message = collectionName
    this.collectionName = collectionName
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

  async getAllDocuments() {
    try {
      this.result = await mongoClient.db(process.env.MONGO_DB_NAME).collection(this.collectionName).find({}).toArray()
      if(!this.result) {
        this.message = 'Not found'
      }
    } catch (error) {
      this.result = null
      this.message = error.message
      console.log(error)
    } finally {
      return this.result  
    }
  }

  async getDocument(id) {
    try {
      const objId = new ObjectId(id)
      this.result = await mongoClient.db(process.env.MONGO_DB_NAME).collection(this.collectionName).findOne({ '_id': objId })
      if(!this.result) { this.message = 'Not found: ' + id }
    } catch (error) {
      this.result = null
      this.message = error.message
      console.log(error)
    } finally {
      return this.result  
    }
  }

  async addDocument(document){
    this.message = 'Added'
    try {
      this.result = await mongoClient.db(process.env.MONGO_DB_NAME).collection(this.collectionName).insertOne( document )
      if(!this.result) { this.message = 'Not added' }
    } catch (error) {
      this.result = null
      this.message = error.message
      console.log(error)
    } finally {
      return this.result  
    } 
  }

  async deleteDocument(id){
    this.message = 'Deleted'
    try {
      const objId = new ObjectId(id)
      this.result = await mongoClient.db(process.env.MONGO_DB_NAME).collection(this.collectionName).findOneAndDelete({'_id': objId})
      this.result = this.result.value
      if(!this.result) { this.message = 'Error deleting: ' + id }
    } catch (error) {
      this.result = null
      this.message = error.message
      console.log(error)
    } finally {
      return this.result  
    } 
  }

  async updateDocument(id, document){
    this.message = 'Updated'
    try {
      const objId = new ObjectId(id)
      this.result = await mongoClient.db(process.env.MONGO_DB_NAME).collection(this.collectionName).findOneAndUpdate({'_id': objId}, {$set:  document })
      this.result = this.result.value
      if(!this.result) {
        this.message = 'Error updating: ' + id
      }
    } catch (error) {
      this.result = null
      this.message = error.message
      console.log(error)
    } finally {
      return this.result  
    } 
  }
}
