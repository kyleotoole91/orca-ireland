require('dotenv').config()
import mongoClient from '../mongo-client';

const collectionName = 'events'

let eventList;

export class Events {

  constructor() {
    eventList = [{id: 1,
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

  async getEvents() {
    return await mongoClient.db(process.env.MONGO_DB_NAME).collection(collectionName).find({}).toArray();
  }

  async getEvent(id) {
    let index = eventList.findIndex(e => e.id === id) 
    return eventList[index]
  }

  async addEvent(event){
    event.id = eventList.length+1
    eventList.push(event)
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
