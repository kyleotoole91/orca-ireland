import React from 'react';
import styled from 'styled-components';
import { useAuth0 } from "@auth0/auth0-react";
//import LogoutButton from './LogoutButton';
import DefaultProfilePng from './images/default-profile-image.png';

const Profile = () => {
  const { logout, loginWithRedirect,  user, isAuthenticated } = useAuth0(); 
  var profilePic = DefaultProfilePng;
  var username = 'Sign In';

  if (user != null) {
    profilePic = user.picture;
    if (user.given_name != null) {
      username = user.given_name;
    } else {
      username = user.nickname;
    }
    console.log(user);
  }
 if (isAuthenticated) { 
    return (
      <ProfileContainer>
        <ProfileImage src={profilePic}></ProfileImage>
        <Username>
        <button className="btn btn-primary btn-block btn-sm" onClick={() => logout({ returnTo: window.location.origin })} href='./'>{username}</button>
        </Username>
      </ProfileContainer>
    )
  } else {
    return (
      <ProfileContainer>
        <ProfileImage src={profilePic}></ProfileImage>
        <Username>
          <button className="btn btn-primary btn-block btn-sm" onClick={() => loginWithRedirect()} href='/dashboard'>{username}</button>
        </Username>
      </ProfileContainer>
    )
  }
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

/*const UsernameText = styled.a`
  display:table-cell;
  vertical-align:middle;
  font-size: 14px;
  color: ${({ theme}) => theme.primaryLight};
;*/

const Username = styled.div`
  text-align: right;
  float: right; 
  height: 100%;
  display: flex;
  align-items: center; 
  padding-right: 12px

`;

const ProfileImage = styled.img` 
  border-radius: 50%;
  float: right;
  position: 'absolute';
  height: 100%;
  padding: 6px;
`;

export default Profile