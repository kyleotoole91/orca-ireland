
export class DateUtils {
  formatDate(date, format) {
    if (!format) {
      format = 'dd/mm/yyyy'
    }
    const map = {
      mm: (date.getMonth()+1).toString().padStart(2, '0'),
      dd: date.getDate().toString().padStart(2, '0'),
      yy: date.getFullYear().toString().slice(-2),
      yyyy: date.getFullYear()
    }
    return format.replace(/mm|dd|yyyy/gi, matched => map[matched])
  }
  formatISODate(isoDate, format) {
    let date = new Date(isoDate)
    return this.formatDate(date, format)
  }
}
