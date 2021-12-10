
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
      return
    }
    if (!event || event.name === '' || event.location === '' || event.date === '') {
      return
    } else {
      if (typeof event.fee === 'string') {
        event.fee = parseFloat(event.fee.replace('€', ''))
      }
      this.setErrorMessage('Please fill in all fields')
      return await super.post(event)
    }
  }

  async put(eventId, event) {
    if (event.name === 'Round ' || event.name === 'Round') {
      this.setErrorMessage('Please specify a round name or number')  
      return
    }
    if (!event || event.name === '' || event.location === '' || event.date === '') {
      this.setErrorMessage('Please fill in all fields')
      return
    } else {
      if (typeof event.fee === 'string') {
        event.fee = parseFloat(event.fee.replace('€', ''))
      }
      return await super.put(eventId.toString(), event)
    }
  }

  async enterEvent(eventId, car_ids) {
    return await this.put(eventId.toString(), {car_ids})
  }
}