import React, {Component} from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

class EventCards extends Component {
  constructor(props) {
    super(props)
    this.state = { }
  }

  render() {
    if (this.props.data.events.length === 1) {
      return ( <div>No events</div> )
    } else if (this.props.data.loading) {
      return (  <div>Loading...</div> )
    } else {
      return (
        <div style={{display: 'flex', flexFlow: 'wrap'}}>
            {this.props.data.events.map((events, index) => (
              <Card style={{maxWidth: '40vh', margin: '3px'}} key={index}>
                <Card.Header>{events.name}</Card.Header>
                <Card.Body>
                  <Card.Title>{events.location}</Card.Title>
                  <Card.Text>{events.price}</Card.Text>
                  <Card.Text>{events.date}</Card.Text>
                  <Button variant="primary">{this.props.buttonText}</Button>
                </Card.Body>
              </Card>
            ))}
        </div>
      )
    }
  }
}

export default EventCards