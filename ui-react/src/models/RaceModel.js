
import {BaseModel} from './BaseModel'

export class RaceModel extends BaseModel {
  
  constructor(token) {
    super(token)
    this.setEndpoint(process.env.REACT_APP_API_RACES)
  }

  async put(raceId, race) {
    if (race.name) {
      this.message = 'Please give the race a name'
      return
    } else {
      return await super.put(raceId, race)
    }
  }

  async post(race) {
    if (race.name) {
      this.message = 'Please give the race a name'
      return
    } else {
      return await super.post(race)
    }
  }

}