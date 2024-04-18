import { BaseModel } from './BaseModel'

export class UserModel extends BaseModel {
  
  constructor() {
    super()
    this.result = null
    this.setCollectionName('users')                                                 
  }

  async getUserByEmail(email) {
    try {
      this.result = await this.db.findOne({"email": email, "deleted": {"$in": [null, false]}});
      if(!this.result) {
        this.message = 'Not found: ' + email
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

  async subscribeUserByEmail(email, subscribe) {
    try {
      this.result = await this.db.updateOne({"email": email}, {"$set": {"unsubscribed": !subscribe}});
      if(!this.result || this.result.matchedCount === 0) {
        this.message = 'Email address not found: ' + email
      } else {
        this.message = `${email} will ${!subscribe ? 'no longer' : 'now'} receive marketing emails`
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