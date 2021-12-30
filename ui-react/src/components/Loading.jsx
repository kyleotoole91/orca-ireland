import React, {Component} from 'react'
import Spinner from 'react-bootstrap/Spinner'

class Loading extends Component {
  constructor(props) {
    super(props)
    this.state = { }
  }

  render() {
    return ( 
        <Spinner animation="border" 
                 variant="primary"  
                 style={{ position: "absolute",
                          top: 50,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          margin: "auto" }} />
    )
  }
}

export default Loading
