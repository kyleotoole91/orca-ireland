import htmlToJson from "html-to-json"
import { BaseModel } from '../models/BaseModel.js'

const cRaceType = 1
const cLapType = 2
const cMinRaces = 5
const cRaceDivider = 2
const cManualLapChar = '*'
const cEndOfFileString = 'bbkRC 2011-1� 2000, 2011 bbk Software Ltd' 

export class BbkParser {

  constructor() {
    this.data = {}
    this.url = ''
    this.bbkConfig = new BaseModel('bbkConfig')
    this.raceParams = { tableStartIdx: 17, gap: 2, footerLineCount: 0 }
    this.lapTimeParams = { tableStartIdx: 14, gap: 1, footerLineCount: 1 }
  }

  async getBbkData(url, type) {
    try {
      this.url = url
      let response = await htmlToJson.request(this.url, {
        'text': function ($doc) {
          return $doc.find('body').text()
        }
      }).then(function (data) {
        if (!data.text || data.text.includes('Cannot GET')) {
          return null
        }
        return data
      })

      if (!response) {
        return this.getErrorObj('not found', url, type)
      }

      if (type === cRaceType) {
        this.addResultData(response)
        const lapTimesUrl = this.findLapTimeUrl(url)
        if (lapTimesUrl !== '') {
          response = await htmlToJson.request(lapTimesUrl, {
            'text': function ($doc) {
              return $doc.find('body').text()
            }
          }).then(function (data) {
            return data 
          })
          this.addLapData(response)
        }
      } else if (type === cLapType) {
        this.data = this.toJsonCsv(response, this.lapTimeParams)
      }
      return this.data
    } catch (e) {
      console.log(e)
      return this.getErrorObj(e.message, url, type)
    }
  }

  getErrorObj(message, url, type) {
    let res = {}
    res.bbkUrl = url
    res.type = type 
    res.error = message
    return res
  }

  async getSeasonReport(season) {
    let typePrefix
    let race
    let url
    let response
    if (season.hasOwnProperty('bbkMtgStart') && season.hasOwnProperty('bbkMtgEnd')) {
      response = {}
      response.season = season.name
      response.raceCount = 0
      response.startDate = season.startDate
      response.endDate = season.endDate
      response.bbkSeasonDir = season.bbkSeasonDir
      response.trackLength = parseInt(process.env.TRACK_LENGTH)
      response.season_id = season._id
      response.bbkUrl = process.env.BBK_ROOT_DIR + '/' + season.bbkSeasonDir
      response.mostConsistent = {}
      response.mostImproved = {}
      response.mostPodiums = {}
      response.mostLaps = {}
      response.mostLapsInRace = {}
      response.bestLapsByClass = []
      response.bestAvrgLapsByClass = []
      response.racesByRacer = []
      response.races = []
      let errCount = 0
      for (var raceType=1; raceType<=2; raceType++) { 
        switch (raceType) {
          case 1:
            typePrefix = 'f'
            break
          case 2:
            typePrefix = 'h'
        }
        for (var m=season.bbkMtgStart; m<=season.bbkMtgEnd; m++) {
          loop1:
          for (var g=1; g <= process.env.MAX_RACES; g++) { 
            loop2:
            for (var r=1; r <= process.env.MAX_GROUPS; r++){
              url = `${process.env.FRONT_END_HOST}${process.env.BBK_ROOT_DIR}/${season.bbkSeasonDir}/mtg${m}/${typePrefix}${g}r${r}.htm`
              race = await this.getBbkData(url, 1)
              if (race && !race.hasOwnProperty('error')) {
                response.races.push(race)
              } else if (r >= 1) {
                break loop2
              }
            }
            if ((g >= 1) && (race && !race.hasOwnProperty('error'))) {
              break loop1
            }
          }
        }
      }
      if (response.races && response.races.length > 0) {
        response.raceCount = response.races.length
        response.bestLapsByClass = this.getBestLapsByClass(response)
        response.bestAvrgLapsByClass = this.getBestAvrgLapsByClass(response)
        response.racesByRacer = this.getRacesByRacer(response)
        response.mostConsistent = this.getMostConsistent(response.racesByRacer)
        response.mostImproved = this.getMostImproved(response.racesByRacer)
        response.mostPodiums = this.getMostPodiums(response.racesByRacer)
        response.mostLaps = this.getMostLaps(response.racesByRacer)
        response.mostLapsInRace = this.getMostLapsInRace(response)
      }
    }
    return response
  }

