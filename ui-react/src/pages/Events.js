import React, {Component} from 'react';
import { withAuthenticationRequired } from "@auth0/auth0-react";
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Loading from '../components/Loading';

let events = [];

class Events extends Component {

  constructor(props) {
    super(props)
    this.state = { loading: true, events }
  }

  async componentDidMount() {
    await fetch(process.env.REACT_APP_API_URL + process.env.REACT_APP_API_EVENTS)
              .then(response => response.json())
              .then((data) => {
                      this.setState({ events: data.events, loading: false })
                    }).catch((error) => {
                      this.setState({ loading: false })
                      console.log(error)
                    });
    
  }

  render() {
    events = this.state.events;
    if (this.state.loading) {
      return ( <Loading /> )
    } else if (this.state.events.length === 0) {
      return ( <div>No events</div> )
    } else {
      return (
          <div style={{display: 'flex', flexFlow: 'wrap'}}>
             {events.map((event, index) => (
              <Card style={{maxWidth: '40vh', margin: '3px', zIndex: 0}} key={index}>
                <Card.Header>{event.name}</Card.Header>
                <Card.Body>
                  <Card.Title>{event.location}</Card.Title>
                  <Card.Text>{event.price}</Card.Text>
                  <Card.Text>{event.date}</Card.Text>
                  <Button variant="primary">Enter</Button>
                </Card.Body>
              </Card>
            ))}    
          </div> 
        )
      }
    }
};

export default withAuthenticationRequired(Events, { onRedirecting: () => (<Loading />) });
