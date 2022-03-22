import { BaseModel } from '../models/BaseModel'

export class MembershipModel extends BaseModel {
  
  constructor() {
    super()
    this.result = null
    this.setCollectionName('memberships')
  }
  
  async getCurrentMembership(showUserDetail) {
    try {
      let fields = { "secret": 0, "users.email": 0, "users.phone": 0 }
      const sort = {"endDate": 1}
      const where = {"endDate" : {"$gte": new Date()}, "deleted": {"$in": [null, false]}}
      if (!showUserDetail) {
        fields = { "users._id": 1, "users.extId": 1 }
      }
      this.result = await this.db.aggregate(this.mongoQuickJoin("users", "user_ids")).match(where).project(fields).sort(sort).limit(1).toArray()
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