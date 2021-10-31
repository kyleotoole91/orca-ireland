import { React, useState, useEffect }from 'react'
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react"
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Loading from '../components/Loading'
import dayjs from 'dayjs'
import { Permissions } from '../utils/permissions'

function Events() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0()
  const [data, setData] = useState()
  const [apiToken, setApiToken] = useState('')
  const [loading, setLoading] = useState(true)
  const [allowAddEvents, setAllowAddEvents] = useState(false)

  if (isAuthenticated && apiToken === '') {
    getApiToken()
  }

  async function getApiToken() {
    let token = await getAccessTokenSilently({ audience: process.env.REACT_APP_AUTH0_AUDIENCE });
    setApiToken(token)   
    console.log(token)
  }

  useEffect(() => {
    async function loadData () {
      const permissions = new Permissions()
      setLoading(true)
      await fetch(process.env.REACT_APP_API_URL + process.env.REACT_APP_API_EVENTS, {headers: {Authorization: `Bearer ${apiToken}`}})
            .then(response => response.json())
            .then((response) => {
                    setData(response.data)
                    setLoading(false)
                    setAllowAddEvents(permissions.check(apiToken, 'post', 'events'))
                  }).catch((error) => {
                    setData([])
                    setLoading(false);
                    console.log(error)
                  })
    }  
    loadData()
  }, [apiToken])

  if (!data || loading) {
    return ( <Loading /> )
  } else if (data.length === 0) {
    return ( <div>No events</div> )
  } else {
    return (
        <div>
           {allowAddEvents && <Button style={{marginLeft: '3px', marginBottom: '3px'}} variant="primary">Add Event</Button> }
           <div style={{display: 'flex', flexFlow: 'wrap'}}>
              {data.map((event, index) => (
              <Card style={{maxWidth: '40vh', margin: '3px', zIndex: 0}} key={index}>
                <Card.Header>{event.name}</Card.Header>
                <Card.Body>
                  <Card.Title>{event.location}</Card.Title>
                  <Card.Text>Entry fee €{event.price}</Card.Text>
                  <Card.Text>{dayjs(event.date).format('DD/MM/YYYY') }</Card.Text>
                  <Button variant="primary">Enter</Button>
                </Card.Body>
              </Card>
            ))}    
          </div> 
        </div>
      )
  }
};

export default withAuthenticationRequired(Events, { onRedirecting: () => (<Loading />) });

/*
function MyComponent() {

  const [data, setData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const { logout, loginWithRedirect,  user, isAuthenticated, getAccessTokenSilently } = useAuth0()
  var profilePic = DefaultProfilePng
  var username = 'Sign In'

  if (user != null) {
    console.log(user)    
    token = getApiToken();
    console.log(token)
    profilePic = user.picture
    if (user.name != null) {
      username = user.name;
    } else {
      username = user.nickname;
    }
  }

  //Alternative to declaring loadData() in useEffect(). Memoize with useCallback()
  const loadData= useCallback(() => {
    //Request code here
    }, [])
    useEffect(() => {
        loadData()
    }, [loadData])
 
  async function getApiToken() {
    return await getAccessTokenSilently();
  }
  
  const loadAsyncData = async () => {
  
    setIsLoading(true);
    setError(null);
    
    try {
      const resp = await fetch('https://...').then(r=>r.json());
      setData(resp);
      setIsLoading(false);
    } catch(e) {
      setError(e);
      setIsLoading(false);
    }
    
  }
  
  useEffect(() => {
    
    loadAsyncData();
    
  }, []);
  
    
  if(this.state.isLoading) return (<p>Loading...</p>);
  if(this.state.error) return (<p>Something went wrong</p>);
  if(this.state.data) return (<p>The data is: {data}</p>);
  return (<p>No data yet</p>);
    
}

*/