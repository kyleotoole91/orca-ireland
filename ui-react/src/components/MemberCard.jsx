import { React, useState, useEffect } from 'react'
import { DateUtils } from '../utils/DateUtils';
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Loading from './Loading'
import { useAuth0 } from "@auth0/auth0-react"
import { UserModel } from '../models/UserModel'
import { MembershipModel } from '../models/MembershipModel'

const dateUtils = new DateUtils()

export const MemberCard = ({user, index, canEdit, canActivateMember, currentMembership, setCurrMembership }) => {
  const [paymentExempt, setPaymentExempt] = useState(user.paymentExempt || false);
  const activeUserIds = currentMembership && currentMembership.user_ids ? currentMembership.user_ids : [];
  const [activeMember, setActiveMember] = useState(activeUserIds.includes(user._id));
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
      const userModel = new UserModel(apiToken, false);
      const updatedUser = {...user, paymentExempt: !paymentExempt};
      await userModel.putConfig(user._id, updatedUser);
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

  const handleSetActiveMember = async (active) => {
    try {
      if (!currentMembership) {
        window.alert('No active membership found');
        return;
      }
      if (!window.confirm(`Are you sure you want to ${active ? 'activate' : 'deactivate'} this user's membership?`)) {
        return;
      }
      setLoading(true);
      const membershipModel = new MembershipModel(apiToken);
      const responseData = await membershipModel.putActiveUser(currentMembership._id, user._id, active);
      if (!membershipModel.success) {
        window.alert(membershipModel.message);
        return;
      }
      const shouldSetCurrMembership = setCurrMembership && responseData && responseData.length > 0;
      if (shouldSetCurrMembership) {
        setCurrMembership(responseData[0]);
      }
      setActiveMember(!activeMember);
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
            readOnly={!canEdit}
            checked={paymentExempt}
            onChange={(e) => handleSetPaymentExempt(e.target.checked)}
          />}
        {canEdit && 
          <Form.Check
            type={'checkbox'}
            label={`Active Member`}
            id={`cb-mark-as-active`}
            checked={activeMember}
            readOnly={!canActivateMember}
            onChange={(e) => handleSetActiveMember(e.target.checked)}
          />}
        {loading && <Loading />}
      </Card.Body>
    </Card> 
  );
}