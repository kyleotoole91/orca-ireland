require('dotenv').config()
import mongoClient from '../mongo-client'
import jwt_decode from "jwt-decode"
import jwt from 'jsonwebtoken'
const collectionName = 'events'

let eventList, token

export class Events {

  constructor() {
    token= '',
    eventList= [{id: 1,
      name: "Round 4",
      location: "Saint Anne''s Park",
      price: "€10",
      date: "Sunday, Nov 7, 2021"},
      {id: 2,
      name: "Round 5",
      location: "Saint Anne''s Park",
      price: "€10",
      date: "Sunday, Nov 21, 2021"},
      {id: 3,
      name: "Round 6",
      location: "Saint Anne''s Park",
      price: "€10",
      date: "Sunday, Nov 28, 2021"}]
  }

  async setToken(tokenParam){
    try { 
      this.token = tokenParam 
      let decoded = jwt_decode(tokenParam)
      console.log(decoded)
    } catch (error) {
      console.error(error);
    }
  } 

  async getEvents() {
    return await mongoClient.db(process.env.MONGO_DB_NAME).collection(collectionName).find({}).toArray()
  }

  async getEvent(id) {
    let index = eventList.findIndex(e => e.id === id) 
    return eventList[index]
  }

  async addEvent(event){
    await mongoClient.db(process.env.MONGO_DB_NAME).collection(collectionName).insertOne({event})
    return event
  }

  async deleteEvent(id){
    let index = eventList.findIndex(e => e.id === id)
    return eventList.splice(index, 1)
  }

  async updateEvent(id, event){
    let index = eventList.findIndex(e => e.id === id)
    if (index >= 0) {
      eventList[index] = event
      return eventList[index]
    } else
      return null
  }

}
