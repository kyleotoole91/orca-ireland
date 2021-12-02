
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

  nextDayOfWeekDate(weekdayName){
  //https://stackoverflow.com/questions/1579010/get-next-date-from-weekday-in-javascript
    var days = {
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
      sunday: 0
    }
    if (!days.hasOwnProperty(weekdayName)) 
      throw new Error(refday+" is not a day of week string: "+JSON.stringify(days))
    var currDate = new Date()
    var currTimestamp = currDate.getTime()
    var triggerDay = days[weekdayName]
    var dayMillDiff = 0
    var dayInMill = 1000*60*60*24
    while (currDate.getDay()!=triggerDay){
        dayMillDiff += dayInMill;
        currDate = new Date(currDate.getTime()+dayInMill)
    }
    return new Date(currTimestamp + dayMillDiff)
}

}
