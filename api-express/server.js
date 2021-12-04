const express = require('express')
const app = express()
var cors = require('cors')
import { BaseController } from './controllers/BaseController' 
import { MembershipController } from './controllers/MembershipController' 
import { EventsController } from './controllers/EventController' 
require('dotenv').config()
import validateJwt from './utils/validate-jwt'
import mongoClient from './mongo-client' 

const corsOpts = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Bearer']
}

app.use(express.urlencoded({extended: true})); 
app.use(express.json());   
app.use(cors(corsOpts));
app.get('/cors', (req, res) => {
  res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.send({ "msg": "This has CORS enabled" })
})

async function listMongoCollections() {
  await mongoClient.db(process.env.MONGO_DB_NAME)
                   .listCollections()
                   .toArray() 
                   .then(collections => { 
                     console.log('Connected to MongoDB:')
                     for (var collection of collections) {
                       console.log(collection.name)
                    }})
}

listMongoCollections()

const eventsController = new EventsController()
const usersController = new BaseController('users')
const membershipsController = new MembershipController()
const classesController = new BaseController('classes')
const carsController = new BaseController('cars')
const imagesController = new BaseController('images')
//events 
app.get('/events', validateJwt, (req, res) => eventsController.getAllDocuments(req, res))
app.get('/events/:id', validateJwt, (req, res) => eventsController.getDocument(req, res))
app.post('/events', validateJwt, (req, res) => eventsController.addDocument(req, res))
app.put('/events/:id', validateJwt, (req, res) => eventsController.updateEvent(req, res))
//images
app.get('/images', (req, res) => imagesController.getAllDocuments(req, res))
app.get('/images/:id', (req, res) => imagesController.getDocument(req, res))
app.post('/events', validateJwt, (req, res) => imagesController.addDocument(req, res))
//events 
app.get('/events', validateJwt, (req, res) => eventsController.getAllDocuments(req, res))
//users 
app.get('/users', validateJwt, (req, res) => usersController.getAllDocuments(req, res))
app.get('/users/:id', validateJwt, (req, res) => usersController.getUserDocument(req, res))
app.post('/users', validateJwt, (req, res) => usersController.addUserDocument(req, res))
app.put('/users/:id', validateJwt, (req, res) => usersController.updateUserDocument(req, res))
app.delete('/users/:id', validateJwt, (req, res) => usersController.deleteUserDocument(req, res))
//memberships
app.get('/memberships', validateJwt, (req, res) => membershipsController.getAllDocuments(req, res))
app.get('/memberships/:id', validateJwt, (req, res) => membershipsController.getDocument(req, res))
app.post('/memberships', validateJwt, (req, res) => membershipsController.addDocument(req, res))
app.put('/memberships/:id', validateJwt, (req, res) => membershipsController.updateDocument(req, res))
app.delete('/memberships/:id', validateJwt, (req, res) => membershipsController.deleteDocument(req, res))
//cars
app.get('/cars', validateJwt, (req, res) => carsController.getAllDocuments(req, res))
app.get('/users/:userId/cars', validateJwt, (req, res) => carsController.getUserDocuments(req, res))
app.get('/users/:userId/cars/:docId', validateJwt, (req, res) => carsController.getUserDocument(req, res))
app.get('/cars/:userId', validateJwt, (req, res) => carsController.getDocument(req, res))
app.post('/users/:userId/cars', validateJwt, (req, res) => carsController.addUserDocument(req, res))
app.put('/users/:userId/cars/:docId', validateJwt, (req, res) => carsController.updateUserDocument(req, res))
app.put('/cars/:id', validateJwt, (req, res) => carsController.updateDocument(req, res))
app.delete('/cars/:id', validateJwt, (req, res) => carsController.deleteDocument(req, res))
app.delete('/users/:userId/cars/:docId', validateJwt, (req, res) => carsController.deleteUserDocument(req, res))
//classes
app.get('/classes', validateJwt, (req, res) => classesController.getAllDocuments(req, res))
app.get('/classes/:id', validateJwt, (req, res) => classesController.getDocument(req, res))
app.post('/classes', validateJwt, (req, res) => classesController.addDocument(req, res))
app.put('/classes/:id', validateJwt, (req, res) => classesController.updateDocument(req, res))
app.delete('/classes/:id', validateJwt, (req, res) => classesController.deleteDocument(req, res))

app.use(function (req, res) {
  res.status(404).send({'success': false, 'message': 'not found'})
})
app.use(function (err, req, res) {
  if (err) {
    res.status(500).send({'success': false, 'message': err.message})
  }
}) 

app.listen(8000, () => {
  console.log('ORCA REST API server listening on port 8000')
})