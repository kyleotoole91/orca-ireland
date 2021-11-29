
import dayjs from 'dayjs'

export class DateUtils {
  formatDate(date, format) {
    if (!format) {
      format = 'dd/mm/yyyy'
    }
    return dayjs(date).format(format)
  }
  formatISODate(isoDate, format) {
    let date = new Date(isoDate)
    return this.formatDate(date, format)
  }
}
