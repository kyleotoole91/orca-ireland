import { BaseModel } from '../models/BaseModel'
import { Permissions } from '../utils/permissions.js'

function getToken(req) {
  return req.get('Authorization').replace('Bearer', '').trim() 
}

export class BaseController {
  constructor (collectionName) {
    this.data = null
    this.collectionName = collectionName
    this.DB = new BaseModel(collectionName)
    this.permissions = new Permissions()
  }
  
  async getAllDocuments(req, res, next) {
    this.data = await this.DB.getAllDocuments() 
    if (this.data) {
      return res.status(200).send({
        success: true,
        messsage: this.DB.message,
        data: this.data
      })
    } else {
      return res.status(404).send({
        success: false,
        message: this.DB.message
      });  
    }
  }

  async getDocument(req, res, next) {
    this.data = await this.DB.getDocument(req.params.id) 
    if (this.data) {
      return res.status(200).send({
        success: true,
        messsage: this.DB.message,
        data: this.data
      })
    } else {
      return res.status(404).send({
        success: false,
        message: this.DB.message
      });  
    } 
  }

  async addDocument(req, res, next) {
    if (this.permissions.check(getToken(req), 'post', this.collectionName)) {
      this.data = await this.DB.addDocument(req.body)
      if (this.data) {
        return res.status(201).send({
          success: true,
          message: this.DB.message,
          data: this.data
        })
      } else {
        return res.status(404).send({
          success: false,
          message: this.DB.message
        });  
      }
    } else {
      return res.status(403).send({
        success: false,
        message: 'forbidden'
      })
    } 
  }

  async updateDocument(req, res, next){
    console.log('updateDocument')
    if (this.permissions.check(getToken(req), 'put', this.collectionName)) {
      console.log('updateDocument')
      this.data = await this.DB.updateDocument(req.params.id, req.body)
      if (this.data) {
        return res.status(201).send({
          success: true,
          message: this.DB.message,
          data: this.data
        })
      } else {
        return res.status(404).send({
          success: false,
          message: this.DB.message
        });  
      }
    } else {
      return res.status(403).send({
        success: false,
        message: 'forbidden'
      })
    } 
  }
  
  async deleteDocument(req, res, next){ 
    if (this.permissions.check(getToken(req), 'delete', this.collectionName)) {
      this.data = await this.DB.deleteDocument(req.params.id)
      if (this.data) {
        return res.status(410).send({
          success: true,
          message: this.DB.message,
          data: this.data
          });
      }else {
        return res.status(404).send({
          success: false,
          message: this.DB.message
        });
      }  
    } else {
      return res.status(403).send({
        success: false,
        message: 'forbidden'
      })
    }     
  }
}

/*
event specific validation
return res.status(403).send({
        success: false,
        message: 'forbidden'
      })
    } else if(!req.body.name) {
      return res.status(400).send({
        success: false,
        message: 'name is required',
      })
    } else if(!req.body.location) {
      return res.status(400).send({
        success: false,
        message: 'location is required',
      })
    } else if(!req.body.date) {
      return res.status(400).send({
        success: false,
        message: 'date is required',
      })
    } else if(!req.body.price) {
      return res.status(400).send({
        success: false,
        message: 'price is required',
      })
    } else { 
      
    }
*/