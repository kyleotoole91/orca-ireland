import {BaseModel} from './BaseModel'

export class ImageModel extends BaseModel{

  constructor(token) {
    super(token)
    this.setEndpoint(process.env.REACT_APP_API_IMAGES)
  }
  
}