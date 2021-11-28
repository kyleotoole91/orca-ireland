import { React, useState, useEffect } from 'react'
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react"
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import InputGroup from 'react-bootstrap/InputGroup'
import Accordion  from 'react-bootstrap/Accordion'
import FormControl from 'react-bootstrap/FormControl'
import Loading from '../components/Loading'
import dayjs from 'dayjs'
import { Permissions } from '../utils/permissions'
import NumberFormat from 'react-number-format'
import { EventModel } from '../models/EventModel'
import { CarModel } from '../models/CarModel'
import { DateUtils } from '../utils/DateUtils'
import Spinner from 'react-bootstrap/Spinner'

const eventModel = new EventModel()
const dateUtils = new DateUtils()
const eventStartTimeHours = 10
let todayDateCtrl = dateUtils.formatDate(new Date(Date.now()), 'yyyy-mm-dd')
let defaultEventDate = new Date(Date.now())
defaultEventDate.setHours(eventStartTimeHours)
defaultEventDate.setMinutes(0)

function Events() {
  const { user, isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0()
  const [name, setName] = useState('')
  const [location, setLocation] = useState("Saint Anne's Park")
  const [date, setDate] = useState(todayDateCtrl)
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
  const [showEnter, setShowEnter] = useState(false)
  const [currEventId, setCurrEventId] = useState('')
  const [refresh, setRefresh] = useState(false)
  const [loadingAllEvents, setLoadingAllEvents] = useState(false)
  const [allEventsExpanded, setAllEventsExpanded] = useState(false)

  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)
  const handleCloseEnter = () => { 
    setCar_ids([])
    setShowEnter(false) 
  }
  const handleShowEnter = (e) => { 
    setCurrEventId(e.target.id.toString())
    setShowEnter(true) 
  }

  if (apiToken === '') {
    if (!isAuthenticated) {
      loginWithRedirect()
    } else {
      getApiToken()
    }
  } else { 
    eventModel.setApiToken(apiToken)
  }

  async function getApiToken() {
    let token = await getAccessTokenSilently({ audience: process.env.REACT_APP_AUTH0_AUDIENCE })
    eventModel.setApiToken(token)
    setApiToken(token)   
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
    if (data && data.length > 0 && data[0].hasOwnProperty('car_ids')) {
      for (var car_id of data[0].car_ids) {
        found = car_id === carId 
        if (found) { 
          if (car_ids.indexOf(carId) === -1) {
            car_ids.push(carId) 
          }
          break 
        }
      }
    }
    return found
  }

  useEffect(() => {
    async function loadData () {
      setLoading(true)
      if (apiToken !== '') {
        try {
          const eventModel = new EventModel(apiToken)
          const carModel = new CarModel(apiToken)
          const permissions = new Permissions()
          setAllowAddEvents(permissions.check(apiToken, 'post', 'events'))
          setAllowDelEvents(permissions.check(apiToken, 'delete', 'events'))
          let currEvent = await eventModel.getCurrentEvent()
          if (eventModel.success) {
            setCurrentEvent(eventModel.responseData)
          } else {
            window.alert(eventModel.message)
          }
          let noCurrentEvent = !currEvent || currEvent.length === 0
          if (noCurrentEvent) {
            await eventModel.get()
            if (eventModel.success) {
              setData(eventModel.responseData)
              setLoadingAllEvents(false)
              setAllEventsExpanded(true)
            } else {
              console.log(eventModel.message)
            }
          }
          await carModel.getUserDocs(user.sub)
          if (carModel.success) {
            setCarData(carModel.responseData)
          }  
        } catch(e) {
          window.alert(e)
        } finally {
          setLoading(false)
        }
      }
    }  
    loadData()
  }, [refresh, apiToken, user.sub])

  async function deleteEvent(e) {
    try {
      if (window.confirm('Are you sure you want to delete this event?')) {
        await eventModel.delete(e.target.id.toString())
        !eventModel.success && window.alert(eventModel.message)
        await eventModel.get()
        eventModel.success && setData(eventModel.responseData)
      }
    } catch(e) {
      window.alert(e)
    } finally {
      setLoading(false)
    }
  }

  async function postEvent() {
    try {
      if (name === '' || location === '') {
        window.alert('Please fill in all fields')
      } else {
        let date = eventDate
        await eventModel.post({name, location, date, fee})
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

  async function enterEvent() {
    try {    
      await eventModel.enterEvent(currEventId, car_ids)
      if (eventModel.success) {
        setRefresh(!refresh)
      } else {
        window.alert(eventModel.message)  
      }
    } catch(e) {
      window.alert(e)
    } finally {
      setLoading(false)
      handleCloseEnter()
    }
  }

  function eventDateChange(stringDate) {
    let date = new Date(stringDate)
    date.setHours(eventStartTimeHours)
    setEventDate(date)
    setDate(stringDate)  
  }

  function nextEventExpand(){
    if (currentEvent && currentEvent.length > 0) {
      return '0'
    } else {
      return '1'  
    }
  }

  function allEventsExpand(){
    if (currentEvent && currentEvent.length > 0) {
      return '1'
    } else {
      return '0'  
    }  
  }

  async function allEventsClick(){
    try {
      if (!allEventsExpanded) {
        setLoadingAllEvents(true)
        //await new Promise(r => setTimeout(r, 2000)); //sleep for 2s
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

  function addCards(events, showEnter) {
    return (
      events.map((event, index) => (
        <Card style={{minWidth: '25vh', maxWidth: '25vh', margin: '3px', zIndex: 0}} key={index}>
          <Card.Header>{event.name}</Card.Header>
          <Card.Body>
            <Card.Title>{event.location}</Card.Title>
            <Card.Text>Entry fee €{event.fee}</Card.Text>
            <Card.Text>{dayjs(event.date).format('DD/MM/YYYY') }</Card.Text>
            {showEnter && <Button onClick={handleShowEnter} id={event._id} variant="outline-primary">Enter</Button> }
            {allowDelEvents && <Button id={event._id} onClick={deleteEvent} style={{marginLeft: "3px"}} variant="outline-danger">Delete</Button> }
          </Card.Body>
        </Card>)
      )
    )
  }

  function getCurrentEventCard(){
    if (loading) {
      return <div className="text-center">
               <Spinner animation="border" variant="primary"/>
             </div>
    } else if (currentEvent && currentEvent.length > 0) {
      return (
        <div style={{display: 'flex', flexFlow: 'wrap'}}>
          {addCards(currentEvent, true)}
        </div>    
      )
    } else {
      return ( <h4>No events</h4> )
    }
  }

  function getAllEventCards(){
    if (loadingAllEvents) {
      return <div className="text-center">
               <Spinner animation="border" variant="primary"/>
             </div>
    } else if (data && data.length > 0) {
      return (
        <div style={{display: 'flex', flexFlow: 'wrap'}}>
          {addCards(data)}
        </div>    
      )
    } else {
      return ( <h4>No events</h4> )
    }
  }

  function modalForm(){
    return ( 
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>New Event</Modal.Title>
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
            <input value={date} onChange={(e) => eventDateChange(e.target.value)} type="date" id="eventDate" name="event-date" min={todayDateCtrl} />
          </label>
          <label style={{ margin: '3px' }} >
            Fee: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <NumberFormat id="eventFee" name="event-fee"  value={fee} onChange={(e) => setFee(e.target.value)} thousandSeparator={ true } prefix={ "€" } />
          </label>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="outline-secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="outline-primary" onClick={postEvent}>
              Save
            </Button>
        </Modal.Footer>
      </Modal>   
    )
  }

  function modalEnterEvent(){
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
      <Modal show={showEnter} onHide={handleCloseEnter}>
        <Modal.Header closeButton>
          <Modal.Title>Enter Event</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ display: 'grid', fontFamily: "monospace"}} >
          <p>Select your car(s)</p>
          {carCheckList()}
        </Modal.Body>
        <Modal.Footer>
            <Button variant="outline-secondary" onClick={handleCloseEnter}>
              Close
            </Button>
            <Button variant="outline-primary" onClick={enterEvent}>
              Enter Event
            </Button>
        </Modal.Footer>
      </Modal>   
    )
  }

  //for split second, data is still undefined although loading state was set to true after data set was set 
  if (loading) {
    return ( <Loading /> )
  } else {
    return (
      <div>
        {allowAddEvents && <Button onClick={handleShow} style={{marginLeft: "3px", marginBottom: "3px"}} variant="outline-primary">Add Event</Button> }
        {modalForm()}
        {modalEnterEvent()}
        <Accordion defaultActiveKey="0">
          <Accordion.Item eventKey={nextEventExpand()}>
            <Accordion.Header>Next Event</Accordion.Header>
            <Accordion.Body>
              {getCurrentEventCard()} 
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey={allEventsExpand()} onClick={allEventsClick}>
            <Accordion.Header>All Events</Accordion.Header>
            <Accordion.Body>
              {getAllEventCards()} 
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>
    )
  }
};

export default withAuthenticationRequired(Events, { onRedirecting: () => (<Loading />) });

//Alternative to declaring functions such as loadData() in useEffect(). Memoize with useCallback()
/* 
function MyComponent() {

  const [data, setData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const { logout, loginWithRedirect,  user, isAuthenticated, getAccessTokenSilently } = useAuth0()
  var profilePic = DefaultProfilePng
  var username = 'Sign In'

  if (user != null) {
    console.log(user)    
    token = getApiToken();
    console.log(token)
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