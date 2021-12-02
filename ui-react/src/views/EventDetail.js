import { React, useState, useEffect } from 'react'
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react"
import Loading from '../components/Loading'
import { EventModel } from '../models/EventModel'
import { ClassModel } from '../models/ClassModel'
import { useParams } from 'react-router-dom'
import Table  from 'react-bootstrap/Table'
import dayjs from 'dayjs'

function EventDetail() {
  let { id } = useParams()
  const { user, isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0()
  const [apiToken, setApiToken] = useState('')
  const [event, setEvent] = useState()
  const [classes, setClasses] = useState()
  const [loading, setLoading] = useState()

  useEffect(() => {
    async function loadData () {
      setLoading(true)
      if (apiToken !== '') {
        try {
          const eventModel = new EventModel(apiToken)
          const classModel = new ClassModel(apiToken)
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

  function addRacers(class_id){
    function addTableRow(car, index){
      return (
        <tr key={index+'-racersRow'}>
          <td>{car.user.firstName+' '+car.user.lastName}</td>
          <td>{car.manufacturer}</td>
          <td>{car.hasOwnProperty('color') && car.color}</td>
          <td>{car.model}</td>
          <td>{car.transponder}</td>
        </tr>
      )
    }  
    return (event.cars.map((car, index) => ( car.class_id===class_id && addTableRow(car, index) ))) 
  }

  function showRoster() {
    return (
      classes.map((carClass, index) => (
          <div key={index+'-div'}>
            <h4 key={index+'-headerLabel'}>{carClass.name}</h4>
            <Table striped bordered hover size="sm" key={index+'-table'}>
              <thead key={index+'-tableHead'}>
                <tr key={index+'-tableHeadRow'}>
                  <th>Name</th>
                  <th>Manufacturer</th>
                  <th>Colour</th>
                  <th>Model</th>
                  <th>Transponder</th>
                </tr>
              </thead>
              <tbody>
                {addRacers(carClass._id, index)}
              </tbody>
            </Table>
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
        <div style={{ alignSelf: 'center', textAlign: 'center', display: 'grid',  justifyContent:'center', alignItems:'center', height: 'auto'}}>
          <h4>Event</h4>
          <h4>{dayjs(event.date).format('DD/MM/YYYY')}</h4>
        </div>
        <div style={{ maxWidth: '50%', height: 'auto'}}>
          <h2>Roster</h2> 
          {showRoster()}  
        </div>
      </>
    )
  } else {
    return (<h2>Not found</h2>)
  }
};

export default withAuthenticationRequired(EventDetail, { onRedirecting: () => (<Loading />) });