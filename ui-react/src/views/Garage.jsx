import { React, useState, useEffect } from 'react'
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react"
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Loading from '../components/Loading'
import { PlusButton } from '../components/PlusButton'
import { GearButtonNoMrg } from '../components/GearButton'
import { CarModel } from '../models/CarModel'
import { ClassModel } from '../models/ClassModel'
import Header from '../components/Header'
import Form from 'react-bootstrap/Form'

const carModel = new CarModel()

function Garage() {
  const { user, isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0()
  const [classes, setClasses] = useState([])
  const [classId, setClassId] = useState('')
  const [manufacturer, setManufacturer] = useState('')
  const [model, setModel] = useState('')
  const [freq, setFreq] = useState('2.4ghz')
  const [transponder, setTransponder] = useState('')
  const [color, setColor] = useState('White')
  const [data, setData] = useState([])
  const [apiToken, setApiToken] = useState('')
  const [loading, setLoading] = useState(true)
  const [show, setShow] = useState(false)
  const [editing, setEditing] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [carId, setCarId] = useState('')
  //arrow functions may be used to execute functions 
  //rather than simply setting state variables
  const handleClose = () => {
    setShow(false)
  }
  const handleShow = () => {
    setShow(true)
  }

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
    try{ 
      const token = await getAccessTokenSilently({ audience: process.env.REACT_APP_AUTH0_AUDIENCE })
      carModel.setApiToken(token)
      setApiToken(token)
    } catch(e) {
      console.log(e)
      loginWithRedirect()
    }   
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
  }, [refresh, apiToken, user.sub])

  async function deleteCar() {
    try {
      if (window.confirm('Are you sure you want to delete this car?')) {
        await carModel.deleteUserDoc(user.sub, carId)
        if (carModel.success){
          setRefresh(!refresh)
        } else {
          window.alert(carModel.message)
        }
      }
    } catch(e) {
      window.alert(e)
    } finally {
      handleClose()
    }
  }

  async function postCar() {
    try {
      await carModel.post(user.sub, {manufacturer, model, transponder, freq, color, 'class_id': classId})  
      if (carModel.success) {
        setRefresh(!refresh)
        handleClose()
      } else {
        window.alert(carModel.message)
      }
    } catch(e) {
      window.alert(e)
    } finally {
      setLoading(false)
    }  
  }

  async function putCar(id) {
    try {
      await carModel.put(user.sub, id.toString(), {manufacturer, model, transponder, freq, color, 'class_id': classId})  
      if (carModel.success) {
        setRefresh(!refresh)
        handleClose()
      } else {
        window.alert(carModel.message)
      }
    } catch(e) {
      window.alert(e)
    } finally {
      setLoading(false)
    }  
  }

  function handleClassChange(e) {
    const option = e.target.childNodes[e.target.selectedIndex]
    const class_id =  option.getAttribute('id')
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

  function findCar(id) {
    if (data && data.length > 0){
      for (var car of data) {
        if (car._id === id) {
          return car
        }
      }
    } else {
      return
    }
  }

  function editCar(id) {
    let car = findCar(id) 
    if (car) {
      setManufacturer(car.manufacturer)
      setModel(car.model)
      setFreq(car.freq)
      setColor(car.color)
      setClassId(car.class_id)
      setTransponder(car.transponder)
      setCarId(id)
      setEditing(true)
      handleShow()
    } else {
      window.alert('error finding car')
    }
  } 

  function addCar() {
    setEditing(false)
    setManufacturer('')
    setModel('')
    setFreq('2.4ghz')
    setColor('White')
    setTransponder('')
    setCarId('')
    handleShow()
  } 

  function saveCar(){
    if (editing) {
      putCar(carId)
    } else {
      postCar()
    }
  }

  function headerText(){
    if (editing) {
      return manufacturer+' '+model
    } else {
      return 'New Car'
    }
  }

  function modalForm(){
    return (  
      <Modal show={show} onHide={handleClose} >
        <Modal.Header closeButton>
          <Modal.Title>{headerText()}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ display: 'grid' } } >
          <Form>
            <Form.Group className="mb-3" controlId="formName">
              <Form.Label>Manufacturer</Form.Label>
              <Form.Control value={manufacturer} disabled={editing} type="text" onChange={(e) => setManufacturer(e.target.value)}/>
            </Form.Group> 
            <Form.Group className="mb-3" controlId="formModel">
              <Form.Label>Model</Form.Label>
              <Form.Control disabled={editing} value={model} onChange={(e) => setModel(e.target.value)} type="text" />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formColor">
              <Form.Label>Colour</Form.Label>
              <Form.Control value={color} onChange={(e) => setColor(e.target.value)} type="text" />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formRadioFreq">
              <Form.Label>Radio Frequency</Form.Label>
              <Form.Control value={freq} onChange={(e) => setFreq(e.target.value)} type="text" />
            </Form.Group> 
            <Form.Group className="mb-3" controlId="formTransponderID">
              <Form.Label>Transponder ID</Form.Label>
              <Form.Control name="transponderID" value={transponder} onChange={(e) => setTransponder(e.target.value)} type="text" />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formClass">
              <Form.Label>Class</Form.Label>
              <Form.Select disabled={editing} onChange={(e) => handleClassChange(e)} value={getClassName(classId)}>
                {classes && classes.map((carClass, index) => 
                  <option id={carClass._id} key={index} >{carClass.name}</option> )}
              </Form.Select>
            </Form.Group>
          </Form>        
        </Modal.Body>
        <Modal.Footer>
            {editing && <Button onClick={deleteCar} style={{marginLeft: "3px"}} variant="outline-danger">Delete</Button> }
            <Button variant="outline-secondary" onClick={handleClose}>Close</Button>
            <Button variant="outline-primary" onClick={saveCar}>Save </Button>
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
        <Header props={{header:'Garage'}} /> 
        <div onClick={addCar} style={{marginBottom: '18px', height: '15px', maxWidth: '15px'}} >
          <PlusButton /> 
        </div>
        <span>Add your cars, this will let you enter events</span>
      </div> )
  } else {
    return (
      <div>
        <Header props={{header:'Garage'}} /> 
        <div onClick={addCar} style={{marginBottom: '18px', height: '15px', maxWidth: '15px'}} >
          <PlusButton /> 
        </div>
        {modalForm()}
        <div style={{display: 'flex', flexFlow: 'wrap'}}>
          {data && data.length > 0 && data.map((car, index) => (
            <Card style={{width: '240px', margin: '3px', zIndex: 0}} key={index}>
              <Card.Header>
                <b>{car.manufacturer}</b>
                <div style={{float: 'right'}} >
                  <GearButtonNoMrg id={car._id} handleClick={() => editCar(car._id)}/>
                </div>
              </Card.Header>
              <Card.Body>
                <Card.Title>{car.model}</Card.Title>
                <Card.Text>Color: {car.hasOwnProperty('color') && car.color}</Card.Text>
                <Card.Text>Frequency: {car.freq}</Card.Text>
                <Card.Text>Transponder ID: {car.transponder}</Card.Text>
                <div style={{float: 'left'}}>
                  <Card.Text>Class: {getClassName(car.class_id)}</Card.Text>
                </div>
              </Card.Body>
            </Card>
          ))}    
        </div> 
      </div>
    )
  }
}

export default withAuthenticationRequired(Garage, { onRedirecting: () => (<Loading />) });
