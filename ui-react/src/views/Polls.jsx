import { React, useState, useEffect } from 'react'
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react"
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Loading from '../components/Loading'
import { PlusButton } from '../components/PlusButton'
import { GearButton } from '../components/GearButton'
import { PollModel } from '../models/PollModel'
import Header from '../components/Header'
import { DateUtils } from '../utils/DateUtils'
import { Permissions } from '../utils/permissions'
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import { PieChart } from 'react-minimal-pie-chart'

const pollModel = new PollModel()
const dateUtils = new DateUtils()
const cEndDateHours = 18
const defaultDate = new Date()
defaultDate.setHours(18)
defaultDate.setMinutes(0)
const defaultDateCtrl = dateUtils.formatDate(defaultDate, 'yyyy-mm-dd')  
const defaultTime = defaultDate
defaultTime.setHours(23)
defaultTime.setMinutes(59)
defaultTime.setSeconds(59)
const defaultTimeCtrl = dateUtils.getTime(defaultTime)  
const cDefaultOptions = 'Yes+No' 

function Polls() {
  const { user, isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0()
  const [apiToken, setApiToken] = useState('')
  const [Id, setId] = useState('')
  const [data, setData] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [options, setOptions] = useState(cDefaultOptions)
  const [endDate, setEndDate] = useState(defaultDate)
  const [endDateCtrl, setEndDateCtrl] = useState(defaultDateCtrl)
  const [endTimeCtrl, setEndTimeCtrl] = useState(defaultTimeCtrl)
  const [allowAddPolls, setAllowAddPolls] = useState(false)
  const [loading, setLoading] = useState(true)
  const [show, setShow] = useState(false)
  const [editing, setEditing] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [showCastVote, setShowCastVote] = useState(false)
  const [selectedOption, setSelectedOption] = useState('')
  const [selectedPollId, setSelectedPollId] = useState('')
  const [showResults, setShowResults] = useState(false)
  const handleSetOption = (optionName) => setSelectedOption(optionName)
  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)
  const handleCloseResults = () => setShowResults(false)
  const handleShowResults = (e) => { 
    setSelectedPollId(e.target.id.toString())
    setShowResults(true) 
  }
  const handleCloseCastVote = () => { 
    setShowCastVote(false) 
    setSelectedOption('')
  } 

  if (apiToken === '') {
    if (!isAuthenticated) {
      loginWithRedirect()
    } else {
      getApiToken()
    }
  } else { 
    pollModel.setApiToken(apiToken)
  }

  async function getApiToken() {
    try{ 
      const token = await getAccessTokenSilently({ audience: process.env.REACT_APP_AUTH0_AUDIENCE })
      pollModel.setApiToken(token)
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
          const pollModel = new PollModel(apiToken)
          await pollModel.get()
          if (pollModel.success) {
            setData(pollModel.responseData)
          } else {
            window.alert(pollModel.message)
          }
          const permissions = new Permissions()
          setAllowAddPolls(permissions.check(apiToken, 'post', 'polls'))
        } finally {
          setLoading(false) 
        }  
      }
    }  
    loadData()
  }, [refresh, apiToken, user.sub])

  async function deleteDoc() {
    try {
      if (window.confirm('Are you sure you want to delete this poll?')) {
        await pollModel.delete(Id)
        if (pollModel.success){
          setRefresh(!refresh)
        } else {
          window.alert(pollModel.message)
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
      await pollModel.post({title, description, options, endDate})  
      if (pollModel.success) {
        setRefresh(!refresh)
        handleClose()
      } else {
        window.alert(pollModel.message)
      }
    } catch(e) {
      window.alert(e)
    } finally {
      setLoading(false)
    }  
  }

  async function castVote() {
    try {
      await pollModel.put(Id.toString(), {selectedOption})  
      if (pollModel.success) {
        setRefresh(!refresh)
        handleCloseCastVote()
      } else {
        window.alert(pollModel.message)
      }
    } catch(e) {
      window.alert(e)
    } finally {
      setLoading(false)
    }  
  }

  async function putDoc(id) {
    try {
      await pollModel.put(id.toString(), {title, description, options, endDate})  
      if (pollModel.success) {
        setRefresh(!refresh)
        handleClose()
      } else {
        window.alert(pollModel.message)
      }
    } catch(e) {
      window.alert(e)
    } finally {
      setLoading(false)
    }  
  }

  function findDoc(id) {
    if (data && data.length > 0){
      for (var poll of data) {
        if (poll._id === id) return poll
      }
    }
  }

  function editDoc(id) {
    let poll = findDoc(id) 
    if (poll) {
      setTitle(poll.title)
      setDescription(poll.description)
      setEndDate(poll.endDate)
      setId(id)
      setEditing(true)
      handleShow()
    } else {
      window.alert('error finding poll')
    }
  } 

  function addDoc() {
    setEditing(false)
    setTitle('')
    setDescription('')
    setOptions(cDefaultOptions)
    setId('')
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
      return title
    } else {
      return 'New Poll'
    }
  }

  function dateChange(stringDate) {
    let date = new Date(stringDate)
    date.setHours(cEndDateHours)
    setEndDate(date)
    setEndDateCtrl(stringDate)  
  }

  function timeChange(stringTime) {
    const hms = stringTime.split(':')
    endDate.setHours(hms[0])
    endDate.setMinutes(hms[1])
    endDate.setSeconds(hms[2])
    setEndDate(endDate)
    setEndTimeCtrl(stringTime)  
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
              <Form.Label>Title</Form.Label>
              <Form.Control value={title} type="text" name="title" onChange={(e) => setTitle(e.target.value)}/>
            </Form.Group> 
            <Form.Group className="mb-3" controlId="formDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control value={description} type="text" as="textarea" name="title" onChange={(e) => setDescription(e.target.value)} />
            </Form.Group> 
            <Form.Group className="mb-3" controlId="formDescription">
              <Form.Label>Options</Form.Label>
              <Form.Control value={options} type="text" name="options" onChange={(e) => setOptions(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formEndDate">
              <Form.Label>End Date</Form.Label>
              <Form.Control value={endDateCtrl} type="date" name="date" onChange={(e) => dateChange(e.target.value)} min={endDateCtrl} />
            </Form.Group> 
            <Form.Group className="mb-3" controlId="formEndTime">
              <Form.Label>End Time</Form.Label>
              <Form.Control value={endTimeCtrl} type="time" name="time"  onChange={(e) => timeChange(e.target.value)} min={endTimeCtrl}  />
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

  function textResults(options) {
    return <>
      {options.length > 0 && options.map((option, index) => (
        <p key={option.name}>{option.name+': ' + calcResult(option)}</p>
      ))}  
    </>
  }

  function pieChart(options) {
    const chartData = []
    let colorIdx = 0
    let colorHexStr = ''
    for (var option of options) {
      colorIdx++ 
      if (option.hasOwnProperty('user_ids')) {
        switch(colorIdx) {
          case 1:
            colorHexStr = '#82E0AA' 
            break;
          case 2:
            colorHexStr = '#F8C471' 
            break;
          case 3:
            colorHexStr = '#AED6F1' 
            break;
          default:
            colorHexStr = '#D2B4DE' 
            break;
          case 4:
            colorHexStr = '#E6B0AA' 
            break;
          case 5:
            colorHexStr = '##C0392B' 
            break;
          case 6:
            colorHexStr = '#ABB2B9' 
            break;
          case 7:
            colorHexStr = '#566573'
            break;
        }
        chartData.push({
          label: option.name,
          value: option.user_ids.length, 
          color: colorHexStr 
        })  
      }
    }
    return <PieChart data={chartData} animate label={({ dataEntry }) => dataEntry.label} />
  }

  function resultsData(options) {
    return <>
       <div>
         {textResults(options)}
       </div>
       <div>
        {pieChart(options)}
      </div>
    </>
  }
  
  function modalCastVote() {
    let poll = findDoc(Id) 
    let title = ''
    if (poll && poll.hasOwnProperty('title')) {
      title = poll.title
    }
    function radioList () {
      function optionItem(option, index) {
        return (
          <InputGroup key={poll._id+index} className="mb-3">
            <InputGroup.Radio key={option.name} id={option.name} onChange={() => handleSetOption(option.name)} checked={selectedOption===option.name} aria-label="Checkbox for following text input" />
            <FormControl key={option.name+'-FormControl'} onChange={() => handleSetOption(option.name)}  value={option.name} aria-label="Text input with checkbox" />
          </InputGroup>
        )
      }    
      return (
        <>
          {poll && poll.hasOwnProperty('options') && poll.options.map((option, index) => optionItem(option, index) ) }
        </>  
      )
    }
    return ( 
      <Modal show={showCastVote} onHide={handleCloseCastVote}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ display: 'grid', fontFamily: "monospace"}} >
          <p>Select one</p>
          {radioList()}
        </Modal.Body>
        <Modal.Footer>
            <Button variant="outline-secondary" onClick={handleCloseCastVote}>
              Close
            </Button>
            <Button variant="outline-primary" onClick={castVote}>
              Save
            </Button>
        </Modal.Footer>
      </Modal>   
    )
  } 

  function calcResult(option) {
    if (option.hasOwnProperty('user_ids')) {
      return option.user_ids.length
    } 
    return 0
  }

  function modalResults() {
    const poll = findDoc(selectedPollId)
    if (process.env.REACT_APP_SHOW_CONSOLE_LOGS) {
      console.log(poll)
    }
    return <>
      <Modal show={showResults} onHide={handleCloseResults}>
        <Modal.Header closeButton>
          <Modal.Title>{poll && poll.hasOwnProperty('title') && poll.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ display: 'grid', fontFamily: "monospace"}} >
          {poll && 
           poll.hasOwnProperty('options') && 
           poll.options.length > 0 && 
           resultsData(poll.options) }    
        </Modal.Body>
        <Modal.Footer>
            <Button variant="outline-secondary" onClick={handleCloseResults}>
              Close
            </Button>
        </Modal.Footer>
      </Modal> 
    </>    
  }

  async function handleShowCastVote(e) { 
    if (!isAuthenticated) {
      loginWithRedirect({ appState: { targetUrl: window.location.pathname } })
    } else {
      setId(e.target.id.toString())
      setShowCastVote(true) 
    }  
  }

  function voteCasted(poll) {
    if (poll && poll.hasOwnProperty('options')){
      for (var option of poll.options) {
        if (option.hasOwnProperty('extIds') && option.extIds.indexOf(user.sub) >= 0) {
          return true
        }
      }
    } 
    return false
  }

  function voteButton(poll) {
    if (!voteCasted(poll) && dateUtils.stringToDate(poll.endDate) >= Date.now()) {
      return (
        <Button id={poll._id} style={{width: "100%"}} variant="outline-primary" onClick={handleShowCastVote}>
          Vote
        </Button>
      )
    } else {
      return (
        <Button id={poll._id} disabled style={{width: "100%"}} variant="outline-secondary">
          Vote
        </Button>
      )
      }
  }

  function resultsButton(poll) {
    if (voteCasted(poll)) {
      return (
        <Button id={poll._id} style={{width: "100%", marginTop: '6px'}} variant="outline-primary" onClick={handleShowResults}>
          Results
        </Button>
      )
    } else {
      return (
        <Button id={poll._id} style={{width: "100%", marginTop: '6px'}} disabled variant="outline-secondary">
          Results
        </Button>
      )
    }
  }

  if (loading) {
    return ( <Loading /> )
  } else {
    return (
      <div>
        <Header props={{header:'Polls'}} /> 
        <div onClick={addDoc} style={{marginBottom: '18px', height: '15px', maxWidth: '15px'}} >
        {allowAddPolls && <PlusButton /> }
        </div>
        {modalForm()}
        {modalResults()}            
        {modalCastVote()}
        <div style={{display: 'flex', flexFlow: 'wrap'}}>
          {data && data.length > 0 && data.map((doc, index) => (
            <Card style={{width: '240px', margin: '3px', zIndex: 0}} key={index}>
              <Card.Header><b>{doc.title}</b></Card.Header>
              <Card.Body>
                <Card.Text>{doc.hasOwnProperty('description') && doc.description}</Card.Text>
                <b>End Date:</b>
                <Card.Text>{dateUtils.stringToWordDateTime(doc.endDate)}</Card.Text>
                {voteButton(doc)}
                {resultsButton(doc)}
                {allowAddPolls && 
                  <div style={{float: 'right'}} >
                    <GearButton id={doc._id} handleClick={() => editDoc(doc._id)}/>
                  </div> }
              </Card.Body>
            </Card>
          ))}    
        </div>                                  
      </div>
    )
  }
}

export default withAuthenticationRequired(Polls, { onRedirecting: () => (<Loading />) });
