import { BaseModel } from '../models/BaseModel'
import { BaseController } from './BaseController.js'
import { MembershipController } from './MembershipController.js'

export class EventsController extends BaseController { 

  constructor () {
    super()
    this.setCollectionName('events')
    this.db = new MembershipModel() 
    this.MembershipController = new MembershipController()
  }

  async putUserEvent(req, res, force) {
    try {
      if (!this.extIdActiveMember(this.getToken(req))) {
        return res.status(403).send({
          success: false,
          message: 'unauthorized: user does not have an active membership'
        })    
      } else {
        //todo
      }
    } catch(e) {
      return res.status(500).send({
        success: false,
        message: 'internal server error: '+e.message
      }) 
    }
  }

}