import React from 'react'
import GoogleMap from '../components/GoogleMap'
import styled from 'styled-components'

const emailTo = "mailto:"+process.env.REACT_APP_EMAIL

export const Footer = () => {
  return (
    <div style={{maxWidth: '2048px'}}>
      <GoogleMap/>
      <WhiteText style={{display: 'grid'}}> 
        <div>
          <a href='https://www.facebook.com/orcaireland/'><img style={{width: '48px', weight: '48px'}} src='/images/facebook.png' alt="Facebook Page"></img></a>  
          <a href={emailTo}>&nbsp;&nbsp;&nbsp;&nbsp;<img style={{width: '36px', weight: '36px'}}  src='/images/email.png' alt="Email"></img></a>
        </div>
        <p>St.Anne's Park, Raheny, Dublin, Ireland</p>
        <span style={{fontSize: '9px'}}>Designed by Kyle O'Toole</span>
        <span style={{fontSize:'8px'}}>2021</span>
      </WhiteText>
    </div>
  )
}

const WhiteText = styled.div`
  font-family: ${({ theme}) => theme.companyFont};  
  p { 
    color: white;
  }
  span {
    color: white;  
  }
  a {
    color: white;
    text-decoration: none;
    outline-style: none;   
    &:visited {
      text-decoration: none;
      outline-style: none;   
      color: white;
    }
  }
  background: ${({ theme}) => theme.primaryLight};
`;
