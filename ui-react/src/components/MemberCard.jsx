import { React, useState, useEffect } from 'react'
import { DateUtils } from '../utils/DateUtils';
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Loading from './Loading'
import { useAuth0 } from "@auth0/auth0-react"
import { UserModel } from '../models/UserModel'
import { MembershipModel } from '../models/MembershipModel'
import { Tooltip } from 'react-bootstrap'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import { UnsubscribeModel } from '../models/UnsubscribeModel'

const dateUtils = new DateUtils()

export const MemberCard = ({user, index, canEditUser, canActivateMember, canTogglePaymentRequired, currentMembership, setCurrMembership }) => {
  const [paymentExempt, setPaymentExempt] = useState(user.paymentExempt || false);
  const activeUserIds = currentMembership && currentMembership.user_ids ? currentMembership.user_ids : [];
  const [activeMember, setActiveMember] = useState(activeUserIds.includes(user._id));
  const [apiToken, setApiToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(!user.unsubscribed);
  const { getAccessTokenSilently } = useAuth0()

  useEffect(() => {
    async function retrieveToken () {
      if (apiToken === '') {
        const token = await getAccessTokenSilently({ audience: process.env.REACT_APP_AUTH0_AUDIENCE });
        setApiToken(token);
      }
    }  
    retrieveToken();
  }, [apiToken, getAccessTokenSilently]);

  const handleSetPaymentExempt = async () => {
    setLoading(true);
    const userModel = new UserModel(apiToken, false);
    const updatedUser = {...user, paymentExempt: !paymentExempt};
    await userModel.putConfig(user._id, updatedUser);
    setLoading(false);
    if (!userModel.success) {
      window.alert(userModel.message);
      return;
    }
    setPaymentExempt(!paymentExempt);
  }

  const handleSetActiveMember = async (active) => {
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
      setLoading(false);
      window.alert(membershipModel.message);
      return;
    }
    const shouldSetCurrMembership = setCurrMembership && responseData && responseData.length > 0;
    if (shouldSetCurrMembership) {
      setCurrMembership(responseData[0]);
    }
    setActiveMember(!activeMember);
  }

  const handleUnsubscribe = async (subscribe) => {
    // if (!window.confirm(`Are you sure you want to ${subscribe ? 'subscribe' : 'unsubscribe'} this user to marketing emails?`)) {
    //   return;
    // }
    setLoading(true);
    const unsubscribeModel = new UnsubscribeModel(apiToken);
    await unsubscribeModel.unsubscribe(user.email, subscribe);
    setLoading(false);
    unsubscribeModel.success && setSubscribed(subscribe);
    window.alert(unsubscribeModel.message);
  }

  const renderCashTooltip = (props) => (
    <Tooltip id="cash-tooltip" {...props}>
      {user.firstName} is currently {paymentExempt ? 'not' : ''} required to pay online for events
    </Tooltip>
  );

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
        {(canEditUser || canActivateMember) &&
          <Form.Check
            type={'checkbox'}
            label={`Active Member`}
            id={`cb-mark-as-active`}
            checked={activeMember}
            readOnly={canEditUser || canActivateMember ? false : true}
            onChange={(e) => handleSetActiveMember(e.target.checked)}
          />}
        {(canEditUser || canTogglePaymentRequired) && 
          <OverlayTrigger
            placement="top"
            delay={{ show: 250, hide: 400 }}
            overlay={renderCashTooltip}
          >
            <Form.Check
              type={'checkbox'}
              label={`Online payment required`}
              id={`cb-mark-as-paid`}
              readOnly={canEditUser || canTogglePaymentRequired ? false : true}
              checked={!paymentExempt}
              onChange={(e) => handleSetPaymentExempt(e.target.checked)}
            />
          </OverlayTrigger>
        }
        {(canEditUser) && 
          <Form.Check
            type={'checkbox'}
            label={`Subcribe to marketing emails`}
            id={`cb-mark-as-subscribed`}
            readOnly={canEditUser ? false : true}
            checked={subscribed}
            onChange={(e) => handleUnsubscribe(e.target.checked)}
          />
        }
        {loading && <Loading />}
      </Card.Body>
    </Card> 
  );
}