import React, {Component} from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

class TextCards extends Component {
  constructor(props) {
    super(props)
    this.state = { }
  }

  render() {
    if (this.props.data.loading) {
      return (
        <div>Loading...</div>
      )
    } else {
      return (
        <div style={{display: 'flex', flexFlow: 'wrap'}}>
            {this.props.data.cardData.map((cardData, index) => (
              <Card style={{maxWidth: '40vh', margin: '3px'}} key={index}>
                <Card.Header>{cardData.header}</Card.Header>
                <Card.Body>
                  <Card.Title>{cardData.title}</Card.Title>
                  <Card.Text>{cardData.text}</Card.Text>
                  <Button variant="primary">{this.props.buttonText}</Button>
                </Card.Body>
              </Card>
            ))}
        </div>
      )
    }
  }
}

export default TextCards