

export class BaseModel {

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL
    this.apiToken = ''
    this.endpoint = ''
    this.endpoint2 = ''
    this.httpMethod = 'GET'
    this.response = {}
    this.responseData = {}
    this.requestData = {}
    this.message = ''
    this.itemId = '' 
    this.itemId2 = ''
    this.urlParams = ''
    this.success = true
  }

  reset() {
    this.endpoint2 = '' 
    this.itemId = '' 
    this.itemId2 = ''  
    this.urlParams = '' 
    this.message = ''
    this.response = {}
    this.responseData = {}
    this.requestData = {}
  }

  async getRequest(){
    try {
      if (this.apiToken && this.apiToken !== '') {
        await fetch(this.getUrl(), {headers: {Authorization: `Bearer ${this.apiToken}`}})
              .then(response => response.json())
              .then((response) => {
                this.setResponseData(response)}) 
      } else {
        this.setErrorMessage('api token not set')  
      }  
    } catch(e) {
      this.setErrorMessage(e)
    } 
  }

  async postRequest(){
    try {
      if (this.apiToken && this.apiToken !== '') {
        await fetch(this.getUrl(), {
                    method: 'POST', 
                    headers: {Authorization: `Bearer ${this.apiToken}`, "Content-Type": "application/json"},
                    body: JSON.stringify(this.requestData)})
              .then(response => response.json())
              .then((response) => {
                this.setResponseData(response)})
      } else {
        this.setErrorMessage('api token not set')  
      }  
    } catch(e) {
      this.setErrorMessage(e)
    } 
  }

  async putRequest(){
    try {
      if (this.apiToken && this.apiToken !== '') {
        await fetch(this.getUrl(), {
                    method: 'PUT', 
                    headers: {Authorization: `Bearer ${this.apiToken}`, "Content-Type": "application/json"},
                    body: JSON.stringify(this.requestData)})
              .then(response => response.json())
              .then((response) => {
                this.setResponseData(response)})
      } else {
        this.setErrorMessage('api token not set')  
      }   
    } catch(e) {
      this.setErrorMessage(e)
    } 
  }

  async deleteRequest(){
    try {
      if (this.apiToken && this.apiToken !== '') {
        await fetch(this.getUrl(), {
                    method: 'DELETE', 
                    headers: {Authorization: `Bearer ${this.apiToken}`, "Content-Type": "application/json"}})
              .then(response => response.json())
              .then((response) => {
                this.setResponseData(response)})
      } else {
        this.setErrorMessage('api token not set')  
      }   
    } catch(e) {
      this.setErrorMessage(e)
    } 
  }

  getUrl(){
    let url = this.baseURL + this.endpoint + this.getItemId() + this.getEndpoint2() + this.getItemId2() + this.urlParams
    return url 
  }

  getEndpoint2() {
    if (this.endpoint2 !== '') {
      return this.endpoint2 
    } else {
      return ''
    }
  }

  setRequestData(data){
    if (data) {
      this.requestData = data 
    }
  }

  setApiToken(apiToken) {
    if (apiToken && apiToken !== '') {
      this.apiToken = apiToken 
    }
  }

  setEndpoint(endpoint) {
    if (endpoint && endpoint !== '') {
      this.endpoint = endpoint 
    } else {
      return ''
    }
  }

  getItemId(){
    if (this.itemId !== '') {
      return '/'+this.itemId
    } else {
      return ''
    }
  }

  getItemId2(){
    if (this.itemId2 !== '') {
      return '/'+this.itemId2
    } else {
      return ''
    }
  }

  setResponseData(response){
    this.response = response
    this.message = response.message
    this.success =  response.success
    this.responseData = response.data
  }

  setErrorMessage(error){
    this.response = {}
    this.responseData = {}
    this.success = false
    this.message = error
    console.log(error)
  }

}