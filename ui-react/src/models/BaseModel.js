

export class BaseModel {

  constructor(token) {
    if (this.constructor === BaseModel) {
      throw new Error('Abstract class Base Model cannot be instantiated')
    } else {
      if (token && token !== '') {
        this.setApiToken(token)
      }
      this.baseURL = process.env.REACT_APP_API_URL
      this.message = 'unknown error occurred'
      this.response = {}
      this.responseData = {}
      this.success = false
      this.useExtId = true
      this.reset()
    }
  }

  reset() {
    this.endpoint2 = '' 
    this.itemId = '' 
    this.itemId2 = ''  
    this.urlParams = '' 
  }

  hasApiToken(){
    if (!this.apiToken || this.apiToken === '') { 
      this.setErrorMessage('api token not set') 
      return false
    } else {
      return true
    }
  }

  async get(id){
    try {
      this.itemId = id
      if (!this.hasApiToken()) { return }
      await fetch(this.getUrl(), {
                  method: 'GET', 
                  headers: {Authorization: `Bearer ${this.apiToken}`, "Content-Type": "application/json"}})
            .then(response => response.json())
            .then((response) => {
              this.setResponseData(response)
            }) 

    } catch(e) {
      this.setErrorMessage(e)
    } finally {
      this.reset()
      return this.responseData
    }
  }

  async getUserDocs(userId, itemId) {
    let origEndpoint = this.endpoint
    try {
      if (!this.hasApiToken()) { return }
      this.itemId = userId 
      this.itemId2 = itemId
      this.endpoint = process.env.REACT_APP_API_USERS
      this.endpoint2 = origEndpoint
      if (this.useExtId){
        this.urlParams = '?extLookup=1' 
      } 
      await fetch(this.getUrl(), {
                  method: 'GET', 
                  headers: {Authorization: `Bearer ${this.apiToken}`, "Content-Type": "application/json"}})
            .then(response => response.json())
            .then((response) => {
              this.setResponseData(response)
            })
    } finally {
      this.reset()
      this.endpoint = origEndpoint
      return this.responseData
    } 
  }

  async put(id, data){
    try {
      if (!this.hasApiToken()) { return }
      this.itemId = id
      await fetch(this.getUrl(), {
                  method: 'PUT', 
                  headers: {Authorization: `Bearer ${this.apiToken}`, "Content-Type": "application/json"},
                  body: JSON.stringify(data)})
            .then(response => response.json())
            .then((response) => {
              this.setResponseData(response)
            })  
    } catch(e) {
      this.setErrorMessage(e)
    } finally {
      this.reset()
      return this.responseData
    } 
  }

  async putUserDoc(userId, itemId, doc) {
    let origEndpoint = this.endpoint
    try {
      if (!this.hasApiToken()) { return }
      this.itemId = userId
      this.itemId2 = itemId
      this.endpoint = process.env.REACT_APP_API_USERS
      this.endpoint2 = origEndpoint
      if (this.useExtId){
        this.urlParams = '?extLookup=1' 
      }
      await fetch(this.getUrl(), {
                  method: 'PUT', 
                  headers: {Authorization: `Bearer ${this.apiToken}`, "Content-Type": "application/json"},
                  body: JSON.stringify(doc)})
            .then(response => response.json())
            .then((response) => {
              this.setResponseData(response)
            }) 
    } finally {
      this.endpoint = origEndpoint
      return this.responseData
    } 
  }

  async post(data){
    try {  
      if (!this.hasApiToken()) { return }
      await fetch(this.getUrl(), {
                  method: 'POST', 
                  headers: {Authorization: `Bearer ${this.apiToken}`, "Content-Type": "application/json"},
                  body: JSON.stringify(data)})
            .then(response => response.json())
            .then((response) => {
              this.setResponseData(response)
            }) 
    } catch(e) {
      this.setErrorMessage(e)
    } finally {
      this.reset()
      return this.responseData
    }
  }

  async postUserDoc(userId, doc) {
    let origEndpoint = this.endpoint
    try {
      if (!this.hasApiToken()) { return }
      this.itemId = userId
      this.endpoint = process.env.REACT_APP_API_USERS
      this.endpoint2 = origEndpoint
      if (this.useExtId){
        this.urlParams = '?extLookup=1' 
      }
      await fetch(this.getUrl(), {
                  method: 'POST', 
                  headers: {Authorization: `Bearer ${this.apiToken}`, "Content-Type": "application/json"},
                  body: JSON.stringify(doc)})
            .then(response => response.json())
            .then((response) => {
              this.setResponseData(response)
            }) 
    } catch(e) {
      this.setErrorMessage(e)
    } finally {
      this.endpoint = origEndpoint
      return this.responseData
    } 
  }

  async delete(id){
    try {
      this.itemId = id
      if (!this.hasApiToken()) { return }
      await fetch(this.getUrl(), {
                  method: 'DELETE', 
                  headers: {Authorization: `Bearer ${this.apiToken}`, "Content-Type": "application/json"}})
            .then(response => response.json())
            .then((response) => {
              this.setResponseData(response)
            })  
    } catch(e) {
      this.setErrorMessage(e)
    } finally {
      this.reset()
      return this.responseData
    }
  }

  async deleteUserDoc(userId, itemId) {
    let origEndpoint = this.endpoint
    try {
      if (!this.hasApiToken()) { return }
      this.autoReset = false
      this.itemId = userId
      this.itemId2 = itemId
      this.endpoint = process.env.REACT_APP_API_USERS
      this.endpoint2 = origEndpoint
      if (this.useExtId){
        this.urlParams = '?extLookup=1' 
      } 
      if (!this.hasApiToken()) { return }
      await fetch(this.getUrl(), {
                  method: 'DELETE', 
                  headers: {Authorization: `Bearer ${this.apiToken}`, "Content-Type": "application/json"}})
            .then(response => response.json())
            .then((response) => {
              this.setResponseData(response)
            })
    } finally {
      this.endpoint = origEndpoint
    } 
  }

  getUrl(){
    let url = this.baseURL + this.endpoint + this.getItemId() + this.getEndpoint2() + this.getItemId2() + this.urlParams
    console.log(url)
    return url 
  }

  getEndpoint2() {
    if (this.endpoint2 && this.endpoint2 !== '') {
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
    if (this.itemId && this.itemId !== '') {
      return '/'+this.itemId
    } else {
      return ''
    }
  }

  getItemId2(){
    if (this.itemId2 && this.itemId2 !== '') {
      return '/'+this.itemId2
    } else {
      return ''
    }
  }

  setResponseData(response){
    console.log(response)
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