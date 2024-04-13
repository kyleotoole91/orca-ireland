import { BaseModel } from '../models/BaseModel'
import { MembershipModel } from '../models/MembershipModel'
import { BaseController } from './BaseController.js'

const ObjectId = require('mongodb').ObjectId

export class MembershipController extends BaseController { 

  constructor () {
    super()
    this.setCollectionName('memberships')
    this.db = new MembershipModel() 
    this.memberTypesDb = new BaseModel('memberTypes')
  }

  async extIdActiveMember(extId) {
    const user = await this.UserDB.getDocumentByExtId(extId, false)
    return this.userIsActiveMember(user)
  }

  async userIsActiveMember(user) {
    const membership = await this.db.getCurrentMembership()
    if (user && membership[0] && membership[0].hasOwnProperty('user_ids')){
      return this.objectIdExists(membership[0].user_ids, user._id) 
    } else {
      return false
    }
  }

  async userCanVote(user) {
    let memberType 
    if (user.hasOwnProperty('memberType_id')) {
      memberType = await this.memberTypesDb.getDocument(user.memberType_id)
    } else if (user.hasOwnProperty('memberType') && user.memberType.hasOwnProperty('canVote')) {
      memberType = await this.memberTypesDb.getDocument(user.memberType._id)
    }
    const membership = await this.db.getCurrentMembership()
    if (memberType && membership[0] && membership[0].hasOwnProperty('user_ids')){
      let canVote = this.objectIdExists(membership[0].user_ids, user._id) && memberType.hasOwnProperty('canVote') && memberType.canVote
      return canVote
    } else {
      return false
    }
  }

  async getAllDocuments(req, res, next) {
    try {
      if (req.query.current === '1') {
        const membership = await this.db.getCurrentMembership(this.permissions.check(this.getToken(req), 'get', 'users')) 
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
      } else if (this.permissions.check(this.getToken(req), 'get', this.collectionName)) {
        super.getAllDocuments(req, res, next)
      } else {
        return res.status(403).send({
          success: false,
          message: 'forbidden'
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
          message: 'forbidden'
        })
      } 
    } catch(e) {
      return res.status(500).send({
        success: false,
        message: 'internal server error: '+e.message
      }) 
    }  
  }

  /*
    to activate membership 
    {
        "secret": "membership-secret",
        "extId": "external-user-id"
    }  
  */
  async updateDocument(req, res) {
    try {
      const user = await this.getUser(req, res, false)
      const addingMember = Object.keys(req.body).length === 2 && req.body.hasOwnProperty('secret') && req.body.hasOwnProperty('extId')
      const hasPermission = (addingMember && user && user.extId === req.body.extId) || this.permissions.check(this.getToken(req), 'put', this.collectionName)
      if (!hasPermission) {
        return res.status(403).send({
          success: false,
          message: 'forbidden'
        })  
      }
      let membership = await this.db.getDocument(req.params.id)
      if (addingMember) {
        if (!user.hasOwnProperty('username') || 
            !user.hasOwnProperty('firstName') || 
            !user.hasOwnProperty('phone') || 
            !user.hasOwnProperty('ecPhone') || 
            !user.hasOwnProperty('ecName')) {
          return res.status(404).send({
            success: false,
            message: 'Please complete and save the Member Details form before activating membership'
          })   
        }
        if (!membership || !membership.hasOwnProperty('secret')) {
          return res.status(404).send({
            success: false,
            message: this.db.message
          })   
        }
        if (membership.secret !== req.body.secret) {
          return res.status(403).send({
            success: false,
            message: 'Incorrect activation code'
          })  
        }
        if (!membership.hasOwnProperty('user_ids')) {  
          membership.user_ids = []
        }
        if (!this.objectIdExists(membership.user_ids, user._id)) {
          membership.user_ids.push(user._id)
          membership = await this.db.updateDocument(req.params.id, membership) 
        }
      } else {
        membership = await this.db.updateDocument(req.params.id, req.body)   
      }
      if (!membership) {
        return res.status(500).send({
          success: false,
          message: this.db.message
        })
      } else {
        return res.status(200).send({
          success: true,
          message: 'membership activated'
        })
      }
    } catch(e) {
      return res.status(500).send({
        success: false,
        message: 'internal server error: '+e.message
      }) 
    }
  }
  
  async activateUserMembership(req, res) {
    try {
      const hasPermission = this.permissions.check(this.getToken(req), 'put', 'activate_users')
      if (!hasPermission) {
        return res.status(403).send({
          success: false,
          message: 'forbidden'
        })  
      }
      const userDb = new BaseModel('users')
      console.log(req.body)
      const user = await userDb.getDocument(req.body.user_id)
      if (!user) {
        return res.status(404).send({
          success: false,
          message: 'user not found'
        })  
      }
      let membership = await this.db.getDocument(req.params.id)
      if (!membership.hasOwnProperty('user_ids')) {  
        membership.user_ids = []
      }
      const newMember = req.body.user_id
      const addingMember = req.body.active === undefined ? true : req.body.active
      if (addingMember && !this.objectIdExists(membership.user_ids, newMember)) {
        membership.user_ids.push(new ObjectId(newMember))
        membership = await this.db.updateDocument(req.params.id, membership) 
      } else if (!addingMember && this.objectIdExists(membership.user_ids, newMember)) {
        membership.user_ids = membership.user_ids.filter(id => id.toString() !== newMember)
        console.log(membership.user_ids)
        membership = await this.db.updateDocument(req.params.id, membership) 
      }
      if (!membership) {
        return res.status(500).send({
          success: false,
          message: this.db.message
        })
      } else {
        const currentMembership = await this.db.getCurrentMembership(this.permissions.check(this.getToken(req), 'get', 'users'))
        return res.status(200).send({
          success: true,
          message: addingMember ? 'membership activated' : 'membership deactivated',
          data: currentMembership
        })
      }
    } catch(e) {
      return res.status(500).send({
        success: false,
        message: 'internal server error: '+e.message
      }) 
    }
  }

}