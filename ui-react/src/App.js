import './App.css'
import React from 'react'
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
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
//import { useAuth0 } from '@auth0/auth0-react';
require('dotenv').config()

function App() {
  const history = useHistory();

  const onRedirectCallback = (appState) => {
    history.push(appState?.returnTo || window.location.pathname);
  };

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
              <Route path="/membership" component={Membership} /> 
              <Route path="/garage" component={Garage} />
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
