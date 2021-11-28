import { BaseController } from './BaseController.js'
import { BaseModel } from '../models/BaseModel'
import { EventModel } from '../models/EventModel'
import { ObjectId } from 'bson'
import { MembershipController } from './MembershipController.js'

export class EventsController extends BaseController { 

  constructor () {
    super()
    this.setCollectionName('events')
    this.db = new EventModel() 
    this.membershipController = new MembershipController()
    this.carDb = new BaseModel('cars') 
  }

  async getAllDocuments(req, res, next) {
    try {
      if (req.query.current === '1') {
        let event = await this.db.getCurrentEvent()
        if (event) {
          return res.status(200).send({
            success: true,
            message: 'current event',
            data: event
          })    
        } else {
          return res.status(404).send({
            success: false,
            message: 'not found'
          })
        }
      } else {
        super.getAllDocuments(req, res, next)
      }
    } catch(e) {
      return res.status(500).send({
        success: false,
        message: 'internal server error: '+e.message
      }) 
    }
  }

  removeUsersCars(user_id, event) {
    for (var car of event.cars) {
      console.log(car.user._id.toString() )
      console.log(user_id.toString() )
      if (car.user._id.toString() === user_id.toString()) {
        event.car_ids.splice(event.car_ids.indexOf(car._id), 1)
      }
    }   
  }

  async updateEvent(req, res) {
    try { 
      let user = await this.getUser(req, res, false)
      let userEnteringEvent = Object.keys(req.body).length === 1 && req.body.hasOwnProperty('car_ids') 
      let hasPermission = userEnteringEvent || this.permissions.check(this.getToken(req), 'put', this.collectionName)
      if (!hasPermission){
        return res.status(403).send({
          success: false,
          message: 'forbidden'
        })
      }
      let event = await this.db.getDocument(req.params.eventId)  
      if (!event) {
        return res.status(404).send({
          success: false,
          message: 'not found: ' + this.db.message
        })
      }
      if (userEnteringEvent) {
        let hasMembership = await this.membershipController.extIdActiveMember(user.extId)
        if (!hasMembership) {
          return res.status(403).send({
            success: false,
            message: 'You need to activate your membership before you can enter events'
          })    
        }
        let car //check the car(s) belongs to the user
        for (var carId of req.body.car_ids) {
          objId = new ObjectId(carId)
          car = this.carDb.getUserDocument(user._id, carId)
          if (!car){
            return res.status(404).send({
              success: false,
              message: 'user car not found: ' + this.carDb.message
            })  
          }
        }
        if (!event.hasOwnProperty('car_ids')) {  
          event.car_ids = []
        } else {
          this.removeUsersCars(user._id, event)
        }

        let objId
        for (var car_id of req.body.car_ids) {
          objId = new ObjectId(car_id) //add cars that don't already exist to the car_ids array
          if (!this.objectIdExists(event.car_ids, objId)) {
            event.car_ids.push(objId)   
          }
        }
        event = await this.db.updateDocument(req.params.eventId, {'car_ids': event.car_ids})  
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