
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
    if (!event || event.name === '' || event.location === '' || event.date === '') {
      this.setErrorMessage('Please fill in all fields')
      return
    } else {
      return await super.post(event)
    }
  }

  async enterEvent(eventId, car_ids) {
    return await this.put(eventId, {car_ids})
  }
}