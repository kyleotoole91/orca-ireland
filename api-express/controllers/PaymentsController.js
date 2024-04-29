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
    const result = await this.paymentsDb.getPaymentsByEventId(req.params.id);
    const success = !result || result.length === 0 ? false : true;

    return res.status(success ? 200 : 404).send({
      success,
      data: success && result,
      message: this.paymentsDb.message
    })
  }

}