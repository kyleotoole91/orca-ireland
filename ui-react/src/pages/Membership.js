import { React, useState, useEffect } from 'react'
import { withAuthenticationRequired } from "@auth0/auth0-react"
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form'
import Loading from '../components/Loading';
import { useAuth0 } from "@auth0/auth0-react";
const urlParam = '?extLookup=1' 

function Membership() {  
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0()

  const [data, setData] = useState([])
  const [apiToken, setApiToken] = useState('')
  const [loading, setLoading] = useState(true)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')

  if (isAuthenticated && apiToken === '') {
    getApiToken()
  }

  async function getApiToken() {
    let token = await getAccessTokenSilently({ audience: process.env.REACT_APP_AUTH0_AUDIENCE })
    setApiToken(token)   
    console.log(token)
  }
  useEffect(() => {
    async function loadData () {
      const extId = '/'+user.sub
      let memberData 
      setLoading(true)
      await fetch(process.env.REACT_APP_API_URL+ 
                  process.env.REACT_APP_API_USERS+extId+urlParam, {headers: {Authorization: `Bearer ${apiToken}`}})
            .then(response => response.json())
            .then((response) => {
              if (response.hasOwnProperty('data')) {
                setData(response.data)  
                console.log(response) 
                console.log(user) 
                memberData = response.data                    
                if (memberData.firstName) {
                  setFirstName(memberData.firstName)  
                } else {
                  setFirstName(user.given_name)
                }
                if (memberData.lastName) {
                  setLastName(memberData.lastName)  
                } else {
                  setLastName(user.family_name)
                } 
                if (memberData.username) {
                  setUsername(memberData.username)  
                } else {
                  setUsername(user.nickname)
                }
                if (memberData.email) {
                  setEmail(memberData.email)  
                } else {
                  setEmail(user.email)
                }
              } else if (response.hasOwnProperty('success') && !response.success && response.hasOwnProperty('message')) {
                console.log(response.message)    
              }
              setLoading(false)
            }).catch((error) => {
              setData([])
              setLoading(false);
              window.alert(error)
              console.log(error)
            })
    }  
    loadData()
  }, [apiToken, user, firstName])

  if (loading) {
    return ( <Loading /> )
  } else if (data) {
    return (
      <div div style={{display: 'flex', flexFlow: 'wrap'}}> 
        <Card style={{margin: '3px'}}>
          <Card.Header>Member details</Card.Header>
          <Card.Body>
            <Form style={{width: '250px'}}>
              <Form.Group className="mb-3" controlId="formGroupFirstName" >
                <Form.Label>First Name</Form.Label>
                <Form.Control type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formGroupLastName" >
                <Form.Label>Last Name</Form.Label>
                <Form.Control type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formGroupLastName">
                <Form.Label>Phone</Form.Label>
                <Form.Control type="text" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formGroupEmail">
                <Form.Label>Username</Form.Label>
                <Form.Control type="text" placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)}/>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formGroupEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control type="test" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Form.Group>
            </Form> 
            <Button variant="outline-primary" >Save </Button>
          </Card.Body>
        </Card>
        <Card style={{margin: '3px', width: '45rm', maxHeight: '125px', width: '284px'}}>
          <Card.Header>Membership</Card.Header>
          <Card.Body>
            <Card.Title>€50 every 3 months </Card.Title>
            <Card.Text>
              Excluding race entry fees (€10)  
            </Card.Text>
          </Card.Body>
        </Card>
      </div>
    )
  }
}

export default withAuthenticationRequired(Membership, {
  onRedirecting: () => (<Loading />)  
});

