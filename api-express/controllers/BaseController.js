import { BaseModel } from '../models/BaseModel'
import { Permissions } from '../utils/permissions.js'

export class BaseController {
  constructor (collectionName) {
    this.data = null
    this.db = new BaseModel(collectionName)
    this.setCollectionName(collectionName)
    this.UserDB = new BaseModel('users') 
    this.permissions = new Permissions()
  }

  objectIdExists(array, targetVal) {
    for (const item of array){
      if (item.toString() === targetVal.toString()){
        return true 
      }
    }
    return false
  }

  setCollectionName(name) {
    if (name && name !== '') {
      this.collectionName = name
      this.db = new BaseModel(this.collectionName)
    }
  }

  getToken(req) {
    return req.get('Authorization').replace('Bearer', '').trim() 
  }  

  async getUser(req, res, forceNew) {
    let user = null
    if (this.permissions.userInToken(this.getToken(req), req.params.userId)) {
      if (req.query.extLookup === '1') {
        user = await this.UserDB.getDocumentByExtId(req.params.userId, forceNew)
      } else {
        user = await this.UserDB.getDocument(req.params.userId, forceNew)
      }
    } else {
      user = await this.UserDB.getDocumentByExtId(this.permissions.extIdFromToken(this.getToken(req)), forceNew)
    }
    return user
  }
  
  async getAllDocuments(req, res, next) {
    try {
      this.data = await this.db.getAllDocuments() 
      if (this.data) {
        return res.status(200).send({
          success: true,
          message: this.db.message,
          data: this.data
        })
      } else {
        return res.status(404).send({
          success: false,
          message: this.db.message
        });  
      }
    } catch(e) {
      console.log(e)
      return res.status(500).send({
        success: false,
        message: e.message
      }) 
    }
  }

  async getDocument(req, res, next) {
    try {
      this.data = await this.db.getDocument(req.params.id) 
      if (this.data) {
        return res.status(200).send({
          success: true,
          message: this.db.message,
          data: this.data
        })
      } else {
        return res.status(404).send({
          success: false,
          message: this.db.message
        });  
      } 
    } catch(e) {
      console.log(e)
      return res.status(500).send({
        success: false,
        message: e.message
      }) 
    }
  }

  async addDocument(req, res, next) {
    try {
      if (this.permissions.check(this.getToken(req), 'post', this.collectionName)) {
        this.data = await this.db.addDocument(req.body)
        if (this.data) {
          return res.status(201).send({
            success: true,
            message: this.db.message,
            data: this.data
          })
        } else {
          return res.status(404).send({
            success: false,
            message: this.db.message
          });  
        }
      } else {
        return res.status(403).send({
          success: false,
          message: 'forbidden'
        })
      } 
    } catch(e) {
      console.log(e)
      return res.status(500).send({
        success: false,
        message: e.message
      }) 
    }
  }

  async updateDocument(req, res, next){
    try {
      if (this.permissions.check(this.getToken(req), 'put', this.collectionName)) {
        this.data = await this.db.updateDocument(req.params.id, req.body)
        if (this.data) {
          return res.status(201).send({
            success: true,
            message: this.db.message,
            data: this.data
          })
        } else {
          return res.status(404).send({
            success: false,
            message: this.db.message
          });  
        }
      } else {
        
        return res.status(403).send({
          success: false,
          message: 'forbidden'
        })
      } 
    } catch(e) {
      console.log(e)
      return res.status(500).send({
        success: false,
        message: e.message
      }) 
    }
  }
  
  async deleteDocument(req, res, next){ 
    try {
      if (this.permissions.check(this.getToken(req), 'delete', this.collectionName)) {
        this.data = await this.db.deleteDocument(req.params.id)
        if (this.data) {
          return res.status(410).send({
            success: true,
            message: this.db.message,
            data: this.data
            });
        }else {
          return res.status(404).send({
            success: false,
            message: this.db.message
          });
        }  
      } else {
        return res.status(403).send({
          success: false,
          message: 'forbidden'
        })
      }     
    } catch(e) {
      console.log(e)
      return res.status(500).send({
        success: false,
        message: e.message
      }) 
    }
  }

