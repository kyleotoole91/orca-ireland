import { React, useState, useEffect } from 'react'
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react"
import Loading from '../components/Loading'
import Header from '../components/Header'
import { EventModel } from '../models/EventModel'
import { CarModel } from '../models/CarModel'
import { ClassModel } from '../models/ClassModel'
import { RaceModel } from '../models/RaceModel'
import { useParams } from 'react-router-dom'
//import Form from 'react-bootstrap/Form'
import Table  from 'react-bootstrap/Table'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import dayjs from 'dayjs'
import { Permissions } from '../utils/permissions'
import { PlusButton } from '../components/PlusButton'
import { TrashCan } from '../components/TrashCan'
import { PencilSquare } from '../components/PencilSquare'
import { useHistory } from 'react-router-dom'

const raceModel = new RaceModel() 
const carModel = new CarModel()
const eventModel = new EventModel()
carModel.useExtId = false
const max_per_race = 50
let currentCar = {}

function EventDetail() {
  let { id } = useParams()
  const history = useHistory()
  const { user, isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0()
  const [apiToken, setApiToken] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [event, setEvent] = useState()
  const [refresh, setRefresh] = useState()
  const [classes, setClasses] = useState()
  const [loading, setLoading] = useState()
  const [userCars, setUserCars] = useState()
  const [allowAddRaces, setAllowAddRaces] = useState(false)
  const [allowDelRaces, setAllowDelRaces] = useState(false)
  const [raceName, setRaceName] = useState('Final')
  const [classId, setClassId] = useState('')
  const [carId, setCarId] = useState('')
  const [oldCarId, setOldCarId] = useState('')
  const [resultsMap, setResultsMap] = useState(new Map())
  const [showRaceForm, setShowRaceForm] = useState(false)
  const closeRaceForm = () => setShowRaceForm(false)
  const displayRaceForm = () => setShowRaceForm(true)
  const [showChangeCarForm, setShowChangeCarForm] = useState(false) 
  const hideUserCarModal = () => setShowChangeCarForm(false)
  const [carsAwaitingPayment, setCarsAwaitingPayment] = useState([])
  const [allCars, setAllCars] = useState([])
  const [entryPaid, setEntryPaid] = useState(false)
  const [allowEditEvents, setAllowEditEvents] = useState(false)
  const [allowEditPaidUsers, setAllowEditPaidUsers] = useState(false)
  const [allowViewUnPaidUsers, setAllowViewUnPaidUsers] = useState(false)
  const [allowViewPayments, setAllowViewPayments] = useState(false)

  useEffect(() => {
    async function loadData () {
      setLoading(true)
      if (apiToken !== '') {
        try {
          const eventModel = new EventModel(apiToken)
          eventModel.urlParams = '?detail=1'
          const classModel = new ClassModel(apiToken)
          const permissions = new Permissions()
          setAllowEditEvents(permissions.check(apiToken, 'put', 'events'))
          setAllowEditPaidUsers(permissions.check(apiToken, 'put', 'paid_users'))
          setAllowViewUnPaidUsers(permissions.check(apiToken, 'view', 'unpaid_users'))
          setAllowAddRaces(permissions.check(apiToken, 'post', 'races'))
          setAllowDelRaces(permissions.check(apiToken, 'delete', 'races'))
          setAllowViewPayments(permissions.check(apiToken, 'get', 'payments'))
         
          await eventModel.get(id)
          if (eventModel.success) {
            if (permissions.check(apiToken, 'get', 'payments')) {
              const paymentsModel = new EventModel(apiToken)
              await paymentsModel.getEventPayments(id)
              if (paymentsModel.success) {
                eventModel.responseData.payments = paymentsModel.responseData
              } else {
                window.alert(paymentsModel.message)
              }
            }
            const paidEvent = !!eventModel.responseData.fee;
            const hasPaidUserIds = !!eventModel.responseData.paid_user_ids;
            setAllCars(eventModel.responseData.cars)
            const carsAwaitingPayment = eventModel.responseData.cars
              .filter(car => paidEvent && !car.user.paymentExempt && !(hasPaidUserIds && eventModel.responseData.paid_user_ids.includes(car.user._id)))
            const carsPaid = eventModel.responseData.cars
              .filter(car => (!paidEvent || !!car.user.paymentExempt) || (hasPaidUserIds && eventModel.responseData.paid_user_ids.includes(car.user._id)));
            eventModel.responseData.cars = carsPaid
            setCarsAwaitingPayment(carsAwaitingPayment || [])
            setEvent(eventModel.responseData)
            await classModel.get()
            if (classModel.success) {
              setClasses(classModel.responseData)
            } else {
              window.alert(classModel.message)
            }
          } else {
            setEvent()
            window.alert(eventModel.message)
            history.push('/events')
          }
        } finally {
          setLoading(false)
        }
      }
    }  
    loadData()
  }, [id, apiToken, user.sub, refresh, history])

  if (apiToken === '') {
    if (!isAuthenticated) {
      loginWithRedirect()
    } else {
      getApiToken()
    }
  } else {
    raceModel.setApiToken(apiToken)
    carModel.setApiToken(apiToken)
    eventModel.setApiToken(apiToken)
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
    try { 
      const token = await getAccessTokenSilently({ audience: process.env.REACT_APP_AUTH0_AUDIENCE })
      setApiToken(token)   
    } catch(e) {
      console.log(e)
      loginWithRedirect()
    }
  }

  async function changeCar(carId) {
    setCarId(carId)
    setOldCarId(carId)
    setOwnerName(carIdToUserName(carId))
    let success = false
    success = await carModel.get(carId)
    if (success) {
      carModel.urlParams = '?user_id='+carModel.responseData.user_id
      success = await carModel.get()
    }
    if (success) {
      setUserCars(carModel.responseData)
      const item = carModel.responseData[0]
      setEntryPaid(event.paid_user_ids && event.paid_user_ids.includes(item.user_id))
      setShowChangeCarForm(true)
    } else {
      window.alert(carModel.message)
    }
  }

  function addRacers(cars, class_id, dontCheckClass) {
    function addTableRow(car, index){
      return (
        <tr key={index+'-racersRow'}>
          <td>{car.user.firstName+' '+car.user.lastName}</td>
          <td>{car.manufacturer}</td>
          <td>{car.model}</td>
          <td>{car.color}</td>
          <td>{car.transponder}</td>
          {allowAddRaces && 
            <td>
              <PencilSquare key={car._id+'-change-car'} id={car._id} handleClick={() => changeCar(car._id)} />
            </td>}
        </tr>
      )
    }  
    
    return cars.map((car, index) => 
      dontCheckClass || car.class_id === class_id 
        ? addTableRow(car, index) 
        : <></>
    );
  }

  function carIdToUserName(carId) {
    for (let car of event.cars) {
      if (car._id === carId) {
        return car.user.firstName  
      } 
    }
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
    const name = e.target.value
    const position = parseInt(e.target.id)
    if (name !== '') {
      const car_id = e.target.childNodes[e.target.selectedIndex].getAttribute('id')
      resultsMap.set(position, { position, name, car_id } )
    } else {
      resultsMap.delete(position)  
    }
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
      let position = ''
      switch(int) {
        case 1:
          position = int+'st'
          break;
        case 2:
          position = int+'nd'
          break;
        case 3:
          position = int+'rd'
          break;
        default:
          position = int+'th'
          break;
      }
      return position
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

  function getUserCarName(carId) {
    if (userCars) {
      for (var car of userCars) {
        if (car._id === carId) {
          return car.manufacturer.trim() +' - '+ car.model.trim() +' - '+ getClassName(car.class_id).trim()
        }
      }
    }
  }

  function getUserIdByCarId(carId) {
    for (var car of allCars) {
      if (car._id === carId) {
        return car.user._id
      }
    }
    return ''
  }

  function getUserByCarId(carId) {
    for (var car of allCars) {
      if (car._id === carId) {
        return car.user
      }
    }
    return
  }

  function handleCarChange(e) {
    const option = e.target.childNodes[e.target.selectedIndex]
    const id = option.getAttribute('id')
    setCarId(id)
  }

  async function putUserCarChange() {
    const eventRec = await eventModel.get(event._id) 
    if (!eventModel.success) {
      return
    }
    const wasPaid = eventRec.paid_user_ids && event.paid_user_ids.includes(getUserIdByCarId(oldCarId));
    const entryPaidChanged = wasPaid !== entryPaid;
    const userId = getUserIdByCarId(oldCarId);

    if (entryPaidChanged && userId) {
      if (!wasPaid) {
        if (!eventRec.paid_user_ids) {
          eventRec.paid_user_ids = []
        }
        eventRec.paid_user_ids.push(userId)
      } else if (eventRec.paid_user_ids && eventRec.paid_user_ids.includes(userId)) {
        eventRec.paid_user_ids.splice(eventRec.paid_user_ids.indexOf(userId), 1)
      }
    }

    const carChanged = carId !== oldCarId

    if (carChanged) {
      for (let i = 0; i < eventRec.car_ids.length; i++) {
        if (!eventRec.car_ids.includes(carId) && eventRec.car_ids[i] === oldCarId) {
          eventRec.car_ids[i] = carId
          break;
        }
      }
    }

    if (entryPaidChanged || carChanged) {
      const res = await eventModel.put(event._id, eventRec)
      if (res && res.errorMesage) {
        window.alert(res.errorMesage)
      }
    }

    hideUserCarModal()
    setRefresh(!refresh)
  }

  async function deleteUserCar() {
    if (window.confirm(`Are you sure you want to remove this car? \n ${getUserCarName(oldCarId)}`)) {
      await eventModel.get(event._id) 
      let tmpEvent = eventModel.responseData
      if (eventModel.success) {
        tmpEvent.car_ids.splice(tmpEvent.car_ids.indexOf(oldCarId), 1)
        eventModel.put(event._id, tmpEvent)
        hideUserCarModal()
        setRefresh(!refresh)
        return
      }
    }
  }

  function editEntryModal() {
    const user = getUserByCarId(carId);
    const paymentExempt = user && !!user.paymentExempt;

    return (
      <Modal show={showChangeCarForm} onHide={hideUserCarModal} >
        <Modal.Header closeButton>
          <Modal.Title>Edit Entry {ownerName}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ display: 'grid'} } >
        { allowEditPaidUsers &&
          <Form.Check
            type={'checkbox'}
            label={paymentExempt ? `Payment Exempt` : `Payment Confirmed`}
            id={`cb-mark-as-paid`}
            checked={entryPaid}
            disabled={paymentExempt}
            onChange={(e) => setEntryPaid(e.target.checked)}
          />
        }
        <select value={getUserCarName(carId)} id='cb-user-car' onChange={(e) => handleCarChange(e)} style={{width: '100%', height: '30px'}} > 
          {userCars && userCars.map((car, index) => 
            <option id={car._id} key={index} >{getUserCarName(car._id)}</option> ) }
        </select>    
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={deleteUserCar} variant="outline-danger">Delete</Button>
          <Button variant="outline-secondary" onClick={hideUserCarModal}>Close</Button>
          <Button variant="outline-primary" onClick={putUserCarChange}>Save </Button>
        </Modal.Footer>
      </Modal>   
    )
  }

  function getCar(id) {
    if (currentCar.hasOwnProperty('_id') && currentCar._id === id){
      return currentCar
    } else {
      for (let i=0; i<event.cars.length; i++) {
        if (event.cars[i]._id === id) {
          currentCar = event.cars[i]
          return event.cars[i]
        }  
      }
    }
  }

  function addRaces(classId) {
    function addRows(results) {
      return (
        results.map((item) => (
          <tr key={item.car_id+'-race-result-row'}>
            <td>{item.position}</td>
            <td>{item.name}</td>
            <td>{getCar(item.car_id).manufacturer}</td>
            <td>{getCar(item.car_id).model}</td>
          </tr>
        ))
      )
    }

    function addRaceResults(race) {
      return (
        <div key={race._id+'-div'}>
          <h5 key={race._id+'-race-name'} style={{float: 'left', marginRight: '6px'}}>{race.name}</h5> 
          {allowDelRaces && <TrashCan key={race._id+'-del-race'} id={race._id} handleClick={() => deleteRace(race._id)} /> }
          <Table key={race._id+'-race-table'} striped bordered hover size="sm">
            <thead key={race._id+'-race-head'}>
              <tr key={race._id+'-race-head-row'}> 
                <th style={{width: '35px'}}>Pos</th>
                <th>Name</th>
                <th>Manufacturer</th>
                <th>Model</th>
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
          <div style={{overflow: 'auto'}} key={index+'-div'}>
            <h4 style={{fontWeight: 'bold',  marginRight: '12px', float: 'left'}} key={index+'-header-label'}>{carClass.name}</h4> 
            <Table striped bordered hover size="sm" key={index+'-roster'}>
              <thead key={index+'-roster-head'}>
                <tr key={index+'-roster-row'}>
                  <th>Name</th>
                  <th>Mfr.</th>
                  <th>Model</th>
                  <th>Colour</th>
                  <th>Tpdr.</th>
                  {allowAddRaces && <th style={{width: '18px'}}></th>}
                </tr>
              </thead>
              <tbody>
                {addRacers(event.cars, carClass._id)}
              </tbody>
            </Table>
            <div style={{display: 'flex', flexFlow: 'wrap'}}>
              <h5 style={{float: 'left'}}>Race Results</h5>
              {event.cars.length && allowAddRaces && <PlusButton id={carClass._id} handleClick={() => addRace(carClass._id)} /> }
            </div>
            {addRaces(carClass._id)}
            <div style={{height: '25px'}}></div>
          </div>
        )
      )
    )
  }
  
  const showCarsAwaitingPayment = () => {
    const visibleUnpaidCars = carsAwaitingPayment.filter(car => 
      allowViewUnPaidUsers || car.user.extId === user.sub
    );
    const hasVisibleUnpaidCars = visibleUnpaidCars && visibleUnpaidCars.length > 0;

    const addTableRow = (car, index) => (
      <tr style={{color: 'red'}} key={index+'-pending-row'}>
        <td>{car.user.firstName+' '+car.user.lastName}</td>
        <td>{getClassName(car.class_id)}</td>
        <td>{car.manufacturer}</td>
        <td>{car.model}</td>
        <td>{car.color}</td>
        {allowAddRaces && <td><PencilSquare key={car._id+'-change-car'} id={car._id} handleClick={() => changeCar(car._id)} /></td>}
      </tr>
    )

    return ( hasVisibleUnpaidCars &&
      <>
        <div style={{overflow: 'auto'}} key={'pending-div'}>
        <h4 style={{color: 'red', fontWeight: 'bold',  marginRight: '12px', float: 'left'}} key={'pending-header-label'}>Pending Payment</h4> 
        <Table striped bordered hover size="sm" key={'pending-roster'}>
          <thead key={'pending-roster-head'}>
            <tr key={'pending-roster-row'}>
              <th>Name</th>
              <th>Class</th>
              <th>Mfr.</th>
              <th>Model</th>
              <th>Colour</th>
              {allowAddRaces && <th style={{width: '18px'}}></th>}
            </tr>
          </thead>
          <tbody>
          { visibleUnpaidCars.map((car, index) => addTableRow(car, index)) }
          </tbody>
        </Table>
        <div style={{height: '25px'}}></div>
      </div>
    </>
  )}

  const showEventPayments = () => {
    const hasPayments = event.payments && event.payments.length > 0

    const addTableRow = (payment, index) => (
      <tr key={index+'-payment-row'}>
        <td>{payment.name}</td>
        <td>{dayjs(payment.date).format('DD/MM/YYYY')}</td>
        <td>{payment.amount} {payment.currency}</td>
        <td>{payment.transaction_id}</td>
      </tr>
    )

    return ( allowViewPayments && hasPayments &&
      <>
        <div style={{overflow: 'auto'}} key={'payments-div'}>
        <h4 style={{fontWeight: 'bold',  marginRight: '12px', float: 'left'}} key={'payments-header-label'}>Payments</h4> 
        <Table striped bordered hover size="sm" key={'payments-roster'}>
          <thead key={'payments-roster-head'}>
            <tr key={'payments-roster-row'}>
              <th>Name</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Transaction ID</th>
            </tr>
          </thead>
          <tbody>
          { event.payments.map((payment, index) => addTableRow(payment, index)) }
          </tbody>
        </Table>
        <div style={{height: '25px'}}></div>
      </div>
    </>
  )}

  if (loading) {
    return <Loading /> 
  } else if (event) {
    return <>
      <Header props={{header: `${event.name}`, subHeader: dayjs(event.date).format('DD/MM/YYYY')}} /> 
      <div style={{display: 'grid', justifyContent: 'center'}}>
        { carsAwaitingPayment.length > 0 && showCarsAwaitingPayment()}
        { event && event.payments && event.payments.length > 0 && showEventPayments()}
        { showRoster() }  
        { allowAddRaces && raceForm() }
        { allowEditEvents && editEntryModal() }
      </div>
    </>
  } else return <h2>Not found</h2>
}

export default withAuthenticationRequired(EventDetail, { onRedirecting: () => (<Loading />) })