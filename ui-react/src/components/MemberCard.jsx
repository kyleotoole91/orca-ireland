import { React, useState, useEffect } from 'react'
import { DateUtils } from '../utils/DateUtils';
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Loading from './Loading'
import { useAuth0 } from "@auth0/auth0-react"
import { UserModel } from '../models/UserModel'

const dateUtils = new DateUtils()

export const MemberCard = ({user, index, canEdit }) => {
  const [paymentExempt, setPaymentExempt] = useState(user.paymentExempt || false);
  const [apiToken, setApiToken] = useState('');
  const [loading, setLoading] = useState(false);
  const { getAccessTokenSilently } = useAuth0()

  useEffect(() => {
    async function retrieveToken () {
      if (apiToken === '') {
        const token = await getAccessTokenSilently({ audience: process.env.REACT_APP_AUTH0_AUDIENCE });
        setApiToken(token);
      }
    }  
    retrieveToken();
  }, []);

  const handleSetPaymentExempt = async () => {
    try {
      setLoading(true);
      const userModel = new UserModel(apiToken);
      const updatedUser = {...user, paymentExempt: !paymentExempt};
      await userModel.put(user.extId, updatedUser);
      if (!userModel.success) {
        window.alert(userModel.message);
        return;
      }
      setPaymentExempt(!paymentExempt);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return ( 
    <Card key={user.extId+'-card'+index} style={{minWidth: '300px', maxWidth: '300px', margin: '3px', zIndex: 0}}>
      <Card.Header key={user.extId+'-header'+index}>{user.firstName+' '+user.lastName}</Card.Header>
      <Card.Body key={user.extId+'-body'+index}>
        {user.hasOwnProperty('memberType') && <Card.Text key={user.extId+'-type'+index}>Member Type: {user.memberType.name}</Card.Text>}
        <Card.Text key={user.extId+'-email'+index}>Email: {user.email}</Card.Text>
        <Card.Text key={user.extId+'-phone'+index}>Phone: {user.phone}</Card.Text>
        {user.hasOwnProperty('dateOfBirth') && <Card.Text key={user.extId+'-dob'+index}>DOB: {dateUtils.formatDate(new Date(user.dateOfBirth), 'dd/mm/yyyy')}</Card.Text>}
        {user.hasOwnProperty('ecName') && <Card.Text key={user.extId+'-ecName'+index}>Emergency Name: {user.ecName}</Card.Text>}
        {user.hasOwnProperty('ecPhone') && <Card.Text key={user.extId+'-ecPhone'+index}>Emergency Phone: {user.ecPhone}</Card.Text>}
        {canEdit && 
          <Form.Check
            type={'checkbox'}
            label={`Payment Exempt`}
            id={`cb-mark-as-paid`}
            checked={paymentExempt}
            onChange={(e) => handleSetPaymentExempt(e.target.checked)}
          />}
        {loading && <Loading />}
      </Card.Body>
    </Card> 
  );
}