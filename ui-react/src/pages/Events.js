import { React, useState, useEffect }from 'react';
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Loading from '../components/Loading';
import dayjs from 'dayjs';

function Events() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0()
  const [data, setData] = useState()
  const [apiToken, setApiToken] = useState('')
  const [loading, setLoading] = useState(true)

  if (isAuthenticated && apiToken === '') {
    getApiToken()
  }

  async function getApiToken() {
    let token = await getAccessTokenSilently({ audience: process.env.REACT_APP_AUTH0_AUDIENCE });
    setApiToken(token)   
    console.log(token)
  }
  
  //Alternative to declaring loadData() in useEffect(). Memoize with useCallback()
  /*const loadData= useCallback(() => {
    //Request code here
    }, [])
    useEffect(() => {
        loadData()
    }, [loadData])
  */
  useEffect(() => {
    async function loadData () {
      setLoading(true)
      await fetch(process.env.REACT_APP_API_URL + process.env.REACT_APP_API_EVENTS, {headers: {Authorization: `Bearer ${apiToken}`}})
            .then(response => response.json())
            .then((data) => {
                    setData(data.events)
                    setLoading(false)
                    console.log(data)
                  }).catch((error) => {
                    setLoading(false); 
                    console.log(error)
                  })
    }  
    loadData()
  }, [apiToken]);

  if (loading) {
    return ( <Loading /> )
  } else if (data.length === 0) {
    return ( <div>No events</div> )
  } else {
    return (
        <div style={{display: 'flex', flexFlow: 'wrap'}}>
            {data.map((event, index) => (
            <Card style={{maxWidth: '40vh', margin: '3px', zIndex: 0}} key={index}>
              <Card.Header>{event.event.name}</Card.Header>
              <Card.Body>
                <Card.Title>{event.event.location}</Card.Title>
                <Card.Text>Entry fee €{event.event.price}</Card.Text>
                <Card.Text>{dayjs(event.event.date).format('DD/MM/YYYY') }</Card.Text>
                <Button variant="primary">Enter</Button>
              </Card.Body>
            </Card>
          ))}    
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