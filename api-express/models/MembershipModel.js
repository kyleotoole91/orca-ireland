import { BaseModel } from '../models/BaseModel'

export class MembershipModel extends BaseModel {
  
  constructor() {
    super()
    this.result = null
    this.setCollectionName('memberships')
  }
  
  async getCurrentMembership() {
    try {
      const fields = { "secret": 0 }
      const sort = {"endDate": 1}
      const join = this.mongoQuickJoin("users", "user_ids")
      const where = {"endDate" : {"$gte": new Date()}, "deleted": {"$in": [null, false]}}
      this.result = await this.db.aggregate(join).match(where).project(fields).sort(sort).limit(1).toArray()
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

}