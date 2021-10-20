import React from 'react';
//import styled from 'styled-components';
import CircuitLogo from '../components/images/orca-logo.png';
import SaintAnnesTrack from '../components/images/saint-annes-track.png';

function Home() {
  return (
    <div style={{ alignSelf: 'center', textAlign: 'center', display: 'grid',  justifyContent:'center', alignItems:'center', height: '100%'}}>
      <h1>On Road Circuit Association</h1>
      <div style={{width: '100%'}}>
        <img src={CircuitLogo} alt="Circuit Logo"></img>
      </div>  
      <h2> Ireland's only 1/8 scale on road circuit</h2>
      <span>St.Anne's Park, Raheny, Dublin, Ireland</span>
      <div style={{width: '100%', maxHeight: '100%'}}>
        <img style={{maxWidth: '100%', maxHeight: '50%'}} src={SaintAnnesTrack} alt="Saint Annes Track"></img>
      </div>
    </div>
  )
}

/*const HomeContainer = styled.div`
  font-family: ${({ theme}) => theme.mainFont};
  padding: 6px;
  width: 100%;
  height: 100%;
  display: 'flex';
  alignItems: 'center';
  justifyContent: 'center';
`;

const HeaderContainer = styled.div`
  font-family: ${({ theme}) => theme.mainFont};
  text-align: centre;
  alignItems: 'center';
  justifyContent: 'center';
`;*/

export default Home
