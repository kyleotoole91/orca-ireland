import { Events } from '../models/events'
import { Permissions } from '../utils/permissions.js'

let eventsDB
let permissions 

function getToken(req) {
  return req.get('Authorization').replace('Bearer', '').trim() 
}

export class EventsController {
  constructor () {
    eventsDB = new Events()
    permissions = new Permissions()
  }
  
  async getEvents(req, res, next) {
    let events = await eventsDB.getEvents() 
    if (events) {
      return res.status(200).send({
        success: true,
        messsage: 'events',
        events
      })
    } else {
      return res.status(404).send({
        success: false,
        message: 'error getting event data'
      });  
    }
  }

  async getEvent(req, res, next) {
    const id = parseInt(req.params.id, 10);
    const event = eventsDB.getEvent(id) 
    if (event) {
      return res.status(200).send({
        success: true,
        messsage: 'events',
        event
      })
    } else {
      return res.status(404).send({
        success: false,
        message: 'error getting event data'
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
      console.log(event)
      return res.status(201).send({
        success: true,
        message: 'event added successfully',
        event,
      })  
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
      const id = parseInt(req.params.id, 10)
      let event = {
        id: id,
        name: req.body.name,
        location: req.body.location,
        price: req.body.price,
        date: req.body.date
      };
      event = eventsDB.updateEvent(id, event)
      if (event) {
        return res.status(201).send({
          success: true,
          message: 'event updated successfully',
          event,
        })
      } else {
        return res.status(404).send({
          success: false,
          message: 'error updating event data, record not found'
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
      const id = parseInt(req.params.id, 10);
      const event = eventsDB.deleteEvent(id)
      if (event) {
        return res.status(410).send({
          success: true,
          message: 'event deleted successfully',
          event
          });
      }else {
        return res.status(404).send({
          success: false,
          message: 'error deleting event'
        });
      }
    }     
  }
}
