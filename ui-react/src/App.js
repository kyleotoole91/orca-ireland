import './App.css'
import React from 'react'
import { BrowserRouter as Router, Route, Switch, useHistory } from 'react-router-dom'
import Auth0ProviderWithHistory from './auth/auth0-provider-with-history'
import { ThemeProvider } from 'styled-components'
import { theme } from './theme'
import { MenuBar} from './components'
import styled from 'styled-components'
//import ProtectedRoute from './auth/protected-route';
import Home from './pages/Home'
import Events from './pages/Events'
import Garage from './pages/Garage'
import Membership from './pages/Membership'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
//import { useAuth0 } from '@auth0/auth0-react';
require('dotenv').config()

const domain = process.env.REACT_APP_AUTH0_DOMAIN
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID
const callbackUri = process.env.REACT_APP_AUTH0_URI_CALLBACK 

function App() {
  const history = useHistory();
  const onRedirectCallback = (appState) => {
    history.push(appState?.returnTo || window.location.pathname);
  };

  //const { isAuthenticated } = useAuth0();
  //console.log(isAuthenticated);

  return ( 
    <Router> 
      <Auth0ProviderWithHistory
        domain={domain}
        clientId={clientId}
        redirectUri={callbackUri}
        onRedirectCallback={onRedirectCallback}
      >
        <ThemeProvider theme={theme} className="App">
          <MenuBar />   
          <AppContainer className="content">
            <Switch>
              <Route exact path="/">
                <Home />
              </Route> 
              <Route path="/events">
                <Events />
              </Route>
              <Route path="/membership">
                <Membership />
              </Route>
              <Route path="/garage">
                <Garage />
              </Route>
            </Switch>   
          </AppContainer>
        </ThemeProvider>
      </Auth0ProviderWithHistory>
    </Router>
  );
};

const AppContainer = styled.div`
  font-family: ${({ theme}) => theme.mainFont};
  padding: 6px;
  width: 100%;
  height: 100%;
`;

export default App;
