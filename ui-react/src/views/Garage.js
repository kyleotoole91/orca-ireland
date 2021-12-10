import { React, useState, useEffect } from 'react'
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react"
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Loading from '../components/Loading'
import { PlusButton } from '../components/PlusButton'
//import { GearButton } from '../components/GearButton'
import { CarModel } from '../models/CarModel'
import { ClassModel } from '../models/ClassModel'
import Header from '../components/Header'

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
  }, [refresh, apiToken, user.sub])

  async function deleteCar() {
    try {
      if (window.confirm('Are you sure you want to delete this car?')) {
        await carModel.deleteUserDoc(user.sub, carId)
        if (carModel.success){
          setRefresh(!refresh)
          handleClose()
        } else {
          window.alert(carModel.message)
        }
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

  function editCar(e) {
    let car = findCar(e.target.id) 
    if (car) {
      setManufacturer(car.manufacturer)
      setModel(car.model)
      setFreq(car.freq)
      setColor(car.color)
      setTransponder(car.transponder)
      setCarId(e.target.id)
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
      return 'Edit car'
    } else {
      return 'Add car'
    }
  }

  function modalForm(){
    function classesDropDown () {
      return (
        <select id={classId} style={{width: '182px', height: '30px'}} onChange={(e) => handleChange(e)} >
          {classes.map((carClass, index) => 
            <option id={carClass._id} key={index} >{carClass.name}</option> ) }
        </select>  
      )
    }
    return (  
      <Modal show={show} onHide={handleClose} >
        <Modal.Header closeButton>
          <Modal.Title>{headerText()}</Modal.Title>
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
            {classes && classes.length !== 0 && classesDropDown()}  
          </label>      
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
          {data.map((car, index) => (
            <Card style={{minWidth: '250px', maxWidth: '250px', margin: '3px', zIndex: 0}} key={index}>
              <Card.Header>{car.manufacturer}</Card.Header>
              <Card.Body style={{height: '240px'}}>
                <Card.Title>{car.model}</Card.Title>
                <Card.Text>Color: {car.hasOwnProperty('color') && car.color}</Card.Text>
                <Card.Text>Frequency: {car.freq}</Card.Text>
                <Card.Text>Transponder ID: {car.transponder}</Card.Text>
                <Card.Text>Class: {getClassName(car.class_id)}</Card.Text>
                <Button style={{width: '100%'}} id={car._id} onClick={editCar} variant="outline-warning">Edit</Button>
              </Card.Body>
            </Card>
          ))}    
        </div> 
      </div>
    )
  }
}

/*
<div id={car._id} onClick={editCar} style={{float: 'right', marginBottom: '18px', height: '15px', maxWidth: '15px'}} >
                  <GearButton />
                </div>
*/

export default withAuthenticationRequired(Garage, { onRedirecting: () => (<Loading />) });