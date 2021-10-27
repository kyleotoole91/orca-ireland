import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

class MenuItems extends Component {

    constructor(props) {
      super(props)
      this.state = {loading: true}
    }
  
    async componentDidMount() {
      this.setState({ loading: false })  
    } 

    render() {
      return (
        <>
          <MenuItem><Link to='./'>Home</Link></MenuItem>
          <MenuItem><Link to='/events'>Events</Link></MenuItem>
          {this.props.authenticated && <MenuItem><Link to='/garage'>Garage</Link></MenuItem> }
          {this.props.authenticated && <MenuItem><Link to='./membership'>Membership</Link></MenuItem> }
        </ >
      )
    }

};

const MenuItem = styled.div`
  display: flex;
  align-items: center; 
  float: left;
  position: 'relative';
  height: 100%;
  text-align: centre;
  padding-left: 12px;
  padding-right: 12px;
  transition: all 0.3s ease-in;
  font-size: 18px;
  font-family: ${({ theme}) => theme.menuFont};
  color: ${({ theme}) => theme.primaryLight};
  &:hover {
    background: white;
  }
  @media (max-width: ${({ theme}) => theme.mobileM}) {
    display: none;
  }
`;

export default MenuItems