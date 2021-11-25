
import {BaseModel} from './BaseModel'

export class ClassModel extends BaseModel{
  
  constructor() {
    super()
    this.setEndpoint(process.env.REACT_APP_API_CLASSES)
  }

  async getClasses() {
    this.reset()
    await this.getRequest()
  }

}