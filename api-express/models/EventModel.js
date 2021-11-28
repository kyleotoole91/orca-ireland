import { BaseModel } from './BaseModel'
const ObjectId = require('mongodb').ObjectId

export class EventModel extends BaseModel {
  
  constructor() {
    super()
    this.result = null
    this.setCollectionName('events')
  }

  async getAllDocuments() {
    try {
      const sort = {"date": -1}
      this.result = await this.db.find({"deleted": {"$in": [null, false]}}).sort(sort).toArray()
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

  async getCurrentEvent() {
    try {
      let joins = [{$lookup:{from: "cars", // join many cars onto events using event.car_ids
                             localField: "car_ids",
                             foreignField: "_id",
                             as: "cars",
                             pipeline: [
                               {$lookup:{from: "users", // join a user onto the car (from the result of the prev lookup)
                                         localField: "user_id",
                                         foreignField: "_id",
                                         as: "user"}
                               },
                               {$unwind: '$user'},
                               {$lookup:{from: "classes", // join a class onto the car (from the result of the prev lookup)
                                        localField: "class_id",
                                        foreignField: "_id",
                                        as: "class"}
                               },
                               {$unwind: '$class'},
                               {$project: { //exclude these fields from the tables joined
                                  "user.email": 0,
                                  "user.phone": 0}
                              }
                             ]}}] 
      const sort = {"date": 1}
      const where = {"date" : {"$gte": new Date()}, "deleted": {"$in": [null, false]}}
      this.result = await this.db.aggregate(joins).match(where).sort(sort).limit(1).toArray()
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

  async getDocument(id) {
    try {
      let joins = [{$lookup:{from: "cars", // join many cars onto events using event.car_ids
                             localField: "car_ids",
                             foreignField: "_id",
                             as: "cars",
                             pipeline: [
                               {$lookup:{from: "users", // join a user onto the car (from the result of the prev lookup)
                                         localField: "user_id",
                                         foreignField: "_id",
                                         as: "user"}
                               },
                               {$unwind: '$user'},
                               {$lookup:{from: "classes", // join a class onto the car (from the result of the prev lookup)
                                        localField: "class_id",
                                        foreignField: "_id",
                                        as: "class"}

                               },
                               {$unwind: '$class'},
                               {$project: { //exclude these fields from the tables joined
                                  "user.email": 0,
                                  "user.phone": 0}
                              }
                             ]}}]
      const objId = new ObjectId(id)
      const where = {"_id" : objId, "deleted": {"$in": [null, false]}}
      this.result = await await this.db.aggregate(joins).match(where).toArray()
      if(!this.result || this.result.length === 0) { 
        this.result = null
        this.message = 'Not found: ' + id 
      } else {
        this.result = this.result[0]  
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

  async getEventCarList(id) {
    try {
      let fields = { "car_ids": 1 } 
      const objId = new ObjectId(id)
      const where = {"_id" : objId}
      this.result = await this.db.find(where).project(fields).toArray()
      if(!this.result || this.result.length === 0) { 
        this.result = null
        this.message = 'Not found: ' + id 
      } else {
        this.result = this.result[0]  
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
}