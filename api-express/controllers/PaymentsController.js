import { PaymentsModel } from '../models/PaymentsModel.js'
import { BaseController } from './BaseController.js'

export class PaymentsController extends BaseController { 

  constructor () {
    super()
    this.setCollectionName('payments')
    this.paymentsDb = new PaymentsModel()
  }

  async getPaymentsByEventId(req, res) {
    if (!this.permissions.check(this.getToken(req), 'get', this.collectionName)) {
      return res.status(403).send({
        success: false,
        message: 'You do not have permission to access payments'
      })
    }
    const data = await this.paymentsDb.getPaymentsByEventId(req.params.id);
    const success = !!data;

    return res.status(success ? 200 : 404).send({
      success,
      data,
      message: this.paymentsDb.message
    })
  }

}