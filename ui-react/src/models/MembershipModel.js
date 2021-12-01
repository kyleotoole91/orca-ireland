
import {BaseModel} from './BaseModel'

export class MembershipModel extends BaseModel{
  constructor(token) {
    super(token)
    this.baseURL = process.env.REACT_APP_API_URL
    this.endpoint = process.env.REACT_APP_API_MEMBERSHIPS
  }

  async getCurrentMembership() {
    this.urlParams = '?current=1'
    return await this.get()
  }

  async post(membership) {
    if (!membership || membership.name === '' || membership.secret === '' || membership.price === '') {
      this.setErrorMessage('Please fill in all fields')
      return
    } else {
      return super.post(membership)
    }
  }

  async activateMembership(membershipId, extId, secret) {
    if (!secret || secret === '') {
      this.setErrorMessage('Please supply an activation code')
      return
    } else {
      return super.put(membershipId, {extId, secret})
    }
  }
}