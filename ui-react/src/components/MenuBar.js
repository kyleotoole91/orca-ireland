import React from 'react';
import styled from 'styled-components';
import mainLogo from './images/race-circuit.png';
import Profile from './Profile';
import MenuItems from './MenuItems';
import { useAuth0 } from '@auth0/auth0-react';
import { SideBar } from './'; 

function MenuBar () {
  const { isAuthenticated } = useAuth0();
  return (
    <>
      <SideBar authenticated={isAuthenticated} />
      <MenuBarContainer style={{zIndex: 1}} > 
        <BurgerContainer />
        <CompanyContainer>
          ORCA Ireland &nbsp;
          <CompanyImage src={mainLogo} />
        </CompanyContainer>
        <MenuItems authenticated={isAuthenticated} />
        <div style={{height: '100%'}} >
          <Profile />
        </div>        
      </MenuBarContainer>
    </ >
  )
};

const CompanyImage = styled.img` 
  float: right;
  position: 'absolute';
  height: 100%;
  padding: 6px;
  @media (max-width: ${({ theme}) => '305px'}) {
    display: none;
  }
`;

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
`;

const MenuBarContainer = styled.div`
  position: sticky;
  top: 0;
  background: ${({ theme}) => theme.primaryDark};
  height: 48px;primaryDark
  color: ${({ theme}) => theme.primaryLight};

  a {
    text-decoration: none;
    outline-style: none;   
    font-weight: bold; 
    &:visited {
      text-decoration: none;
      outline-style: none;   
      color: ${({ theme}) => theme.primaryLight};
    } 
  } 
`;

const CompanyContainer = styled.div`
  display: flex;
  align-items: center;   
  float: left;
  position: 'relative';
  height: 100%;
  text-align: left;
  padding-left: 18px;
  padding-right: 18px;
  color: ${({ theme}) => theme.primaryLight};
  font-family: ${({ theme}) => theme.companyFont};
  @media (max-width: ${({ theme}) => theme.mobileXS}) {
    display: none;
  }
`;

export default MenuBar
