import React, {Component} from 'react';
import { withAuthenticationRequired } from "@auth0/auth0-react";
import TextCards from '../components/TextCards';

const buttonText = 'Register'

class Events extends Component {

  constructor(props) {
    super(props)
    this.state = { loading: true,
                    cardData: [{header: "Round 4",
                                title: "Race entry fee €10",
                                text: "Sunday, Nov 7, 2021"},
                              {header: "Round 5",
                                title: "Race entry fee €10",
                                text: "Sunday, Nov 21, 2021"}] }
  }

  async componentDidMount() {
    this.setState({ loading: false })  
  } 

  render() {
    return (
      <div style={{display: 'flex', flexFlow: 'wrap'}}>
        <TextCards data={this.state} buttonText={buttonText} > </TextCards>
      </div>
    )
  }

};

export default withAuthenticationRequired(Events, { onRedirecting: () => (<div>Loading..</div>) });
