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

  addObject_ids(obj){
    //TODO: needs to loop nested objects
    Object.keys(obj).forEach(function(key) {
      const idField = key
      const idValue = obj[idField]
      if (idField.includes('_id')) {
        console.log('Found object id field '+idField+' '+idValue)
        obj[idField] = new ObjectId(idValue) 
      }
    })
  }

  async getAllDocuments() {
    try {
      this.result = await mongoClient.db(process.env.MONGO_DB_NAME).collection(this.collectionName).find({}).toArray()
      if(!this.result) {
        this.message = 'Not found'
      } else {
        this.message = this.collectionName
      }
    } catch (error) {
      this.result = null
      this.message = error.message
      console.log(error)
    } finally {
      return this.result  
    }
  }
  
  async getDocumentByExtId(extId, force) { 
    try {
      this.result = await mongoClient.db(process.env.MONGO_DB_NAME).collection(this.collectionName).findOne({ 'extId': extId })
      if (!this.result && force) {
        this.result = await mongoClient.db(process.env.MONGO_DB_NAME).collection(this.collectionName).insertOne({ 'extId': extId }) 
        if (this.result.insertedId !== '') {
          this.result._id = this.result.insertedId
          this.result.extId = extId
        } 
      }
      if (!this.result) {
        this.message = 'Not found'
      } else {
        this.message = "User's "+this.collectionName
      }
    } catch (error) {
      this.result = null
      this.message = error.message
      console.log(error)
    } finally {
      return this.result  
    }  
  }

  async getUserDocuments(userId) {
    try {
      const objId = new ObjectId(userId) 
      this.result = await mongoClient.db(process.env.MONGO_DB_NAME).collection(this.collectionName).find({'user_id': objId}).toArray()
      if(!this.result) {
        this.message = 'Not found'
      } else {
        this.message = "User's "+this.collectionName
      }
    } catch (error) {
      this.result = null
      this.message = error.message
      console.log(error)
    } finally {
      return this.result  
    }
  }

  async getUserDocument(userId, docId) {
    try {
      const objUserId = new ObjectId(userId) 
      const objDocId = new ObjectId(docId) 
      this.result = await mongoClient.db(process.env.MONGO_DB_NAME).collection(this.collectionName).find({'user_id': objUserId, '_id': objDocId}).toArray()
      if(!this.result) {
        this.message = 'Not found'
      } else {
        this.message = "User's "+this.collectionName
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
      if(!this.result) { 
        this.message = 'Not found: ' + id 
      } else {
        this.message = this.collectionName
      }
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
      this.addObject_ids(document)
      this.result = await mongoClient.db(process.env.MONGO_DB_NAME).collection(this.collectionName).insertOne( document )
      if(!this.result) {
        this.message = 'Not added' 
      } else {
        this.message = this.collectionName
      }
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
      if(!this.result) { 
        this.message = 'Error deleting: ' + id 
      } else {
        this.message = this.collectionName
        this.result = this.result.value
      }
    } catch (error) {
      this.result = null
      this.message = error.message
      console.log(error)
    } finally {
      return this.result  
    } 
  }

  async deleteUserDocument(userId, id){
    this.message = 'Deleted '+id
    try {
      const objId = new ObjectId(id)
      this.result = await mongoClient.db(process.env.MONGO_DB_NAME).collection(this.collectionName).findOneAndDelete({'_id': objId, 'user_id': userId})
      if(!this.result.value) { 
        this.message = 'Error deleting: ' + id 
      } else {
        this.result = this.result.value
      }
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
      this.addObject_ids(document)
      const objId = new ObjectId(id)
      this.result = await mongoClient.db(process.env.MONGO_DB_NAME).collection(this.collectionName).findOneAndUpdate({'_id': objId}, {$set:  document })
      if(!this.result) {
        this.message = 'Error updating: ' + id
      } else {
        this.result = this.result.value
      }
    } catch (error) {
      this.result = null
      this.message = error.message
      console.log(error)
    } finally {
      return this.result  
    } 
  }

  async updateUserDocument(userId, id, document){
    this.message = 'Updated'
    try {
      this.addObject_ids(document)
      const objId = new ObjectId(id)
      this.result = await mongoClient.db(process.env.MONGO_DB_NAME).collection(this.collectionName).findOneAndUpdate({'_id': objId, 'user_id': userId}, {$set:  document })
      if(!this.result) {
        this.message = 'Error updating: ' + id
      } else {
        this.result = this.result.value
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
