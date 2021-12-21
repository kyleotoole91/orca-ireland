import React, {useState, useEffect} from 'react'
import OrcaLogo from '../components/images/orca-logo.png'
import SaintAnnesTrack from '../components/images/saint-annes-track.png'
import Loading from '../components/Loading'
import { Footer } from '../components/Footer'

function Home() {
  const [loading, setLoading] = useState(true)
  const [orcaLogo, setOrcaLogo] = useState()
  const [trackImage, setTrackImage] = useState()

  useEffect(() => {
    async function loadPage () {
      setLoading(true)
      try {
        setOrcaLogo(OrcaLogo)
        setTrackImage(SaintAnnesTrack) 
      } finally {
        setLoading(false)
      }
    }  
    loadPage()
  }, [])

  if (loading || !orcaLogo || !trackImage) {
    return ( <Loading /> )
  } else {
    return (
      <div style={{textAlign: 'center', display: 'grid', justifyContent:'center'}}> 
        <h1>On Road Circuit Association</h1>
        <div style={{width: '100%', height: '240px'}}>
          <img style={{maxWidth: '100%', maxHeight: '100%'}} src={orcaLogo} alt="Circuit Logo"></img>
        </div>  
        <h2> Ireland's only 1/8 scale on road circuit</h2>
        <div style={{width: '100%', height: '100%'}}>
          <img style={{maxWidth: '100%', maxHeight: '100%'}} src={trackImage} alt="Saint Annes Track"></img>
        </div> 
        <Footer />
      </div>)
  }
}

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
