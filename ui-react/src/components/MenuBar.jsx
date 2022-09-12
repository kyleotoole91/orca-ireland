import React from 'react'
import styled from 'styled-components'
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
      {width <= 800 &&
        <SideBar authenticated={isAuthenticated} />
      }
      <MenuBarContainer style={{zIndex: 3}} > 
        {width <= 800 &&
          <BurgerContainer />
        }
        {width > 250 && 
          <CompanyContainer>
            ORCA Ireland &nbsp;
          </CompanyContainer>
        } 
        <MenuItems authenticated={isAuthenticated} />
        {width > 120 && <Profile />}     
      </MenuBarContainer>
    </ >
  )
}

const BurgerContainer = styled.div` 
  float: left; 
  display: flex;
  align-items: center;
  height: 100%;
  width: 32px;
  button {
    padding-top: 12px;
  }
`
const MenuBarContainer = styled.div`
background: ${({theme}) => theme.colorWhite};
  position: sticky;
  height: 48px;
  top: 0px;
  a {
    color: ${({theme}) => theme.primaryLight};
    text-decoration: none;
    outline-style: none;   
    font-weight: bold; 
    &:visited {
      text-decoration: none;
      outline-style: none;   
      color: ${({theme}) => theme.primaryLight};
    } 
    &:hover {
      color: ${({theme}) => theme.hoverMenuItem};
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
  padding-left: 12px;
  color: ${({theme}) => theme.primaryLight};
  font-family: ${({theme}) => theme.companyFont};
`

export default MenuBar
