import { BaseModel } from './BaseModel'

export class EventTypeModel extends BaseModel {
  
  constructor(token) {
    super(token)
    this.setEndpoint(process.env.REACT_APP_API_EVENT_TYPES)
  }

}