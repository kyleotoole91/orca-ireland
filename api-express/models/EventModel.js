import { BaseModel } from './BaseModel';

export const cRegistrationHours = 39;

const ObjectId = require('mongodb').ObjectId;
const cUpcomingEventDays = 30;
const cRegistrationOpenDays = 7; 

export class EventModel extends BaseModel {
  
  constructor(includeEmail) {
    super()
    this.result = null
    this.setCollectionName('events')
    const exlusions = includeEmail 
      ? { "user.phone": 0 }
      : { "user.email": 0, "user.phone": 0 }
    this.mongoPipeline = [
      {$lookup:{from: "users", // join the user document onto the car (from the result of the root lookup)
        localField: "user_id",
        foreignField: "_id",
        as: "user"}},
      {$unwind: '$user'}, //remove array, making it a one to one
      {$lookup:{from: "classes", // join a class onto the car (from the result of the previous lookup)
        localField: "class_id",
        foreignField: "_id",
        as: "class"}
      },
      {$unwind: '$class'}, //remove array, making it a one to one
      {$project: exlusions } //exclude these fields from the tables joined
    ]                                                  
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

  subtractDaysFromDate(currentDate, daysToSubtract) {
      daysToSubtract = daysToSubtract || 0;
      const pastDate = new Date(currentDate);
      pastDate.setDate(pastDate.getDate() - daysToSubtract);

      return pastDate
  }

  addRegistrationCloseDate(event) {
    const eventDate = new Date(event.date);
    event.closeDate = event.closeDate
      ? new Date(event.closeDate)
      : new Date(eventDate.setHours(eventDate.getHours() - cRegistrationHours));
    const openDate = this.subtractDaysFromDate(new Date(event.date), cRegistrationOpenDays);
    event.openDate = event.openDate
      ? new Date(event.openDate)
      : openDate;
  }

  addRegistrationCloseDates(events) {
    events && events.forEach(event => this.addRegistrationCloseDate(event));
  }

  async getCurrentEvent() {
    try {
      let joins = [
        {$lookup:{from: "cars", // join many cars onto events using event.car_ids
          localField: "car_ids",
          foreignField: "_id",
          as: "cars",
          pipeline: this.mongoPipeline}},
        {$lookup:{from: "eventTypes", // join the user document onto the car (from the result of the root lookup)
          localField: "eventType_id",
          foreignField: "_id",
          as: "eventType"}},
      ]
      const sort = {"date": 1}
      const where = {"date" : {"$gte": new Date()}, "deleted": {"$in": [null, false]}}
      this.result = await this.db.aggregate(joins).match(where).sort(sort).limit(1).toArray()

      if (!this.result) { 
        this.message = 'Not found: ' + id 
      } else {
        this.message = this.collectionName
      }

    } catch (error) {
      this.result = null
      this.message = error.message
      console.log(error)
    } finally {
      this.addRegistrationCloseDates(this.result);
      return this.result  
    }
  }  

  async getUpcomingEvents() {
    try {
      const maxDate = new Date()
      maxDate.setDate(maxDate.getDate() + cUpcomingEventDays)
      let joins = [
        {$lookup:{from: "cars", // join many cars onto events using event.car_ids
          localField: "car_ids",
          foreignField: "_id",
          as: "cars",
          pipeline: this.mongoPipeline}},
        {$lookup:{from: "eventTypes", // join the user document onto the car (from the result of the root lookup)
          localField: "eventType_id",
          foreignField: "_id",
          as: "eventType"}},
      ] 
      const sort = {"date": 1}
      const where = {"date" : {"$gt": new Date(), "$lt": maxDate}, "deleted": {"$in": [null, false]}}
      this.result = await this.db.aggregate(joins).match(where).sort(sort).toArray()
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
      this.addRegistrationCloseDates(this.result);
      return this.result  
    }
  }  

  async getByDateRange(startDate, endDate) { //YYYY-MM-DD
    try {
      if (startDate && endDate) {
        var sDateStr = startDate.split('-')
        var sDate = new Date(sDateStr[0], sDateStr[1]-1, sDateStr[2])
        var eDateStr = endDate.split("-")
        var eDate = new Date(eDateStr[0], eDateStr[1]-1, eDateStr[2]) 
        eDate.setDate(eDate.getDate() + 1)
      }
      const joins = [{
        $lookup:{from: "races", // join many cars onto events using event.car_ids
        localField: "_id",
        foreignField: "event_id",
        as: "races",
        pipeline: [{
          "$match": { //"join" condition
          "deleted": {"$in": [null, false]}
        }}]
      }}] 
      const sort = {"date": 1}
      const where = {"date" : {"$gte": sDate, "$lt": eDate}, "deleted": {"$in": [null, false]}}
      this.result = await this.db.aggregate(joins).match(where).sort(sort).toArray()
      if (!this.result) { 
        this.message = 'Not found: ' + id 
      } else {
        this.message = this.collectionName
      }
    } catch (error) {
      this.result = null
      this.message = error.message
      console.log(error)
    } finally {
      this.addRegistrationCloseDates(this.result);
      return this.result  
    }
  }  

  async getDocument(id, query) {
    try {
      let joins = [] 
      const objId = new ObjectId(id)
      const where = {"_id" : objId, "deleted": {"$in": [null, false]}}
      let showDetail = query && query.hasOwnProperty('detail') && (query.detail == 1)
      if (showDetail || this.loadDetail) {
        joins = [{$lookup:{from: "cars", // join many cars onto events using event.car_ids
            localField: "car_ids",
            foreignField: "_id",
            as: "cars",
            pipeline: this.mongoPipeline}
          },
          {$lookup:{from: "races", // join many races
            localField: "_id",
            foreignField: "event_id",
            as: "races"}
          }
        ]
      }
      this.result = await this.db.aggregate(joins).match(where).toArray()
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
      this.addRegistrationCloseDate(this.result);
      return this.result  
    }
  }

  async getEventCarList(id) {
    try {
      let fields = { "car_ids": 1 } 
      const objId = new ObjectId(id)
      const where = {"_id" : objId}
      this.result = await this.db.find(where).project(fields).toArray()
      if (!this.result || this.result.length === 0) { 
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

  async updateDocument(id, document){
    this.message = 'Updated'
    try {
      const objId = new ObjectId(id)
      this.applyDataTypes(document)
      if (document.hasOwnProperty('car_ids')) {
        for (var a = 0; a < document.car_ids.length; a++) {
          document.car_ids[a] = new ObjectId(document.car_ids[a])
        }
      }
      this.result = await this.db.findOneAndUpdate({'_id': objId}, {$set:  document })
      if (!this.result || !this.result.hasOwnProperty('ok') || this.result.ok !== 1) {
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

  async addPaidUserId(id, userId) {
    this.message = 'Updated'
    try {
      const objId = new ObjectId(id)
      const userObjId = new ObjectId(userId)
      
      this.result = await this.db.findOne({'_id': objId})
      const paidUsers = this.result.paid_user_ids;
      const mappedPaidUsers = paidUsers ? paidUsers.map(x => x.toString()) : [];
      if (!this.result || mappedPaidUsers.length !== 0 && mappedPaidUsers.indexOf(userId) !== -1) { 
        this.result = null
        this.message = 'user already paid: ' + userId
        return this.result
      }

      this.result = await this.db.findOneAndUpdate({'_id': objId}, {$push: { "paid_user_ids": userObjId }})
      
      if (!this.result || !this.result.hasOwnProperty('ok') || this.result.ok !== 1) {
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

  async deletePaidUser(id, userId) {
    this.message = 'Updated'
    try {
      const objId = new ObjectId(id)
      const userObjId = new ObjectId(userId)
      
      this.result = await this.db.findOne({'_id': objId})
      const paidUsers = this.result.paid_user_ids;
      const mappedPaidUsers = paidUsers ? paidUsers.map(x => x.toString()) : [];
      if (!this.result || mappedPaidUsers.length === 0 || mappedPaidUsers.indexOf(userId) === -1) { 
        this.result = null
        this.message = 'user not found: ' + userId
        return this.result
      }

      this.result = await this.db.findOneAndUpdate({'_id': objId}, {$pull: { "paid_user_ids": userObjId }})
      
      if (!this.result || !this.result.hasOwnProperty('ok') || this.result.ok !== 1) {
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

  async markEventAsNotified(id) {
    try {
      const objId = new ObjectId(id)
      const result = await this.db.findOneAndUpdate({'_id': objId}, {$set: { "notified": true }})
      if (!result || !result.hasOwnProperty('ok') || result.ok !== 1) {
        return {
          success: false,
          message: 'Error updating: ' + id
        }
      } else {
        return {
          success: true,
          message: 'Updated'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }

  async markEventAsReminded(id) {
    try {
      const objId = new ObjectId(id)
      const result = await this.db.findOneAndUpdate({'_id': objId}, {$set: { "reminded": true }})
      if (!result || !result.hasOwnProperty('ok') || result.ok !== 1) {
        return {
          success: false,
          message: 'Error updating: ' + id
        }
      } else {
        return {
          success: true,
          message: 'Updated'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }

}