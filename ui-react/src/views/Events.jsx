import { React, useState, useEffect } from 'react'
import { useAuth0 } from "@auth0/auth0-react"
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import InputGroup from 'react-bootstrap/InputGroup'
import Accordion  from 'react-bootstrap/Accordion'
import FormControl from 'react-bootstrap/FormControl'
import Loading from '../components/Loading'
import Header from '../components/Header'
import { Permissions } from '../utils/permissions'
import NumberFormat from 'react-number-format'
import { EventModel } from '../models/EventModel'
import { CarModel } from '../models/CarModel'
import { DateUtils } from '../utils/DateUtils'
import Spinner from 'react-bootstrap/Spinner'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { PlusButton } from '../components/PlusButton'
import { GearButton } from '../components/GearButton'

const eventModel = new EventModel()
const dateUtils = new DateUtils()
const eventStartTimeHours = 10
let defaultEventDate = dateUtils.nextDayOfWeekDate('sunday')
defaultEventDate.setHours(eventStartTimeHours)
defaultEventDate.setMinutes(0)
let defaultEventDateCtrl = dateUtils.formatDate(defaultEventDate, 'yyyy-mm-dd')
const defaultEventName = 'Round ' 

function Events() {
  const history = useHistory()
  const { user, isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0()
  const [name, setName] = useState(defaultEventName)
  const [location, setLocation] = useState("Saint Anne's Park")
  const [date, setDate] = useState(defaultEventDateCtrl)
  const [eventDate, setEventDate] = useState(defaultEventDate)
  const [fee, setFee] = useState(10.00)
  const [data, setData] = useState([])
  const [currentEvent, setCurrentEvent] = useState([])
  const [car_ids, setCar_ids] = useState([])
  const [carData, setCarData] = useState([])
  const [apiToken, setApiToken] = useState('')
  const [loading, setLoading] = useState(true)
  const [allowAddEvents, setAllowAddEvents] = useState(false)
  const [allowDelEvents, setAllowDelEvents] = useState(false)
  const [show, setShow] = useState(false)
  const [showRegistration, setShowRegistration] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState('')
  const [selectedEvent, setSelectedEvent] = useState()
  const [refresh, setRefresh] = useState(false)
  const [loadingAllEvents, setLoadingAllEvents] = useState(false)
  const [allEventsExpanded, setAllEventsExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)
  const handleCloseRegistration = () => { 
    setCar_ids([])
    setShowRegistration(false) 
  }

  useEffect(() => {
    async function loadData () {
      setLoading(true)
      try {
        const eventModel = new EventModel(apiToken)
        await eventModel.getCurrentEvent()
        if (eventModel.success) {
          if (eventModel.responseData.length > 0) {
            setCurrentEvent(eventModel.responseData)
            setSelectedEvent(eventModel.responseData[0])
            setSelectedEventId(eventModel.responseData[0]._id)
          }
        } else {
          window.alert(eventModel.message)
        } 
        if (apiToken !== '' && user) {
          const carModel = new CarModel(apiToken)
          const permissions = new Permissions()
          setAllowAddEvents(permissions.check(apiToken, 'post', 'events'))
          setAllowDelEvents(permissions.check(apiToken, 'delete', 'events'))
          if (user && user.hasOwnProperty('sub')) {
            await carModel.getUserDocs(user.sub)
            if (carModel.success) {
              setCarData(carModel.responseData)
            } 
          } 
        }
      } catch(e) {
        window.alert(e)
      } finally {
        setAllEventsExpanded(false)
        setLoading(false)
      }
    }  
    loadData()
  }, [refresh, user, apiToken])

  if (apiToken === '') {
    if (isAuthenticated) {
      getApiToken()
    }
  } else { 
    eventModel.setApiToken(apiToken)
  }

  async function getApiToken() {
    try { 
      const token = await getAccessTokenSilently({ audience: process.env.REACT_APP_AUTH0_AUDIENCE })
      eventModel.setApiToken(token)
      setApiToken(token)   
    } catch(e) {
      console.log(e)
      loginWithRedirect()
    }
  }

  async function handleShowRegistration(e) { 
    if (!isAuthenticated) {
      loginWithRedirect({ appState: { targetUrl: window.location.pathname } })
    } else {
      let event = await selectEvent(e.target.id.toString())
      if (event) {
        setSelectedEventId(e.target.id.toString())  
        setSelectedEvent(event)
        setShowRegistration(true)
        if (event.hasOwnProperty('car_ids')) {
          setCar_ids(event.car_ids)
        } else {
          setCar_ids([])
        }
      }
    }  
  }


  async function selectEvent(eventId){
    await eventModel.get(eventId)
    if (eventModel.success) {
      setSelectedEventId(eventId)
      setSelectedEvent(eventModel.responseData)   
      return eventModel.responseData
    } else {
      window.alert(eventModel.message)
      setSelectedEventId('')
      setSelectedEvent() 
      return
    }
  }

  function addCar(id){
    if (car_ids.indexOf(id) === -1) {
      car_ids.push(id)   
    } else {
      car_ids.splice(car_ids.indexOf(id), 1) 
    }
    setCar_ids(car_ids)
  }

  function carInEvent(carId) {
    let found = false
    if (selectedEventId !== '') {
      if (selectedEvent && selectedEvent.hasOwnProperty('car_ids')) {
        for (var car_id of selectedEvent.car_ids) {
          found = car_id === carId 
          if (found) { 
            if (car_ids.indexOf(carId) === -1) {
              car_ids.push(carId) 
            }
            break 
          }
        }
      }
    }
    return found
  }

  async function deleteEvent() {
    try {
      if (window.confirm('Are you sure you want to delete this event?')) {
        setLoading(true) 
        await eventModel.delete(selectedEventId.toString())
        if (eventModel.success) {
          setRefresh(!refresh)
          handleClose()
        } else {
          window.alert(eventModel.message)
        }
      }
    } catch(e) {
      window.alert(e)
    } finally {
      setLoading(false)
    }
  }

  async function postEvent() {
    let date = eventDate
    await eventModel.post({name, location, date, fee})
    if (eventModel.success) {
      setRefresh(!refresh)
      handleClose()
    } else {
      window.alert(eventModel.message) 
    }
  }

  async function putEvent() {
    let date = eventDate
    await eventModel.put(selectedEventId, {name, location, date, fee})
    if (eventModel.success) {
      setRefresh(!refresh)
      handleClose()
    } else {
      window.alert(eventModel.message) 
    }
  }

  async function enterEvent() {  
    await eventModel.enterEvent(selectedEventId, car_ids)
    let payNow = false
    if (eventModel.success) {
      if (car_ids && car_ids.length > 0) {
        payNow = window.confirm('You have successfully registered for this event! \n\n'+
                                'Club rounds: \u20AC10 \n'+
                                'National rounds: \u20AC20 \n'+
                                'Two classes: Club \u20AC15 National \u20AC30 \n'+
                                'Cadet: Half price \n\n'+
                                'Would you like to be redirected to PayPal to make this payment now?\nUse "Friends and Family" for no fees') 
      }
      if (payNow) {
        window.location.href=process.env.REACT_APP_PAYPAL_PAYMENT_LINK  
      } else if (car_ids && car_ids.length > 0) {
        history.push('/events/'+selectedEventId)   
      } else {
        setRefresh(!refresh)
        handleCloseRegistration() 
      }
    } else {
      window.alert(eventModel.message)  
    }
  }

  function eventDateChange(stringDate) {
    let date = new Date(stringDate)
    date.setHours(eventStartTimeHours)
    setEventDate(date)
    setDate(stringDate)  
  }

  async function allEventsClick(){
    try {
      if (!allEventsExpanded) {
        setLoadingAllEvents(true)
        await eventModel.get()
        if (eventModel.success) {
          setData(eventModel.responseData)
        }  
      } 
    } finally {
      setLoadingAllEvents(false)
      setAllEventsExpanded(!allEventsExpanded)
    }
  }

  function showEventDetails(id) {
    if (!isAuthenticated) {
      loginWithRedirect({ appState: { targetUrl: window.location.pathname+'/'+id } })
    } else {
      history.push('/events/'+id)
    }
  }

  function getCurrentEventCard(){
    if (loading) {
      return <div className="text-center">
               <Spinner animation="border" variant="primary"/>
             </div>
    } else if (currentEvent && currentEvent.length > 0) {
      return <div style={{display: 'flex', flexFlow: 'wrap'}}>
              {addCards(currentEvent, true)}
            </div>  
    } else {
      return <h4>No upcoming event</h4> 
    }
  }

  function getAllEventCards(){
    if (loadingAllEvents) {
      return <div className="text-center">
               <Spinner animation="border" variant="primary"/>
             </div>
    } 
    if (data && data.length > 0) {
      return <div style={{display: 'flex', flexFlow: 'wrap'}}>
               {addCards(data)}
             </div>    
    }
    return <h4>No events</h4> 
  }

  async function editEvent(id) {
    if (!isAuthenticated) {
      loginWithRedirect({ appState: { targetUrl: window.location.pathname } })
    } else {
      let selEvent = await selectEvent(id)
      if (selEvent) {
        setEditing(true)
        setName(selEvent.name)
        setLocation(selEvent.location)
        setEventDate(new Date(selEvent.date))
        setDate(dateUtils.formatDate(new Date(selEvent.date), 'yyyy-mm-dd')) 
        setFee(selEvent.fee)
        handleShow()
      } else {
        window.alert('Error loading event')
      }
    }
  } 

  function addEvent() {
    setEditing(false)
    setName(defaultEventName)
    setLocation("Saint Anne's Park")
    setEventDate(defaultEventDate)
    setDate(defaultEventDateCtrl) 
    setFee(10)
    handleShow()
  } 

  function saveEvent(){
    if (editing) {
      putEvent(selectedEventId.toString())
    } else {
      postEvent()
    }
  }

  function addCards(events, currentEvent) {
    let margin = '0px'
    let detailBtnMrg = '10px'
    if (currentEvent) {
      margin = '10px'
      detailBtnMrg = '6px'
    }
    return (
      events.map((event) => (
        <Card style={{minWidth: '225px', maxWidth: '225px', margin: '3px', zIndex: 0}} key={event._id}>
          <Card.Header>
             <b>{event.name}</b>
             <div style={{marginBottom: `${margin}`, float: 'right'}} >
              {allowDelEvents && <GearButton id={event._id} handleClick={() => editEvent(event._id)}/> }
            </div>
          </Card.Header>
          <Card.Body>
            <Card.Title>{event.location}</Card.Title>
            <Card.Text>Entry fee &euro;{event.fee}</Card.Text>
            <div style={{marginBottom: `${margin}`, float: 'left'}}>
              <Card.Text>{dateUtils.stringToWordDateTime(event.date)}</Card.Text>
            </div>
            {currentEvent && 
              <Button onClick={handleShowRegistration} id={event._id}  style={{width: "100%"}} variant="outline-primary">
                Registration
              </Button>} 
            <Button id={event._id} onClick={(e) => showEventDetails(e.target.id)} style={{marginTop: `${detailBtnMrg}`, width: "100%"}} variant="outline-primary">
              Details
            </Button> 
          </Card.Body>
        </Card>)
      )
    )
  }

  function headerText(){
    if (editing) {
      return 'Edit event'
    } else {
      return 'Add event'
    }
  }
  
  function modalAddEventForm(){
    return ( 
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
        <Modal.Title>{headerText()}</Modal.Title>
        </Modal.Header>
          <Modal.Body style={{ display: 'grid', fontFamily: "monospace"}} >
            <label style={{ margin: '3px' }} >
              Name: &nbsp;&nbsp;&nbsp;&nbsp; 
              <input value={name} onChange={(e) => setName(e.target.value)} type="text" id="eventName" name="event-name" />
            </label>
            <label style={{ margin: '3px' }} >
              Location: <input value={location} onChange={(e) => setLocation(e.target.value)} type="text" id="eventLocation" name="event-location" />
            </label>
            <label style={{ margin: '3px' }} >
              Date: &nbsp;&nbsp;&nbsp;&nbsp;
              <input style={{minWidth: '182px'}} value={date} onChange={(e) => eventDateChange(e.target.value)} type="date" id="eventDate" name="event-date" min={defaultEventDateCtrl} />
            </label>
            <label style={{ margin: '3px' }} >
              Fee: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <NumberFormat id="eventFee" name="event-fee"  value={fee} onChange={(e) => setFee(e.target.value)} thousandSeparator={ true } prefix={ "€" } />
            </label>
          </Modal.Body>
        <Modal.Footer>
          {allowDelEvents && editing && <Button onClick={deleteEvent} variant="outline-danger">Delete</Button> }
          <Button variant="outline-secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="outline-primary" onClick={saveEvent}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>   
    )
  }

  function modalRegistration(){
    function carCheckList () {
      function carItem(car, index) {
        return (
          <InputGroup key={car._id+index} className="mb-3">
            <InputGroup.Checkbox key={car._id} id={car._id} defaultChecked={carInEvent(car._id)} onChange={(e) => addCar(e.target.id)} aria-label="Checkbox for following text input" />
            <FormControl key={car._id+'-FormControl'} onChange={(e) => addCar(e.target.id)} value={car.manufacturer+' - '+car.model } aria-label="Text input with checkbox" />
          </InputGroup>
        )
      }    
      return (
        <>
          {carData && carData.map((car, index) => carItem(car, index) ) }
        </>  
      )
    }
    return ( 
      <Modal show={showRegistration} onHide={handleCloseRegistration}>
        <Modal.Header closeButton>
          <Modal.Title>Enter Event</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ display: 'grid'}} >
          <p>One car per class</p>
          {carCheckList()}
        </Modal.Body>
        <Modal.Footer>
            <Button variant="outline-secondary" onClick={handleCloseRegistration}>
              Close
            </Button>
            <Button variant="outline-primary" onClick={enterEvent}>
              Save
            </Button>
        </Modal.Footer>
      </Modal>   
    )
  }

  if (loading) {
    return ( <Loading /> )
  } else {
    return (
      <div>
        <Header props={{header:'Events'}} />
        {modalAddEventForm()}
        {modalRegistration()}
        {allowAddEvents && <div onClick={addEvent} style={{marginBottom: '18px', height: '15px', maxWidth: '15px'}} >
                              <PlusButton >Add Event</PlusButton> 
                           </div> }
        <Accordion defaultActiveKey="0">
          <Accordion.Item eventKey="0">
            <StyledAccordionHeader>Upcoming Events</StyledAccordionHeader>
            <Accordion.Body>
              {getCurrentEventCard()} 
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="1">
            <StyledAccordionHeader onClick={allEventsClick}>All Events</StyledAccordionHeader>
            <Accordion.Body>
              {getAllEventCards()} 
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>
    )
  }
}

