import { EventsModel } from '../models/events'
import { Permissions } from '../utils/permissions.js'

let eventsDB
let permissions 

function getToken(req) {
  return req.get('Authorization').replace('Bearer', '').trim() 
}

export class EventsController {
  constructor () {
    eventsDB = new EventsModel()
    permissions = new Permissions()
  }
  
  async getEvents(req, res, next) {
    let events = await eventsDB.getEvents() 
    if (events) {
      return res.status(200).send({
        success: true,
        messsage: eventsDB.message,
        data: events
      })
    } else {
      return res.status(404).send({
        success: false,
        message: eventsDB.message
      });  
    }
  }

  async getEvent(req, res, next) {
    const event = await eventsDB.getEvent(req.params.id) 
    if (event) {
      return res.status(200).send({
        success: true,
        messsage: eventsDB.message,
        data: event
      })
    } else {
      return res.status(404).send({
        success: false,
        message: eventsDB.message
      });  
    } 
  }

  async addEvent(req, res, next) {
    if (!permissions.check(getToken(req), 'post', 'events')) {
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
      let event = {
        name: req.body.name,
        location: req.body.location,
        price: req.body.price,
        date: req.body.date
      }
      event = await eventsDB.addEvent(event)
      if (event) {
        return res.status(201).send({
          success: true,
          message: eventsDB.message,
          data: event
        })
      } else {
        return res.status(404).send({
          success: false,
          message: eventsDB.message
        });  
      } 
    }
  }

  async updateEvent(req, res, next){
    if (!permissions.check(getToken(req), 'put', 'events')) {
      return res.status(403).send({
        success: false,
        message: 'forbidden'
      })
    } else if(!req.body.name) {
      return res.status(400).send({
        success: false,
        message: 'name is required',
      });
    } else if(!req.body.location) {
      return res.status(400).send({
        success: false,
        message: 'location is required',
      });
    } else if(!req.body.date) {
      return res.status(400).send({
        success: false,
        message: 'date is required',
      });
    } else if(!req.body.price) {
      return res.status(400).send({
        success: false,
        message: 'price is required',
      });
    } else {
      let event = {
        name: req.body.name,
        location: req.body.location,
        price: req.body.price,
        date: req.body.date
      };
      event = await eventsDB.updateEvent(req.params.id, event)
      if (event) {
        return res.status(201).send({
          success: true,
          message: eventsDB.message,
          data: event
        })
      } else {
        return res.status(404).send({
          success: false,
          message: eventsDB.message
        });  
      } 
    }
  }
  
  async deleteEvent(req, res, next){ 
    if (!permissions.check(getToken(req), 'delete', 'events')) {
      return res.status(403).send({
        success: false,
        message: 'forbidden'
      })
    } else {
      const event = await eventsDB.deleteEvent(req.params.id)
      if (event) {
        return res.status(410).send({
          success: true,
          message: eventsDB.message,
          data: event
          });
      }else {
        return res.status(404).send({
          success: false,
          message: eventsDB.message
        });
      }
    }     
  }
}
