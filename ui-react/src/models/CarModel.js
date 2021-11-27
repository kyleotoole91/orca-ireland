
import { BaseModel } from './BaseModel'

export class CarModel extends BaseModel{
  
  constructor(token) {
    super(token)
    this.setEndpoint(process.env.REACT_APP_API_CARS)
  }

  async post(userId, car) {
    let origEndpoint = this.endpoint
    try {
      this.itemId = userId
      this.endpoint = process.env.REACT_APP_API_USERS
      this.endpoint2 = origEndpoint
      this.urlParams = '?extLookup=1' 
      if (userId === '') {
        this.setErrorMessage('Please specify a user')
      } else if (car.manufacturer === '' || car.model === '' || car.transponder === '' || car.freq === '' || car.class_id === '') {
        this.setErrorMessage('Please fill in all fields')
      } else {
        await super.post(car)
      }
    } finally {
      this.endpoint = origEndpoint 
      return this.responseData
    }
  }

}