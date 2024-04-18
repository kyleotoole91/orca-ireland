import { UserModel } from '../models/UserModel.js'
import { BaseController } from './BaseController.js'

export class UserController extends BaseController { 

  constructor () {
    super()
    this.setCollectionName('users')
    this.UserDB = new UserModel()
  }

  async subscribeUserByEmail(req, res, subscribe = false) {
    if (!req.body.email) {
      return res.status(400).send({
        success: false,
        message: 'Please provide an email address'
      })
    }
    const result = await this.UserDB.subscribeUserByEmail(req.body.email, subscribe);
    const success = !!result && result.matchedCount > 0;

    return res.status(success ? 200 : 400).send({
      success,
      message: this.UserDB.message
    })
  }

}