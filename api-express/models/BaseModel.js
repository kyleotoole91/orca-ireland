require('dotenv').config()
import mongoClient from '../mongo-client'
const ObjectId = require('mongodb').ObjectId

export class BaseModel {

  constructor(collectionName) {
    this.result = null
    this.db = null
    this.setCollectionName(collectionName)
  }

  setCollectionName(name) {
    if (name && name !== '') {
      this.collectionName = name
      this.db = mongoClient.db(process.env.MONGO_DB_NAME).collection(this.collectionName) 
    }
  }

  mongoQuickJoin(foreignTable, localField) {
    return [{"$lookup":{"from": foreignTable, 
                        "localField": localField,
                        "foreignField": "_id",
                        "as": foreignTable }}]
  }

  mongoJoin(foreignTable, localField) {
    return {"$lookup":{"from": foreignTable, 
                       "localField": localField,
                       "foreignField": "_id",
                       "as": foreignTable }}
  }

  //Auto converts string fields with _id suffix to mongo db object _ids. Sometimes throws undefined errors
  addObject_ids(obj){
    try {
      Object.keys(obj).forEach(function(key) {
        const field = key
        const value = obj[field]
        if (field.includes('_id')) {
          obj[field] = new ObjectId(value) 
        } else if (value === 'object' && !Array.isArray(value) && value !== null) {
          addObject_ids(value);
        } else if (Array.isArray(value)) {
          value.forEach(function (item) {
            if (item === 'object' && !Array.isArray(item) && item !== null) {
              addObject_ids(item);
            }  
          });
        }
      })
    } catch(e) {
      console.log('Error addObject_ids(): '+e.message)
    }
  }

  async getAllDocuments() {
    try {
      this.result = await this.db.find({"deleted": {"$in": [null, false]}}).toArray()
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
      this.result = await this.db.findOne({ 'extId': extId, "deleted": {"$in": [null, false]} })
      if (!this.result && force) {
        this.result = await this.db.insertOne({ 'extId': extId }) 
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

  async getDocument(id) {
    try {
      const objId = new ObjectId(id)
      this.result = await this.db.findOne({ '_id': objId, "deleted": {"$in": [null, false]} })
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
      this.result = await this.db.insertOne( document )
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
      this.result = await this.db.findOneAndUpdate({'_id': objId}, {$set: {"deleted": true} })
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
      this.result = await this.db.findOneAndUpdate({'_id': objId, 'user_id': userId}, {$set: {"deleted": true} })
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
      const objId = new ObjectId(id)
      this.result = await this.db.findOneAndUpdate({'_id': objId}, {$set:  document })
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

  async getUserDocuments(userId) {
    try {
      const objId = new ObjectId(userId) 
      this.result = await this.db.find({'user_id': objId, "deleted": {"$in": [null, false]}}).toArray()
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
      this.result = await this.db.find({'user_id': objUserId, '_id': objDocId, "deleted": {"$in": [null, false]}}).toArray()
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

  async updateUserDocument(userId, id, document){
    this.message = 'Updated'
    try {
      this.addObject_ids(document)
      const objId = new ObjectId(id)
      this.result = await this.db.findOneAndUpdate({'_id': objId, 'user_id': userId}, {$set:  document })
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
