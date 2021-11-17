import { MembershipModel } from '../models/MembershipModel'
import { BaseController } from './BaseController.js'

export class MembershipController extends BaseController { 

  constructor () {
    super()
    this.setCollectionName('memberships')
    this.db = new MembershipModel() 
  }

  async getAllDocuments(req, res, next) {
    //TODO: add param for latest event, which is not protected and does not return the secret
    try {
      if (req.query.current === '1') {
        let membership = await this.db.getCurrentMembership()
        if (membership) {
          return res.status(200).send({
            success: true,
            message: 'current membership',
            data: membership
          })    
        } else {
          return res.status(404).send({
            success: false,
            message: 'not found'
          })
        }
      } else if (!this.permissions.check(this.getToken(req), 'get', this.collectionName)) {
        super.getAllDocuments(req, res, next)
      } else {
        return res.status(403).send({
          success: false,
          message: 'unauthorized'
        })
      } 
    } catch(e) {
      return res.status(500).send({
        success: false,
        message: 'internal server error: '+e.message
      }) 
    }
  }

  async getDocument(req, res, next) {
    try {
      if (this.permissions.check(this.getToken(req), 'get', this.collectionName)) {
        super.getDocument(req, res, next)
      } else { 
        return res.status(403).send({
          success: false,
          message: 'unauthorized'
        })
      } 
    } catch(e) {
      return res.status(500).send({
        success: false,
        message: 'internal server error: '+e.message
      }) 
    }  
  }
  
  //TODO override base methods for GET and ensire user has perms to ready memberships, we don't want people viewing the memberhsip secret
  async putUserMembership(req, res, force) {
    try {
      let user = await this.getUser(req, res, false)
      let membership = await this.db.getDocument(req.params.membershipId)
      console.log(user)
      if (!user || !membership || !membership.hasOwnProperty('secret')) {
        return res.status(404).send({
          success: false,
          message: 'not found'
        })   
      }
      if (!membership.hasOwnProperty('users')) {  
        membership.users = []
      }
      if (!this.objectIdExists(membership.users, user._id)) {
        membership.users.push(user._id)
        membership = await this.db.updateDocument(req.params.membershipId, membership) 
        console.log(membership)
      }  
      return res.status(200).send({
        success: true,
        message: 'membership activated'
      })
    } catch(e) {
      return res.status(500).send({
        success: false,
        message: 'internal server error: '+e.message
      }) 
    }
  }

}