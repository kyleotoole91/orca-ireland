import { React, useState, useEffect } from 'react'
import { withAuthenticationRequired } from "@auth0/auth0-react"
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form'
import Loading from '../components/Loading';
import { useAuth0 } from "@auth0/auth0-react";
import { UserModel } from '../models/UserModel'

function Membership() {  
  const userModel = new UserModel() 
  const { user, isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0()
  const [apiToken, setApiToken] = useState('')
  const [loading, setLoading] = useState(true)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')

  if (apiToken === '') {
    if (!isAuthenticated) {
      loginWithRedirect()
    } else {
      getApiToken()
    }
  } else { 
    userModel.setApiToken(apiToken)
  }

  async function getApiToken() {
    let token = await getAccessTokenSilently({ audience: process.env.REACT_APP_AUTH0_AUDIENCE })
    userModel.setApiToken(token)
    setApiToken(token)   
    console.log(token)
    console.log(user)
  }

  useEffect(() => {
    async function loadData () {
      setLoading(true)
      if (apiToken !== '') {
        try {
          const userModel = new UserModel() 
          userModel.setApiToken(apiToken)
          await userModel.get(user.sub)
          if (userModel.success) {
            user.nickname && setUsername(user.nickname) 
            user.email && setEmail(user.email) 
            setUsername(userModel.responseData.username)   
            setPhone(userModel.responseData.phone) 
            if (userModel.responseData.hasOwnProperty('firstName')) {
              setFirstName(userModel.responseData.firstName)
            } else if (user.hasOwnProperty('given_name')) {
              setFirstName(user.given_name)  
            }
            if (userModel.responseData.hasOwnProperty('lastName')) {
              setLastName(userModel.responseData.lastName)
            } else if (user.hasOwnProperty('family_name')) {
              setLastName(user.family_name)  
            }
          } else {
            console.log(userModel.message)
            if (user.hasOwnProperty('given_name')) {
              setFirstName(user.given_name) 
            }
            if (user.hasOwnProperty('family_name')) {
              setLastName(user.family_name) 
            }
            window.alert(userModel.message)
          }
        } catch(e) {
          window.alert(e)
        } finally {
          setLoading(false)
        }
      }
    }  
    loadData()
  }, [apiToken, user, isAuthenticated, getAccessTokenSilently])

  async function updateUserDetails() {
    try {
      const extId = user.sub
      await userModel.put(user.sub, { firstName, lastName, phone, username, email, extId })  
      if (userModel.success) {
        window.alert('Details updated succesfully')
      } else {
        window.alert(userModel.message)
      }
    } catch (e) {
      window.alert(e)
    } finally {
      setLoading(false)  
    }
  }

  if (loading) {
    return ( <Loading /> )
  } else {
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
            <Button variant="outline-primary" onClick={updateUserDetails}>Save </Button>
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