  addResultData(response) {
    this.data = this.toJsonCsv(response, this.raceParams)
    this.data = this.transformResults(this.data)
  }

  addLapData(response) {
    const json = this.toJsonCsv(response, this.lapTimeParams)
    this.data.laps = this.transformLapDataResults(json)
  }

  getNameByCarNo(carNo) {
    if (this.data && this.data.results) {
      for (var result of this.data.results) {
        if (parseInt(result.carNo) === parseInt(carNo)) {
          return result.name
        }
      }
    } 
    return ''
  }
  
  transformLapDataResults(laps) {
    let res = []
    let carItem = {}
    let carNo = 0
    let mins = 0.0
    let secs = 0.0
    const carItems = new Map()
    if (!laps || !laps.results) {
      return res
    }
    for (var i = 1; i < laps.results.length; i++) {
      carItem = {}
      try {
        for (var a = 1; a < laps.results[i].length; a++) {
          carNo = laps.results[0][a]
          carItem = carItems.get(carNo)
          if (!carItem) {
            carItem = {}
            carItem.secs = []
            carItem.carNo = parseInt(carNo.substring(4).trim())
            carItem.name = this.getNameByCarNo(carItem.carNo)
          }
          if (laps.results[i][a].trim() === '' || laps.results[i][a].includes(cManualLapChar)) {
            carItem.secs.push(0)
          } else {
            if (laps.results[i][a].indexOf('m') > 0) {
              mins = parseInt(laps.results[i][a].substring(1, laps.results[i][a].indexOf('m')))
              secs = mins * 60
              const lastChar = laps.results[i][a].substring(laps.results[i][a].length - 2, laps.results[i][a].length-1) 
               if (!parseFloat(lastChar)) { 
                secs = parseFloat(secs + parseFloat(laps.results[i][a].substring(laps.results[i][a].indexOf('m') + 1, laps.results[i][a].length - 2)))
               } else {
                secs = parseFloat(secs + parseFloat(laps.results[i][a].substring(laps.results[i][a].indexOf('m') + 1, laps.results[i][a].length - 1)))
              }
              carItem.secs.push(secs)
            } else {
              carItem.secs.push(parseFloat(parseFloat(laps.results[i][a])))
            }
          }
          carItems.set(carNo, carItem)
        }
      } catch (e) {
        console.log(e)
      }
    }
    let resItem
    carItems.forEach(function (value, key) {
      resItem = {}
      resItem.carNo = value.carNo
      resItem.name = value.name
      resItem.lapCount = 0
      resItem.secs = []
      for (i = 0; i < value.secs.length; i++) {
        if (value.secs[i] > 0) {
          resItem.lapCount++
          resItem.secs.push(value.secs[i])
        }
      }
      res.push(resItem)
    })
    return res
  }

  findLapTimeUrl(url) {
    const items = url.split('/')
    let res
    let end = items[items.length - 1]
    let firstChar = end[0]
    if (firstChar === 'f') { //final
      end = end.slice(1)
      end = firstChar + 'laph' + end
    } else { //heat
      end = 'hlap' + end
    }
    items.pop()
    res = items.join('/') + '/' + end
    return res
  }

  convertToSecs(csvLine) {
    let mins = 1
    let secs = 0.0
    if (csvLine.indexOf('m') > 0) {
      mins = parseInt(csvLine.substring(1, csvLine.indexOf('m') - 1))
      secs = parseFloat(csvLine.substring(csvLine.indexOf('m') + 1, csvLine.length - 1).trim())
      secs = secs + (mins * 60)
    } else if (csvLine.indexOf('(') > -1) {
      secs = parseFloat(csvLine.substring(0, csvLine.indexOf('(')).trim())
    } else {
      secs = parseFloat(csvLine.substring(0, csvLine.length - 1).trim())  
    }
    return secs
  }

