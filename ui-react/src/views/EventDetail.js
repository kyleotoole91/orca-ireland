import { React, useState, useEffect } from 'react'
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react"
import Loading from '../components/Loading'
import { EventModel } from '../models/EventModel'
import { ClassModel } from '../models/ClassModel'
import { useParams } from 'react-router-dom'
import Table  from 'react-bootstrap/Table'

function EventDetail() {
  let { id } = useParams()

  const { user, isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0()
  const [apiToken, setApiToken] = useState('')
  const [event, setEvent] = useState()
  const [classes, setClasses] = useState()
  const [loading, setLoading] = useState()

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
                  <th>manufacturer</th>
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

  useEffect(() => {
    async function loadData () {
      setLoading(true)
      if (apiToken !== '') {
        try {
          const eventModel = new EventModel(apiToken)
          const classModel = new ClassModel(apiToken)
          await eventModel.get(id)
          if (eventModel.success) {
            console.log(eventModel.responseData)
            setEvent(eventModel.responseData)
            await classModel.get()
            if (classModel.success) {
              setClasses(classModel.responseData)
            } else {
              window.alert(classModel.message)
            }
          } else {
            setEvent({})
            window.alert(eventModel.message)
          }
        } finally {
          setLoading(false)
        }
      }
    }  
    loadData()
  }, [id, apiToken, user.sub])

  if (!event || loading) {
    return ( <Loading /> )
  } else {
    return (
      <div>
        <h2>Roster</h2> 
        {showRoster()}  
      </div>
    )
  }
};

export default withAuthenticationRequired(EventDetail, { onRedirecting: () => (<Loading />) });