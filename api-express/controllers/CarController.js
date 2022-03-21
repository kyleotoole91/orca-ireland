import { EventModel } from '../models/EventModel'
import { BaseController } from './BaseController.js'

export class CarController extends BaseController { 

  constructor () {
    super()
    this.setCollectionName('cars')
    this.eventDB = new EventModel()
  }

  async deleteUserDocument(req, res) {
    try {
      const currentEvent = await this.eventDB.getCurrentEvent()
      if (currentEvent && 
          currentEvent.length > 0 &&
          currentEvent[0].hasOwnProperty('car_ids') &&
          this.objectIdExists(currentEvent[0].car_ids, req.params.docId)) { 
            return res.status(403).send({
            success: false,
            message: 'Unable to delete car since it is registered in an upcoming event'
          })   
      } else {
        return super.deleteUserDocument(req, res)
      }
    } catch(e) {
      return res.status(500).send({
        success: false,
        message: 'internal server error: '+e.message
      }) 
    }
  }

}