import { BaseController } from './BaseController.js'
import { MembershipController } from './MembershipController.js'

export class EventsController extends BaseController { 

  constructor () {
    super()
    this.setCollectionName('events')
    this.membershipController = new MembershipController()
  }

  async updateEvent(req, res) {
    try { 
      let user = await this.getUser(req, res, false)
      let addingMember = Object.keys(req.body).length === 1 && req.body.hasOwnProperty('extId')
      let hasPermission = (addingMember && user.extId !== req.body.extId) || this.permissions.check(this.getToken(req), 'put', this.collectionName)
      if (!hasPermission){
        return res.status(403).send({
          success: false,
          message: 'unauthorized'
        })
      }
      let event = await this.db.getDocument(req.params.eventId)
      if (!event) {
        return res.status(404).send({
          success: false,
          message: 'not found: ' + this.db.message
        })
      }
      if (addingMember) {
        let hasMembership = await this.membershipController.extIdActiveMember(user.extId)
        if (!hasMembership) {
          return res.status(403).send({
            success: false,
            message: 'unauthorized: user does not have an active membership'
          })    
        }
        if (!event.hasOwnProperty('user_ids')) {  
          event.user_ids = []
        }
        if (!this.objectIdExists(event.user_ids, user._id)) {
          event.user_ids.push(user._id)
          event = await this.db.updateDocument(req.params.eventId, event) 
        }
      } else {
        event = await this.db.updateDocument(req.params.eventId, req.body)   
      }
      if (!event) {
        return res.status(500).send({
          success: false,
          message: this.db.message
        })
      } else {
        return res.status(200).send({
          success: true,
          message: 'event application successfull'
        })
      }
    } catch(e) {
      return res.status(500).send({
        success: false,
        message: 'internal server error: '+e.message
      }) 
    }
  }

}