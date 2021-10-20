import React from 'react';
import styled from 'styled-components';
import mainLogo from './images/race-circuit.png';
import Profile from './Profile';
import MenuItems from './MenuItems';
import { useAuth0 } from '@auth0/auth0-react';
import { SideBar } from './'; 

const MenuBar = () => {
  const { isAuthenticated } = useAuth0();
  if (isAuthenticated) {
    return (
      <>
        <SideBar />
        <MenuBarContainer> 
          <BurgerContainer /> 
          <CompanyContainer>
            ORCA Ireland &nbsp;
            <ProfileImage src={mainLogo}></ProfileImage>
          </CompanyContainer>
          <MenuItems />
          <ProfileContainer>
            <Profile />
          </ProfileContainer>        
        </MenuBarContainer>
      </ >
    )
  } else {
    return (
      <>
        <MenuBarContainer> 
          <CompanyContainer>
            ORCA Ireland &nbsp;
            <ProfileImage src={mainLogo}></ProfileImage>
          </CompanyContainer>
          <ProfileContainer>
            <Profile />
          </ProfileContainer>        
        </MenuBarContainer>
      </ >
    )
  }
};

const ProfileContainer = styled.div` 
  height: 100%;
  @media (max-width: ${({ theme}) => theme.mobileS}) {
    display: none;
  }
`;

const ProfileImage = styled.img` 
  float: right;
  position: 'absolute';
  height: 100%;
  padding: 6px;
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
