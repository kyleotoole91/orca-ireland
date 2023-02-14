import { React, useState, useEffect } from 'react'
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react"
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Loading from '../components/Loading'
import { PlusButton } from '../components/PlusButton'
import { GearButtonNoMrg } from '../components/GearButton'
import { SeasonModel } from '../models/SeasonModel'
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
  const [bestOffset, setBestOffset] = useState(1)
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

  if (apiToken === '') {
    if (!isAuthenticated) {
      loginWithRedirect()
    } else {
      getApiToken()
    }
  } else { 
    seasonModel.setApiToken(apiToken)
  }

  async function getApiToken() {
    try{ 
      const token = await getAccessTokenSilently({ audience: process.env.REACT_APP_AUTH0_AUDIENCE })
      seasonModel.setApiToken(token)
      setApiToken(token)
    } catch(e) {
      loginWithRedirect()
    }   
  }

  useEffect(() => {
    async function loadData () {
      if (apiToken !== '') {
        setLoading(true)
        try {
          const seasonModel = new SeasonModel(apiToken)
          await seasonModel.get()
          if (seasonModel.success) {
            seasonModel.responseData.sort((a, b) => parseFloat(b.startDate) - parseFloat(a.startDate)) //sort desc by date
            setData(seasonModel.responseData)
          } else {
            window.alert(seasonModel.message)
          }
          const permissions = new Permissions()
          setAllowAddSeasons(permissions.check(apiToken, 'post', 'seasons'))
        } finally {
          setLoading(false) 
        }  
      }
    }  
    loadData()
  }, [refresh, apiToken, user.sub])

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
      await seasonModel.post({name, startDate, endDate, maxPoints, pointsOffset, bestOffset})  
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
      await seasonModel.put(id.toString(), {name, startDate, endDate, maxPoints, pointsOffset, bestOffset})  
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
      setStartDate(new Date(season.startDate))
      setEndDate(new Date(season.endDate))
      setStartDateCtrl(dateUtils.formatDate(new Date(season.startDate), 'yyyy-mm-dd'))
      setEndDateCtrl(dateUtils.formatDate(new Date(season.endDate), 'yyyy-mm-dd'))
      setPointsOffset(season.pointsOffset)
      setBestOffset(season.bestOffset)
      setMaxPoints(season.maxPoints)
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

  function modalForm() {
    return (  
      <Modal show={show} onHide={handleClose} >
        <Modal.Header closeButton>
          <Modal.Title>{headerText()}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
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
    if (!isAuthenticated) {
      loginWithRedirect({ appState: { targetUrl: window.location.pathname+'/'+id } })
    } else {
      history.push('/seasons/'+id)
    }
  }

  function detailsButton(season) {
    return (
      <Button id={season._id} onClick={(e) => showSeasonDetails(e.target.id)} style={{marginTop: "6px", width: "100%"}} variant="outline-primary">
        Driver Standings
      </Button> 
    )
  }

  if (loading) {
    return ( <Loading /> )
  } else {
    return (
      <div>
        <Header props={{header:'Seasons'}} /> 
        <div onClick={addDoc} style={{marginBottom: '18px', height: '15px', maxWidth: '15px'}} >
        {allowAddSeasons && <PlusButton /> }
        </div>
        {modalForm()}         
        <div style={{display: 'flex', flexFlow: 'wrap'}}>
          {data && data.length > 0 && data.map((doc, index) => (
            <Card style={{width: '240px', margin: '3px', zIndex: 0}} key={index}>
              <Card.Header>
                <b>{doc.hasOwnProperty('name') && doc.name}</b>
                {allowAddSeasons && 
                  <div style={{float: 'right'}} >
                    <GearButtonNoMrg id={doc._id} handleClick={() => editDoc(doc._id)}/>
                  </div> }
              </Card.Header>
              <Card.Body>
                <b>Start Date:</b>
                <Card.Text>{dateUtils.stringToWordDate(doc.startDate)}</Card.Text> 
                <b>End Date:</b>
                <Card.Text>{dateUtils.stringToWordDate(doc.endDate)}</Card.Text>
                {detailsButton(doc)}
              </Card.Body>
            </Card>
          ))}    
        </div>                                  
      </div>
    )
  }
}

export default withAuthenticationRequired(Seasons, { onRedirecting: () => (<Loading />) });
