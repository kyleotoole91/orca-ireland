import { BaseController } from './BaseController.js'
import { MembershipController } from './MembershipController.js'
import { PollModel } from '../models/PopllModel.js'

const noMemberShipMsg='You must have an active membership in order to cast votes'

export class PollController extends BaseController { 

  constructor () {
    super()
    this.setCollectionName('polls')
    this.db = new PollModel()
    this.memberTypesController = new BaseController('memberTypes')
    this.membershipController = new MembershipController()
  }

  async hasMembership(user, msg){
    const hasMembership = await this.membershipController.userIsActiveMember(user)
    if (!hasMembership) {
      return res.status(403).send({
        success: false,
        message: msg
      }) 
    }
  } 

  //todo: protect adding polls by permissions found in token 

  async updateDocument(req, res) {
    try { 
      let user = await this.getUser(req, res, false)
      this.hasMembership(user, noMemberShipMsg)
      const userCastingVote = req.body.hasOwnProperty('selectedOption') 
      const hasPermission = userCastingVote || this.permissions.check(this.getToken(req), 'put', this.collectionName)
      if (!hasPermission) {
        return res.status(403).send({
          success: false,
          message: 'You do not have permission to add or edit polls'
        })
      }
      const poll = await this.db.getDocument(req.params.id) 
      if (!poll) {
        return res.status(404).send({
          success: false,
          message: this.db.message
        })
      }
      if (userCastingVote) { 
        this.addUsersVote(poll, req, res)   
      } else { 
        this.updatePoll(poll, req, res)
      }  
    } catch(e) {
      return res.status(500).send({
        success: false,
        message: 'internal server error: '+e.message
      }) 
    }
  }

  async updatePoll(poll, req, res) {
    for (var option of poll.options) {
      if (option.hasOwnProperty('user_ids') && option.user_ids.length > 0) {  
        return res.status(403).send({
          success: false,
          message: 'Unable to edit poll. Votes have been casted'
        })
      }
    } 
    const updatedPoll = await this.db.updateDocument(req.params.id, req.body)
    if (!updatedPoll) {
      return res.status(500).send({
        success: false,
        message: this.db.message
      })
    } else {
      return res.status(200).send({
        success: true,
        message: 'poll update successfull'
      })
    }    
  }

  async addUsersVote(poll, req, res) {
    if (poll.date < new Date()) {
      return res.status(403).send({
        success: false,
        message: 'Unable to cast vote. This poll is closed'
      })    
    }
    const user = await this.getUser(req, res, false)
    this.hasMembership(user, noMemberShipMsg)
    if (!this.membershipController.userCanVote(user)) {
      return res.status(403).send({
        success: false,
        message: 'You are not eligable to cast votes'
      }) 
    }
    for (var option of poll.options) {
      if (option.hasOwnProperty('user_ids')) {
        if (this.indexOfObjectId(option.user_ids, user._id) > -1){
          return res.status(403).send({
            success: false,
            message: 'You have already casted a vote for this poll'
          }) 
        }
      }
    } 
    let optionFound = false
    for (var option of poll.options) {
      optionFound = option.name === req.body.selectedOption
      if (optionFound) {
        if (!option.hasOwnProperty('user_ids')) {  
          option.user_ids = []
        }
        option.user_ids.push(user._id)
        if (!option.hasOwnProperty('extIds')) {  
          option.extIds = []
        }
        option.extIds.push(user.extId)
        break
      }
    } 
    if (!optionFound){
      return res.status(404).send({
        success: false,
        message: 'The selected option was not found'
      })
    }
    poll = await this.db.updateDocument(req.params.id, poll)
    if (!poll) {
      return res.status(500).send({
        success: false,
        message: this.db.message
      })
    } else {
      return res.status(200).send({
        success: true,
        message: 'vote succesfully casted'
      })
    }   
  }

}