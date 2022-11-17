import { BaseModel } from './BaseModel'

export class SeasonModel extends BaseModel {
  
  constructor(token) {
    super(token)
    this.setEndpoint(process.env.REACT_APP_API_SEASONS)
  }

  async post(season) {
    let origEndpoint = this.endpoint
    try {
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
    console.log(season)
    let origEndpoint = this.endpoint
    try {
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