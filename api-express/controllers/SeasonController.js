import { EventModel } from '../models/EventModel'
import { BaseController } from './BaseController.js'
import { BaseModel } from '../models/BaseModel'
import { BbkParser } from './BbkParser'
import { parse } from 'dotenv'

export class SeasonController extends BaseController { 

  constructor () {
    super()
    this.setCollectionName('seasons')
    this.bbk = new BbkParser()
    this.eventDB = new EventModel()
    this.carsDB = new BaseModel('cars')
    this.classes = new BaseModel('classes')
    this.eventTypeDB = new BaseModel('eventTypes')
    this.bbkReportDB = new BaseModel('bbkReports')
    this.bbkDataDB = new BaseModel('bbkData')
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
          let map = new Map()
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

  getRacesByRacer(data) {
    let nameMap = new Map()
    let nameItem
    let raceItem
    if (data && data.hasOwnProperty('races')) {
      for (var race of data.races) {
        if (race.hasOwnProperty('results')) {
          for (var result of race.results) {
            nameItem = nameMap.get(result.name) 
            if (result.name && 
                result.name.trim() !== '' && 
                result.avrgLap && 
                result.bestLap) {
              if (!nameItem) {
                nameItem = {}
                nameItem.name = result.name
                nameItem.podiums = 0
                nameItem.consistPct = 0
                nameItem.improvSec = 0
                nameItem.races = []
              }
              raceItem = {}
              raceItem.event = race.name
              raceItem.race = race.race
              raceItem.avrgLap = result.avrgLap
              raceItem.bestLap = result.bestLap
              if (result.pos <= 3 && race.race.includes('Final')) {
                nameItem.podiums++   
              }
              nameItem.races.push(raceItem)
              nameMap.set(result.name, nameItem)
            }
          }
        }
      }

      let res = []
      nameMap.forEach(function (nameItem) {
        res.push(nameItem)
      })

      for (var item of res) {
        item.consistPct = this.calcConsistency(item)
        item.improvSec = this.calcImprovSec(item)
      }
      return res
    }  
  }

  compareByConsistency(a, b) {
    try {
      if ( b.consistPct < a.consistPct ) {
        return -1
      }
      if ( b.consistPct > a.consistPct) {
        return 1
      }
    } catch(e) {
      console.log(e)
    }
    return 0
  }

  compareByImprovSec(a, b) {
    if ( a.improvSec < b.improvSec ) {
      return -1
    }
    if ( a.improvSec > b.improvSec) {
      return 1
    }
    return 0
  }

  compareByEventName(a, b) {
    if ( a.event < b.event ) {
      return -1
    }
    if ( a.event > b.event) {
      return 1
    }
    return 0
  }

  calcConsistency(racerData) {
    let count = 0
    let best = 0
    let avrg = 0
    let consist
    let totalConsistPct = 0
    this.podiumCount = 0
    for (var i = 0; i < racerData.races.length; i++) {
      if (racerData.races[i].hasOwnProperty('avrgLap') && 
          racerData.races[i].avrgLap && 
          racerData.races[i].avrgLap > 0) {
        best = racerData.races[i].bestLap
        avrg = racerData.races[i].avrgLap
        consist = (((avrg - best) / ((avrg + best) / 2)) * 100)
        if (consist > 0) {
          consist = parseFloat((100 - consist).toFixed(3))
        } else {
          consist =  parseFloat((100 + consist).toFixed(3))    
        }
        totalConsistPct = totalConsistPct + Math.abs(consist)
        //console.log(`Avrg: ${avrg} Best: ${best} consistPct: ${consist}`) 
        count++
      }
    }
    return parseFloat((totalConsistPct / count).toFixed(3))    
  }
  
  calcImprovSec(racerData) {
    const minRaces = 5
    const raceDivider = 2
    let earlyAvrgSecs = 0.0
    let earlyTotalSecs = 0.0
    let lateTotalSecs = 0.0
    let lateAvrgSecs = 0.0
    let numRaces = 0
    let improvSec = 0

    if (!racerData || !racerData.hasOwnProperty('races')) {
      return 
    }
    
    numRaces = Math.floor(racerData.races.length / raceDivider) 
    if (numRaces <= 1 || racerData.races.length < minRaces) { 
      return 
    }

    racerData.races.sort(this.compareByEventName)

    let count = 0
    for (var i = 0; i < numRaces  && i < racerData.races.length; i++) {
      if (racerData.races[i].hasOwnProperty('avrgLap') && 
          racerData.races[i].avrgLap && 
          racerData.races[i].avrgLap > 0 &&
          racerData.races[racerData.races.length - 1 - i].avrgLap && 
          racerData.races[racerData.races.length - 1 - i].avrgLap > 0) {
        earlyTotalSecs = earlyTotalSecs + racerData.races[i].avrgLap 
        lateTotalSecs = lateTotalSecs + racerData.races[racerData.races.length - 1 - i].avrgLap 
        count++
      }
    }
    earlyAvrgSecs = earlyTotalSecs / count
    lateAvrgSecs = lateTotalSecs / count

    improvSec = parseFloat((lateAvrgSecs - earlyAvrgSecs).toFixed(3)) 
    return improvSec 
  }
  
  getBestLapsByClass(data) {
    let classMap = new Map()
    let raceItem
    if (data && data.hasOwnProperty('races')) {
      for (var race of data.races) {
        if (race.hasOwnProperty('results')) {
          for (var result of race.results) {
            raceItem = classMap.get(race.class)  
            if ((!raceItem) || 
                ((raceItem.class === race.class) && 
                 (result.bestLap && result.bestLap != 0) && 
                 (parseFloat(result.bestLap) < parseFloat(raceItem.bestLap)))) {
              raceItem = {}
              raceItem.bbkUrl = race.bbkUrl
              raceItem.class = race.class
              raceItem.event = race.name
              raceItem.race = race.race
              raceItem.name = result.name
              raceItem.lapCount = result.lapCount
              raceItem.bestLap = parseFloat(result.bestLap)
              classMap.set(race.class, raceItem)
            }
          }
        }
      }
      let res = []
      classMap.forEach(function (raceItem) {
        res.push(raceItem)
      })
      return res
    }
  }

  getBestAvrgLapsByClass(data) {
    let classMap = new Map()
    let raceItem
    if (data && data.hasOwnProperty('races')) {
      for (var race of data.races) {
        if (race.hasOwnProperty('results')) {
          for (var result of race.results) {
            raceItem = classMap.get(race.class)  
            if ((!raceItem) || 
                ((raceItem.class === race.class) && 
                 (result.lapCount > 2) &&
                 (result.avrgLap && result.avrgLap != 0) && 
                 (parseFloat(result.avrgLap) < parseFloat(raceItem.avrgLap)))) {
              raceItem = {}
              raceItem.bbkUrl = race.bbkUrl
              raceItem.class = race.class
              raceItem.event = race.name
              raceItem.race = race.race
              raceItem.name = result.name
              raceItem.lapCount = result.lapCount
              raceItem.avrgLap = parseFloat(result.avrgLap)
              classMap.set(race.class, raceItem)
            }
          }
        }
      }
      let res = []
      classMap.forEach(function (raceItem) {
        res.push(raceItem)
      })
      return res
    }
  }

  getFastestLapOfSeason(data) {
    let result = { name: '', secs: 10000.0 }
    let secs = 0.0
    if (data && data.hasOwnProperty('races')) {
      for (var race of data.races) {
        if (race.hasOwnProperty('laps')) {
          for (var lap of race.laps) {
            for (var second of lap.secs) {
              secs = parseFloat(second)
              if ((secs && secs!= 0) && (parseFloat(secs) < parseFloat(result.secs))) {
                result.secs = second
                result.carNo = lap.carNo
                result.name = lap.name
                result.class = race.class
                result.race = race.name
                result.bbkUrl = race.bbkUrl
              }
            }
          }
        }
      }
    }
    return result
  }

  getMostConsistent(racesByRacer) {
    let res = {}
    racesByRacer = racesByRacer.sort(this.compareByConsistency)
    if (racesByRacer[0].hasOwnProperty('consistPct')) {
      res.name = racesByRacer[0].name
      res.consistPct = racesByRacer[0].consistPct
      return res
    }
    return
  }
  
  mostImproved(racesByRacer) {
    let res = {}
    racesByRacer = racesByRacer.sort(this.compareByImprovSec)
    if (racesByRacer[0].hasOwnProperty('improvSec')) {
      res.name = racesByRacer[0].name
      res.improvSec = racesByRacer[0].improvSec
      return res
    }
    return 
  }


  async getSeasonBbkResults(req, res) {
    try {
      const seasonId = req.params.id
      if (seasonId) {
        this.season = await this.db.getDocument(seasonId)
        if (this.season) {
          let typePrefix
          let race
          let url
          let response = {}
          response.season = this.season.name
          response.raceCount = 0
          response.startDate = this.season.startDate
          response.endDate =this. season.endDate
          response.bbkSeasonDir = this.season.bbkSeasonDir
          response.season_id = this.season._id
          response.mostConsistent = {}
          response.mostImproved = {}
          response.bestOverallLap = {}
          response.bestLapsByClass = []
          response.bestAvrgLapsByClass = []
          response.racesByRacer = []
          response.races = []
          //const response = await this.bbk.getBbkData('https://orcaireland.com/bbk/winter-2022-2023/mtg24/h1r12.htm', 1)
          if (this.season.hasOwnProperty('bbkMtgStart') && this.season.hasOwnProperty('bbkMtgEnd')) {
            for (var raceType=1; raceType<=2; raceType++) { 
              switch (raceType) {
                case 1:
                  typePrefix = 'f';
                  break;
                case 2:
                  typePrefix = 'h';
              }
              for (var m=this.season.bbkMtgStart; m<=this.season.bbkMtgEnd; m++) {
                for (var g=1; g <= process.env.MAX_RACES; g++) {
                  for (var r=1; r <= process.env.MAX_GROUPS; r++){
                    url = `${process.env.FRONT_END_HOST}${process.env.BBK_ROOT_DIR}/${this.season.bbkSeasonDir}/mtg${m}/${typePrefix}${g}r${r}.htm`
                    race = await this.bbk.getBbkData(url, 1)
                    if (race) {
                      response.races.push(race)
                    }
                  }  
                }
              }
            }
            response.raceCount = response.races.length
            response.bestOverallLap = this.getFastestLapOfSeason(response)
            response.bestLapsByClass = this.getBestLapsByClass(response)
            response.bestAvrgLapsByClass = this.getBestAvrgLapsByClass(response)
            response.racesByRacer = this.getRacesByRacer(response)
            response.mostConsistent = this.getMostConsistent(response.racesByRacer)
            response.mostImproved = this.mostImproved(response.racesByRacer)
          }
          if (response.length === 0) {
            return this.notFoundError(res)   
          }
          return res.status(200).send({
            success: true,
            message: `Report: BBK Race Results by Season`,
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