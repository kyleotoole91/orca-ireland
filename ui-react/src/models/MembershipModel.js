
import {BaseModel} from './BaseModel'

export class MemeberModel extends BaseModel{
  constructor() {
    super()
    this.baseURL = process.env.REACT_APP_API_URL
    this.endpoint = process.env.REACT_APP_API_MEMBERSHIPS
  }

  async getMemberships() {
    this.reset()
    this.getRequest()
  }

  async getMembership(id) {
    this.reset()
    this.itemId = id
    this.getRequest()
  }

  async getCurrentMembership() {
    this.reset()
    this.urlParams = '?current=1'
    await this.getRequest()
  }

  async deleteMembership(id) {
    this.reset()
    this.itemId = id
    this.deleteRequest()
  }

  async postMembership(membership) {
    this.reset()
    try {
      if (!membership) {
        this.setErrorMessage('Please supply a membership object')
      } else {
        this.setRequestData(membership)
        this.postRequest()
      }
    } catch(e) {
      this.setErrorMessage(e)
    } finally {
      setLoading(false)
    }
  }
}