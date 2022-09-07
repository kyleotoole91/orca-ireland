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
import { MemberTypes } from '../models/MemberTypes'
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
let oneYearFromToday = new Date(year+1, month, day-1)
let oneYearFromTodayCtrl = dateUtils.formatDate(oneYearFromToday, 'yyyy-mm-dd')
const firstNamePH = 'First Name'
const ecNamePH = 'Enter Full Name'
const ecPhonePH = 'Enter Emergency Phone'
const lastNamePH = 'Last Name'
const usernamePH = 'Enter username'
const phonePH = 'Enter phone'
const emailPH = 'Enter email'
const defaultDOB = new Date()
const cJuniorYears = 16
defaultDOB.setFullYear(defaultDOB.getFullYear()-18)
const defaultDOBCtrl = dateUtils.formatDate(defaultDOB, 'yyyy-mm-dd')

function Membership() {  
  const { user, isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0()
  const [saveButtonState, setSaveButtonState] = useState(false)
  const [apiToken, setApiToken] = useState('')
  const [loading, setLoading] = useState(true)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [memberDOB, setMemberDOB] = useState(defaultDOB)
  const [memberDOBCtrl, setMemberDOBCtrl] = useState(defaultDOBCtrl)
  const [currMembership, setCurrMembership] = useState()
  const [activationCode, setActivationCode] = useState('')
  const [activeMember, setActiveMember] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [allowAddMemberships, setAllowAddMemberships] = useState(false)
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
  const [fee, setFee] = useState(150)
  const [allMembersExpanded, setAllMembersExpanded] = useState(false)
  const [allMembersShipsExpanded, setAllMembersShipsExpanded] = useState(false)
  const [allMembersShips, setAllMembersShips] = useState()
  const [loadingAllMembers, setLoadingAllMembers] = useState(false)
  const [loadingAllMembersShips, setLoadingAllMembersShips] = useState(false)
  const [userData, setUserData] = useState()
  const [memberTypes, setMemberTypes] = useState()
  const [memberTypeID, setMemberTypeID] = useState('')
  const [memberTypeName, setMemberTypeName] = useState('')
  const [ecName, setEcName] = useState('')
  const [ecPhone, setEcPhone] = useState('')
  const [dobChanged, setDobChanged] = useState(false)
  const [allowViewMembers, setAllowViewMembers] = useState(false)

  useEffect(() => {
    async function loadData () {
      setLoading(true)
      if (apiToken !== '') {
        try {
          const userModel = new UserModel(apiToken) 
          const membershipModel = new MembershipModel(apiToken) 
          const memberTypesModel = new MemberTypes(apiToken) 
          const permissions = new Permissions()
          setAllowAddMemberships(permissions.check(apiToken, 'post', 'memberships'))
          setAllowViewMembers(permissions.check(apiToken, 'get', 'users'))
          await userModel.get(user.sub)
          await memberTypesModel.get()
          if (memberTypesModel.success && memberTypesModel.responseData.length > 0) {
            setMemberTypes(memberTypesModel.responseData) 
            for (let i=0; i<=memberTypesModel.responseData.length; i++) {
              if (memberTypesModel.responseData[i].default) {
                setMemberTypeName(memberTypesModel.responseData[i].name)
                setMemberTypeID(memberTypesModel.responseData[i]._id)
                break
              }
            }    
          } else {
            window.alert('Could not load member types: ' + memberTypesModel.message) 
          }
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
            if (userModel.responseData.hasOwnProperty('dateOfBirth')) {
              const date = new Date(userModel.responseData.dateOfBirth)
              setMemberDOB(date)
              setMemberDOBCtrl(dateUtils.formatDate(date, 'yyyy-mm-dd'))
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
            if (userModel.responseData.hasOwnProperty('ecName')) {
              setEcName(userModel.responseData.ecName)
            } 
            if (userModel.responseData.hasOwnProperty('ecPhone')) {
              setEcPhone(userModel.responseData.ecPhone)
            } 
            if (userModel.responseData.hasOwnProperty('memberType')) {
              setMemberTypeName(userModel.responseData.memberType.name)
              setMemberTypeID(userModel.responseData.memberType._id)
            }
          } else {
            if (user.hasOwnProperty('given_name')) {
              setFirstName(user.given_name) 
            }
            if (user.hasOwnProperty('family_name')) {
              setLastName(user.family_name) 
            }
            window.alert('Error loading user data: ' + userModel.message)
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

  function getMemberTypeById(id) {
    for (let i=0; i<memberTypes.length; i++) {
      if (memberTypes[i]._id === id) {
        return memberTypes[i]
      }
    } 
    return null
  }

  async function getApiToken() {
    try {
      const token = await getAccessTokenSilently({ audience: process.env.REACT_APP_AUTH0_AUDIENCE })
      setApiToken(token) 
      userModel.setApiToken(token)
      membershipModel.setApiToken(token)
      console.log(token)
    } catch(e) {
      console.log(e)
      loginWithRedirect()
    }
  }

  function userInMemebership(userExtId, membership) {
    let found = false
    for (var user of membership.users) {
      found = userExtId === user.extId 
      if (found) break 
    }
    return found
  }

  async function activateMembership() {
    try {
      if (!user.email_verified) {
        window.alert('Please verify your email, check your inbox. You may need to log out and log back in again to get rid of this error.')
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
      await userModel.put(user.sub, { firstName, lastName, phone, username, email, ecName, ecPhone,
                                      'memberType': getMemberTypeById(memberTypeID), 'dateOfBirth': memberDOB, extId })  
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
      return <Button style={{float: 'right'}} variant="outline-primary" onClick={updateUserDetails}>Save </Button>
    } else {
      return <Button disabled style={{float: 'right'}} variant="outline-secondary" onClick={updateUserDetails}>Save </Button>
    }
  }
  
  function setMemberDetailProp(fieldPlaceholder, value) {
    if (fieldPlaceholder === firstNamePH) { setFirstName(value) }
    if (fieldPlaceholder === lastNamePH) { setLastName(value) }
    if (fieldPlaceholder === usernamePH) { setUsername(value) }
    if (fieldPlaceholder === emailPH) { setEmail(value) }
    if (fieldPlaceholder === phonePH) { setPhone(value) }
    if (fieldPlaceholder === ecNamePH) { setEcName(value) }
    if (fieldPlaceholder === ecPhonePH) { setEcPhone(value) }
    setSaveButtonState(true)
  }

  function addMembershipClick() {
    setEditing(false)
    setSecret('')
    setName('')
    setStartDate(todayDate)
    setStartDateCtrl(todayDateCtrl) 
    setEndDate(oneYearFromToday)
    setEndDateCtrl(oneYearFromTodayCtrl)
    setFee(150)
    handleShow()
  }

  async function postMembership(){
    await membershipModel.post({name, startDate, endDate, fee, secret})
    if (membershipModel.success){
      setRefresh(!refresh)
      handleClose() 
    } else {
      window.alert(membershipModel.message)
    }
  }

  function saveMembership() {
    if (editing) {
      //Editing and deleting membership(s) needs to be implemented
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

  function memberDOBChange(stringDate) {
    let date = new Date(stringDate)
    setDobChanged(true)
    setMemberDOB(date)
    setMemberDOBCtrl(stringDate)
    setSaveButtonState(true)
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
        <Button variant="outline-primary" style={{width: '252px'}} onClick={activateMembership}> Activate</Button>
        <a href={process.env.REACT_APP_PAYPAL_PAYMENT_LINK}>
          <Button variant="outline-primary" style={{width: '252px', marginTop: '6px'}}> Pay with PayPal</Button>
        </a>
      </>
    )
  }

  function memberTypeChange(e) {
    const option = e.target.childNodes[e.target.selectedIndex]
    const memberType_id =  option.getAttribute('id')
    const memberType = getMemberTypeById(memberType_id)
    setMemberTypeName(memberType.name)
    setMemberTypeID(memberType_id)
    setSaveButtonState(true)
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
              Fee (&euro;): &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <NumberFormat id="eventFee" name="event-fee"  value={fee} onChange={(e) => setFee(e.target.value)} thousandSeparator={ true } /*prefix="€"*/ />
            </label>
            <label style={{ margin: '3px' }} >
              Activation Code: &nbsp;
              <input value={secret} onChange={(e) => setSecret(e.target.value)} type="password" id="secret" name="membership-secret" />
            </label>
          </Modal.Body>
        <Modal.Footer>
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
      let cardHeight = '369px'
      if (activeMember) {
        membershipState = 'Active'
        cardHeight = '200px' 
      } 
      return (
        <Card style={{margin: '3px', maxHeight: cardHeight, minWidth: '284px', maxWidth: '284px'}}>
          <Card.Header>Current Membership</Card.Header>
          <Card.Body>
            <Card.Title>{currMembership.name}</Card.Title>
            <Card.Text><b>Valid until: </b> { dateUtils.stringToWordDate(currMembership.endDate) }</Card.Text>
            <Card.Text><b>Price:</b> &euro;{currMembership.fee}</Card.Text>
            <Card.Text><b>Status:</b> {membershipState}</Card.Text>
            {!activeMember && activationForm()}
          </Card.Body>
        </Card>
      )
    } else return <> </> 
  }

  function memberDetailsForm(){
    function allowedDOB(memberType) {
      if (memberType.hasOwnProperty('junior')) {
        //TODO: is not exact 16 years from today, eg 02/02/2022 -> 01/01/2007 returns jr but 01/02/2006 doesn't
        if (dateUtils.yearsSince(memberDOB) < cJuniorYears) { 
          return memberType.junior
        } else {
          return !memberType.junior  
        }
      }
    }
    function memberTypesDropDown () {
      let dobHasChanged = dobChanged
      return (
        memberTypes.map((memberType) => {
          if (allowedDOB(memberType) && dobHasChanged) {
            console.log('Changing selected member type to: '+memberType.name)
            setMemberTypeName(memberType.name)
            setMemberTypeID(memberType._id)  
            setDobChanged(false) //delayed so using dobHasChanged
            dobHasChanged = false
          }  
          return allowedDOB(memberType) && <option id={memberType._id} key={memberType._id} >{memberType.name}</option> 
        })
      )
    }
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
              <Form.Group className="mb-3" controlId="formGroupDOB">
                <Form.Label>Date of Birth</Form.Label>
                <Form.Control type="date" value={memberDOBCtrl} onChange={(e) => memberDOBChange(e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formGroupUsername">
                <Form.Label>Member Type</Form.Label>
                <select className="form-select" value={memberTypeName} onChange={(e) => memberTypeChange(e)} >
                  {memberTypes && memberTypes.length !== 0 && memberTypesDropDown()} 
                </select>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formGroupEcName" >
                <Form.Label>Emergency Contact Name</Form.Label>
                <Form.Control type="text" placeholder={ecNamePH} value={ecName} onChange={(e) => setMemberDetailProp(e.target.placeholder, e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formEcPhone">
                <Form.Label>Emergency Contact Phone</Form.Label>
                <Form.Control type="text" placeholder={ecPhonePH} value={ecPhone} onChange={(e) => setMemberDetailProp(e.target.placeholder, e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formGroupUsername">
                <Form.Label>Username</Form.Label>
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
      if (userInMemebership(user.extId, currMembership)) {
        return <Card key={user.extId+'-card'+index} style={{minWidth: '300px', maxWidth: '300px', margin: '3px', zIndex: 0}}>
                 <Card.Header key={user.extId+'-header'+index}>{user.firstName+' '+user.lastName}</Card.Header>
                 <Card.Body key={user.extId+'-body'+index}>
                   {user.hasOwnProperty('memberType') && <Card.Text key={user.extId+'-type'+index}>Member Type: {user.memberType.name}</Card.Text>}
                   <Card.Text key={user.extId+'-email'+index}>Email: {user.email}</Card.Text>
                   <Card.Text key={user.extId+'-phone'+index}>Phone: {user.phone}</Card.Text>
                   {user.hasOwnProperty('dateOfBirth') && <Card.Text key={user.extId+'-dob'+index}>DOB: {dateUtils.formatDate(new Date(user.dateOfBirth), 'dd/mm/yyyy')}</Card.Text>}
                   {user.hasOwnProperty('ecName') && <Card.Text key={user.extId+'-ecName'+index}>Emergency Name: {user.ecName}</Card.Text>}
                   {user.hasOwnProperty('ecPhone') && <Card.Text key={user.extId+'-ecPhone'+index}>Emergency Phone: {user.ecPhone}</Card.Text>}
                 </Card.Body>
               </Card> 
      } 
    }
    if (loadingAllMembers) {
      return <div className="text-center">
               <Spinner animation="border" variant="primary"/>
             </div>
    } else if (userData && userData.length > 0) {
      return <div style={{display: 'flex', flexFlow: 'wrap'}}>
              {userData.map((user, index) => (addCard(user, index)))}
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

  function getAllMembershipsCards() {
    function addCard(membership, index) {
      let memberCount = 0
      if (membership.hasOwnProperty('user_ids')) {
        memberCount = membership.user_ids.length  
      }
      return <Card key={user.extId+'-card'+index} style={{minWidth: '300px', maxWidth: '300px', margin: '3px', zIndex: 0}}>
                <Card.Header key={membership.extId+'-header'+index}>{membership.name}</Card.Header>
                <Card.Body>
                  <Card.Text>Start Date: {dateUtils.stringToWordDate(membership.startDate)}</Card.Text>
                  <Card.Text>End Date: {dateUtils.stringToWordDate(membership.endDate)}</Card.Text>
                  <Card.Text>Price: &euro;{membership.fee}</Card.Text>
                  <Card.Text>Member count: {memberCount}</Card.Text>
                </Card.Body>
              </Card> 
    }
    if (loadingAllMembersShips) {
      return <div className="text-center">
               <Spinner animation="border" variant="primary"/>
             </div>
    } else if (allMembersShips && allMembersShips.length > 0) {
      return <div style={{display: 'flex', flexFlow: 'wrap'}}>
              {allMembersShips.map((user, index) => (addCard(user, index)))}
            </div> 
    } else { 
      return <h4>No active members</h4> 
    }
  }

  function allMembershipsAccordian() {
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
        {allowAddMemberships && 
            <div onClick={addMembershipClick} style={{marginBottom: '18px', height: '15px', maxWidth: '15px'}} >
              <PlusButton />
            </div> }
        {modalMembershipForm()}
        <Accordion defaultActiveKey="0">
          <Accordion.Item eventKey="0">
            <StyledAccordionHeader>My Membership</StyledAccordionHeader>
            <Accordion.Body>
              {memberDetailsForm()}
            </Accordion.Body>
          </Accordion.Item>
          {allowViewMembers && allMembersAccordian()}
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
export default withAuthenticationRequired(Membership, { onRedirecting: () => (<Loading />) })

