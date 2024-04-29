import {BaseModel} from './BaseModel'

export class EventModel extends BaseModel{

  constructor(token) {
    super(token)
    this.setEndpoint(process.env.REACT_APP_API_EVENTS)
  }

  async getCurrentEvent() {
    this.urlParams = '?current=1'
    return await this.get()
  }

  async post(event) {
    if (event.name === 'Round ' || event.name === 'Round') {
      this.setErrorMessage('Please specify a round name or number')  
      return null
    }
    if (!event || event.name === '' || event.location === '' || event.date === '') {
      return null
    } else {
      if (typeof event.fee === 'string') {
        event.fee = parseFloat(event.fee.replace('€', ''))
      }
      return await super.post(event)
    }
  }

  async getEventPayments(eventId) {
    this.itemId = eventId
    this.endpoint2 = '/payments'
    return await super.get(eventId)
  }

  async put(eventId, event) {
    if (event.name === 'Round ' || event.name === 'Round') {
      this.setErrorMessage('Please specify a round name or number')  
      return null
    }
    if (!event || event.name === '' || event.location === '' || event.date === '') {
      this.setErrorMessage('Please fill in all fields')
      return null
    } else {
      if (typeof event.fee === 'string') {
        event.fee = parseFloat(event.fee.replace('€', ''))
      }
      return await super.put(eventId.toString(), event)
    }
  }

  async addPaidUser(eventId, userId) {
    try {
      const url = `${this.baseURL}/events/${eventId.toString()}/paid_user`
      await fetch(url, {
                  method: 'POST', 
                  headers: {Authorization: `Bearer ${this.apiToken}`, "Content-Type": "application/json"},
                  body: JSON.stringify({paid_user_id: userId})
                })
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

  async deletePaidUser(eventId, userId) {
    try {
      await fetch(`${this.baseURL}/events/${eventId.toString()}/paid_user/${userId}`, {
                  method: 'DELETE', 
                  headers: {Authorization: `Bearer ${this.apiToken}`, "Content-Type": "application/json"}})
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

  async enterEvent(eventId, car_ids) {
    return await this.put(eventId.toString(), {car_ids})
  }
}