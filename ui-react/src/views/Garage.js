import { React, useState, useEffect } from 'react'
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react"
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Loading from '../components/Loading'
import { CarModel } from '../models/CarModel'
import { ClassModel } from '../models/ClassModel'

const carModel = new CarModel()

function Garage() {
  const { user, isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0()
  const [classes, setClasses] = useState([])
  const [classId, setClassId] = useState('')
  const [manufacturer, setManufacturer] = useState('')
  const [model, setModel] = useState('')
  const [freq, setFreq] = useState('')
  const [transponder, setTransponder] = useState('')
  const [color, setColor] = useState('')
  const [data, setData] = useState([])
  const [apiToken, setApiToken] = useState('')
  const [loading, setLoading] = useState(true)
  const [show, setShow] = useState(false)
  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  if (apiToken === '') {
    if (!isAuthenticated) {
      loginWithRedirect()
    } else {
      getApiToken()
    }
  } else { 
    carModel.setApiToken(apiToken)
  }

  async function getApiToken() {
    let token = await getAccessTokenSilently({ audience: process.env.REACT_APP_AUTH0_AUDIENCE })
    carModel.setApiToken(token)
    setApiToken(token)   
  }

  useEffect(() => {
    async function loadData () {
      if (apiToken !== '') {
        setLoading(true)
        try {
          const carModel = new CarModel(apiToken)
          const classModel = new ClassModel(apiToken)
          await carModel.getUserDocs(user.sub)
          if (carModel.success) {
            setData(carModel.responseData)
          } else {
            window.alert(carModel.message)
          }
          await classModel.get()
          if (classModel.success) {
            setClasses(classModel.responseData)
            if (classModel.responseData.length > 0) {
              setClassId(classModel.responseData[0]._id)
            }
          } else {
            window.alert(classModel.message)
          }
        } finally {
          setLoading(false) 
        }  
      }
    }  
    loadData()
  }, [apiToken, user.sub])

  async function deleteCar(e) {
    try {
      if (window.confirm('Are you sure you want to delete this car?')) {
        await carModel.deleteUserDoc(user.sub, e.target.id.toString())
        !carModel.success && window.alert(carModel.message)
        await carModel.getUserDocs(user.sub)
        carModel.success && setData(carModel.responseData)
      }
    } catch(e) {
      window.alert(e)
    } finally {
      setLoading(false)
    }
  }

  async function postCar() {
    try {
      await carModel.post(user.sub, {manufacturer, model, transponder, freq, color, 'class_id': classId})  
      if (carModel.success) {
        handleClose()
      } else {
        window.alert(carModel.message)
      }
      await carModel.getUserDocs(user.sub)
      carModel.success && setData(carModel.responseData)
    } catch(e) {
      window.alert(e)
    } finally {
      setLoading(false)
    }  
  }

  function handleChange(e){
    const option = e.target.childNodes[e.target.selectedIndex]
    const class_id =  option.getAttribute('id'); 
    setClassId(class_id)
  }

  function getClassName(id) {
    let carClass
    if (classes && classes.length !== 0) {
      carClass = classes.find(c => c._id === id)
    } 
    if (carClass) {
      return carClass.name
    } else {
      return ''
    } 
  }

  function modalForm(){
    function classesdDropDown () {
      return (
        <select id={classId} style={{width: '197px', height: '30px'}} onChange={(e) => handleChange(e)} >
          {classes.map((carClass, index) => 
            <option id={carClass._id} key={index} >{carClass.name}</option> ) }
        </select>  
      )
    }
    return (  
      <Modal show={show} onHide={handleClose} >
        <Modal.Header closeButton>
          <Modal.Title>New Car</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ display: 'grid', fontFamily: "monospace"} } >
          <label style={{ margin: '3px' }} >
            Manufacturer: &nbsp;&nbsp;
            <input value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} type="text" id="eventName" name="event-name" />
          </label> 
          <label style={{ margin: '3px' }} >
            Model: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <input value={model} onChange={(e) => setModel(e.target.value)} type="text" />
          </label>
          <label style={{ margin: '3px' }} >
            Colour:  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <input value={color} onChange={(e) => setColor(e.target.value)} type="text" />
          </label> 
          <label style={{ margin: '3px' }} >
            Frequency: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <input value={freq} onChange={(e) => setFreq(e.target.value)} type="text" />
          </label>        
          <label style={{ margin: '3px' }} >
            Transponder ID: <input value={transponder} onChange={(e) => setTransponder(e.target.value)} type="text" />
          </label>   
          <label style={{ margin: '3px' }} >
            Class: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            {classes && classes.length !== 0 && classesdDropDown()}  
          </label>      
        </Modal.Body>
        <Modal.Footer>
            <Button variant="outline-secondary" onClick={handleClose}>Close</Button>
            <Button variant="outline-primary" onClick={postCar}>Save </Button>
        </Modal.Footer>
      </Modal>   
    )
  }

  if (loading) {
    return ( <Loading /> )
  } else if (!data || data.length === 0) {
    return ( 
      <div>
        {modalForm(false)}
        <Button onClick={handleShow} style={{marginLeft: "3px", marginBottom: "3px"}} variant="outline-primary">Add Car</Button> 
      </div> )
  } else {
    return (
      <div>
        <Button onClick={handleShow} style={{marginLeft: "3px", marginBottom: "3px"}} variant="outline-primary">Add Car</Button> 
        {modalForm(true)}
        <div style={{display: 'flex', flexFlow: 'wrap'}}>
          {data.map((car, index) => (
            <Card style={{minWidth: '30vh', maxWidth: '30vh', margin: '3px', zIndex: 0}} key={index}>
              <Card.Header>{car.manufacturer}</Card.Header>
              <Card.Body>
                <Card.Title>{car.model}</Card.Title>
                <Card.Text>Color: {car.hasOwnProperty('color') && car.color}</Card.Text>
                <Card.Text>Frequency: {car.freq}</Card.Text>
                <Card.Text>Transponder ID: {car.transponder}</Card.Text>
                <Card.Text>Class: {getClassName(car.class_id)}</Card.Text>
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