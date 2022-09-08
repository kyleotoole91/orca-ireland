import { BaseController } from './BaseController.js'
import { BaseModel } from '../models/BaseModel'
import { MembershipController } from './MembershipController.js'

export class PollController extends BaseController { 

  constructor () {
    super()
    this.setCollectionName('polls')
    this.db = new BaseModel('polls') 
    this.memberTypesController = new BaseController('memberTypes')
    this.membershipController = new MembershipController()
  }

  async updateDocument(req, res) {
    try { 
      let user = await this.getUser(req, res, false)
      let userCastingVote = req.body.hasOwnProperty('selectedOption') 
      let hasPermission = userCastingVote || this.permissions.check(this.getToken(req), 'put', this.collectionName)
      if (!hasPermission){
        return res.status(403).send({
          success: false,
          message: 'forbidden'
        })
      }
      let poll = await this.db.getDocument(req.params.id) 
      if (!poll) {
        return res.status(404).send({
          success: false,
          message: this.db.message
        })
      }
      if (userCastingVote) { 
        this.addUsersVote(poll, user, req, res)   
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
    let updatedPoll = await this.db.updateDocument(req.params.id, req.body)
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

  async addUsersVote(poll, user, req, res) {
    if (poll.date < new Date()) {
      return res.status(403).send({
        success: false,
        message: 'Unable to cast vote. This poll is closed'
      })    
    }
    let hasMembership = await this.membershipController.extIdActiveMember(user.extId)
    if (!hasMembership) {
      return res.status(403).send({
        success: false,
        message: 'You must have an active membership in order to cast votes'
      })    
    } else if (!this.membershipController.extIdCanVote(user.extId)) {
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