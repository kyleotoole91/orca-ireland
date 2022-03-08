import {BaseModel} from './BaseModel'
import {Validator} from '../utils/Validator'

export class UserModel extends BaseModel {
  
  constructor(token) {
    super(token)
    this.Validator = new Validator()
    this.setEndpoint(process.env.REACT_APP_API_USERS)
  }

  validPhone(phone) {
    if (phone === '') {
      this.message = 'Please enter a phone number'
      return false  
    }
    this.Validator.validatePhone(phone)
    this.message = this.Validator.errorMessage
    return this.Validator.valid
  }

  validName(name) {
    if (name === '') {
      this.message = 'Please enter a name'
      return false  
    }
    this.Validator.validateName(name)
    this.message = this.Validator.errorMessage
    return this.Validator.valid
  }

  validUser(user) {
    return this.validName(user.firstName) && 
           this.validName(user.lastName) && 
           this.validPhone(user.phone) && 
           this.validPhone(user.ecPhone) && 
           this.validName(user.ecName)
  }

  async put(userId, user) {
    if (this.validUser(user)) {
      this.urlParams = '?extLookup=1' //use Auth0 user_id instead of our MongoDB ObjectID
      return await super.put(userId, user)
    } 
    return null
  }

  async post(user) {
    if (this.validUser(user)) {
      return await super.post(user)
    } 
    return null
  }

}