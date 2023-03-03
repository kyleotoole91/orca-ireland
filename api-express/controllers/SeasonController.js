import { EventModel } from '../models/EventModel'
import { BaseController } from './BaseController.js'
import { BaseModel } from '../models/BaseModel'
import { BbkParser } from './BbkParser'

export class SeasonController extends BaseController { 

  constructor () {
    super()
    this.setCollectionName('seasons')
    this.bbk = new BbkParser()
    this.eventDB = new EventModel()
    this.carsDB = new BaseModel('cars')
    this.classes = new BaseModel('classes')
    this.eventTypeDB = new BaseModel('eventTypes')
    this.eventTypeId = {}
    this.defaultEventTypeId = {}
    this.cars = {}
    this.season = {}
  }

  getUserIdByCar(carId) {
    for (var car of this.cars) {
      if (car._id.toString() === carId.toString()) {
        return car.user_id
      }
    }
    return
  }

  getCarManufacturer(carId) {
    for (var car of this.cars) {
      if (car._id.toString() === carId.toString()) {
        return car.manufacturer.trim()
      }
    }
    return
  }

  calcPoints(position) {
    return (this.season.maxPoints - position) + 1
  }

  includeEvent(event) {
    if (event.hasOwnProperty('eventType_id')) {
      return event.eventType_id.toString() === this.eventTypeId.toString()  
    } else {
      return this.defaultEventTypeId.toString() === this.eventTypeId.toString()
    }
  }

  async calcDriverStandings() {
    let classId = ''
    let map
    let classResults = []
    let classResult = {}
    let driver
    let eventPoints
    let classes = await this.classes.getAllDocuments()
    
    if (classes) {
      for (var cls of classes) {
        classId = cls._id.toString()
        classResult = {}
        classResult.standings = []
        classResult.className = cls.name
        this.season.eventCount = this.season.events.length
        if (this.season.events) {
          this.cars = await this.carsDB.getAllDocuments()
          map = new Map()
          for (var event of this.season.events) {
            if (event.races && this.includeEvent(event)) {
              for (var race of event.races) {
                if (race.results) {
                  for (var result of race.results) {
                    if (race.class_id.toString() === classId) {
                      result.user_id = this.getUserIdByCar(result.car_id)
                      result.points = this.calcPoints(result.position)
                      driver = map.get(result.user_id)
                      eventPoints = {}
                      eventPoints.event_id = event._id
                      eventPoints.date = event.date
                      eventPoints.points = result.points
                      eventPoints.eventName = event.name
                      if (driver) {
                        driver.eventCount++
                        driver.totalPoints = driver.totalPoints + eventPoints.points
                      } else {
                        driver = {}
                        driver.eventCount = 1 
                        driver.driverName = result.name
                        driver.totalPoints = eventPoints.points
                        driver.pointsArray = []         
                        driver.eventPoints = []
                        driver.car_ids = []
                        driver.manufacturers = []
                      }
                      if (driver.car_ids.indexOf(result.car_id.toString()) == -1) {
                        driver.car_ids.push(result.car_id.toString())
                        driver.manufacturers.push(this.getCarManufacturer(result.car_id))
                      }
                      driver.eventPoints.push(eventPoints)
                      driver.pointsArray.push(eventPoints.points)
                      map.set(result.user_id, driver)
                    }
                  }
                }
              }
            }
          }
          this.season.bestOf = this.season.eventCount - this.season.bestOffset
          let eventCount
          for (let driver of map.values()) {
            driver.bestOfPoints = 0
            eventCount = driver.eventCount 
            driver.pointsArray.sort(function(a, b) {
              return a - b
            })
            while (eventCount > this.season.bestOf) {
              eventCount--
              driver.pointsArray.shift()
            }
            for (var points of driver.pointsArray) {
              driver.bestOfPoints = driver.bestOfPoints + points  
            }
            classResult.standings.push(driver)
          } 
        } 
        classResults.push(classResult)
      }  
    }   
    this.season.classResults = classResults
    return this.season
  }

  async getDefaultEventTypeId() {
    let eventTypes = await this.eventTypeDB.getAllDocuments()
    for (var eventType of eventTypes) {
      if (eventType.hasOwnProperty('default')) {
        return eventType._id
      }
    }
  }

  async getSeasonResults(req, res) {
    try {
      const seasonId = req.params.id
      if (seasonId) {
        this.season = await this.db.getDocument(seasonId)
        if (this.season) {
          const dbStartDate = this.season.startDate.toISOString().slice(0, 10)
          const dbEndDate = this.season.endDate.toISOString().slice(0, 10)
          this.defaultEventTypeId = await this.getDefaultEventTypeId()
          if (this.season.hasOwnProperty('eventType_id')) {
            this.eventTypeId = this.season.eventType_id
          } else {
            this.eventTypeId = this.defaultEventTypeId 
          }
          const events = await this.eventDB.getByDateRange(dbStartDate, dbEndDate)
          this.season.events = events
          this.season = await this.calcDriverStandings(this.eventTypeId)
          return res.status(200).send({
            success: true,
            message: 'Season results',
            data: this.season
          })
        } else {
          return res.status(404).send({
            success: false,
            message: 'not found'
          })  
        }
      }
    } catch(e) {
      return res.status(500).send({
        success: false,
        message: 'internal server error: '+e.message
      }) 
    }
  }

  async getSeasonBbkResults(req, res) {
    try {
      const seasonId = req.params.id
      if (seasonId) {
        this.season = await this.db.getDocument(seasonId)
        if (this.season) {
          const host = process.env.FRONT_END_URL
          let response = []
          let typePrefix
          //const response = await this.bbk.getBbkData('https://orcaireland.com/bbk/winter-2022-2023/mtg24/h1r12.htm', 1)
          if (response && response.hasOwnProperty('error')) {
            return this.notFoundError(res, response.error) 
          } 
          if (this.season.hasOwnProperty('bbkMtgStart') && this.season.hasOwnProperty('bbkMtgEnd')) {
            for (var raceType=1; raceType<=2; raceType++) { 
              if (raceType === 1) {
                typePrefix = 'f' //finals
              } else {
                typePrefix = 'h' //heats
              }
              const maxRaces = 6
              const maxGroups = 6
              for (var m=this.season.bbkMtgStart; m<=this.season.bbkMtgEnd; m++) {
                let race = {}
                let url = ''
                for (var g=1; g<=maxGroups; g++) {
                  for (var r=1; r<=maxRaces; r++){
                    url = `${host}/bbk/${this.season.bbkSeasonDir}/mtg${m}/${typePrefix}${g}r${r}.htm`
                    race = await this.bbk.getBbkData(url, 1)
                    if (race) {
                      response.push(race)
                    } else { 
                      break 
                    }
                  }  
                  if (!race && g > 1) {
                    break  
                  }
                }
              }
            }
          }
          if (response.length === 0) {
            return this.notFoundError(res)   
          }
          return res.status(200).send({
            success: true,
            message: `BBK Race Results for season ${this.season.name}/${this.season.bbkSeasonDir}`,
            data: response,
          })
        } else {
          return this.notFoundError(res)  
        }
      }
    } catch(e) {
      return res.status(500).send({
        success: false,
        message: 'internal server error: '+e.message
      }) 
    }
  }

}