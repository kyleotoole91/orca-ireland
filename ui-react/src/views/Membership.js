import { React, useState, useEffect } from 'react'
import { withAuthenticationRequired } from "@auth0/auth0-react"
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Loading from '../components/Loading'
import { useAuth0 } from "@auth0/auth0-react"
import { UserModel } from '../models/UserModel'
import { MembershipModel } from '../models/MembershipModel'
import { DateUtils } from '../utils/DateUtils'

const firstNamePH = 'First Name'
const lastNamePH = 'Last Name'
const usernamePH = 'Enter nickname'
const phonePH = 'Enter nickname'
const emailPH = 'Enter email'
const userModel = new UserModel() 
const membershipModel = new MembershipModel() 
const dateUtils = new DateUtils()

function Membership() {  
  const { user, isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0()
  const [apiToken, setApiToken] = useState('')
  const [loading, setLoading] = useState(true)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [currMembership, setCurrMembership] = useState()
  const [activationCode, setActivationCode] = useState('')
  const [activeMember, setActiveMember] = useState(false)
  const [saveButtonState, setSaveButtonState] = useState(false)
  const [refresh, setRefresh] = useState(false)

  if (apiToken === '') {
    if (!isAuthenticated) {
      loginWithRedirect()
    } else {
      getApiToken()
    }
  } else { 
    userModel.setApiToken(apiToken)
    membershipModel.setApiToken(apiToken)
  }

  async function getApiToken() {
    let token = await getAccessTokenSilently({ audience: process.env.REACT_APP_AUTH0_AUDIENCE })
    setApiToken(token) 
    userModel.setApiToken(token)
    membershipModel.setApiToken(token)
    console.log(token)
    console.log(user)
  }

  function userInMemebership(userExtId, membership) {
    let found = false
    for (var user of membership.users) {
      found = userExtId === user.extId 
      if (found) { break }
    }
    return found
  }

  async function activateMembership() {
    try {
      await membershipModel.activateMembership(currMembership._id, user.sub, activationCode)  
      if (!membershipModel.success) {
        window.alert(membershipModel.message)
      }
    } finally {
      setRefresh(!refresh) 
      setLoading(false) 
    }
  }

  async function updateUserDetails() {
    try {
      const extId = user.sub
      await userModel.put(user.sub, { firstName, lastName, phone, username, email, extId })  
      if (userModel.success) {
        setSaveButtonState(false)
      } else {
        window.alert(userModel.message)
      }
    } finally {
      setLoading(false)  
    }
  }

  useEffect(() => {
    async function loadData () {
      setLoading(true)
      if (apiToken !== '') {
        try {
          const userModel = new UserModel(apiToken) 
          const membershipModel = new MembershipModel(apiToken) 
          await userModel.get(user.sub)
          if (userModel.success) {
            user.nickname && setUsername(user.nickname) 
            user.email && setEmail(user.email) 
            if (userModel.responseData.hasOwnProperty('username') && userModel.responseData.username !== '') {
              setUsername(userModel.responseData.username)   
            } else {
              setUsername(user.nickname)
            }
            setPhone(userModel.responseData.phone) 
            if (userModel.responseData.hasOwnProperty('firstName')) {
              setFirstName(userModel.responseData.firstName)
            } else if (user.hasOwnProperty('given_name')) {
              setFirstName(user.given_name)  
            }
            if (userModel.responseData.hasOwnProperty('lastName')) {
              setLastName(userModel.responseData.lastName)
            } else if (user.hasOwnProperty('family_name')) {
              setLastName(user.family_name)  
            }
          } else {
            console.log(userModel.message)
            if (user.hasOwnProperty('given_name')) {
              setFirstName(user.given_name) 
            }
            if (user.hasOwnProperty('family_name')) {
              setLastName(user.family_name) 
            }
            window.alert(userModel.message)
          }
          await membershipModel.getCurrentMembership()
          if (membershipModel.success && membershipModel.responseData.length === 1) {
            setCurrMembership(membershipModel.responseData[0]) 
            setActiveMember(userInMemebership(user.sub, membershipModel.responseData[0]))  
          } 
        } catch(e) {
          window.alert(e)
        } finally {
          setLoading(false)
        }
      }
    }  
    loadData()
  }, [refresh, apiToken, user, isAuthenticated, getAccessTokenSilently])

  function activationForm() {
    return (
      <>
        <Form.Group className="mb-3" controlId="formActivation">
          <Form.Label>Activation code</Form.Label>
          <Form.Control type="password"placeholder="Enter activation code" value={activationCode} onChange={(e) => setActivationCode(e.target.value)}/>
        </Form.Group>
        <Button variant="outline-primary" onClick={activateMembership}> Activate</Button>
      </>
    )
  }

  function membershipForm(){
    if (currMembership) {
      let membershipState = 'Inactive'  
      let cardHeight = '350px'
      if (activeMember) {
        membershipState = 'Active'
        cardHeight = '210px' 
      } 
      return (
        <Card style={{margin: '3px', maxHeight: cardHeight, minWidth: '284px', maxWidth: '284px'}}>
          <Card.Header>Membership</Card.Header>
          <Card.Body>
            <Card.Title>{currMembership.name}</Card.Title>
            <Card.Text><b>Valid until: </b> {dateUtils.formatISODate(currMembership.endDate)}</Card.Text>
            <Card.Text><b>Price:</b> €{currMembership.price}</Card.Text>
            <Card.Text><b>Status:</b> {membershipState}</Card.Text>
            {!activeMember && activationForm()}
          </Card.Body>
        </Card>
      )
    } else {
      return (
        <>
        </>  
      )
    }
  }

  function saveButton() {
    if (saveButtonState) {
      return <Button variant="outline-primary" onClick={updateUserDetails}>Save </Button>
    } else {
      return <Button disabled variant="outline-secondary" onClick={updateUserDetails}>Save </Button>
    }
  }
  
  function setMemberDetailProp(fieldPlaceholder, value) {
    if (fieldPlaceholder === firstNamePH) { setFirstName(value) }
    if (fieldPlaceholder === lastNamePH) { setLastName(value) }
    if (fieldPlaceholder === usernamePH) { setUsername(value) }
    if (fieldPlaceholder === email) { setEmail(value) }
    if (fieldPlaceholder === phonePH) { setPhone(value) }
    setSaveButtonState(true)
  }

  if (loading) {
    return ( <Loading /> )
  } else {
    return (
      <div style={{display: 'flex', flexFlow: 'wrap'}}> 
        <Card style={{margin: '3px', minWidth: '284px', maxWidth: '284px'}}>
          <Card.Header>Member details</Card.Header>
          <Card.Body>
            <Form style={{width: '250px'}}>
              <Form.Group className="mb-3" controlId="formGroupFirstName" >
                <Form.Label>First Name</Form.Label>
                <Form.Control type="text" placeholder={firstNamePH} value={firstName} onChange={(e) => setMemberDetailProp(e.target.placeholder, e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formGroupLastName" >
                <Form.Label>Last Name</Form.Label>
                <Form.Control type="text" placeholder={lastNamePH} value={lastName} onChange={(e) => setMemberDetailProp(e.target.placeholder, e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formGroupPhone">
                <Form.Label>Phone</Form.Label>
                <Form.Control type="text" placeholder={phonePH} value={phone} onChange={(e) => setMemberDetailProp(e.target.placeholder, e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formGroupUsername">
                <Form.Label>Nickname</Form.Label>
                <Form.Control readOnly type="text" placeholder={usernamePH} value={username} onChange={(e) => setMemberDetailProp(e.target.placeholder, e.target.value)}/>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formGroupEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control readOnly type="test" placeholder={emailPH} value={email} onChange={(e) => setMemberDetailProp(e.target.placeholder, e.target.value)} />
              </Form.Group>
            </Form> 
            {saveButton()}
          </Card.Body>
        </Card>
        {membershipForm()}
      </div>
    )
  }
}

export default withAuthenticationRequired(Membership, {
  onRedirecting: () => (<Loading />)  
});

