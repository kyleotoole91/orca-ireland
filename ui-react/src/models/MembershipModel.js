
import {BaseModel} from './BaseModel'

export class MemeberModel extends BaseModel{
  constructor() {
    super()
    this.baseURL = process.env.REACT_APP_API_URL
    this.endpoint = process.env.REACT_APP_API_MEMBERSHIPS
  }

  async getCurrentMembership() {
    this.urlParams = '?current=1'
    await this.get()
  }

  async post(membership) {
    if (!membership) {
      this.setErrorMessage('Please supply a membership object')
      return
    } else {
      return super.post(membership)
    }
  }
}