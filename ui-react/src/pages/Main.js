import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from '../theme';
import styled from 'styled-components';
import Home from '../pages/Home';
import Events from '../pages/Events';
import Garage from '../pages/Garage';
import Membership from '../pages/Membership';
import { MenuBar} from '../components';

class Main extends Component {

  constructor(props) {
    super(props)
    this.state = {}
  }

  async componentWillMount() {
    this.setState({ loading: true })
  }  

  render() {
    return (
      <AppContainer className="content">

      </AppContainer>
    )}
}

const AppContainer = styled.div`
  font-family: ${({ theme}) => theme.mainFont};
  padding: 6px;
  width: 100%;
  height: 100%;
`;

export default Main;