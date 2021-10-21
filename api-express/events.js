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

  getEvents() {
    return eventList  
  }

  getEvent(id) {
    let index = eventList.findIndex(e => e.id === id) 
    return eventList[index]
  }

  addEvent(event){
    return eventList.push(event)
  }

  deleteEvent(id){
    let index = eventList.findIndex(e => e.id === id)
    return eventList.splice(index, 1)
  }

  updateEvent(id, event){
    let index = eventList.findIndex(e => e.id === id)
    if (index >= 0) {
      eventList[index] = event
      return eventList[index]
    } else
      return null
  }

}
