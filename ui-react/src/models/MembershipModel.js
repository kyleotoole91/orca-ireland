import {BaseModel} from './BaseModel'

export class MembershipModel extends BaseModel {
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
    if (!membership || membership.name === '' || membership.secret === '' || membership.fee === '') {
      this.setErrorMessage('Please fill in all fields')
      return null
    } else {
      let prc = membership.fee 
      if (typeof prc == 'string') {
        membership.fee = parseFloat(prc.replace('€', ''))
      }
      return super.post(membership)
    }
  }

  async activateMembership(membershipId, extId, secret) {
    if (!secret || secret === '') {
      this.setErrorMessage('Please supply an activation code')
      return null
    } else {
      return super.put(membershipId, {extId, secret})
    }
  }

  async putActiveUser(membershipId, userId, active) {
    try {
      this.itemId = membershipId
      const body = { user_id: userId, active }
      await fetch(this.baseURL + this.endpoint + `/${this.itemId}/active_user`, {
          method: 'PUT', 
          headers: {Authorization: `Bearer ${this.apiToken}`, "Content-Type": "application/json"},
          body: JSON.stringify(body)})
      .then(response => response.json())
      .then((response) => {
        this.setResponseData(response)
      })  
    } catch(e) {
      this.setErrorMessage(e)
    } finally {
      this.reset()
      return this.responseData
    } 
  }

}