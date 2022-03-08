import { BaseModel } from './BaseModel'

export class MemberTypes extends BaseModel {
  
  constructor(token) {
    super(token)
    this.setEndpoint(process.env.REACT_APP_API_MEMBER_TYPES)
  }

}