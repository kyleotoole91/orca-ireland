import { BaseModel } from './BaseModel'

export class PaymentModel extends BaseModel {
  
  constructor() {
    super()
    this.result = null
    this.setCollectionName('payments')                                                 
  }

  async getPaymentsByEventAndUser(eventId, userId) {
    try {
      this.result = await this.db.find({"event_d": eventId}).toArray()
      await this.db.findOne({ "event_id": eventId, "user_id": userId,"deleted": {"$in": [null, false]} })
      if(!this.result) {
        this.message = 'Not found: ' + eventId
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

  async getPaymentsByMembershipId(membershipId) {
    try {
      this.result = await this.db.find({"membership_id": membershipId}).toArray()
      await this.db.findOne({ "membership_id": membershipId, "deleted": {"$in": [null, false]} })
      if(!this.result) {
        this.message = 'Not found: ' + membershipId
      }
      else {
        this.message = this.collectionName
      }
    }
    catch (error) {
      this.result = null
      this.message = error.message
      console.log(error)
    } finally {
      return this.result  
    }
  }

  async getPaymentsByEventId(eventId) {
    try {
      this.result = await this.db.find({"event_id": eventId}).toArray()
      await this.db.findOne({ "event_id": eventId, "deleted": {"$in": [null, false]} })
      if(!this.result) {
        this.message = 'Not found: ' + eventId
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

  async getAllDocuments() {
    try {
      const sort = {"endDate": -1}
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
}