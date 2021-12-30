import React, {useState, useEffect} from 'react'
import OrcaLogo from '../components/images/orca-logo.png'
import SaintAnnesTrack from '../components/images/saint-annes-track.png'
import Loading from '../components/Loading'
import { Footer } from '../components/Footer'
import { BrandsBand } from '../components/BrandsBand' 

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
        <BrandsBand />
        <div style={{width: '100%', height: '100%'}}>
          <img style={{maxWidth: '100%', maxHeight: '100%'}} src={trackImage} alt="Saint Annes Track"></img>
        </div>
        <Footer />
      </div>)
  }
}

export default Home
