import htmlToJson from "html-to-json"
import { BaseModel } from '../models/BaseModel.js'

const cRaceType = 1
const cLapType = 2

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
        const shortUrl = data.text.substring(data.text.indexOf('/bbk'), data.text.length)
        const notfoundMsg = 'Cannot GET ' + shortUrl;
        if (data.text.trim() === notfoundMsg.trim()) {
          return null
        }
        return data
      })

      if (!response) {
        return null
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
      return { error: e.message }
    }
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
    let carItem = {}
    let carNo = 0
    let mins = 0.0
    let secs = 0.0
    const carItems = new Map()
    for (var i = 1; i < laps.results.length; i++) {
      carItem = {}
      for (var a = 1; a < laps.results[a].length; a++) {
        carNo = laps.results[0][a]
        carItem = carItems.get(carNo)
        if (!carItem) {
          carItem = {}
          carItem.secs = []
          carItem.carNo = parseInt(carNo.substring(4).trim())
          carItem.name = this.getNameByCarNo(carItem.carNo)
        }
        if (laps.results[i][a].trim() === '') {
          carItem.secs.push(0)
        } else {
          if (laps.results[i][a].indexOf('m') > 0) {
            mins = parseInt(laps.results[i][a].substring(1, laps.results[i][a].indexOf('m')))
            secs = mins * 60
            const lastChar = laps.results[i][a].substring(laps.results[i][a].length - 2, laps.results[i][a].length-1) 
             if (!parseFloat(lastChar)) { // * may mean not count, I must check with the race controller
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
    }
    let res = []
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
        }
        resItem.secs.push(value.secs[i])
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

  transformResults(data) {
    const posIdx = 0
    const carNoIdx = 1
    const nameIdx = 2
    const resultIdx = 3
    const avrgLapIdx = 4
    const bestLapIdx = 5
    const clubNoIdx = 6
    const carMakeIdx = 7
    const roofColorIdx = 7 //specific for heats 
    const carMakeIdx2 = 8 //specific for heats 
    const carModelIdx = 9 //specific for heats 
    let row
    let rows = []
    //let tmp = ''
    for (var csvLine of data.results) {
      row = {}
      row.pos = parseInt(csvLine[posIdx])
      row.carNo = parseInt(csvLine[carNoIdx])
      row.name = csvLine[nameIdx]
      row.result = csvLine[resultIdx]
      row.avrgLap = parseFloat(csvLine[avrgLapIdx])
      row.clubNo = parseInt(csvLine[clubNoIdx])

      if (csvLine.length > 8) {
        row.roofColor = csvLine[roofColorIdx]
        row.carMake = csvLine[carMakeIdx2]
        row.model = csvLine[carModelIdx]
      } else {
        row.carMake = csvLine[carMakeIdx]
      }

      if (row.result.trim() !== 'DNS') {
        const bestLapLine = csvLine[bestLapIdx]
        row.bestLap = parseFloat(bestLapLine.substring(0, bestLapLine.indexOf('(')).trim())
        row.bestLapNo = parseInt(bestLapLine.substring(bestLapLine.indexOf('(')+1, bestLapLine.indexOf(')')))
        
        const line = csvLine[resultIdx]
        row.lapCount = parseInt(line.substring(0, line.indexOf('/')))
        row.mins = parseInt(line.substring(line.indexOf('/') + 1, line.indexOf('m')))
        row.secs = parseInt(line.substring(line.indexOf('m') + 1, line.indexOf('.')))
        row.ms = parseInt(line.substring(line.indexOf('.') + 1, line.length - 1))
      }
      rows.push(row)
    }
    rows.shift() //remove header
    data.results = rows
    return data
  }

  extractClassName(raceName) {
    return raceName.split('(')[1].split(')')[0]
  }

  toJsonCsv(fileStr, { tableStartIdx, gap, footerLineCount }) {
    try {
      const endOfFileString = 'bbkRC 2011-1� 2000, 2011 bbk Software Ltd' 
      const titleIdx = 3
      const nameIdx = 7
      const timeIdx = 14
      const tableHeaderIdx = tableStartIdx
      let fileStrings = []
      let response = {}
      if (fileStr) {
        fileStrings = fileStr.text.split(/\r?\n/);
      }
      //response.fileStrings = fileStrings
      //console.log(fileStrings)
      let tableHeaderEndIdx = tableHeaderIdx
      while (fileStrings && tableHeaderEndIdx < fileStrings.length && fileStrings[tableHeaderEndIdx].trim() !== '') {
        tableHeaderEndIdx++
      }
      if (fileStrings && fileStrings.length > 0) {
        response.bbkURL = this.url
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
            if (fileStrings[sIdx + i] === endOfFileString) {
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

}
