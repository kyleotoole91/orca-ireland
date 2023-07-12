require('dotenv').config()
import mongoClient from '../mongo-client'
const ObjectId = require('mongodb').ObjectId

export class BaseModel {

  constructor(collectionName) {
    this.result = null
    this.db = null
    this.loadDetail = false
    this.limit = 0
    this.includeDeleted = false
    this.setCollectionName(collectionName)
  }

  deletedFilter(){
    if (this.includeDeleted)
      return {"$in": [null, false, true]}
    else
      return {"$in": [null, false]}
  }

  parseQueryParams(req) {
    if (req.query.limit && parseInt(req.query.limit)) {
      this.limit = parseInt(req.query.limit)
    } else {
      this.limit = 0
    }
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

  addedOk(dbResult){
    return dbResult &&
           dbResult.hasOwnProperty('acknowledged')  &&
           dbResult.acknowledged  && 
           dbResult.hasOwnProperty('insertedId')  &&
           dbResult.insertedId
  }

  deletedOk(dbResult){
    return dbResult &&
           dbResult.hasOwnProperty('ok')  &&
           dbResult.ok === 1  && 
           dbResult.hasOwnProperty('value') &&
           dbResult.value._id !== ''
  }
  
  applyDataTypes(obj){
    try {
      Object.keys(obj).forEach(function(key) {
        const field = key
        const value = obj[field]
        if (field && !Array.isArray(value) && value && field !== '' && value !== '') {
          if (field.includes('date') || field.includes('Date')){
            obj[field] = new Date(value) 
          } else if (field.includes('_id')) {
            obj[field] = new ObjectId(value) 
          } 
        }
        //Sometimes throws undefined errors
        /*else if (value === 'object' && !Array.isArray(value) && value !== null) {
          applyDataTypes(value);
        } else if (Array.isArray(value)) {
          value.forEach(function (item) {
            if (item === 'object' && !Array.isArray(item) && item !== null) {
              applyDataTypes(item);
            }  
          });
        }*/
      })
    } catch(e) {
      console.log('Error applyDataTypes(): '+e.message)
    }
  }

  async getAllDocuments(req) {
    try {
      let sort = {}
      if (this.collectionName === 'images') {
        sort = {"$natural": -1}
      } 
      this.result = await this.db.find({"deleted": this.deletedFilter()}).sort(sort).limit(this.limit).toArray()
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
      this.result = await this.db.findOne({ 'extId': extId, "deleted": this.deletedFilter() })
      if (!this.result || !this.result.hasOwnProperty('_id') && force) {
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

  async getDocumentsByUserId(userId) { 
    try {
      const userObjId = new ObjectId(userId) 
      this.result = await this.db.find({ 'user_id': userObjId, "deleted": this.deletedFilter() }).toArray()
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
      this.result = await this.db.findOne({ '_id': objId, "deleted": this.deletedFilter() })
      if(!this.result || !this.result.hasOwnProperty('_id')) {
        this.result = null 
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

  async addDocument(document) {
    this.message = 'Added'
    try {
      this.applyDataTypes(document)
      this.result = await this.db.insertOne( document )
      if(!this.addedOk(this.result)) {
        this.result = null
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
      if(!this.deletedOk(this.result)) {
        this.result = null 
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
      if(!this.deletedOk(this.result)) {
        this.result = null 
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
      this.applyDataTypes(document)
      this.result = await this.db.findOneAndUpdate({'_id': objId}, {$set:  document })
      if(!this.result || !this.result.hasOwnProperty('ok') || this.result.ok !== 1) {
        this.result = null
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
      this.result = await this.db.find({'user_id': objId, "deleted": this.deletedFilter()}).toArray()
      if(!this.result) {
        this.result = null
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
      this.result = await this.db.find({'user_id': objUserId, '_id': objDocId, "deleted": this.deletedFilter()}).toArray()
      if(!this.result || this.result.length === 0) {
        this.result = null
        this.message = 'Not found'
      } else {
        this.result = this.result[0]
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
      this.applyDataTypes(document)
      const objId = new ObjectId(id)
      this.result = await this.db.findOneAndUpdate({'_id': objId, 'user_id': userId}, {$set:  document })
      if(!this.result || !this.result.hasOwnProperty('ok') || this.result.ok !== 1) {
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
