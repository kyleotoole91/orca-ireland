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
    this.init() //  ^(?:\([0-9]{1,6}\)|\([\+ 0-9]{1,7}\)|[\+ 0-9]*\([\+ 0-9]{1,4}\)*[\/ \- 0-9]{4,25}|[\/ \+ \-  0-9]{4,26})$
    this.reqEx = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s/0-9]*$/
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
