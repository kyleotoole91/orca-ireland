import React from 'react';
import styled from 'styled-components';
import { useAuth0 } from "@auth0/auth0-react";
//import LogoutButton from './LogoutButton';
import DefaultProfilePng from './images/default-profile-image.png';

let token

function Profile () {
  const { logout, loginWithRedirect,  user, isAuthenticated, getAccessTokenSilently } = useAuth0()
  var profilePic = DefaultProfilePng
  var username = 'Sign In'

  if (user != null) {
    console.log(user)    
    token = getApiToken();
    console.log(token)
    profilePic = user.picture
    if (user.name != null) {
      username = user.name;
    } else {
      username = user.nickname;
    }
  }
 
  async function getApiToken() {
    return await getAccessTokenSilently();
  }

  return (
    <ProfileContainer>
      {isAuthenticated &&
        <ProfileImage src={profilePic} onClick={() => logout({ returnTo: window.location.origin })} href='./'></ProfileImage>} 
      {!isAuthenticated &&
        <ProfileImage src={profilePic} onClick={() => loginWithRedirect()} href='./'></ProfileImage>}
      <Username>
        {isAuthenticated &&
          <button className="btn btn-primary btn-block btn-sm" onClick={() => logout({ returnTo: window.location.origin })} href='./'>{username}</button>}  
        {!isAuthenticated &&
          <button className="btn btn-primary btn-block btn-sm" onClick={() => loginWithRedirect()} href='./'>{username}</button>}
      </Username>
    </ProfileContainer>
  )
}

const ProfileContainer = styled.div`
  float: right;
  position: 'relative';
  height: 100%;
  text-align: right;
  padding-left: 12px;
  padding-right: 6px;
  font-family: ${({ theme}) => theme.profileFont};
  color: ${({ theme}) => theme.primaryLight};
  a {
    text-decoration: none;
    outline-style: none;   
  } 
`;

const Username = styled.div`
  float: right;
  position: 'absolute';
  height: 100%;
  padding: 8px;
  @media (max-width: ${ ({ theme}) => theme.mobileL}) {
    display: none;
  }
`;

const ProfileImage = styled.img` 
  border-radius: 50%;
  float: right;
  position: 'absolute';
  height: 100%;
  padding: 6px;
`;

export default Profile