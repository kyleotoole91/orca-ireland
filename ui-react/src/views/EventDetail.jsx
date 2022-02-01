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
import { TrashCan } from '../components/TrashCan'

const raceModel = new RaceModel() 
const max_per_race = 10

function EventDetail() {
  let { id } = useParams()
  const { user, isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0()
  const [apiToken, setApiToken] = useState('')
  const [event, setEvent] = useState()
  const [refresh, setRefresh] = useState()
  const [classes, setClasses] = useState()
  const [loading, setLoading] = useState()
  const [allowAddRaces, setAllowAddRaces] = useState(false)
  const [allowDelRaces, setAllowDelRaces] = useState(false)
  const [showRaceForm, setShowRaceForm] = useState(false)
  const [raceName, setRaceName] = useState('')
  const [classId, setClassId] = useState('')
  const closeRaceForm = () => setShowRaceForm(false)
  const displayRaceForm = () => setShowRaceForm(true)
  const [resultsMap, setResultsMap] = useState(new Map())

  useEffect(() => {
    async function loadData () {
      setLoading(true)
      if (apiToken !== '') {
        try {
          const eventModel = new EventModel(apiToken)
          const classModel = new ClassModel(apiToken)
          const permissions = new Permissions()
          setAllowAddRaces(permissions.check(apiToken, 'post', 'races'))
          setAllowDelRaces(permissions.check(apiToken, 'delete', 'races'))
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
  }, [id, apiToken, user.sub, refresh])

  if (apiToken === '') {
    if (!isAuthenticated) {
      loginWithRedirect()
    } else {
      getApiToken()
    }
  } else {
    raceModel.setApiToken(apiToken)
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
    if (classes && event) {
      for (var car of event.cars) {
        for (var cls of classes) {
          if (car.class_id === cls._id && arr.indexOf(cls) === -1)
            arr.push(cls)
        }
      }
    }
    return arr
  }

  function addRace(classId) {
    resultsMap.clear()
    setClassId(classId)
    displayRaceForm()
  }

  async function postRace() {  
    const date = event.date
    const event_id = event._id
    const class_id = classId 
    const name = raceName
    const class_name = getClassName(class_id)
    const results = [...resultsMap.values()]
    const race = {event_id, class_id, class_name, date, name, results} 
    await raceModel.post(race)
    if (raceModel.success) {
      setRefresh(!refresh)
      setShowRaceForm(false)
    } else {
      window.alert(raceModel.message) 
    }
  }

  async function deleteRace(raceId) {
    if (window.confirm('Are you sure you want to delete this race?')) {
      await raceModel.delete(raceId)
      if (raceModel.success) {
        setRefresh(!refresh)
        setShowRaceForm(false)
      } else {
        window.alert(raceModel.message) 
      }
    }
  }

  function onRaceInputChange(e) {
    const position = parseInt(e.target.id)
    const name = e.target.value
    const car_id = e.target.childNodes[e.target.selectedIndex].getAttribute('id')
    resultsMap.set(position, { position, name, car_id } )
    setResultsMap(resultsMap)
  }

  function shouldAdd(cars, position){
    let count = 0
    for (var car of cars) {
      if (car.class_id === classId) {
        ++count
      } 
    }
    return position <= count
  }

  function raceForm() {
    function racers(pos, onValueChange) { 
      return (
        <select onChange={(e) => onValueChange(e)} key={pos} id={pos} style={{width: '250px', height: '30px'}} > 
          <option value="">--Select racer--</option>
          {event.cars.map((car) => {
            if (car.class_id === classId) { 
              return <option key={car._id} id={car._id} value={car.user.firstName+' '+car.user.lastName} >{car.user.firstName+' '+car.user.lastName} </option>    
            } else {
              return <></>
            }
          })}
        </select>  
      )
    }
    function intToPositionText(int) {
      let positions = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th']
      if (int >= 0 && int <= positions.length) {
        return positions[int-1]
      }
      return ''
    }
    function getNbsp(pos) {
      if (pos >= 10) return ( <> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </> )
      return ( <> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </> )
    }
    function addInput(pos) { 
      return <label key={'label-'+pos} style={{ margin: '3px' }} >
              {intToPositionText(pos)+':'} {getNbsp(pos)}
              {racers(pos, (e) => onRaceInputChange(e))}  
             </label>
    }
    function addInputs(){
      if (event && event.cars.length !== 0) {
        var inputs = []
        for (let i=1; i<=max_per_race; i++) {
          if (shouldAdd(event.cars, i)) {
            inputs.push(addInput(i))
          } else {
            break
          }
        }
        return inputs
      }
    }
    
    return (  
      <Modal show={showRaceForm} onHide={closeRaceForm} >
        <Modal.Header closeButton>
          <Modal.Title>Add Race ({getClassName(classId)})</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ display: 'grid', fontFamily: "monospace"} } >
          <label style={{ margin: '3px' }} >
            Race Name: &nbsp; 
            <input style={{width: '250px'}} value={raceName} onChange={(e) => setRaceName(e.target.value)} type="text" />
          </label> 
          {addInputs()}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={closeRaceForm}>Close</Button>
          <Button variant="outline-primary" onClick={postRace}>Save </Button>
        </Modal.Footer>
      </Modal>   
    )
  }

  function addRaces(classId) {
    function addRows(results) {
      return (
        results.map((item, index) => (
          <tr key={item.car_id+'-race-result-row'}>
            <td>{item.position}</td>
            <td>{item.name}</td>
          </tr>
        ))
      )
    }
    function addRaceResults(race, index) {
      return (
        <div key={race._id+'-div'}>
          <h5 key={race._id+'-race-name'} style={{float: 'left', marginRight: '6px'}}>{race.name}</h5> 
          {allowDelRaces && <TrashCan key={race._id+'-del-race'} id={race._id} handleClick={() => deleteRace(race._id)} /> }
          <Table key={race._id+'-race-table'} striped bordered hover size="sm">
            <thead key={race._id+'-race-head'}>
              <tr key={race._id+'-race-head-row'}> 
                <th style={{width: '35px'}}>Pos</th>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {addRows(race.results)}
            </tbody>
          </Table>
        </div>
      )
    } 
    function raceDeleted(race){
      if (race.hasOwnProperty('deleted')) { return race.deleted } else { return false }
    }

    if (event && event.hasOwnProperty('races')) {
      event.races.sort((a, b) => parseFloat(a.position) - parseFloat(b.position)) //sort asc by position
      return (event.races.map((race, index) => ( 
        !raceDeleted(race) && race.class_id===classId && addRaceResults(race, index) 
      ))) 
    } else { return }
  }

  function showRoster() {
    const filteredClasses = classesWithEntries(classes)
    return (
      filteredClasses.map((carClass, index) => (
          <div key={index+'-div'}>
            <h3 style={{fontWeight: 'bold',  marginRight: '12px', float: 'left'}} key={index+'-header-label'}>{carClass.name}</h3> 
            <Table striped bordered hover size="sm" key={index+'-roster'}>
              <thead key={index+'-roster-head'}>
                <tr key={index+'-roster-row'}>
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
              <h4 style={{float: 'left'}}>Race Results</h4>
              {event.cars.length && allowAddRaces && <PlusButton id={carClass._id} handleClick={() => addRace(carClass._id)} /> }
            </div>
            {addRaces(carClass._id)}
            <div style={{height: '25px'}}></div>
          </div>
        )
      )
    )
  }

  if (loading) {
    return <Loading /> 
  } else if (event) {
    return <>
            <Header props={{header: `${event.name}`, subHeader: dayjs(event.date).format('DD/MM/YYYY')}} /> 
            <div style={{position: 'relative', width: 'auto', height: 'auto', maxWidth: '900px'}}>
              {showRoster()}  
              {raceForm()}
            </div>
          </>
  } else return <h2>Not found</h2>
}

export default withAuthenticationRequired(EventDetail, { onRedirecting: () => (<Loading />) })