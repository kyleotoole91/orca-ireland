import React from 'react'
import styled from 'styled-components'
import mainLogo from './images/race-circuit.png'
import Profile from './Profile'
import MenuItems from './MenuItems'
import { useAuth0 } from '@auth0/auth0-react'
import { SideBar } from './'
import { useWindowDimensions } from '../utils/WindowSize'

function MenuBar () {
  const { isAuthenticated } = useAuth0()
  const { width } = useWindowDimensions()
  return (
    <>
      <SideBar authenticated={isAuthenticated} />
      <MenuBarContainer style={{zIndex: 3}} > 
        <BurgerContainer />
        {width > 285 && 
          <CompanyContainer>
            ORCA Ireland &nbsp;
            {width > 319 && <CompanyImage src={mainLogo} /> }
          </CompanyContainer>
        } 
        <MenuItems authenticated={isAuthenticated} />
        {width > 120 && <Profile /> }     
      </MenuBarContainer>
    </ >
  )
}

const CompanyImage = styled.img` 
  float: right;
  position: relative;
  height: 100%;
  padding: 6px;
`

const BurgerContainer = styled.div` 
  float: left; 
  display: flex;
  align-items: center;
  height: 100%;
  width: 50px;
  button {
    margin: 0px;
    padding-top: 12px;
    padding-left: 12px; 
  }
`
//background: ${({ theme}) => theme.primaryDark};
const MenuBarContainer = styled.div`
background: ${({ theme}) => theme.colorWhite};
  position: sticky;
  top: 0;
  height: 48px;
  a {
    color: ${({ theme}) => theme.primaryLight};
    text-decoration: none;
    outline-style: none;   
    font-weight: bold; 
    &:visited {
      text-decoration: none;
      outline-style: none;   
      color: ${({ theme}) => theme.primaryLight};
    } 
    &:hover {
      color: ${({ theme}) => theme.hoverMenuItem};
    }
  } 
`

const CompanyContainer = styled.div`
  display: flex;
  align-items: center;   
  float: left;
  position: 'relative';
  height: 100%;
  text-align: left;
  color: ${({ theme}) => theme.primaryLight};
  font-family: ${({ theme}) => theme.companyFont};
`
/*
  @media (max-width: ${({ theme}) => theme.mobileXS}) {
    display: none;
  }
*/

export default MenuBar
