import {BaseModel} from './BaseModel'
import {Validator} from '../utils/Validator'

export class UserModel extends BaseModel {
  
  constructor(token) {
    super(token)
    this.Validator = new Validator();
    this.setEndpoint(process.env.REACT_APP_API_USERS)
  }

  validatePhone(phone) {
    const valid = this.Validator.validatePhone(phone)
    this.message = this.Validator.errorMessage
    return valid
  }

  validateName(name) {
    const valid = this.Validator.validateName(name)
    this.message = this.Validator.errorMessage
    return valid
  }

  async put(userId, user) {
    if (user.extId === '' || user.firstName === '' || user.lastName === '') {
      this.message = 'Please fill in all fields'
    } else if (this.validatePhone(user.phone) && this.validateName(user.firstName) && this.validateName(user.lastName)) {
      this.urlParams = '?extLookup=1' //use Auth0 user_id instead of our MongoDB ObjectID
      return await super.put(userId, user)
    }
    return null
  }

  async post(user) {
    if (user.extId === '' || user.firstName === '' || user.lastName === '' || user.phone === '') {
      this.message = 'Please fill in all fields'
    } else if (this.validatePhone(user.phone) && this.validateName(user.firstName) && this.validateName(user.lastName)) {
      return await super.post(user)
    }
    return null
  }

}