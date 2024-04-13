import { React, useState } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Loading from './Loading'
import { EmailActiveMembersModel } from '../models/EmailActiveMembersModel';
import { useApiToken } from '../hooks/useApiToken';

export const EmailActiveMembersForm = () => {
  const apiToken = useApiToken();
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSendEmails = async () => {
    try {
      // ask if the user is sure
      if (!window.confirm('Are you sure you want to send this email to all active members?')) {
        return;
      }
      setLoading(true);
      const emailModel = new EmailActiveMembersModel(apiToken);
      await emailModel.post(emailSubject, emailContent);
      window.alert(emailModel.message);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return ( 
    <Card style={{margin: '3px', width: '100%'}}>
      <Card.Header>Email Content</Card.Header>
      <Card.Body>
        <Form>
          <Form.Group className="mb-3" >
            <Form.Label>Subject</Form.Label>
            <Form.Control value={emailSubject} type="text" onChange={(e) => setEmailSubject(e.target.value)}/>
          </Form.Group> 
          <Form.Group className="mb-3">
            <Form.Label>Email Body</Form.Label>
            <Form.Control value={emailContent} onChange={(e) => setEmailContent(e.target.value)} type="text" as="textarea" style={{ height: '8rem' }}/>
          </Form.Group>  
          <Form.Group className="mb-3">
            <Button onClick={handleSendEmails} variant="outline-primary" style={{ float: 'right', width: '6rem', marginTop: '6px' }}>Send</Button>
          </Form.Group> 
        </Form>
        { loading && <Loading /> }
      </Card.Body>
    </Card>
  );
}