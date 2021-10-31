const express = require('express')
const app = express()
var cors = require('cors')
import { BaseController } from './controllers/BaseController' 
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

const eventsController = new BaseController('events')
const usersController = new BaseController('users')
const membershipsController = new BaseController('memberships')
//events
app.get('/events', validateJwt, (req, res) => eventsController.getAllDocuments(req, res))
app.get('/events/:id', validateJwt, (req, res) => eventsController.getDocument(req, res))
app.post('/events', validateJwt, (req, res) => eventsController.addDocument(req, res))
app.put('/events/:id', validateJwt, (req, res) => eventsController.updateDocument(req, res))
app.delete('/events/:id', validateJwt, (req, res) => eventsController.deleteDocument(req, res))
//users
app.get('/users', validateJwt, (req, res) => usersController.getAllDocuments(req, res))
app.get('/users/:id', validateJwt, (req, res) => usersController.getDocument(req, res))
app.post('/users', validateJwt, (req, res) => usersController.addDocument(req, res))
app.put('/users/:id', validateJwt, (req, res) => usersController.updateDocument(req, res))
app.delete('/users/:id', validateJwt, (req, res) => usersController.deleteDocument(req, res))
//memberships
app.get('/memberships', validateJwt, (req, res) => membershipsController.getAllDocuments(req, res))
app.get('/memberships/:id', validateJwt, (req, res) => membershipsController.getDocument(req, res))
app.post('/memberships', validateJwt, (req, res) => membershipsController.addDocument(req, res))
app.put('/memberships/:id', validateJwt, (req, res) => membershipsController.updateDocument(req, res))
app.delete('/memberships/:id', validateJwt, (req, res) => membershipsController.deleteDocument(req, res))

app.listen(8000, () => {
  console.log('ORCA api server listening on port 8000')
})