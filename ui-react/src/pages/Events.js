import React, {Component} from 'react';
import { withAuthenticationRequired } from "@auth0/auth0-react";
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

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
          {this.state.cardData.map((cardData) => (
            <Card style={{maxWidth: '40vh', margin: '6px'}}>
              <Card.Header>{cardData.header}</Card.Header>
              <Card.Body>
                <Card.Title>{cardData.title}</Card.Title>
                <Card.Text>{cardData.text}</Card.Text>
                <Button variant="primary">Registration</Button>
              </Card.Body>
            </Card>
          ))}
      </div>
    )
  }

};

export default withAuthenticationRequired(Events, { onRedirecting: () => (<div>Loading..</div>) });
