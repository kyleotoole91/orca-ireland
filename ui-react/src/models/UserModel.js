import {BaseModel} from './BaseModel'

export class UserModel extends BaseModel {
  
  constructor(token) {
    super(token)
    this.setEndpoint(process.env.REACT_APP_API_USERS)
  }

  async put(userId, user) {
    if (user.extId === '' || user.firstName === '' || user.lastName === '') {
      this.message = 'Please fill in all fields'
      return
    } else {
      this.urlParams = '?extLookup=1'
      return await super.put(userId, user)
    }
  }

  async post(user) {
    if (user.extId === '' || user.firstName === '' || user.lastName === '') {
      this.message = 'Please fill in all fields'
      return
    } else {
      return await super.post(user)
    }
  }

}