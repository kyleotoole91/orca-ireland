export class Validator {

  constructor() {
    this.init() 
  }

  init() {
    this.reqEx = null
    this.errorMessage = ''
    this.valid = false  
  }

  validatePhone = (phone) => {
    this.init() 
    this.reqEx = /^\s*\(?\s*\d{1,4}\s*\)?\s*[\d\s]{9,16}\s*$/
    this.valid = this.reqEx.test(phone)
    if (!this.valid) {
      this.errorMessage = 'Please enter a valid phone number'
    } 
    return this.valid
  }

  validateName = (name) => {
    this.init() 
    this.reqEx = /^[a-z ,.'-]+$/i
    this.valid = this.reqEx.test(name)
    if (!this.valid) {
      this.errorMessage = 'Please enter a valid name'
    } 
    return this.valid
  }

}