  transformResults(data) {
    const posIdx = 0
    const carNoIdx = 1
    const nameIdx = 2
    const resultIdx = 3
    const avrgLapIdx = 4
    const bestLapIdx = 5
    const clubNoIdx = 6
    const carMakeIdx = 7
    //specific for heats 
    const roofColorIdx = 7 
    const carMakeIdx2 = 8  
    const carModelIdx = 9 
    let row
    let rows = []
    let csvLine = ''
    for (var i=1; i < data.results.length; i++) {
      csvLine = data.results[i]
      if (csvLine && csvLine !== '') {
        row = {}
        row.pos = parseInt(csvLine[posIdx].trim())
        row.carNo = parseInt(csvLine[carNoIdx].trim())
        row.name = csvLine[nameIdx]
        row.result = csvLine[resultIdx]
        row.clubNo = parseInt(csvLine[clubNoIdx]) 
        if (row.result !== '' && row.result.trim() !== 'DNS' && !row.result.includes(cManualLapChar)) {
          if (csvLine.length > 8) {
            row.roofColor = csvLine[roofColorIdx]
            row.carMake = csvLine[carMakeIdx2]
            row.model = csvLine[carModelIdx]
          } else {
            row.carMake = csvLine[carMakeIdx]
          }
          const bestLapLine = csvLine[bestLapIdx].trim()
          const avrgLapLine = csvLine[avrgLapIdx].trim() 
          row.avrgLap = this.convertToSecs(avrgLapLine)
          row.bestLap = this.convertToSecs(bestLapLine)
          row.bestLapKph = parseFloat(this.calcKph(row.bestLap, 1))
          row.bestLapNo = parseInt(bestLapLine.substring(bestLapLine.indexOf('(') + 1, bestLapLine.indexOf(')')).trim())
          const result = csvLine[resultIdx]
          row.lapCount = parseInt(result.substring(0, result.indexOf('/')).trim())
          row.mins = parseInt(result.substring(result.indexOf('/') + 1, result.indexOf('m')).trim())
          row.secs = parseInt(result.substring(result.indexOf('m') + 1, result.indexOf('.')).trim())
          row.ms = parseInt(result.substring(result.indexOf('.') + 1, result.length - 1).trim())
          if (row.mins === 0) {
            row.totalSecs = parseFloat(row.secs.toString().trim() + '.' + row.ms.toString().trim())
          } else {
            row.totalSecs = row.mins * 60 + parseFloat(row.secs.toString().trim() + '.' + row.ms.toString().trim()) 
          }
          row.avrgLapKph = parseFloat(this.calcKph(row.totalSecs, row.lapCount))
          rows.push(row)  
        }
      } 
    }
    data.results = rows
    return data
  }

  calcKph(lapTimeSecs, lapCount) {
    if (!lapTimeSecs || lapTimeSecs <= 0) {
      return
    }
    if (!lapCount) {
      lapCount = 1
    }
    const distM = lapCount * process.env.TRACK_LENGTH
    const ms = distM / lapTimeSecs  
    return parseFloat(ms * 3.6).toFixed(3)
  }

  extractClassName(raceName) {
    return raceName.split('(')[1].split(')')[0]
  }

