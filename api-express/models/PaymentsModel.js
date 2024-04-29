import { BaseModel } from './BaseModel'
const ObjectId = require('mongodb').ObjectId

export class PaymentsModel extends BaseModel {
  
  constructor() {
    super()
    this.result = null
    this.setCollectionName('payments')                                                 
  }

  async getPaymentsByEventId(eventId) {
    try {
      const objId = new ObjectId(eventId)
      this.result = await this.db.find({"event_id": objId, "deleted": {"$in": [null, false]}}).toArray();
      if (!this.result) {
        this.message = 'Not found'
      } else {
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

}