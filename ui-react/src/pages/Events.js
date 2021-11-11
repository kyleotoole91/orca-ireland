import { React, useState, useEffect } from 'react'
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react"
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import Loading from '../components/Loading'
import dayjs from 'dayjs'
import { Permissions } from '../utils/permissions'
import NumberFormat from 'react-number-format';

const urlParam = '?extLookup=1' 

function formatDate(date, format) {
  const map = {
    mm: (date.getMonth()+1).toString().padStart(2, '0'),
    dd: date.getDate().toString().padStart(2, '0'),
    yy: date.getFullYear().toString().slice(-2),
    yyyy: date.getFullYear()
  }
  return format.replace(/mm|dd|yyyy/gi, matched => map[matched])
}

function Events() {
  const { user, isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0()
  let todayDate = new Date(Date.now())
  todayDate = formatDate(todayDate, 'yyyy-mm-dd')
  const [name, setName] = useState('')
  const [location, setLocation] = useState("Saint Anne's Park")
  const [date, setDate] = useState(todayDate)
  const [fee, setFee] = useState(10.00)
  
  const [data, setData] = useState([])
  const [carData, setCarData] = useState([])
  const [apiToken, setApiToken] = useState('')
  const [loading, setLoading] = useState(true)
  const [allowAddEvents, setAllowAddEvents] = useState(false)
  const [allowDelEvents, setAllowDelEvents] = useState(false)
  const [show, setShow] = useState(false)
  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)
  const [showEnter, setShowEnter] = useState(false)
  const handleCloseEnter = () => setShowEnter(false)
  const handleShowEnter = () => setShowEnter(true)

  if (user && isAuthenticated && apiToken === '') {
    getApiToken()
  } else if (apiToken === '') { 
    loginWithRedirect()
  }

  async function getApiToken() {
    let token = await getAccessTokenSilently({ audience: process.env.REACT_APP_AUTH0_AUDIENCE })
    setApiToken(token)   
    console.log(token)
  }

  useEffect(() => {
    async function loadData () {
      setLoading(true);
      const permissions = new Permissions()
      try {
        await fetch(process.env.REACT_APP_API_URL + process.env.REACT_APP_API_EVENTS, {headers: {Authorization: `Bearer ${apiToken}`}})
            .then(response => response.json())
            .then((response) => {
              setData(response.data)
              setAllowAddEvents(permissions.check(apiToken, 'post', 'events'))
              setAllowDelEvents(permissions.check(apiToken, 'delete', 'events'))
            }).catch((error) => {
              setData([])
              window.alert(error)
              console.log(error)
            })
      //load user's cars
      const extId = '/'+user.sub
      await fetch(process.env.REACT_APP_API_URL+ 
                  process.env.REACT_APP_API_USERS+extId+
                  process.env.REACT_APP_API_CARS+urlParam, {headers: {Authorization: `Bearer ${apiToken}`}})
            .then(response => response.json())
            .then((response) => {
              setCarData(response.data)
              console.log(carData)
            }).catch((error) => {
              setCarData([])
              window.alert(error)
              console.log(error)
            })    
      } catch(e) {
        window.alert(e)
      } finally {
        setLoading(false)
      }
    }  
    loadData()
  }, [apiToken])

  async function deleteEvent(e) {
    try {
      if (window.confirm('Are you sure you want to delete this event?')) {
        const eventId = '/'+e.target.id.toString()
        await fetch( process.env.REACT_APP_API_URL + process.env.REACT_APP_API_EVENTS + eventId, {
                    method: 'DELETE', 
                    headers: {Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json"},})
        .then(response => response.json())
        .then((response) => {
          if (!response.success) {
            window.alert(response.message)   
          }
          setLoading(false)
          handleClose()
        }).catch((error) => {
          setData([])
          window.alert(error)
          console.log(error)
        });
        //refresh
        setLoading(true)
        const permissions = new Permissions()
        await fetch(process.env.REACT_APP_API_URL + process.env.REACT_APP_API_EVENTS, {headers: {Authorization: `Bearer ${apiToken}`}})
              .then(response => response.json())
              .then((response) => {
                setData(response.data)
                setAllowAddEvents(permissions.check(apiToken, 'post', 'events'))
                setAllowDelEvents(permissions.check(apiToken, 'delete', 'events'))
                setLoading(false)
              }).catch((error) => {
                setData([])
                window.alert(error)
                console.log(error)
              });
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
        const event = {name, location, date, fee}
        await fetch(process.env.REACT_APP_API_URL + process.env.REACT_APP_API_EVENTS, {
                method: 'POST', 
                headers: {Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json"},
                body: JSON.stringify(event)
              })
        .then(response => response.json())
        .then((response) => {
          if (!response.success) {
            window.alert(response.message)   
          }
          setLoading(false)
          handleClose()
        }).catch((error) => {
          setData([])
          window.alert(error)
          console.log(error)
        })
        //refresh
        setLoading(true)
        const permissions = new Permissions()
        await fetch(process.env.REACT_APP_API_URL + process.env.REACT_APP_API_EVENTS, {headers: {Authorization: `Bearer ${apiToken}`}})
              .then(response => response.json())
              .then((response) => {
                setData(response.data)
                setAllowAddEvents(permissions.check(apiToken, 'post', 'events'))
                setAllowDelEvents(permissions.check(apiToken, 'delete', 'events'))
                setLoading(false)
              }).catch((error) => {
                setData([])
                window.alert(error)
                console.log(error)
              })
      }
    } catch(e) {
      window.alert(e)
    } finally {
      setLoading(false)
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
            <input value={date} onChange={(e) => setDate(e.target.value)} type="date" id="eventDate" name="event-date" min={todayDate} />
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
      function carItem( car, index ) {
        return (
          <>
            <InputGroup id={car.model} index={index} className="mb-3">
              <InputGroup.Checkbox id={car.model} aria-label="Checkbox for following text input" />
              <FormControl id={car.model} value={car.manufacturer+' - '+car.model } aria-label="Text input with checkbox" />
            </InputGroup>
          </> 
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
  //for split second, data is still undefined although loading state was set to true after data set was set 
  if (loading) {
    return ( <Loading /> )
  } else if (!data || data.length === 0) {
    return ( 
      <div>
        {allowAddEvents && modalForm()}
        {allowAddEvents && <Button onClick={handleShow} style={{marginLeft: "3px", marginBottom: "3px"}} variant="outline-primary">Add Event</Button> }
      </div> )
  } else {
    return (
      <div>
        {allowAddEvents && <Button onClick={handleShow} style={{marginLeft: "3px", marginBottom: "3px"}} variant="outline-primary">Add Event</Button> }
        {modalForm()}
        {modalEnterEvent()}
        <div style={{display: 'flex', flexFlow: 'wrap'}}>
          {data.map((event, index) => (
            <Card style={{maxWidth: '40vh', margin: '3px', zIndex: 0}} key={index}>
              <Card.Header>{event.name}</Card.Header>
              <Card.Body>
                <Card.Title>{event.location}</Card.Title>
              <Card.Text>Entry fee €{event.fee}</Card.Text>
                <Card.Text>{dayjs(event.date).format('DD/MM/YYYY') }</Card.Text>
                <Button onClick={handleShowEnter} id={event._id} variant="outline-primary">Enter</Button>
                {allowDelEvents && <Button id={event._id} onClick={deleteEvent} style={{marginLeft: "3px"}} variant="outline-danger">Delete</Button> }
              </Card.Body>
            </Card>
          ))}    
        </div> 
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