  toJsonCsv(fileStr, { tableStartIdx, gap, footerLineCount }) {
    try {
      const titleIdx = 3
      const nameIdx = 7
      const timeIdx = 14
      const tableHeaderIdx = tableStartIdx
      let fileStrings = []
      let response = {}
      if (fileStr) {
        fileStrings = fileStr.text.split(/\r?\n/);
      }
      let tableHeaderEndIdx = tableHeaderIdx
      while (fileStrings && tableHeaderEndIdx < fileStrings.length && fileStrings[tableHeaderEndIdx].trim() !== '') {
        tableHeaderEndIdx++
      }
      if (fileStrings && fileStrings.length > 0) {
        response.bbkUrl = this.url
        response.name = fileStrings[titleIdx]
        response.duration = fileStrings[timeIdx]
        response.race = fileStrings[nameIdx]
        response.class = this.extractClassName(fileStrings[nameIdx])
        response.results = []
        let lines = []
        for (var i = 0; i < tableHeaderEndIdx - tableHeaderIdx; i++) {
          lines.push(fileStrings[tableHeaderIdx + i])
        }
        response.results.push(lines)
        lines = []
        let sIdx = tableHeaderEndIdx + gap
        while (sIdx <= fileStrings.length) {
          for (var i = 0; i < tableHeaderEndIdx - tableHeaderIdx; i++) {
            if (fileStrings[sIdx + i] === cEndOfFileString) {
              for (var i = 0; i < footerLineCount; i++) {
                response.results.pop()
              }
              return response
            }
          }
          for (var i = 0; i < tableHeaderEndIdx - tableHeaderIdx; i++) {
            lines.push(fileStrings[sIdx + i])
          }
          response.results.push(lines)
          lines = []
          sIdx = sIdx + gap + (tableHeaderEndIdx - tableHeaderIdx)
        }
      }
      return response
    } catch (e) {
      return { error: e }
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
                nameItem.totalLaps = 0
                nameItem.consistPct = 0
                nameItem.improvSec = 0
                nameItem.races = []
              }
              raceItem = {}
              raceItem.event = race.name
              raceItem.race = race.race
              raceItem.avrgLap = result.avrgLap
              raceItem.bestLap = result.bestLap
              raceItem.lapCount = result.lapCount
              nameItem.totalLaps = nameItem.totalLaps + result.lapCount
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

  calcConsistency(racerData) {
    let count = 0
    let best = 0
    let avrg = 0
    let consist
    let totalConsistPct = 0
    this.podiumCount = 0
    if (!racerData.races || racerData.races.length < cMinRaces) {
      return
    }
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
        count++
      }
    }
    return parseFloat((totalConsistPct / count).toFixed(3))    
  }
  
  calcImprovSec(racerData) {
    let earlyAvrgSecs = 0.0
    let earlyTotalSecs = 0.0
    let lateTotalSecs = 0.0
    let lateAvrgSecs = 0.0
    let numRaces = 0
    let improvSec = 0

    if (!racerData || !racerData.hasOwnProperty('races')) {
      return 
    }
    
    numRaces = Math.floor(racerData.races.length / cRaceDivider) 
    if (numRaces <= 1 || racerData.races.length < cMinRaces) { 
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
              raceItem.bestLapKph = parseFloat(this.calcKph(result.bestLap))
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
              raceItem.avrgLapKph = parseFloat(this.calcKph(raceItem.avrgLap))
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
  
  getMostImproved(racesByRacer) {
    let res = {}
    racesByRacer = racesByRacer.sort(this.compareByImprovSec)
    if (racesByRacer[0].hasOwnProperty('improvSec')) {
      res.name = racesByRacer[0].name
      res.improvSec = racesByRacer[0].improvSec
      return res
    }
    return 
  }

  getMostPodiums(racesByRacer) {
    let res = []
    let item = {}
    racesByRacer = racesByRacer.sort(this.compareByPodiums)
    if (racesByRacer.length >= 0 && racesByRacer[0].hasOwnProperty('podiums')) {
      if (racesByRacer.length > 0 && racesByRacer[0].hasOwnProperty('podiums')) { 
        res = []  
      }
      item = {}
      item.name = racesByRacer[0].name
      item.podiums = racesByRacer[0].podiums
      res.push(item)
    }
    return res
  }

  getMostLaps(racesByRacer) {
    let res = []
    let item = {}
    racesByRacer = racesByRacer.sort(this.compareByTotalLaps)
    if (racesByRacer.length >= 0 && racesByRacer[0].hasOwnProperty('totalLaps')) {
      if (racesByRacer.length > 0 && racesByRacer[0].hasOwnProperty('totalLaps')) {
        res = []
      }
      item = {}
      item.name = racesByRacer[0].name
      item.totalLaps = racesByRacer[0].totalLaps
      res.push(item)
      return res
    }
    return res
  }

  getMostLapsInRace(data) {
    let res = []
    let item = {}
    let currBest = 0
    if (data && data.hasOwnProperty('races')) {
      for (var race of data.races) {
        if (race.hasOwnProperty('results')) {
          for (var result of race.results) {
            if (result.lapCount >= currBest) {
              if (result.lapCount > currBest) {
                res = []  
              }
              item = {}
              item.name = result.name
              item.lapCount = result.lapCount  
              currBest = result.lapCount  
              res.push(item)
            }
          }
        }
      }
    }
    return res
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

  compareByPodiums(a, b) {
    if ( b.podiums < a.podiums ) {
      return -1
    }
    if ( b.podiums > a.podiums) {
      return 1
    }
    return 0
  }

  compareByTotalLaps(a, b) {
    if ( b.totalLaps < a.totalLaps ) {
      return -1
    }
    if ( b.totalLaps > a.totalLaps) {
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

}
