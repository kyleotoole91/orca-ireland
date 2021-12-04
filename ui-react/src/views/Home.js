import React from 'react'
import CircuitLogo from '../components/images/orca-logo.png'
import SaintAnnesTrack from '../components/images/saint-annes-track.png'
import GoogleMap from '../components/GoogleMap'
import styled from 'styled-components'

const emailTo = "mailto:"+process.env.REACT_APP_EMAIL

function Home() {
  return (
    <>
      <div style={{ alignSelf: 'center', textAlign: 'center', display: 'grid',  justifyContent:'center', alignItems:'center', height: 'auto'}}>
        <h1>On Road Circuit Association</h1>
        <div style={{width: '100%'}}>
          <img style={{maxWidth: '50%', maxHeight: '50%'}} src={CircuitLogo} alt="Circuit Logo"></img>
        </div>  
        <h2> Ireland's only 1/8 scale on road circuit</h2>
        <div style={{width: '100%', maxHeight: '100%'}}>
          <img style={{maxWidth: '100%', maxHeight: '100%'}} src={SaintAnnesTrack} alt="Saint Annes Track"></img>
        </div>
        <GoogleMap />
        <FooterContainer> 
          <a href='https://www.facebook.com/orcaireland/'>Follow us <img style={{width: '48px', weight: '48px'}} src='/images/facebook.png' alt="Facebook Page"></img></a>  
          <a href={emailTo}>Contact us <img style={{width: '36px', weight: '36px'}}  src='/images/email.png' alt="Email"></img></a>
          <p></p>
          <p>St.Anne's Park, Raheny, Dublin, Ireland</p>
          <p style={{fontSize: '10px'}}>Designed by Kyle O'Toole</p>
          <p>2021</p>
        </FooterContainer> 
      </div>
    </>
  )
}

const FooterContainer = styled.div`
  width: 100%; 
  height: 150px;
  alignSelf: center;
  display: grid;  
  justifyContent: center;
  alignItems: 'center';
  p { 
    color: white;
  }
  a {
    color: white;
    text-decoration: none;
    outline-style: none;   
    font-weight: bold; 
    &:visited {
      text-decoration: none;
      outline-style: none;   
      color: white;
    }
  }
  background: ${({ theme}) => theme.primaryLight};
`;


/*const HomeContainer = styled.div`
  font-family: ${({ theme}) => theme.mainFont};
  padding: 6px;
  width: 100%;
  height: 100%;
  display: 'flex';
  alignItems: 'center';
  justifyContent: 'center';

  position: 'relative';
  height: '300px';
  width; '100%';
  font-family: ${({ theme}) => theme.profileFont};
  background: ${({ theme}) => theme.primaryLight};

`;


<div style={{ alignSelf: 'center', textAlign: 'center', display: 'grid',  justifyContent:'center', alignItems:'center', height: 'auto'}}>
  <h1>On Road Circuit Association</h1>
  <div style={{width: '100%'}}>
    <img style={{maxWidth: '50%', maxHeight: '50%'}} src={CircuitLogo} alt="Circuit Logo"></img>
  </div>  
  <h2> Ireland's only 1/8 scale on road circuit</h2>
  <span>St.Anne's Park, Raheny, Dublin, Ireland</span>
  <div style={{width: '100%', maxHeight: '100%'}}>
    <img style={{maxWidth: '100%', maxHeight: '50%'}} src={SaintAnnesTrack} alt="Saint Annes Track"></img>
  </div>
</div>

const HeaderContainer = styled.div`
  font-family: ${({ theme}) => theme.mainFont};
  text-align: centre;
  alignItems: 'center';
  justifyContent: 'center';
`;*/

export default Home
