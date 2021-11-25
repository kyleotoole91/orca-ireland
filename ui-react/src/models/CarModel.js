
import { BaseModel } from './BaseModel'

export class CarModel extends BaseModel{
  
  constructor() {
    super()
    this.setEndpoint(process.env.REACT_APP_API_CARS)
  }

  async getCars() {
    this.reset()
    await this.getRequest()
  }

  async getUserCars(userId) {
    this.reset()
    let origEndpoint = this.endpoint
    try {
      this.itemId = userId
      this.endpoint = process.env.REACT_APP_API_USERS
      this.endpoint2 = origEndpoint
      this.urlParams = '?extLookup=1' 
      await this.getRequest()
    } finally {
      this.endpoint = origEndpoint
    } 
  }

  async getCar(id) {
    this.reset()
    this.itemId = id
    await this.getRequest()
  }

  async deleteCar(id) {
    this.reset()
    this.itemId = id
    await this.deleteRequest()
  }

  async deleteUserCar(userId, carId) {
    let origEndpoint = this.endpoint
    try {
      this.reset()
      this.itemId = userId
      this.itemId2 = carId
      this.endpoint = process.env.REACT_APP_API_USERS
      this.endpoint2 = origEndpoint
      this.urlParams = '?extLookup=1' 
      await this.deleteRequest()
    } finally {
      this.endpoint = origEndpoint
    } 
  }

  async postCar(userId, manufacturer, model, freq, transponder, classId) {
    let origEndpoint = this.endpoint
    try {
      this.reset() 
      this.itemId = userId
      this.endpoint = process.env.REACT_APP_API_USERS
      this.endpoint2 = origEndpoint
      this.urlParams = '?extLookup=1' 
      if (manufacturer === '' || model === '' || transponder === '' || freq === '' || classId === '') {
        this.setErrorMessage('Please fill in all fields')
      } else {
        this.setRequestData({manufacturer, model, freq, transponder, classId})
        await this.postRequest()
      }
    } catch(e) {
      this.setErrorMessage(e)
    } finally {
      this.endpoint = origEndpoint   
    }
  }
}