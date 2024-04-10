import { BaseController } from './BaseController.js'
import { authAndTransactions } from '../adapters/paypal.js'

const MAX_DAYS = 31;

export class PayPalController extends BaseController { 

  checkDateRange(startDateIso, endDateIso) {
    if (startDateIso && endDateIso) {
      const startDateObj = new Date(startDateIso);
      const endDateObj = new Date(endDateIso);
      const diffTime = Math.abs(endDateObj - startDateObj);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > MAX_DAYS;
    }
    return true;
  };

  async getTransactions(req, res) {
    try {

      if (!this.permissions.check(this.getToken(req), 'get', this.collectionName)) 
        return res.status(403).send({
          success: false,
          message: 'forbidden'
        }
      );

      const startDate = req.query.start_date;
      const endDate = req.query.end_date;
      const keyword = req.query.keyword;
      const email = req.query.email;
      const amount = req.query.amount;

      if (this.checkDateRange(startDate, endDate)) {
        return res.status(400).send({
          success: false,
          message: `date range must not exceed ${MAX_DAYS} days`
        })
      }

      const data = await authAndTransactions(startDate, endDate, keyword, email, amount);
      const error = data.error;
      if (error) {
        return res.status(data.error.code).send({
          success: false,
          message: error.message
        })
      }
      return res.status(200).send({
        success: true,
        message: '',
        data
      })

    } catch(e) {
      return res.status(500).send({
        success: false,
        message: 'internal server error: '+e.message
      }) 
    }
  }

}