import { BaseModel } from './BaseModel'

export class SeasonModel extends BaseModel {
  
  constructor(token) {
    super(token)
    this.setEndpoint(process.env.REACT_APP_API_SEASONS)
  }

  async getSeasonResults(id) {
    try {
      this.itemId = id
      await fetch(this.getUrl()+'/results', {
                  method: 'GET', 
                  headers: {Authorization: `Bearer ${this.apiToken}`, "Content-Type": "application/json"}})
            .then(response => response.json())
            .then((response) => {
              this.setResponseData(response)
            }) 
            
    } catch(e) {
      this.setErrorMessage(e)
    } finally {
      this.reset()
      return this.responseData
    }
  }

  async getSeasonBbkReport(id) {
    try {
      this.itemId = id
      await fetch(this.getUrl()+'/reports/bbk', {
                  method: 'GET', 
                  headers: {Authorization: `Bearer ${this.apiToken}`, "Content-Type": "application/json"}})
            .then(response => response.json())
            .then((response) => {
              this.setResponseData(response)
            }) 
            
    } catch(e) {
      this.setErrorMessage(e)
    } finally {
      this.reset()
      return this.responseData
    }
  }

  parseValues(season) {
    season.bbkMtgStart = parseInt(season.bbkMtgStart)
    season.bbkMtgEnd = parseInt(season.bbkMtgEnd)
    if (season.hasOwnProperty('bestOffset')) {
      season.bestOffset = parseInt(season.bestOffset)
    }
    if (season.hasOwnProperty('pointsOffset')) {
      season.pointsOffset = parseInt(season.pointsOffset)
    }
    if (season.hasOwnProperty('maxPoints')) {
      season.maxPoints = parseInt(season.maxPoints)
    }
  }

  async post(season) {
    let origEndpoint = this.endpoint
    try {
      this.parseValues(season)
      if (!season.name || season.name === '') {
        this.setErrorMessage('Please specify a name')
      } else {
        await super.post(season)
      }
    } finally {
      this.endpoint = origEndpoint 
      return this.responseData
    }
  }

  async put(seasonId, season) {
    let origEndpoint = this.endpoint
    try {
      this.parseValues(season)
      if (seasonId === '') {
        this.setErrorMessage('Please specify a season')
      } else if (!season.name || season.name === '') {
        this.setErrorMessage('Please specify a name')
      } else {
        await super.put(seasonId, season)
      }
    } finally {
      this.endpoint = origEndpoint 
      return this.responseData
    }
  }

}