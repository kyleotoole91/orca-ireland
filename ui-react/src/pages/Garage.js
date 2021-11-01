import { React, useState, useEffect }from 'react'
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react"
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Loading from '../components/Loading'
//import { Permissions } from '../utils/permissions'

//extLookup=1 will accept the auth0 user id instead of the mongodb users._id object id
const urlParam = '?extLookup=1' 

function Garage() {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0()

  const [manufacturer, setManufacturer] = useState('')
  const [model, setModel] = useState('')
  const [freq, setFreq] = useState('')
  const [transponder, setTransponder] = useState('')
  const [classId, setClassId] = useState('')
  
  const [data, setData] = useState([])
  const [apiToken, setApiToken] = useState('')
  const [loading, setLoading] = useState(true)
  const [show, setShow] = useState(false)
  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  useEffect(() => {
    async function loadData () {
      setLoading(true)
      const extId = '/'+user.sub
      await fetch(process.env.REACT_APP_API_URL+ 
                  process.env.REACT_APP_API_USERS+extId +
                  process.env.REACT_APP_API_CARS+urlParam, {headers: {Authorization: `Bearer ${apiToken}`}})
            .then(response => response.json())
            .then((response) => {
              setData(response.data)
              setLoading(false)
            }).catch((error) => {
              setData([])
              setLoading(false);
              window.alert(error)
              console.log(error)
            })
    }  
    loadData()
  }, [apiToken, user.sub])

  if (isAuthenticated && apiToken === '') {
    getApiToken()
  }

  async function getApiToken() {
    let token = await getAccessTokenSilently({ audience: process.env.REACT_APP_AUTH0_AUDIENCE })
    setApiToken(token)   
    console.log(token)
  }

  async function deleteCar(e) {
    if (window.confirm('Are you sure you want to delete this car?')) {
      const id = '/'+e.target.id.toString()
      const extId = '/'+user.sub
      await fetch(process.env.REACT_APP_API_URL+ 
                  process.env.REACT_APP_API_USERS+extId+
                  process.env.REACT_APP_API_CARS+id+urlParam, {
                  method: 'DELETE', 
                  headers: {Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json"},
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
            });
      //refresh
      setLoading(true)
      await fetch(process.env.REACT_APP_API_URL+ 
                  process.env.REACT_APP_API_USERS+extId +
                  process.env.REACT_APP_API_CARS+urlParam, {headers: {Authorization: `Bearer ${apiToken}`}})
            .then(response => response.json())
            .then((response) => {
              setData(response.data)
              setLoading(false)
            }).catch((error) => {
              setData([])
              setLoading(false);
              window.alert(error)
              console.log(error)
            });
    }
  }

  async function postCar() {
    const extId = '/'+user.sub
    if (manufacturer === '' || model === '' || transponder === ''|| freq === '') {
      window.alert('Please fill in all fields')
    } else {
      const car = {manufacturer, model, freq, transponder, classId}
      await fetch(process.env.REACT_APP_API_URL+ 
                  process.env.REACT_APP_API_USERS+extId +
                  process.env.REACT_APP_API_CARS+urlParam, {
              method: 'POST', 
              headers: {Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json"},
              body: JSON.stringify(car)
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
      await fetch(process.env.REACT_APP_API_URL+ 
                  process.env.REACT_APP_API_USERS+extId +
                  process.env.REACT_APP_API_CARS+urlParam, {headers: {Authorization: `Bearer ${apiToken}`}})
            .then(response => response.json())
            .then((response) => {
              setData(response.data)
              setLoading(false)
            }).catch((error) => {
              setData([])
              setLoading(false);
              window.alert(error)
              console.log(error)
            })
    }
  }
  
  function modalForm(){
    return ( 
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>New Car</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ display: 'grid' }} >
              <label style={{ margin: '3px' }} >
                Manufacturer: &nbsp;&nbsp;&nbsp; 
                <input value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} type="text" id="eventName" name="event-name" />
              </label>
              <label style={{ margin: '3px' }} >
                Model: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
                <input value={model} onChange={(e) => setModel(e.target.value)} type="text" />
              </label>
              <label style={{ margin: '3px' }} >
                Frequency: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <input value={freq} onChange={(e) => setFreq(e.target.value)} type="text" />
              </label>
              <label style={{ margin: '3px' }} >
                Transponder ID: <input value={transponder} onChange={(e) => setTransponder(e.target.value)} type="text" />
              </label>
            </Modal.Body>
            <Modal.Footer>
               <Button variant="outline-secondary" onClick={handleClose}>
                 Close
               </Button>
               <Button variant="outline-primary" onClick={postCar}>
                 Save
               </Button>
            </Modal.Footer>
          </Modal>   
    )
  }

  if (loading) {
    return ( <Loading /> )
  } else if (!data || data.length === 0) {
    return ( 
      <div>
        {modalForm()}
        <Button onClick={handleShow} style={{marginLeft: "3px", marginBottom: "3px"}} variant="outline-primary">Add Car</Button> 
      </div> )
  } else {
    return (
      <div>
        <Button onClick={handleShow} style={{marginLeft: "3px", marginBottom: "3px"}} variant="outline-primary">Add Car</Button> 
        {modalForm()}
        <div style={{display: 'flex', flexFlow: 'wrap'}}>
          {data.map((car, index) => (
            <Card style={{maxWidth: '40vh', margin: '3px', zIndex: 0}} key={index}>
              <Card.Header>{car.manufacturer}</Card.Header>
              <Card.Body>
                <Card.Title>{car.model}</Card.Title>
                <Card.Text>Frequency: {car.freq}</Card.Text>
                <Card.Text>Transponder ID: {car.transponder}</Card.Text>
                <Button id={car._id} variant="outline-warning">Edit</Button>
                <Button id={car._id} onClick={deleteCar} style={{marginLeft: "3px"}} variant="outline-danger">Delete</Button> 
              </Card.Body>
            </Card>
          ))}    
        </div> 
      </div>
    )
  }
}

export default withAuthenticationRequired(Garage, { onRedirecting: () => (<Loading />) });