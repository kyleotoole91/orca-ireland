import React from 'react'
import { withAuthenticationRequired } from "@auth0/auth0-react"
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

const Membership = () => {  
  return (
    <div style={{maxWidth: '40vh'}}> 
      <Card>
        <Card.Header>Membership</Card.Header>
        <Card.Body>
          <Card.Title>€50 per year </Card.Title>
          <Card.Text>
            Excluding race entry fees (€10)  
          </Card.Text>
          <Button variant="primary">Purchase</Button>
        </Card.Body>
      </Card>
    </div>
  )
}

export default withAuthenticationRequired(Membership, {
  onRedirecting: () => (<div>Redirecting you..</div>)  
});

