
import {BaseModel} from './BaseModel'

export class EventModel extends BaseModel{
  constructor() {
    super()
    this.setEndpoint(process.env.REACT_APP_API_EVENTS)
  }

  async getEvents() {
    this.itemId = ''
    await this.getRequest()
  }

  async getEvent(id) {
    this.itemId = id
    await this.getRequest()
  }

  async deleteEvent(id) {
    this.itemId = id
    await this.deleteRequest()
  }

  async postEvent(name, location, date, fee) {
    try {
      if (name === '' || location === '' || date === '') {
        this.setErrorMessage('Please fill in all fields')
      } else {
        this.setRequestData({name, location, date, fee})
        await this.postRequest()
      }
    } catch(e) {
      this.setErrorMessage(e)
    }
  }

  async enterEvent(eventId, car_ids) {
    if (car_ids && car_ids.length > 0) {
      this.itemId = eventId
      this.setRequestData({car_ids})
      await this.putRequest()
    } else {
      this.setErrorMessage('Please choose at least one car')
    }
  }

}