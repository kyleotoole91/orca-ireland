import { React, useState, useEffect } from 'react'
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react"
import Loading from '../components/Loading'
import Header from '../components/Header'
import { EventModel } from '../models/EventModel'
import { ClassModel } from '../models/ClassModel'
import { useParams } from 'react-router-dom'
import Table  from 'react-bootstrap/Table'
import dayjs from 'dayjs'
import { Permissions } from '../utils/permissions'
import { PlusButton } from '../components/PlusButton'

function EventDetail() {
  let { id } = useParams()
  const { user, isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0()
  const [apiToken, setApiToken] = useState('')
  const [event, setEvent] = useState()
  const [classes, setClasses] = useState()
  const [loading, setLoading] = useState()
  const [allowAddRaces, setAllowAddRaces] = useState(false)

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
    return (event.cars.map((car, index) => ( car.class_id===class_id && addTableRow(car, index) ))) 
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
              {allowAddRaces && <PlusButton />}
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
        <Header props={{header:'Event', subHeader: dayjs(event.date).format('DD/MM/YYYY')}} /> 
        <div style={{position: 'relative', width: 'auto', height: 'auto', maxWidth: '900px'}}>
          <h2>Roster</h2> 
          {showRoster()}  
        </div>
      </>
    )
  } else {
    return (<h2>Not found</h2>)
  }
}

export default withAuthenticationRequired(EventDetail, { onRedirecting: () => (<Loading />) });