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


  useEffect(() => {
    async function loadData () {
      const extId = '/'+user.sub
      if (apiToken === '' && isAuthenticated) {
        setApiToken(await getAccessTokenSilently({ audience: process.env.REACT_APP_AUTH0_AUDIENCE }))
      }
      let memberData 
      setLoading(true)
      await fetch(process.env.REACT_APP_API_URL+ 
                  process.env.REACT_APP_API_USERS+extId+urlParam, {headers: {Authorization: `Bearer ${apiToken}`}})
            .then(response => response.json())
            .then((response) => {
              console.log(response) 
              user.nickname && setUsername(user.nickname) 
              user.email && setEmail(user.email) 
              if (response.success && response.hasOwnProperty('data')) {
                memberData = response.data 
                setUsername(memberData.username)   
                setPhone(memberData.phone) 
                if (memberData.hasOwnProperty('firstName')) {
                  setFirstName(memberData.firstName)
                } else if (user.hasOwnProperty('given_name')) {
                  setFirstName(user.given_name)  
                }
                if (memberData.hasOwnProperty('lastName')) {
                  setLastName(memberData.lastName)
                } else if (user.hasOwnProperty('family_name')) {
                  setLastName(user.family_name)  
                }
                console.log(response.message)  
              } else if (!response.success && response.hasOwnProperty('message')) {
                console.log('Error: '+response.message)  
                //window.alert(response.message) //shows unauthorized error from the cors preflight options req, so disabled for now  
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
  }, [apiToken, user, isAuthenticated, getAccessTokenSilently])

  async function updateMemberDetails() {
    if (firstName === '' || lastName === '' || phone === '') {
      window.alert('Please fill in all fields')
    } else {
      const extId = user.sub 
      const extIdUrl = '/'+extId
      const member = {firstName, lastName, phone, username, email, extId}
      await fetch(process.env.REACT_APP_API_URL+ 
                  process.env.REACT_APP_API_USERS+extIdUrl+urlParam, {
              method: 'PUT', 
              headers: {Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json"},
              body: JSON.stringify(member)
            })
      .then(response => response.json())
      .then((response) => {
        if (!response.success) {
          window.alert(response.message)   
        } else {
          window.alert('Membership details updated succesfully')    
        }
        setLoading(false)
      }).catch((error) => {
        setData([])
        setLoading(false);
        window.alert(error)
        console.log(error)
      })
    }
  }

  if (loading) {
    return ( <Loading /> )
  } else if (data) {
    return (
      <div style={{display: 'flex', flexFlow: 'wrap'}}> 
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
                <Form.Control readOnly type="text" placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)}/>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formGroupEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control readOnly type="test" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Form.Group>
            </Form> 
            <Button variant="outline-primary" onClick={updateMemberDetails}>Save </Button>
          </Card.Body>
        </Card>
        <Card style={{margin: '3px', maxHeight: '125px', width: '284px'}}>
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

