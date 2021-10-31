import { React, useState, useEffect }from 'react'
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react"
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Loading from '../components/Loading'
import dayjs from 'dayjs'
import { Permissions } from '../utils/permissions'
import NumberFormat from 'react-number-format';

function formatDate(date, format) {
  const map = {
      mm: date.getMonth() + 1,
      dd: date.getDate(),
      yy: date.getFullYear().toString().slice(-2),
      yyyy: date.getFullYear()
  }
  return format.replace(/mm|dd|yyyy/gi, matched => map[matched])
}

function Events() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0()

  let today = formatDate(new Date(Date.now()), 'yyyy-mm-dd')
  const [name, setName] = useState('')
  const [location, setLocation] = useState("Saint Anne's Park")
  const [date, setDate] = useState(today)
  const [fee, setFee] = useState(10.00)
  
  const [data, setData] = useState()
  const [apiToken, setApiToken] = useState('')
  const [loading, setLoading] = useState(true)
  const [allowAddEvents, setAllowAddEvents] = useState(false)
  const [show, setShow] = useState(false)
  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  if (isAuthenticated && apiToken === '') {
    getApiToken()
  }

  async function getApiToken() {
    let token = await getAccessTokenSilently({ audience: process.env.REACT_APP_AUTH0_AUDIENCE })
    setApiToken(token)   
    console.log(token)
  }

  async function postEvent() {
    if (name === '' || location === '') {
      window.alert('Please fill in all fields')
    } else {
      const event = {name, location, date, fee}
      await fetch(process.env.REACT_APP_API_URL + process.env.REACT_APP_API_EVENTS, {
              method:'POST', 
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
              setLoading(false);
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
                    setLoading(false)
                    setAllowAddEvents(permissions.check(apiToken, 'post', 'events'))
                  }).catch((error) => {
                    setData([])
                    setLoading(false);
                    console.log(error)
                  })
    }
  }
  


  useEffect(() => {
    async function loadData () {
      const permissions = new Permissions()
      setLoading(true)
      await fetch(process.env.REACT_APP_API_URL + process.env.REACT_APP_API_EVENTS, {headers: {Authorization: `Bearer ${apiToken}`}})
            .then(response => response.json())
            .then((response) => {
                    setData(response.data)
                    setLoading(false)
                    setAllowAddEvents(permissions.check(apiToken, 'post', 'events'))
                  }).catch((error) => {
                    setData([])
                    setLoading(false);
                    console.log(error)
                  })
    }  
    loadData()
  }, [apiToken])

  if (!data || loading) {
    return ( <Loading /> )
  } else if (data.length === 0) {
    return ( <div>No events</div> )
  } else {
    return (
        <div>
          {allowAddEvents && <Button onClick={handleShow} style={{marginLeft: "3px", marginBottom: "3px"}} variant="primary">Add Event</Button> }
          <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>New Event</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ display: 'grid' }} >
              <label style={{ margin: '3px' }} >
                Name: &nbsp;&nbsp;&nbsp; <input value={name} onChange={(e) => setName(e.target.value)} type="text" id="eventName" name="event-name" />
              </label>
              <label style={{ margin: '3px' }} >
                Location: <input value={location} onChange={(e) => setLocation(e.target.value)} type="text" id="eventLocation" name="event-location" />
              </label>
              <label style={{ margin: '3px' }} >
                Date: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <input value={date} onChange={(e) => setDate(e.target.value)} type="date" id="eventDate" name="event-date" min="2021-01-01" />
              </label>
              <label style={{ margin: '3px' }} >
                Fee: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <NumberFormat id="eventFee" name="event-fee"  value={fee} onChange={(e) => setFee(e.target.value)} thousandSeparator={ true } prefix={ "€" } />
              </label>
            </Modal.Body>
            <Modal.Footer>
               <Button variant="secondary" onClick={handleClose}>
                 Close
               </Button>
               <Button variant="primary" onClick={postEvent}>
                 Save
               </Button>
            </Modal.Footer>
          </Modal> 
          
          <div style={{display: 'flex', flexFlow: 'wrap'}}>
            {data.map((event, index) => (
              <Card style={{maxWidth: '40vh', margin: '3px', zIndex: 0}} key={index}>
                <Card.Header>{event.name}</Card.Header>
                <Card.Body>
                  <Card.Title>{event.location}</Card.Title>
                <Card.Text>Entry fee €{event.price}</Card.Text>
                  <Card.Text>{dayjs(event.date).format('DD/MM/YYYY') }</Card.Text>
                  <Button variant="primary">Enter</Button>
                </Card.Body>
              </Card>
            ))}    
          </div> 
        </div>
      )
  }
};

export default withAuthenticationRequired(Events, { onRedirecting: () => (<Loading />) });

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

  //Alternative to declaring loadData() in useEffect(). Memoize with useCallback()
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