  // User protected documents 
  async getUserDocuments(req, res, next) {
    try {  
      let user = await this.getUser(req, res, false)
      if (user && user.hasOwnProperty('err') && user.hasOwnProperty('code')) {
        return res.status(user.code).send({
          success: false,
          message: user.err
        }) 
      } else if (user && user._id !== '') {
        this.data = await this.db.getUserDocuments(user._id) 
        if (this.data) {
          return res.status(200).send({
            success: true,
            message: this.db.message,
            data: this.data
          })
        } else {
          return res.status(404).send({
            success: false,
            message: this.db.message
          })  
        } 
      } else {
        return res.status(404).send({
          success: false,
          message: this.db.message
        })  
      }
    } catch(e) {
      console.log(e)
      return res.status(500).send({
        success: false,
        message: e.message
      }) 
    }
  }

  async getUserDocument(req, res, next) {
    try {
      let user = await this.getUser(req, res, false)
      if (!user){
        return res.status(404).send({
          success: false,
          message: 'user not found'
        });
      }
      if (user.hasOwnProperty('err') && user.hasOwnProperty('code') ){
        return res.status(user.code).send({
          success: false,
          message: user.err
        }) 
      } 
      if (user) {
        if (!req.params.docId || req.params.docId === '') { //requesting /user if no other param given
          this.data = await this.db.getDocument(user._id) 
        } else {
          this.data = await this.db.getUserDocument(user._id, req.params.docId) 
        }
        if (this.data) {
          return res.status(200).send({
            success: true,
            message: this.db.message,
            data: this.data
          })
        } else {
          return res.status(404).send({
            success: false,
            message: this.DB.message
          });  
        } 
      }
    } catch(e) {
      console.log(e)
      return res.status(500).send({
        success: false,
        message: e.message
      }) 
    }
  }

  async deleteUserDocument(req, res, next) {
    try {
      let user = await this.getUser(req, res, false)
      if (user.hasOwnProperty('code') && user.hasOwnProperty('err')){
        return res.status(user.code).send({
          success: false,
          message: user.err
        }) 
      } else if (user && user._id !== '') { 
        this.data = await this.db.deleteUserDocument(user._id, req.params.docId) 
        if (this.data) {
          return res.status(410).send({
            success: true,
            message: this.db.message,
            data: this.data
          })
        } else {
          return res.status(404).send({
            success: false,
            message: this.db.message
          });  
        }
      } else {
        return res.status(404).send({
          success: false,
          message: this.db.message
        });  
      }
    } catch(e) {
      console.log(e)
      return res.status(500).send({
        success: false,
        message: e.message
      }) 
    }
  }
  
  async addUserDocument(req, res, next) {  
    try {
      //add the mongodb.users._id to the object
      const user = await this.getUser(req, res, true)
      if (user && user.hasOwnProperty('code') && user.hasOwnProperty('err')){
        return res.status(user.code).send({
          success: false,
          message: user.err
        }) 
      } else if (user && user._id !== '') {
        req.body.user_id = user._id
        this.data = await this.db.addDocument(req.body) 
        if (this.data) {
          return res.status(200).send({
            success: true,
            message: this.db.message,
            data: this.data
          })
        } else {
          return res.status(404).send({
            success: false,
            message: this.db.message
          });  
        }
      } else {
        return res.status(404).send({
          success: false,
          message: this.DB.message
        });  
      } 
    } catch(e) {
      console.log(e)
      return res.status(500).send({
        success: false,
        message: e.message
      }) 
    }
  }

  async updateUserDocument(req, res, next) {  
    try {
      const user = await this.getUser(req, res, false)
      //console.log(req.originalUrl) //how to get url 
      if (user || this.permissions.userInToken(this.getToken(req), req.params.id)) { 
        if (!req.params.docId && req.query.extLookup === '1') { //requesting /user if no other param given
          if (user) {
            this.data = await this.db.updateDocument(user._id, req.body) 
          } else { //allow inserting of user record if not found on put request
            this.data = await this.db.addDocument(req.body)     
          }
        } else {  
           this.data = await this.db.updateUserDocument(user._id, req.params.docId, req.body)
        } 
        if (this.data) {
          return res.status(200).send({
            success: true,
            message: this.db.message,
            data: this.data
          })
        } else {
          return res.status(404).send({
            success: false,
            message: this.db.message
          });  
        } 
      } else {
        return res.status(404).send({
          success: false,
          message: 'user not found or does not match token claims'
        }) 
      } 
    } catch(e) {
      console.log(e)
      return res.status(500).send({
        success: false,
        message: e.message
      }) 
    }
  }
}
