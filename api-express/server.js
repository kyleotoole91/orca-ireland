const express = require('express')
const app = express();
var cors = require('cors');
import { Events } from './models/events'
require('dotenv').config()
import validateJwt from './utils/validate-jwt'

const corsOpts = {
  origin: 'http://localhost:3000',
  methods: [
    'GET',
    'POST',
    'PUT',
    'DELETE',
  ],
  allowedHeaders: [
    'Content-Type',
  ],
};

app.use(express.urlencoded({extended: true})); 
app.use(express.json());   
app.use(cors(corsOpts));
app.get('/cors', (req, res) => {
  res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.send({ "msg": "This has CORS enabled" })
})
app.use(function(err,req,res,next){
  res.status(401).send({error: err.message})
  res.status(422).send({error: err.message})
});

let eventsDB = new Events()

app.get('/events', async (req, res) => {
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
})

app.get('/events/:id', async (req, res) => {
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
})

app.post('/events', validateJwt, async (req, res) => {
	if(!req.body.name) {
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
    let events = eventsDB.getEvents() 
    let event = {
      id: events.length + 1,
      name: req.body.name,
      location: req.body.location,
      price: req.body.price,
      date: req.body.date
    }
    event = eventsDB.addEvent(event)
    return res.status(201).send({
      success: true,
      message: 'event added successfully',
      event,
    })  
  }
})

app.put('/events/:id', validateJwt, async (req, res) => {
	const id = parseInt(req.params.id, 10);
  if(!req.body.name) {
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
})

app.delete('/events/:id', validateJwt, async (req, res) => {
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
})

app.listen(8000, () => {
  console.log('ORCA api server listening on port 8000')
})