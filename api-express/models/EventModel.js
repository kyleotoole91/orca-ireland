import { BaseModel } from './BaseModel'
const ObjectId = require('mongodb').ObjectId

export class EventModel extends BaseModel {
  
  constructor() {
    super()
    this.result = null
    this.setCollectionName('events')
  }

  async getDocument(id) {
    try {
      let joins = [{$lookup:{from: "cars", 
                             localField: "car_ids",
                             foreignField: "_id",
                             as: "cars",
                             let: {userId: "$_id"},
                             pipeline: [
                               {$lookup:{from: "users", 
                                         localField: "user_id",
                                         foreignField: "_id",
                                         as: "user"}
                               },
                               {$lookup:{from: "classes", 
                                        localField: "class_id",
                                        foreignField: "_id",
                                        as: "class"}
                               },
                               {$project: {
                                  "user.email": 0,
                                  "user.phone": 0
                                }
                              }
                             ]}}]
      const objId = new ObjectId(id)
      const where = {"_id" : objId}
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
      this.result = await await this.db.aggregate(joins).match(where).project(fields).toArray()
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