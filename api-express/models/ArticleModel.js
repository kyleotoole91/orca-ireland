import { BaseModel } from './BaseModel'

export class ArticleModel extends BaseModel {
  
  constructor() {
    super()
    this.result = null
    this.setCollectionName('articles')
  }

  async getAllDocuments(req) {
    try {
      this.parseQueryParams(req) 
      const sort = {"date": -1}
      this.result = await this.db.find({"deleted": {"$in": [null, false]}}).sort(sort).limit(this.limit).toArray()
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