const StyledAccordionHeader  = styled(Accordion.Header)`
  .accordion-button:focus {
    z-index: 0
  }
`

export default Events

//export default withAuthenticationRequired(Events, { onRedirecting: () => (<Loading />) });

//Alternative to declaring functions and objects in useEffect(). Memoize with useCallback()
/* 
function MyComponent() {

  const [data, setData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const { logout, loginWithRedirect,  user, isAuthenticated, getAccessTokenSilently } = useAuth0()
  var profilePic = DefaultProfilePng
  var username = 'Sign In'

  if (user != null) {
    token = getApiToken();
    profilePic = user.picture
    if (user.name != null) {
      username = user.name;
    } else {
      username = user.nickname;
    }
  }

  //Alternative to declaring function in useEffect: Memoize with useCallback()
  const loadData= useCallback(() => {
    //Request code here
    }, [])
  useEffect(() => {
      loadData()
  }, [loadData])
 
  async function getApiToken() {
    return await getAccessTokenSilently();
  }
  
  const loadAsyncData = async () => {
  
    setIsLoading(true);
    setError(null);
    
    try {
      const resp = await fetch('https://...').then(r=>r.json());
      setData(resp);
      setIsLoading(false);
    } catch(e) {
      setError(e);
      setIsLoading(false);
    }
    
  }
  
  useEffect(() => {
    
    loadAsyncData();
    
  }, []);
  
    
  if(this.state.isLoading) return (<p>Loading...</p>);
  if(this.state.error) return (<p>Something went wrong</p>);
  if(this.state.data) return (<p>The data is: {data}</p>);
  return (<p>No data yet</p>);
    
}

*/
