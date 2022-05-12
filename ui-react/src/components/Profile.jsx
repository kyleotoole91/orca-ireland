import React from 'react'
import styled from 'styled-components'
import { useAuth0 } from "@auth0/auth0-react"
import DefaultProfilePng from './images/default-profile-image.png'
import { useWindowDimensions } from '../utils/WindowSize'

function Profile ({ forceUsername }) {
  const { logout, loginWithRedirect,  user, isAuthenticated } = useAuth0()
  var profilePic = DefaultProfilePng
  var username = 'Log In'
  const { width } = useWindowDimensions()

  if (user != null) {
    profilePic = user.picture
    if (user.name != null) {
      username = user.name
    } else {
      username = user.nickname
    }
  }

  function profileButton(){
    return (
      <>
        {(isAuthenticated || width > 1050) && 
          <ProfileImage alt="user profile image" src={profilePic} onClick={() => logout({ returnTo: window.location.origin })} href='./'></ProfileImage>
        }
        <Username> 
          {!isAuthenticated &&
            <button className="btn btn-outline-primary btn-block btn-sm" 
                    onClick={() => loginWithRedirect({ appState: { targetUrl: window.location.pathname } })} href='./'>
              {username}
            </button>
          }
          {isAuthenticated && width > 1050 &&
            <button className="btn btn-outline-primary btn-block btn-sm" onClick={() => logout({ returnTo: window.location.origin })} href='./'>
              Log Out  
            </button>
          }  
        </Username>   
      </>
    )
  }

  function profileButtonForce(){
    return (
      <>
        <ProfileImage alt="user profile image" src={profilePic} onClick={() => logout({ returnTo: window.location.origin })} href='./'></ProfileImage>
        <UsernameForce>
          {isAuthenticated && 
            <button className="btn btn-outline-primary btn-block btn-sm" onClick={() => logout({ returnTo: window.location.origin })} href='./'>
              Log Out  
            </button>
          }  
          {!isAuthenticated && 
            <button className="btn btn-outline-primary btn-block btn-sm" 
                    onClick={() => loginWithRedirect({ appState: { targetUrl: window.location.pathname } })} href='./'>{username}
          </button>}
        </UsernameForce>
      </>
    )
  }
  
  return (
    <ProfileContainer> 
      {!forceUsername && profileButton()}
      {forceUsername && profileButtonForce()}
    </ProfileContainer>
  )
}

const ProfileContainer = styled.div`
  float: right;
  position: 'relative';
  height: 100%;
  text-align: right;
  padding-left: 12px;
  font-family: ${({ theme}) => theme.profileFont};
  color: ${({ theme}) => theme.primaryLight};
  a {
    text-decoration: none;
    outline-style: none;   
  } 
`

const Username = styled.div`
  float: right;
  position: 'absolute';
  height: 100%;
  padding: 8px;
`

const UsernameForce = styled.div`
  float: right;
  position: 'absolute';
  height: 100%;
  padding: 8px;
`

const ProfileImage = styled.img` 
  border-radius: 50%;
  float: right;
  position: 'absolute';
  height: 100%;
  padding: 6px;
`

export default Profile
