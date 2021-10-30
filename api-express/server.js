const express = require('express')
const app = express()
var cors = require('cors')
import { EventsController } from './controllers/events' 
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
    'Authorization',
    'Bearer'
  ],
}

app.use(express.urlencoded({extended: true})); 
app.use(express.json());   
app.use(cors(corsOpts));
app.get('/cors', (req, res) => {
  res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.send({ "msg": "This has CORS enabled" })
})

let eventsController = new EventsController()

app.get('/events', (req, res) => eventsController.getEvents(req, res))
app.get('/events/:id', (req, res) => eventsController.getEvent(req, res))
app.post('/events', validateJwt, (req, res) => eventsController.addEvent(req, res))
app.put('/events/:id', validateJwt, (req, res) => eventsController.updateEvent(req, res))
app.delete('/events/:id', validateJwt, (req, res) => eventsController.updateEvent(req, res))

app.listen(8000, () => {
  console.log('ORCA api server listening on port 8000')
})