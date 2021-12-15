import { React, useState, useEffect } from 'react'
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react"
import Loading from '../components/Loading'
import Header from '../components/Header'
import { EventModel } from '../models/EventModel'
import { ClassModel } from '../models/ClassModel'
import { RaceModel } from '../models/RaceModel'
import { useParams } from 'react-router-dom'
import Table  from 'react-bootstrap/Table'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import dayjs from 'dayjs'
import { Permissions } from '../utils/permissions'
import { PlusButton } from '../components/PlusButton'

const raceModel = new RaceModel() 

function EventDetail() {
  let { id } = useParams()
  const { user, isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0()
  const [apiToken, setApiToken] = useState('')
  const [event, setEvent] = useState()
  const [classes, setClasses] = useState()
  const [loading, setLoading] = useState()
  const [allowAddRaces, setAllowAddRaces] = useState(false)
  const [showRaceForm, setShowRaceForm] = useState(false)
  const [raceName, setRaceName] = useState('')
  const [classId, setClassId] = useState('')
  const [firstCarId, setFirstCarId] = useState('')
  const [secondCarId, setSecondCarId] = useState('')
  const [thirdCarId, setThirdCarId] = useState('')
  const closeRaceForm = () => setShowRaceForm(false)
  const displayRaceForm = () => setShowRaceForm(true)

  useEffect(() => {
    async function loadData () {
      setLoading(true)
      if (apiToken !== '') {
        try {
          const eventModel = new EventModel(apiToken)
          const classModel = new ClassModel(apiToken)
          const permissions = new Permissions()
          setAllowAddRaces(permissions.check(apiToken, 'post', 'races'))
          await eventModel.get(id)
          if (eventModel.success) {
            setEvent(eventModel.responseData)
            await classModel.get()
            if (classModel.success) {
              setClasses(classModel.responseData)
            } else {
              window.alert(classModel.message)
            }
          } else {
            setEvent()
          }
        } finally {
          setLoading(false)
        }
      }
    }  
    loadData()
  }, [id, apiToken, user.sub])

  if (apiToken === '') {
    if (!isAuthenticated) {
      loginWithRedirect()
    } else {
      getApiToken()
    }
  }

  async function getApiToken() {
    let token = await getAccessTokenSilently({ audience: process.env.REACT_APP_AUTH0_AUDIENCE })
    setApiToken(token)   
  }

  function addRacers(class_id) {
    function addTableRow(car, index){
      return (
        <tr key={index+'-racersRow'}>
          <td>{car.user.firstName+' '+car.user.lastName}</td>
          <td>{car.manufacturer}</td>
          <td>{car.model}</td>
          <td>{car.color}</td>
          <td>{car.transponder}</td>
        </tr>
      )
    }  
    return (event.cars.map((car, index) => ( 
      car.class_id===class_id && addTableRow(car, index) 
    ))) 
  }

  function classesWithEntries(classes) {
    let arr = []
    if (classes && event){
      for (var car of event.cars) {
        for (var cls of classes) {
          if (car.class_id === cls._id) {
            if (arr.indexOf(cls) === -1) {
              arr.push(cls)
            }
          }
        }
      }
    }
    return arr
  }

  function addRace(classId) {
    setClassId(classId)
    displayRaceForm()
  }

  function saveRace(){
    //todo, post race to DB
    //raceModel.post(data)
  }

  function onFirstChange(e) {
    setFirstCarId(e.target.childNodes[e.target.selectedIndex].getAttribute('id'))
  }

  function onSecondChange(e) {
    setSecondCarId(e.target.childNodes[e.target.selectedIndex].getAttribute('id'))
  }

  function onThirdChange(e) {
    setThirdCarId(e.target.childNodes[e.target.selectedIndex].getAttribute('id'))
  }

  function shouldAdd(cars, position){
    let count = 0
    for (var car of cars) {
      if (car.class_id === classId) {
        count = count + 1
      } 
    }
    return position <= count
  }

  function raceForm() {
    const checkClass = (car) => {
      if (car.class_id === classId) { 
        return <option id={car._id} key={car._id} >{car.user.firstName+' '+car.user.lastName} </option>    
      } else {
        return
      }
    }
    function racers(onValueChange) { 
      return (
        <select onChange={(e) => onValueChange(e)} id={classId} style={{width: '250px', height: '30px'}} > 
          <option value="">--Select racer--</option>
          {event.cars.map((car) => checkClass(car))}
        </select>  
      )
    }
    return (  
      <Modal show={showRaceForm} onHide={closeRaceForm} >
        <Modal.Header closeButton>
          <Modal.Title>Add Race</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ display: 'grid', fontFamily: "monospace"} } >
          <label style={{ margin: '3px' }} >
            Race Name: &nbsp; 
            <input style={{width: '250px'}} value={raceName} onChange={(e) => setRaceName(e.target.value)} type="text" />
          </label> 
          <label style={{ margin: '3px' }} >
            1st: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            {event && event.cars.length !== 0 && racers((e) => onFirstChange(e))}  
          </label>
          {shouldAdd(event.cars, 2) &&
            <label style={{ margin: '3px' }} >
              2nd: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              {event && event.cars.length !== 0 && racers((e) => onSecondChange(e))}  
            </label> 
          }
          {shouldAdd(event.cars, 3) &&
            <label style={{ margin: '3px' }} >
              3rd: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              {event && event.cars.length !== 0 && racers((e) => onThirdChange(e))}  
            </label> 
          }
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={closeRaceForm}>Close</Button>
          <Button variant="outline-primary" onClick={saveRace}>Save </Button>
        </Modal.Footer>
      </Modal>   
    )
  }

  function showRoster() {
    const filteredClasses = classesWithEntries(classes)
    return (
      filteredClasses.map((carClass, index) => (
          <div key={index+'-div'}>
            <h4 style={{marginRight: '12px', float: 'left'}} key={index+'-headerLabel'}>{carClass.name}</h4> 
            <Table striped bordered hover size="sm" key={index+'-table'}>
              <thead key={index+'-tableHead'}>
                <tr key={index+'-tableHeadRow'}>
                  <th>Name</th>
                  <th>Mfr.</th>
                  <th>Model</th>
                  <th>Colour</th>
                  <th>Tpdr.</th>
                </tr>
              </thead>
              <tbody>
                {addRacers(carClass._id, index)}
              </tbody>
            </Table>
            <div style={{display: 'flex', flexFlow: 'wrap'}}>
              <h4 style={{float: 'left'}}>Races</h4>
              {event.cars.length &&
                allowAddRaces && <PlusButton id={carClass._id} handleClick={() => addRace(carClass._id)} />
              }
            </div>
          </div>
        )
      )
    )
  }

  if (loading) {
    return ( <Loading /> )
  } else if (event) {
    return (
      <>
        <Header props={{header: `${event.name}`, subHeader: dayjs(event.date).format('DD/MM/YYYY')}} /> 
        <div style={{position: 'relative', width: 'auto', height: 'auto', maxWidth: '900px'}}>
          <h2>Roster</h2> 
          {showRoster()}  
          {raceForm()}
        </div>
      </>
    )
  } else {
    return (<h2>Not found</h2>)
  }
}

export default withAuthenticationRequired(EventDetail, { onRedirecting: () => (<Loading />) });