import { BaseModel } from './BaseModel'

export class CarModel extends BaseModel {
  
  constructor(token) {
    super(token)
    this.setEndpoint(process.env.REACT_APP_API_CARS)
  }

  async post(userId, car) {
    let origEndpoint = this.endpoint
    try {
      if (userId === '') {
        this.setErrorMessage('Please specify a user')
      } else if (car.manufacturer === '' || car.model === '' || car.transponder === ''|| car.color === '' || car.freq === '' || car.class_id === '') {
        this.setErrorMessage('Please fill in all fields')
      } else {
        await super.postUserDoc(userId, car)
      }
    } finally {
      this.endpoint = origEndpoint 
      return this.responseData
    }
  }

  async put(userId, carId, car) {
    let origEndpoint = this.endpoint
    try {
      if (userId === '') {
        this.setErrorMessage('Please specify a user')
      } else if (car.manufacturer === '' || car.model === '' || car.transponder === ''|| car.color === '' || car.freq === '' || car.class_id === '') {
        this.setErrorMessage('Please fill in all fields')
      } else {
        await super.putUserDoc(userId, carId, car)
      }
    } finally {
      this.endpoint = origEndpoint 
      return this.responseData
    }
  }

}