import { BaseModel } from './BaseModel'
const ObjectId = require('mongodb').ObjectId

export class SeasonReportModel extends BaseModel {
  
  constructor() {
    super()
    this.result = null
    this.setCollectionName('seasonReports')                                                 
  }

  async getBySeasonId(id) {
    try {
      const seasonObjId = new ObjectId(id)
      this.result = await this.db.find({ 'season_id': seasonObjId, "deleted": {"$in": [null, false]} }).toArray()
      if(!this.result) {
        this.message = 'Not found'
      } else {
        this.message = this.collectionName
      }
    } catch (error) {
      this.result = null
      this.message = error.message
      console.log(error)
    } finally {
      return this.result  
    }
  }
}