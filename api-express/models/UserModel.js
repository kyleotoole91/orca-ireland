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

}