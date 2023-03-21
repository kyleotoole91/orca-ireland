import { React, useState, useEffect } from 'react'
import { useAuth0 } from "@auth0/auth0-react"
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Loading from '../components/Loading'
import { PlusButton } from '../components/PlusButton'
import { GearButtonNoMrg } from '../components/GearButton'
import { SeasonModel } from '../models/SeasonModel'
import { EventTypeModel } from '../models/EventTypeModel'
import Header from '../components/Header'
import { DateUtils } from '../utils/DateUtils'
import { Permissions } from '../utils/permissions'
import { useHistory } from 'react-router-dom'

const seasonModel = new SeasonModel()
const dateUtils = new DateUtils()
const defaultDate = new Date()
defaultDate.setHours(23)
defaultDate.setMinutes(0)
const defaultDateCtrl = dateUtils.formatDate(defaultDate, 'yyyy-mm-dd')  
const defaultTime = defaultDate
defaultTime.setHours(23)
defaultTime.setMinutes(59)
defaultTime.setSeconds(59)

function Seasons() {
  const history = useHistory()
  const { user, isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0()
  const [apiToken, setApiToken] = useState('')
  const [Id, setId] = useState('')
  const [data, setData] = useState([])
  const [name, setName] = useState('')
  const [pointsOffset, setPointsOffset] = useState(1)
  const [bestOffset, setBestOffset] = useState(2)
  const [maxPoints, setMaxPoints] = useState(100)
  const [endDate, setEndDate] = useState(defaultDate)
  const [startDate, setStartDate] = useState(new Date())
  const [startDateCtrl, setStartDateCtrl] = useState(defaultDateCtrl)
  const [endDateCtrl, setEndDateCtrl] = useState(defaultDateCtrl)
  const [allowAddSeasons, setAllowAddSeasons] = useState(false)
  const [loading, setLoading] = useState(true)
  const [show, setShow] = useState(false)
  const [editing, setEditing] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)
  const [eventTypes, setEventTypes] = useState([])
  const [eventTypeId, setEventTypeId] = useState('')
  const [bbkMtgStart, setBbkMtgStart] = useState(1)
  const [bbkMtgEnd, setBbkMtgEnd] = useState(6)
  const [bbkURL, setBbkUrl] = useState('/bbk/[season_folder]/index.htm')
  const [bbkSeasonDir, setBbkSeasonDir] = useState('')

  useEffect(() => {
    async function loadData () {
      setLoading(true)
      try {
        const seasonModel = new SeasonModel(apiToken)
        const eventTypeModel = new EventTypeModel(apiToken)
        await seasonModel.get()
        await eventTypeModel.get()
        if (seasonModel.success && eventTypeModel.success) {
          seasonModel.responseData.sort((a, b) => parseFloat(b.startDate) - parseFloat(a.startDate)) //sort desc by date
          setData(seasonModel.responseData)
          setEventTypes(eventTypeModel.responseData)
        } else {
          window.alert(seasonModel.message + eventTypeModel.message)
        }
        const permissions = new Permissions()
        setAllowAddSeasons(permissions.check(apiToken, 'post', 'seasons'))
      } finally {
        setLoading(false) 
      }  
    }  
    loadData()
  }, [refresh, user, apiToken])

  if (apiToken === '') {
    if (isAuthenticated) {
      getApiToken()  
    }
  } else { 
    seasonModel.setApiToken(apiToken)
  }

  async function getApiToken() {
    try { 
      const token = await getAccessTokenSilently({ audience: process.env.REACT_APP_AUTH0_AUDIENCE })
      seasonModel.setApiToken(token)
      setApiToken(token)   
    } catch(e) {
      console.log(e)
      loginWithRedirect()
    }
  }

  async function deleteDoc() {
    try {
      if (window.confirm('Are you sure you want to delete this Season?')) {
        await seasonModel.delete(Id)
        if (seasonModel.success){
          setRefresh(!refresh)
        } else {
          window.alert(seasonModel.message)
        }
      }
    } catch(e) {
      window.alert(e)
    } finally {
      handleClose()
    }
  }

  async function postDoc() {
    try {
      await seasonModel.post({name, startDate, endDate, maxPoints, pointsOffset, bestOffset,
        bbkMtgStart, bbkMtgEnd, bbkURL, bbkSeasonDir, 'eventType_id': eventTypeId})  
      if (seasonModel.success) {
        setRefresh(!refresh)
        handleClose()
      } else {
        window.alert(seasonModel.message)
      }
    } catch(e) {
      window.alert(e)
    } finally {
      setLoading(false)
    }  
  }

  async function putDoc(id) {
    try {
      await seasonModel.put(id.toString(), {name, startDate, endDate, maxPoints, pointsOffset, bestOffset, 
        bbkMtgStart, bbkMtgEnd, bbkURL, bbkSeasonDir, 'eventType_id': eventTypeId})  
      if (seasonModel.success) {
        setRefresh(!refresh)
        handleClose()
      } else {
        window.alert(seasonModel.message)
      }
    } catch(e) {
      window.alert(e)
    } finally {
      setLoading(false)
    }  
  }

  function findDoc(id) {
    if (data && data.length > 0){
      for (var Season of data) {
        if (Season._id === id) return Season
      }
    }
  }

  function editDoc(id) {
    let season = findDoc(id) 
    if (season) {
      setId(id)
      setName(season.name)
      setEventTypeId(season.eventType_id)
      setStartDate(new Date(season.startDate))
      setEndDate(new Date(season.endDate))
      setStartDateCtrl(dateUtils.formatDate(new Date(season.startDate), 'yyyy-mm-dd'))
      setEndDateCtrl(dateUtils.formatDate(new Date(season.endDate), 'yyyy-mm-dd'))
      setPointsOffset(season.pointsOffset)
      setBestOffset(season.bestOffset)
      setMaxPoints(season.maxPoints)
      setBbkMtgStart(season.bbkMtgStart)
      setBbkMtgEnd(season.bbkMtgEnd)
      setBbkUrl(season.bbkURL)
      setBbkSeasonDir(season.bbkSeasonDir)
      setEditing(true)
      handleShow()
    } else {
      window.alert('error finding Season')
    }
  } 

  function addDoc() {
    setId('')
    setName('')
    setStartDate(new Date())
    setEndDate(new Date())
    setPointsOffset(1)
    setBestOffset(1)
    setMaxPoints(100)
    setEditing(false)
    handleShow()
  } 

  function saveDoc() {
    if (editing) {
      putDoc(Id)
    } else {
      postDoc()
    }
  }

  function headerText() {
    if (editing) {
      return name
    } else {
      return 'New Season'
    }
  }

  function dateChange(stringDate) {
    let date = new Date(stringDate)
    date.setHours(23)
    date.setMinutes(59)
    date.setSeconds(59)
    setEndDate(date)
    setEndDateCtrl(stringDate)  
  }

  function startDateChange(stringDate) {
    let date = new Date(stringDate)
    date.setHours(0)
    setStartDate(date)
    setStartDateCtrl(stringDate)  
  }

  function getEventTypeName(id) {
    for (var eventType of eventTypes) {
      if (eventType._id === id) {
        return eventType.name
      }
    }
  }

  function handleEventTypeChange(e) {
    const option = e.target.childNodes[e.target.selectedIndex]
    const id = option.getAttribute('id')
    setEventTypeId(id)
  }

  function modalForm() {
    return (  
      <Modal show={show} onHide={handleClose} >
        <Modal.Header closeButton>
          <Modal.Title>{headerText()}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formEventType">
              <Form.Label>Event Type</Form.Label>
              <Form.Select id='cb-event-type' onChange={(e) => handleEventTypeChange(e)} value={getEventTypeName(eventTypeId)}>
                {eventTypes && eventTypes.map((eventType, index) => 
                  <option id={eventType._id} key={index} >{eventType.name}</option> )}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formTitle">
              <Form.Label>Name</Form.Label>
              <Form.Control value={name} type="text" name="name" onChange={(e) => setName(e.target.value)}/>
            </Form.Group> 
            <Form.Group className="mb-3" controlId="formEndDate">
              <Form.Label>Start Date</Form.Label>
              <Form.Control value={startDateCtrl} type="date" name="date" onChange={(e) => startDateChange(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formEndDate">
              <Form.Label>End Date</Form.Label>
              <Form.Control value={endDateCtrl} type="date" name="date" onChange={(e) => dateChange(e.target.value)} min={startDateCtrl} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formMaxPoints">
              <Form.Label>Max Points</Form.Label>
              <Form.Control value={maxPoints} type="number" name="maxPoints" onChange={(e) => setMaxPoints(e.target.value)} />
            </Form.Group> 
            <Form.Group className="mb-3" controlId="formPointsOffset">
              <Form.Label>Points Offset</Form.Label>
              <Form.Control value={pointsOffset} type="number" name="pointsOffset" onChange={(e) => setPointsOffset(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formPointsOffset">
              <Form.Label>Best Rounds Offset</Form.Label>
              <Form.Control value={bestOffset} type="number" name="pointsOffset" onChange={(e) => setBestOffset(e.target.value)} />
            </Form.Group> 
            <Form.Group className="mb-3" controlId="bbkMtgStart">
              <Form.Label>BBK Meeting Start</Form.Label>
              <Form.Control value={bbkMtgStart} type="number" name="pointsOffset" onChange={(e) => setBbkMtgStart(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="bbkMtgEnd">
              <Form.Label>BBK Meeting End</Form.Label>
              <Form.Control value={bbkMtgEnd} type="number" name="pointsOffset" onChange={(e) => setBbkMtgEnd(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBbkUrl">
              <Form.Label>BBK Url</Form.Label>
              <Form.Control value={bbkURL} type="text" name="name" onChange={(e) => setBbkUrl(e.target.value)}/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBbkUrl">
              <Form.Label>BBK Dir</Form.Label>
              <Form.Control value={bbkSeasonDir} type="text" name="name" onChange={(e) => setBbkSeasonDir(e.target.value)}/>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
            {editing && <Button onClick={deleteDoc} style={{marginLeft: "3px"}} variant="outline-danger">Delete</Button> }
            <Button variant="outline-secondary" onClick={handleClose}>Close</Button>
            <Button variant="outline-primary" onClick={saveDoc}>Save </Button>
        </Modal.Footer>
      </Modal>   
    )
  }
  
  function showSeasonDetails(id) {
    history.push('/seasons/'+id)
  }

  function detailsButton(season) {
    return (
      <Button id={season._id} onClick={(e) => showSeasonDetails(e.target.id)} style={{marginTop: "6px", width: "100%"}} variant="outline-primary">
        Results
      </Button> 
    )
  }

  if (loading) {
    return ( <Loading /> )
  } else {
    return (
      <div>
        <Header props={{header:'Results'}} /> 
        <div onClick={addDoc} style={{marginBottom: '18px', height: '15px', maxWidth: '15px'}} >
        {allowAddSeasons && <PlusButton /> }
        </div>
        {modalForm()}         
        <div style={{alignSelf: 'center', display: 'grid',  justifyContent:'center',  width: 'auto', height: 'auto'}}>
          {data && data.length > 0 && data.map((doc, index) => (
            <Card style={{width: '100%', minWidth: '22rem', textAlign: 'center', maxWidth: '80rem', margin: '3px', zIndex: 0}} key={index}>
              <Card.Header>
                <b>{doc.hasOwnProperty('name') && doc.name}</b>
                {allowAddSeasons && 
                  <div style={{float: 'right'}} >
                    <GearButtonNoMrg id={doc._id} handleClick={() => editDoc(doc._id)}/>
                  </div> }
              </Card.Header>
              <Card.Body>
                <Card.Text>{dateUtils.stringToWordDate(doc.startDate)} <b>to</b> {dateUtils.stringToWordDate(doc.endDate)}</Card.Text> 
                {detailsButton(doc)}
              </Card.Body>
            </Card>
          ))}       
        </div>             
      </div>
    )
  }
}

export default Seasons;
