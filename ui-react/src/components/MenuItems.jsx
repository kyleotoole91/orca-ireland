import React, {Component} from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

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
          <MenuItem><Link id="home" to='/'>Home</Link></MenuItem>
          <MenuItem><Link id="gallery" to="/gallery">Gallery</Link></MenuItem>
          <MenuItem><Link id="articles" to='/articles'>News</Link></MenuItem>
          <MenuItem><Link id="events" to='/events'>Events</Link></MenuItem>
          <MenuItem><Link id="seasons" to='/seasons'>Results</Link></MenuItem>
          {this.props.authenticated && <MenuItem><Link id="garage" to='/garage'>My Cars</Link></MenuItem>}
          {this.props.authenticated && <MenuItem><Link id="membership" to="/membership">Membership</Link></MenuItem>}
          {this.props.authenticated && <MenuItem><Link id="membership" to="/polls">Polls</Link></MenuItem>}
          <MenuItem><Link id="about" to="/about">About</Link></MenuItem> 
        </ >
      )
    }

}

const MenuItem = styled.div`
  display: flex;
  align-items: center; 
  float: left;
  position: 'relative';
  height: 100%;
  text-align: centre;
  padding-left: 10px;
  padding-right: 10px;
  transition: all 0.3s ease-in;
  font-size: 18px;
  font-family: ${({ theme }) => theme.menuFont};
  @media (max-width: ${({ theme }) => theme.menuItemsMax}) {
    display: none;
  }
  &:hover {
    background: white;
  }
`

export default MenuItems
