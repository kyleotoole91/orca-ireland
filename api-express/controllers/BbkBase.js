import htmlToJson from 'html-to-json'

const cRaceType = 1
const cLapType = 2

export class BbkBase {

  constructor() {
    this.url = ''
    this.data = {} 
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

}
