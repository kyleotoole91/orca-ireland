import { React, useState, useEffect } from 'react'
import { withAuthenticationRequired } from "@auth0/auth0-react"
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Loading from '../components/Loading'
import Header from '../components/Header'
import { useAuth0 } from "@auth0/auth0-react"
import { UserModel } from '../models/UserModel'
import { MembershipModel } from '../models/MembershipModel'
import { DateUtils } from '../utils/DateUtils'
import { Permissions } from '../utils/permissions'
import Modal from 'react-bootstrap/Modal'
import NumberFormat from 'react-number-format'
import Accordion  from 'react-bootstrap/Accordion'
import styled from 'styled-components'
import Spinner from 'react-bootstrap/Spinner'
import { PlusButton } from '../components/PlusButton'

const userModel = new UserModel() 
const membershipModel = new MembershipModel() 
const dateUtils = new DateUtils()
let todayDate = new Date(Date.now())
let todayDateCtrl = dateUtils.formatDate(todayDate, 'yyyy-mm-dd')
let d = new Date()
let year = d.getFullYear()
let month = d.getMonth()
let day = d.getDate()
let oneYearFromToday = new Date(year+1, month, day)
let oneYearFromTodayCtrl = dateUtils.formatDate(oneYearFromToday, 'yyyy-mm-dd')
const firstNamePH = 'First Name'
const lastNamePH = 'Last Name'
const usernamePH = 'Enter nickname'
const phonePH = 'Enter phone'
const emailPH = 'Enter email'

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
  const [allowAddMemberships, setAllowAddMemberships] = useState(false)
  //const [allowReadMemberships, setAllowReadMemberships] = useState(false)
  const [editing, setEditing] = useState(false)
  const [show, setShow] = useState(false)
  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)
  const [secret, setSecret] = useState('')
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState(todayDate)
  const [startDateCtrl, setStartDateCtrl] = useState(todayDateCtrl)
  const [endDate, setEndDate] = useState(oneYearFromToday)
  const [endDateCtrl, setEndDateCtrl] = useState(oneYearFromTodayCtrl)
  const [fee, setFee] = useState(200)
  const [allMembersExpanded, setAllMembersExpanded] = useState(false)
  const [allMembersShipsExpanded, setAllMembersShipsExpanded] = useState(false)
  const [allMembersShips, setAllMembersShips] = useState()
  const [loadingAllMembers, setLoadingAllMembers] = useState(false)
  const [loadingAllMembersShips, setLoadingAllMembersShips] = useState(false)
  const [userData, setUserData] = useState()

  useEffect(() => {
    async function loadData () {
      setLoading(true)
      if (apiToken !== '') {
        try {
          const userModel = new UserModel(apiToken) 
          const membershipModel = new MembershipModel(apiToken) 
          const permissions = new Permissions()
          setAllowAddMemberships(permissions.check(apiToken, 'post', 'memberships'))
          //setAllowReadMemberships(permissions.check(apiToken, 'get', 'memberships'))
          await userModel.get(user.sub)
          if (userModel.success) {
            user.nickname && setUsername(user.nickname) 
            user.email && setEmail(user.email) 
            if (userModel.responseData.hasOwnProperty('username') && userModel.responseData.username !== '') {
              setUsername(userModel.responseData.username)   
            } else {
              setUsername(user.nickname)
            }
            if (userModel.responseData.hasOwnProperty('phone')) {
              setPhone(userModel.responseData.phone)
            } 
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
          setAllMembersExpanded(false)
          setLoading(false)
        }
      }
    }  
    loadData()
  }, [refresh, apiToken, user, isAuthenticated, getAccessTokenSilently])
  
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
      if (!user.email_verified) {
        window.alert('Please verify your email, check your inbox')
      } else {
        await membershipModel.activateMembership(currMembership._id, user.sub, activationCode)  
        if (!membershipModel.success) {
          window.alert(membershipModel.message)
        }
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
    if (fieldPlaceholder === emailPH) { setEmail(value) }
    if (fieldPlaceholder === phonePH) { setPhone(value) }
    setSaveButtonState(true)
  }

  function addMembership() {
    setEditing(false)
    setSecret('')
    setName('')
    setStartDate(todayDate)
    setStartDateCtrl(todayDateCtrl) 
    setEndDate(oneYearFromToday)
    setEndDateCtrl(oneYearFromTodayCtrl)
    setFee(200)
    handleShow()
  }

  async function postMembership(){
    await membershipModel.post({name, startDate, endDate, fee, secret})
    if (membershipModel.success){
      handleClose() 
    } else {
      window.alert(membershipModel.message)
    }
  }

  function saveMembership() {
    if (editing) {
      //putMembership(carId)
    } else {
      postMembership()
    }
    handleClose()
  }

  function startDateChange(stringDate) {
    let date = new Date(stringDate)
    setStartDate(date)
    setStartDateCtrl(stringDate)  
  }

  function endDateChange(stringDate) {
    let date = new Date(stringDate)
    setEndDate(date)
    setEndDateCtrl(stringDate)  
  }

  async function allMembersClick(){
    try {
      if (!allMembersExpanded) {
        setLoadingAllMembers(true)
        await userModel.get()
        if (userModel.success) {
          setUserData(userModel.responseData)
        }  
      } 
    } finally {
      setLoadingAllMembers(false)
      setAllMembersExpanded(!allMembersExpanded)
    }
  }

  async function allMembersShipsClick(){
    try {
      if (!allMembersShipsExpanded) {
        setLoadingAllMembersShips(true)
        await membershipModel.get()
        if (membershipModel.success) {
          setAllMembersShips(membershipModel.responseData)
        }  
      } 
    } finally {
      setLoadingAllMembersShips(false)
      setAllMembersShipsExpanded(!allMembersShipsExpanded)
    }
  }

  function activationForm() {
    return (
      <>
        <Form.Group className="mb-3" controlId="formActivation">
          <Form.Label>Activation code</Form.Label>
          <Form.Control type="password" placeholder="Enter activation code" value={activationCode} onChange={(e) => setActivationCode(e.target.value)}/>
        </Form.Group>
        <Button variant="outline-primary" onClick={activateMembership}> Activate</Button>
      </>
    )
  }

  function modalMembershipForm(){
    function headerText(){
      if (editing) {
        return 'Edit Membership'
      } else {
        return 'Add Membership'
      }
    }
    return ( 
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
        <Modal.Title>{headerText()}</Modal.Title>
        </Modal.Header>
          <Modal.Body style={{ display: 'grid', fontFamily: "monospace"}} >
            <label style={{ margin: '3px' }} >
              Name: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <input value={name} onChange={(e) => setName(e.target.value)} type="text" id="eventName" name="event-name" />
            </label>
            <label style={{ margin: '3px' }} >
              Start Date: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <input style={{width: '182px'}} value={startDateCtrl} onChange={(e) => startDateChange(e.target.value)} type="date" id="eventDate" name="event-date" min={startDateCtrl} />
            </label>
            <label style={{ margin: '3px' }} >
              Expiry Date: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <input style={{width: '182px'}} value={endDateCtrl} onChange={(e) => endDateChange(e.target.value)} type="date" id="eventDate" name="event-date" />
            </label>
            <label style={{ margin: '3px' }} >
              Fee: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <NumberFormat id="eventFee" name="event-fee"  value={fee} onChange={(e) => setFee(e.target.value)} thousandSeparator={ true } prefix={ "€" } />
            </label>
            <label style={{ margin: '3px' }} >
              Activation Code: &nbsp;
              <input value={secret} onChange={(e) => setSecret(e.target.value)} type="password" id="secret" name="membership-secret" />
            </label>
          </Modal.Body>
        <Modal.Footer>
          {/*allowDelEvents && editing && <Button onClick={deleteMembership} variant="outline-danger">Delete</Button>*/}
          <Button variant="outline-secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="outline-primary" onClick={saveMembership}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>   
    )
  }

  function membershipCard(){
    if (currMembership) {
      let membershipState = 'Inactive'  
      let cardHeight = '350px'
      if (activeMember) {
        membershipState = 'Active'
        cardHeight = '210px' 
      } 
      return (
        <Card style={{margin: '3px', maxHeight: cardHeight, minWidth: '284px', maxWidth: '284px'}}>
          <Card.Header>Current Membership</Card.Header>
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

  function userMembershipDetails(){
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
        {membershipCard()}
      </div>
    )
  }

  function getAllMembersCards(){
    function addCard(user, index){
      if (userInMemebership(user.extId, currMembership)){
        return <Card key={user.extId+'-card'+index} style={{minWidth: '300px', maxWidth: '300px', margin: '3px', zIndex: 0}}>
                 <Card.Header key={user.extId+'-header'+index}>{user.firstName+' '+user.lastName}</Card.Header>
                 <Card.Body key={user.extId+'-body'+index}>
                   <Card.Text key={user.extId+'-email'+index}>Email: {user.email}</Card.Text>
                   <Card.Text key={user.extId+'-phone'+index}>Phone: {user.phone}</Card.Text>
                 </Card.Body>
               </Card> 
      } 
    }
    function addMemberCards(users) {
      return ( users.map((user, index) => (addCard(user, index))) )
    }

    if (loadingAllMembers) {
      return <div className="text-center">
               <Spinner animation="border" variant="primary"/>
             </div>
    } else if (userData && userData.length > 0) {
      return <div style={{display: 'flex', flexFlow: 'wrap'}}>
              {addMemberCards(userData)}
            </div> 
    } else { 
      return <h4>No active members</h4> 
    }
  }

  function allMembersAccordian(){
    return <Accordion.Item eventKey="1">
            <StyledAccordionHeader onClick={allMembersClick}>Active Members</StyledAccordionHeader>
            <Accordion.Body>
              {getAllMembersCards()} 
            </Accordion.Body>
          </Accordion.Item>
  }

  function getAllMembershipsCards(){
    function addCard(membership, index){
      let memberCount = 0
      if (membership.hasOwnProperty('user_ids')) {
        memberCount = membership.user_ids.length  
      }
      return <Card key={user.extId+'-card'+index} style={{minWidth: '300px', maxWidth: '300px', margin: '3px', zIndex: 0}}>
                <Card.Header key={membership.extId+'-header'+index}>{membership.name}</Card.Header>
                <Card.Body>
                  <Card.Text>Start Date: {dateUtils.formatISODate(membership.endDate)}</Card.Text>
                  <Card.Text>End Date: {dateUtils.formatISODate(membership.endDate)}</Card.Text>
                  <Card.Text>Price: €{membership.price}</Card.Text>
                  <Card.Text>Member count: {memberCount}</Card.Text>
                </Card.Body>
              </Card> 
    }
    function addMemberCards(users){
      return ( users.map((user, index) => (addCard(user, index))) )
    }
    if (loadingAllMembersShips) {
      return <div className="text-center">
               <Spinner animation="border" variant="primary"/>
             </div>
    } else if (allMembersShips && allMembersShips.length > 0) {
      return <div style={{display: 'flex', flexFlow: 'wrap'}}>
              {addMemberCards(allMembersShips)}
            </div> 
    } else { 
      return <h4>No active members</h4> 
    }
  }

  function allMembershipsAccordian(){
    return <Accordion.Item eventKey="2">
            <StyledAccordionHeader onClick={allMembersShipsClick}>All Memberships</StyledAccordionHeader>
            <Accordion.Body>
              {getAllMembershipsCards()} 
            </Accordion.Body>
          </Accordion.Item>
  }

  if (loading) {
    return ( <Loading /> )
  } else {
    return (
      <>
        <Header props={{header:'Membership'}} />
        {allowAddMemberships && <div onClick={addMembership} style={{marginBottom: '18px', height: '15px', maxWidth: '15px'}} >
                                  <PlusButton >Add Event</PlusButton> 
                                </div> }
        {modalMembershipForm()}
        <Accordion defaultActiveKey="0">
          <Accordion.Item eventKey="0">
            <StyledAccordionHeader>My Membership</StyledAccordionHeader>
            <Accordion.Body>
              {userMembershipDetails()}
            </Accordion.Body>
          </Accordion.Item>
          {activeMember && allMembersAccordian()}
          {allowAddMemberships && allMembershipsAccordian()}
        </Accordion>
      </>
    )
  }
}

const StyledAccordionHeader = styled(Accordion.Header)`
  .accordion-button:focus {
    z-index: 0
  }
`
export default withAuthenticationRequired(Membership, {
  onRedirecting: () => (<Loading />)  
});

