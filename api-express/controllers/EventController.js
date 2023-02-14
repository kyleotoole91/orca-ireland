import { BaseController } from './BaseController.js'
import { BaseModel } from '../models/BaseModel'
import { EventModel } from '../models/EventModel'
import { ObjectId } from 'bson'
import { MembershipController } from './MembershipController.js'

const cRegistrationHours = 40

export class EventController extends BaseController { 

  constructor () {
    super()
    this.setCollectionName('events')
    this.db = new EventModel() 
    this.membershipController = new MembershipController()
    this.carDb = new BaseModel('cars') 
  }

  async getDocument(req, res) {
    try {
      let user = await this.getUser(req, res, false)
      let hasMembership = false
      if (user && user.hasOwnProperty('extId')) {
        hasMembership = await this.membershipController.extIdActiveMember(user.extId)
      }
      if (!hasMembership) {
        return res.status(403).send({
          success: false,
          message: 'You must have an active membership to use this feature'
        })    
      } else {
        super.getDocument(req, res)
      }
    } catch(e) {
      console.log(e)
      return res.status(500).send({
        success: false,
        message: e.message
      }) 
    }
  }

  async getAllDocuments(req, res, next) {
    try {
      if (req.query.current === '1') {
        let events = await this.db.getUpcomingEvents()
        if (events) {
          return res.status(200).send({
            success: true,
            message: 'upcoming events',
            data: events
          })    
        } else {
          return res.status(404).send({
            success: false,
            message: 'not found'
          })
        }
      } else if (req.query.startDate && req.query.endDate) {
        let events = await this.db.getByDateRange(req.query.startDate, req.query.endDate) 
        return res.status(200).send({
          success: true,
          message: 'events by date range',
          data: events
        }) 
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
    let userCarIdx = -1
    for (var car of event.cars) {
      if (car.user._id.toString() === user_id.toString()) {
        userCarIdx = this.indexOfObjectId(event.car_ids, car._id)
        if (userCarIdx >= 0) {
          console.log(event.car_ids.splice(userCarIdx, 1))
        }
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
      let event = await this.db.getDocument(req.params.id) 
      if (!event) {
        return res.status(404).send({
          success: false,
          message: this.db.message
        })
      }
      if (userEnteringEvent) {
        let hasMembership = await this.membershipController.extIdActiveMember(user.extId)
        if (!hasMembership) {
          return res.status(403).send({
            success: false,
            message: 'You must have an active membership to use this feature'
          })    
        }
        if (((event.date - new Date()) / 36e5) < cRegistrationHours) {
          return res.status(403).send({
            success: false,
            message: 'Registration is closed'
          })    
        }
        let classIds = []
        let car //check the car(s) belongs to the user
        for (var carId of req.body.car_ids) {
          car = await this.carDb.getUserDocument(user._id.toString(), carId.toString())
          if (!car){
            return res.status(404).send({
              success: false,
              message: this.carDb.message
            })  
          } else {
            if (classIds.indexOf(car.class_id.toString()) >= 0) {
              return res.status(422).send({
                success: false,
                message: 'You can only enter with one car per class'
              }) 
            } else {
              classIds.push(car.class_id.toString()) 
            }
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
        event = await this.db.updateDocument(req.params.id, {'car_ids': event.car_ids})  
      } else {
        for (var a=0; a<req.body.car_ids.length-1; a++) {
          req.body.car_ids[a] = new ObjectId(req.body.car_ids[a])
        }
        event = await this.db.updateDocument(req.params.id, req.body)   
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

/*
event validation
return res.status(403).send({
        success: false,
        message: 'forbidden'
      })
    } else if(!req.body.name) {
      return res.status(400).send({
        success: false,
        message: 'name is required',
      })
    } else if(!req.body.location) {
      return res.status(400).send({
        success: false,
        message: 'location is required',
      })
    } else if(!req.body.date) {
      return res.status(400).send({
        success: false,
        message: 'date is required',
      })
    } else if(!req.body.price) {
      return res.status(400).send({
        success: false,
        message: 'price is required',
      })
    } else { 
      
    }
*/