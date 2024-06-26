import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { slide as Menu } from "react-burger-menu";
import Profile from './Profile'
import styles from './styles'

export default class SideBar extends Component {
  constructor (props) {
    super(props)
    this.state = {
      menuOpen: false
    }
  }

  // This keeps your state in sync with the opening/closing of the menu
  // via the default means, e.g. clicking the X, pressing the ESC key etc.
  handleStateChange (state) {
    this.setState({menuOpen: state.isOpen})  
  }
  
  // This can be used to close the menu, e.g. when a user clicks a menu item
  closeMenu () {
    this.setState({menuOpen: false})
  }

  // This can be used to toggle the menu, e.g. when using a custom icon
  // Tip: You probably want to hide either/both default icons if using a custom icon
  // See https://github.com/negomi/react-burger-menu#custom-icons
  toggleMenu () {
    this.setState(state => ({menuOpen: !state.menuOpen}))
  }

  render() {
    return (
      <Menu isOpen={this.state.menuOpen} onStateChange={(state) => this.handleStateChange(state)} styles={styles} >
        <Link onClick={() => this.closeMenu()} id="home" to="/">Home</Link>
        <Link onClick={() => this.closeMenu()} id="gallery" to="/gallery">Gallery</Link>
        {!this.props.authenticated && <Link onClick={() => this.closeMenu()} id="articles" className="menu-item" to="/articles">News</Link>}
        {!this.props.authenticated && <Link onClick={() => this.closeMenu()} id="events" className="menu-item" to="/events">Events</Link>}
        {!this.props.authenticated && <Link onClick={() => this.closeMenu()} id="seasons" className="menu-item" to="/seasons">Results</Link>}
        {!this.props.authenticated && <Link onClick={() => this.closeMenu()} id="about" className="menu-item--small" to="/about">About</Link>}
        {this.props.authenticated && <Link onClick={() => this.closeMenu()} id="articles" className="menu-item" to="/articles">News</Link>}
        {this.props.authenticated && <Link onClick={() => this.closeMenu()} id="events" className="menu-item" to="/events">Events</Link>}
        {this.props.authenticated && <Link onClick={() => this.closeMenu()} id="seasons" className="menu-item" to="/seasons">Results</Link>}
        {this.props.authenticated && <Link onClick={() => this.closeMenu()} id="garage" className="menu-item" to="/garage">My Cars</Link>}
        {this.props.authenticated && <Link onClick={() => this.closeMenu()} id="membership" className="menu-item--small" to="/membership">Membership</Link>}
        {this.props.authenticated && <Link onClick={() => this.closeMenu()} id="polls" className="menu-item--small" to="/polls">Polls</Link>}
        {this.props.authenticated && <Link onClick={() => this.closeMenu()} id="about" className="menu-item--small" to="/about">About</Link>}
        <ProfileContainer><Profile forceUsername={true}/></ProfileContainer>
      </Menu>
    )
  }
}

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column; 
  height: 50px;
`

