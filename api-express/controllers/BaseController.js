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
    this.UserDB = new BaseModel('users') 
    this.permissions = new Permissions()
  }

  async getUser(req, res, force) {
    let user = null
    if (this.permissions.userInToken(getToken(req), req.params.id)) {
      if (req.query.extLookup === '1') {
        user = await this.UserDB.getDocumentByExtId(req.params.id, force)
      } else {
        user = await this.UserDB.getDocumentId(req.params.id, force)
      }
    } else {
      user = {code: 403, err: 'Forbidden: invalid user'}
    } 
    return user
  }
  
  async getAllDocuments(req, res, next) {
    try {
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
      if (this.permissions.check(getToken(req), 'put', this.collectionName)) {
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
    } catch(e) {
      console.log(e)
      return res.status(500).send({
        success: false,
        message: e.message
      }) 
    }
  }

  // User document functions
  // To be refactered into a decentdant class
  async getUserDocuments(req, res, next) {
    try {  
      let user = await this.getUser(req, res, false)
      if (user.hasOwnProperty('err') && user.hasOwnProperty('code')) {
        return res.status(user.code).send({
          success: false,
          message: user.err
        }) 
      } else if (user && user._id !== '') {
        this.data = await this.DB.getUserDocuments(user._id) 
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
          })  
        } 
      } else {
        return res.status(404).send({
          success: false,
          message: this.DB.message
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
      console.log('get user doc')
      let user = await this.getUser(req, res, false)
      console.log(user)
      if (user.hasOwnProperty('err') && user.hasOwnProperty('code') ){
        return res.status(user.code).send({
          success: false,
          message: user.err
        }) 
      } else {
        if (!req.params.docId || req.params.docId === '') { //requesting /user if no other param given
          this.data = await this.DB.getDocument(user._id) 
        } else {
          this.data = await this.DB.getUserDocument(user._id, req.params.docId) 
        }
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
        this.data = await this.DB.deleteUserDocument(user._id, req.params.docId) 
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
  
  async addUserDocument(req, res, next) {  
    try {
      //add the mongodb.users._id to the object
      const user = await this.getUser(req, res, true)
      if (user.hasOwnProperty('code') && user.hasOwnProperty('err')){
        return res.status(user.code).send({
          success: false,
          message: user.err
        }) 
      } else if (user && user._id !== '') {
        req.body.user_id = user._id
        this.data = await this.DB.addDocument(req.body) 
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
      if (user) { 
        this.data = await this.DB.updateUserDocument(user._id, req.params.docId, req.body) 
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
      } else {
        return res.status(404).send({
          success: false,
          message: this.DB.message
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