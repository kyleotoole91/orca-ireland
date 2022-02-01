import {BaseModel} from './BaseModel'

export class RaceModel extends BaseModel {
  
  constructor(token) {
    super(token)
    this.setEndpoint(process.env.REACT_APP_API_RACES)
  }

  async put(raceId, race) {
    if (race.name) {
      this.message = 'Please give the race a name'
      return null
    } else {
      return await super.put(raceId, race)
    }
  }

  async post(race) {
    if (race.name === '') {
      this.message = 'Please give the race a name'
      return null
    } else {
      let results = race.results
      results.sort((a, b) => parseFloat(a.position) - parseFloat(b.position))
      race.results = results
      return await super.post(race)
    }
  }

}