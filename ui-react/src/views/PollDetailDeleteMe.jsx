import { React, useState, useEffect } from 'react'
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react"
import Loading from '../components/Loading'
import Header from '../components/Header'
import { PollModel } from '../models/PollModel'
import { useHistory } from 'react-router-dom'

const pollModel = new PollModel() 

function EventDetail() {
  let { id } = useParams()
  const history = useHistory()
  const { user, isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0()
  const [apiToken, setApiToken] = useState('')
  const [poll, setPoll] = useState()

  useEffect(() => {
    async function loadData () {
      setLoading(true)
      if (apiToken !== '') {
        try {
          const pollModel = new EventModel(apiToken)
          await poll.get(id)
          if (pollModel.success) {
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
  }, [id, apiToken, user.sub, history])

  if (apiToken === '') {
    if (!isAuthenticated) {
      loginWithRedirect()
    } else {
      getApiToken()
    }
  } else {
    raceModel.setApiToken(apiToken)
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
          <div key={index+'-div'}>
            <h2 style={{fontWeight: 'bold',  marginRight: '12px', float: 'left'}} key={index+'-header-label'}>{carClass.name}</h2> 
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