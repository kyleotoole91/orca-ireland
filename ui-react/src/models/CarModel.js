
import {BaseModel} from './BaseModel'

export class CarModel extends BaseModel{
  
  constructor() {
    super()
    this.setEndpoint(process.env.REACT_APP_API_CARS)
  }

  async getCars() {
    await this.getRequest()
  }

  async getUserCars(userId) {
    let origEndpoint = this.endpoint
    try {
      this.itemId = userId
      this.endpoint = process.env.REACT_APP_API_USERS
      this.endpoint2 = origEndpoint
      this.urlParams = '?extLookup=1' 
      await this.getRequest()
    } finally {
      this.endpoint = origEndpoint
      this.endpoint2 = ''
      this.urlParams = ''
    } 
  }

  async getCar(id) {
    this.itemId = id
    await this.getRequest()
  }

  async deleteCar(id) {
    this.itemId = id
    await this.deleteRequest()
  }

  async postCar(manufacturer, model, freq, transponder, classId) {
    try {
      if (manufacturer === '' || model === '' || transponder === '' || freq === '' || classId === '') {
        this.setErrorMessage('Please fill in all fields')
      } else {
        this.setRequestData({manufacturer, model, freq, transponder, classId})
        await this.postRequest()
      }
    } catch(e) {
      this.setErrorMessage(e)
    }
  }

}