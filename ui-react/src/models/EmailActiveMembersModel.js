import { BaseModel } from './BaseModel'

export class EmailActiveMembersModel extends BaseModel {
  
  constructor(token) {
    super(token)
    this.setEndpoint(process.env.REACT_APP_API_EMAIL_ACTIVE_MEMBERS)
  }

  async post(subject, content) {
    if (!content || content === '') {
      this.setErrorMessage('Please provide email body content')
      return null
    }

    const contentIsHtml = content.startsWith('<') && content.endsWith('>')
    const html = contentIsHtml ? content : undefined
    const message = contentIsHtml ? undefined : content
    
    return await super.post({ subject, html, message })
  }

}