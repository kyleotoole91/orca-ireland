import './App.css'
import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Route, Switch, useHistory } from 'react-router-dom'
import Auth0ProviderWithHistory from './auth/auth0-provider-with-history'
import { ThemeProvider } from 'styled-components'
import { theme } from './theme'
import { MenuBar} from './components'
import styled from 'styled-components'
//import ProtectedRoute from './auth/protected-route';
import Homepage from './views/Home'
import Events from './views/Events'
import EventDetail from './views/EventDetail'
import Garage from './views/Garage'
import Membership from './views/Membership'
import Gallery from './views/Gallery'
import About from './views/About'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
//import { useAuth0 } from '@auth0/auth0-react';
import Loading from './components/Loading'

require('dotenv').config()

function App() {
  const [loading, setLoading] = useState(true)
  const history = useHistory()
  
  useEffect(() => {
    async function loadPage () {
      setLoading(true)
      try {
        //
      } finally {
        setLoading(false)
      }
    }  
    loadPage()
  }, [])

  const onRedirectCallback = (appState) => {
   history.push(appState?.returnTo || window.location.pathname);
  }

  if (loading) {
    return ( <Loading /> )
  } else {
    return ( 
      <Router> 
        <Auth0ProviderWithHistory
          onRedirectCallback={onRedirectCallback} >
          <ThemeProvider theme={theme} className="App">
            <MenuBar />   
            <AppContainer className="content">
              <Switch>
                <Route exact path="/" component={Homepage} />
                <Route path="/home" component={Homepage} />
                <Route path="/events/:id" component={EventDetail} />
                <Route path="/events" component={Events} />
                <Route path="/gallery" component={Gallery} />
                <Route path="/membership" component={Membership} /> 
                <Route path="/garage" component={Garage} />
                <Route path="/about" component={About} />
              </Switch>   
            </AppContainer>
          </ThemeProvider>
        </Auth0ProviderWithHistory>
      </Router>
    )
  }
}

const AppContainer = styled.div`
  font-family: ${({ theme}) => theme.mainFont};
  padding: 6px;
  width: 100%;
  height: 100%;
`

export default App
