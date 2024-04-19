import {BaseModel} from './BaseModel'

export class UnsubscribeModel extends BaseModel{

  constructor(token) {
    super(token)
    this.setEndpoint(process.env.REACT_APP_API_UNSUBSCRIBE)
  }

  async unsubscribe(email, resubscribe = false) {
    return await super.post({ email, subscribe: resubscribe })
  }
  
}