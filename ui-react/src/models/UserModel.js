
import {BaseModel} from './BaseModel'

export class UserModel extends BaseModel{
  
  constructor() {
    super()
    this.setEndpoint(process.env.REACT_APP_API_USERS)
  }

  async getUsers() {
    this.reset()
    await this.getRequest()
  }

  async getUser(id) {
    this.reset()
    this.itemId = id
    this.urlParams = '?extLookup=1'
    await this.getRequest()
  }

  async putUser(user) {
    this.reset()
    if (user.firstName === '' || user.lastName === '' || user.phone === '') {
      this.message = 'Please fill in all fields'
    } else {
      this.itemId = user.extId
      this.urlParams = '?extLookup=1'
      this.requestData = user
      await this.putRequest()
    }
  }

}