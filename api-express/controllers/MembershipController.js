import { BaseModel } from '../models/BaseModel'
import { BaseController } from './BaseController.js'

export class MembershipController extends BaseController { 

  constructor () {
    super()
    this.setCollectionName('memberships')
    this.MembershipDB = new BaseModel(this.collectionName) 
  }
  
  //TODO override base methods for GET and ensire user has perms to ready memberships, we don't want people viewing the memberhsip secret
  async putUserMembership(req, res, force) {
    try {
      let user = await this.getUser(req, res, false)
      let membership = await this.MembershipDB.getDocument(req.params.membershipId)
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
        membership = await this.MembershipDB.updateDocument(req.params.membershipId, membership) 
        console.log(membership)
      }  
      return res.status(200).send({
        success: true,
        message: 'user added to membership'
      })
    } catch(e) {
      return res.status(500).send({
        success: false,
        message: 'internal server error: '+e.message
      }) 
    }
  }

}