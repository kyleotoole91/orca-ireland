import { BaseModel } from '../models/BaseModel'
import { BaseController } from './BaseController.js'

export class EventsController extends BaseController { 

  constructor () {
    super()
    this.setCollectionName('events')
    this.db = new MembershipModel() 
  }

  async putUserEvent(req, res, force) {
    try {
     //TODO
    } catch(e) {
      return res.status(500).send({
        success: false,
        message: 'internal server error: '+e.message
      }) 
    }
  }

}