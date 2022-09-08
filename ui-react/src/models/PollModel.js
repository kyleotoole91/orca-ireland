import { BaseModel } from './BaseModel'

export class PollModel extends BaseModel {
  
  constructor(token) {
    super(token)
    this.setEndpoint(process.env.REACT_APP_API_POLLS)
  }

  isValid(poll){
    if (!poll.hasOwnProperty('selectedOption')) { //if not user casting vote
      if (poll.title === '') {
        this.setErrorMessage('Please specify a title')
        return false
      } else if (poll.description === '') {
        this.setErrorMessage('Please specify a description')
        return false
      } else if (poll.options === '') {
        this.setErrorMessage('Please specify options seperated by + signs')
        return false
      } else if (!poll.options.includes('+')) {
        this.setErrorMessage('Please specify at least two options seperated by + signs')
        return false
      }
    }
    return true
  }

  buildOptions(poll) {
    let options = []
    const tmpOptions = poll.options.split('+')
    for (const option of tmpOptions) {
      let obj = {'name': option}   
      options.push(obj)
    }
    poll.options = options
  }

  async post(poll) {
    try {
      if (this.isValid(poll)) {
        this.buildOptions(poll)
        console.log(poll)
        await super.post(poll)
      }
    } finally {
      return this.responseData
    }
  }

  async put(pollId, poll) {
    try {
      if (this.isValid(poll)) {
        if (poll.hasOwnProperty('options')) {
          this.buildOptions(poll)
        }
        await super.put(pollId, poll)
      }
    } finally {
      return this.responseData
    }
  }

}