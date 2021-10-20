import React from 'react';
import { withAuthenticationRequired } from "@auth0/auth0-react";
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

const Events = () => {  
  return (
    <div style={{maxWidth: '40vh'}}>
      <Card>
        <Card.Header>Round 1</Card.Header>
        <Card.Body>
          <Card.Title>Race entry fee €10</Card.Title>
          <Card.Text>
            Sunday, Nov 7, 2021    
          </Card.Text>
          <Button variant="primary">Purchase</Button>
        </Card.Body>
      </Card>
    </div>
  )
}

export default withAuthenticationRequired(Events, {
  onRedirecting: () => (<div>Redirecting you..</div>)  
});
