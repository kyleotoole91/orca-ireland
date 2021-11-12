import { BaseModel } from '../models/BaseModel'
import mongoClient from '../mongo-client'

export class MembershipModel extends BaseModel {
  
  constructor() {
    super()
    this.result = null
    this.setCollectionName('memberships')
  }
   
  async getLatestMembership(){
    try {
      const fields = { secret: 0, users: 0 }
      const sort = {'startDate': 1}
      const join = [{$lookup:{ from: 'users', 
                               localField: 'users', //todo: try to get working with array of objectids (users field)
                               foreignField: '_id',
                               as: 'userList' }}]
      this.result = await this.db.aggregate(join).project(fields).sort(sort).limit(1).toArray()
      console.log(this.result)
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